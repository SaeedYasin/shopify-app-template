import express from "express";
import { Shopify } from "@shopify/shopify-api";
import type { RequestWithSession } from "../middleware/load-session.js";

const productRoutes = express.Router();

productRoutes.get("/count", async (req: RequestWithSession, res) => {
  try {
    const { session } = req;
    const { Product } = await import(
      `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
    );

    const countData = await Product.count({ session });
    res.status(200).send(countData);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default productRoutes;
