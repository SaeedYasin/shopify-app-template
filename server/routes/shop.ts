import express from "express";
import shops from "../prisma/database/shops.js";
import { Shopify } from "@shopify/shopify-api";
import type { Shop } from "@shopify/shopify-api/dist/rest-resources/2022-07";
import type { RequestWithSession } from "../middleware/load-session.js";

const shopRoutes = express.Router();

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

shopRoutes.get("/", async (req: RequestWithSession, res) => {
  try {
    const { session } = req;
    const { shop, accessToken } = session;
    const currentUser = session.onlineAccessInfo.associated_user;

    const client = new Shopify.Clients.Graphql(shop, accessToken);
    const response = await client.query({
      data: GET_SHOP_DATA,
    });
    const resBody = response?.body as Shop;

    res.status(200).send({ ...resBody, currentUser });
  } catch (error) {
    console.log(`Failed to process api request: ${error}`);
    res.status(500).send(error.message);
  }
});

shopRoutes.get("/info", async (req: RequestWithSession, res) => {
  try {
    const { session } = req;
    const { shop } = session;

    const shopInfo = await shops.getShop(shop);

    if (shopInfo) {
      res.status(200).send(shopInfo);
    } else {
      throw new Error(`Error while fetching shopInfo for shop ${shop}`);
    }
  } catch (error) {
    console.log(`Failed to process api request: ${error}`);
    res.status(500).send(error.message);
  }
});

shopRoutes.post("/update", async (req: RequestWithSession, res) => {
  try {
    const { session } = req;
    const { shop } = session;

    const shopInfo = await shops.updateShop({ shop, ...req.body });

    if (shopInfo) {
      res.status(200).send(shopInfo);
    } else {
      throw new Error(`Error while fetching shopInfo for shop ${shop}`);
    }
  } catch (error) {
    console.log(`Failed to process api request: ${error}`);
    res.status(500).send(error.message);
  }
});

export default shopRoutes;
