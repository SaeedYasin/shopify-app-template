// @ts-check
import { resolve } from "path";
import express from "express";
import cookieParser from "cookie-parser";
import { Shopify, ApiVersion } from "@shopify/shopify-api";
import "dotenv/config";

// Database
import shops from "./prisma/database/shops.js";
import sessions from "./prisma/database/sessions.js";

// Middleware
import applyAuthMiddleware from "./middleware/auth.js";
import verifyRequest from "./middleware/verify-request.js";

// Webhooks
import gdprRoutes from "./webhooks/gdprRoutes.js";
import gdpr from "./webhooks/gdprHandlers.js";
import { hmacVerify } from "./webhooks/hmacVerify.js";
import { uninstall } from "./webhooks/uninstall.js";

const USE_ONLINE_TOKENS = true;
const TOP_LEVEL_OAUTH_COOKIE = "shopify_top_level_oauth";

const PORT = parseInt(process.env.PORT || "8081", 10);
const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.April22,
  IS_EMBEDDED_APP: true,
  // We persist active shops in the DB to make sure stores don't have
  // to re-login when the server restarts.
  SESSION_STORAGE: new Shopify.Session.CustomSessionStorage(
    sessions.storeCallback,
    sessions.loadCallback,
    sessions.deleteCallback
  ),
});

Shopify.Webhooks.Registry.addHandlers({
  APP_UNINSTALLED: {
    path: "/webhooks",
    webhookHandler: async (_topic, shop, _body) => {
      await uninstall(shop);
    },
  },
  CUSTOMERS_DATA_REQUEST: {
    path: "/gdpr/customers_data_request",
    webhookHandler: async (topic, shop, body) =>
      await gdpr.customerDataRequest(topic, shop, body),
  },
  CUSTOMERS_REDACT: {
    path: "/gdpr/customers_redact",
    webhookHandler: async (topic, shop, body) =>
      await gdpr.customerRedact(topic, shop, body),
  },
  SHOP_REDACT: {
    path: "/gdpr/shop_redact",
    webhookHandler: async (topic, shop, body) =>
      await gdpr.shopRedact(topic, shop, body),
  },
});

// export for test use only
export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production"
) {
  console.log("App started...");

  const app = express();
  app.set("top-level-oauth-cookie", TOP_LEVEL_OAUTH_COOKIE);
  app.set("use-online-tokens", USE_ONLINE_TOKENS);

  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

  applyAuthMiddleware(app);

  app.post("/webhooks", async (req, res) => {
    try {
      await Shopify.Webhooks.Registry.process(req, res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
      if (!res.headersSent) {
        res.status(500).send(error.message);
      }
    }
  });

  app.get("/products-count", verifyRequest(app), async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(req, res, true);
    const { Product } = await import(
      `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
    );

    const countData = await Product.count({ session });
    res.status(200).send(countData);
  });

  app.post("/graphql", verifyRequest(app), async (req, res) => {
    try {
      const response = await Shopify.Utils.graphqlProxy(req, res);
      res.status(200).send(response.body);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.use(express.json());
  app.use("/gdpr", hmacVerify, gdprRoutes);

  app.use((req, res, next) => {
    const shop = req.query.shop;
    if (Shopify.Context.IS_EMBEDDED_APP && shop) {
      res.setHeader(
        "Content-Security-Policy",
        `frame-ancestors https://${shop} https://admin.shopify.com;`
      );
    } else {
      res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
    }
    next();
  });

  app.use("/*", async (req, res, next) => {
    const query = req.query as Record<string, string>;
    const { shop } = query;
    if (shop) console.log(`Processing request from ${shop}`);

    // Detect whether we need to reinstall the app, any request from Shopify will
    // include a shop in the query parameters.
    const activeShop = await shops.getShop(shop);
    if ((!activeShop || !activeShop?.isInstalled) && shop) {
      res.redirect(`/auth?${new URLSearchParams(query).toString()}`);
    } else {
      next();
    }
  });

  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite;
  if (!isProd) {
    vite = await import("vite").then(({ createServer }) =>
      createServer({
        root,
        logLevel: isTest ? "error" : "info",
        server: {
          port: PORT,
          hmr: {
            protocol: "ws",
            host: "localhost",
            port: 64999,
            clientPort: 64999,
          },
          middlewareMode: true,
        },
      })
    );
    app.use(vite.middlewares);
  } else {
    const compression = await import("compression").then(
      ({ default: fn }) => fn
    );
    const serveStatic = await import("serve-static").then(
      ({ default: fn }) => fn
    );
    const fs = await import("fs");
    app.use(compression());
    app.use(serveStatic(resolve("dist/client")));
    app.use("/*", (req, res, next) => {
      // Client-side routing will pick up on the correct route to render, so we always render the index here
      res
        .status(200)
        .set("Content-Type", "text/html")
        .send(fs.readFileSync(`${process.cwd()}/dist/client/index.html`));
    });
  }

  return { app, vite };
}

if (!isTest) {
  createServer().then(({ app }) => app.listen(PORT));
}
