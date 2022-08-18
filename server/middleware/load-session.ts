import { Shopify } from "@shopify/shopify-api";
import { SessionInterface } from "@shopify/shopify-api";
import type { Express, Request, Response, NextFunction } from "express";

export interface RequestWithSession extends Request {
  session: SessionInterface;
}

export default function loadSession(app: Express) {
  return async (req: RequestWithSession, res: Response, next: NextFunction) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );

    req.session = session;
    return next();
  };
}
