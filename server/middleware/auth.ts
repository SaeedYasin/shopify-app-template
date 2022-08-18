import { AuthQuery, SessionInterface, Shopify } from "@shopify/shopify-api";
import shops from "../prisma/database/shops.js";
import type { Express } from "express";

import topLevelAuthRedirect from "../helpers/top-level-auth-redirect.js";

export default function applyAuthMiddleware(app: Express) {
  app.get("/auth", async (req, res) => {
    if (!req.signedCookies[app.get("top-level-oauth-cookie")]) {
      return res.redirect(
        `/auth/toplevel?${new URLSearchParams(
          req.query as Record<string, string>
        ).toString()}`
      );
    }

    const redirectUrl = await Shopify.Auth.beginAuth(
      req,
      res,
      (req.query as Record<string, string>).shop,
      "/auth/token",
      false
    );

    res.redirect(redirectUrl);
  });

  app.get("/auth/toplevel", (req, res) => {
    res.cookie(app.get("top-level-oauth-cookie"), "1", {
      signed: true,
      httpOnly: true,
      sameSite: "strict",
    });

    res.set("Content-Type", "text/html");

    res.send(
      topLevelAuthRedirect({
        apiKey: Shopify.Context.API_KEY,
        hostName: Shopify.Context.HOST_NAME,
        host: req.query.host,
        query: req.query,
      })
    );
  });

  app.get("/auth/token", async (req, res) => {
    await Shopify.Auth.validateAuthCallback(
      req,
      res,
      req.query as unknown as AuthQuery
    );

    const redirectUrl = await Shopify.Auth.beginAuth(
      req,
      res,
      (req.query as Record<string, string>).shop,
      "/auth/callback",
      app.get("use-online-tokens")
    );

    res.redirect(redirectUrl);
  });

  app.get("/auth/callback", async (req, res) => {
    try {
      const session = await Shopify.Auth.validateAuthCallback(
        req,
        res,
        req.query as unknown as AuthQuery
      );

      const host = req.query.host;
      const response = await Shopify.Webhooks.Registry.register({
        shop: session.shop,
        accessToken: session.accessToken,
        topic: "APP_UNINSTALLED",
        path: "/webhooks",
      });

      if (!response["APP_UNINSTALLED"].success) {
        console.log(
          `Failed to register APP_UNINSTALLED webhook: ${response.result}`
        );
      }

      // Update db and mark shop as active
      await updateShopData(app, session);

      // Redirect to app with shop parameter upon auth
      res.redirect(`/?shop=${session.shop}&host=${host}`);
    } catch (e) {
      switch (true) {
        case e instanceof Shopify.Errors.InvalidOAuthError:
          res.status(400);
          res.send(e.message);
          break;
        case e instanceof Shopify.Errors.CookieNotFound:
        case e instanceof Shopify.Errors.SessionNotFound:
          // This is likely because the OAuth session cookie expired before the merchant approved the request
          res.redirect(`/auth?shop=${req.query.shop}`);
          break;
        default:
          res.status(500);
          res.send(e.message);
          break;
      }
    }
  });
}

const GET_SHOP_DATA = `{
  shop {
    id
    name
    ianaTimezone
    email
    url
    currencyCode
    primaryDomain {
      url
      sslEnabled
    }
    plan {
      displayName
      partnerDevelopment
      shopifyPlus
    }
    billingAddress {
      name
      company
      city
      country
      phone
    }
  }
}`;

async function updateShopData(app: Express, session: SessionInterface) {
  const existingShop = await shops.getShop(session.shop);
  console.log(`Get shop data returned: ${JSON.stringify(existingShop)}`);
  let fetchShopData = true;
  // const betaUsers = [""];

  if (!existingShop) {
    console.log(`Event: Install on new shop ${session.shop}`);
    await shops.createShop({
      shop: session.shop,
      scopes: session.scope,
      isInstalled: true,
      installedAt: new Date(),
      uninstalledAt: null,
      installCount: 1,
      showOnboarding: true,
      // notifications: [],
      // settings: { beta: betaUsers.includes(shop) ? true : false },
    });

    // Track install event
    // analytics.track({
    //   event: "install",
    //   userId: shop,
    // });
  } else {
    if (!!existingShop.shopData) {
      fetchShopData = false;
    }

    if (!existingShop.isInstalled) {
      // This is a REINSTALL
      console.log(`Event: Reinstall on existing shop ${session.shop}`);
      await shops.updateShop({
        shop: session.shop,
        scopes: session.scope,
        isInstalled: true,
        installedAt: new Date(),
        uninstalledAt: null,
        installCount: existingShop.installCount + 1,
        showOnboarding: true,
        // settings: { beta: betaUsers.includes(shop) ? true : false },
        subscription: {
          update: {
            active: true,
          },
        },
      });

      // Track reinstall event
      // analytics.track({
      //   event: "reinstall",
      //   userId: shop,
      // });
    }
  }

  if (fetchShopData) {
    try {
      const client = new Shopify.Clients.Graphql(
        session.shop,
        session.accessToken
      );

      // Track reauth event
      // analytics.track({
      //   event: "reauth",
      //   userId: session.shop,
      // });

      const res = await client.query({ data: GET_SHOP_DATA });
      const resBody = res?.body as any;

      if (!resBody?.data?.shop) {
        console.warn(`Missing shop data on ${session.shop}`);
      } else {
        const shopData = resBody.data.shop;
        console.log("Got shops data", shopData);

        await shops.updateShop({
          shop: session.shop,
          shopData: {
            create: shopData,
          },
        });
      }
    } catch (error) {
      console.log(`Failed to fetch shop data: ${error}`);
    }
  }
}
