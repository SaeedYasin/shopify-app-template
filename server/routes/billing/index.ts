import loadSession from "../../middleware/load-session.js";
import verifyRequest from "../../middleware/verify-request.js";
import { upgrade } from "./upgrade.js";
import { downgrade } from "./downgrade.js";
import { confirm } from "./confirm.js";
import type { Express, Request, Response } from "express";
import type { RequestWithSession } from "../../middleware/load-session.js";

const billingEndpoint = "/api/billing";

export default function billingRoutes(app: Express) {
  // POST api/billing -> Create a subscription plan charge
  app.post(
    `${billingEndpoint}`,
    verifyRequest(app),
    loadSession(app),
    async (req: RequestWithSession, res: Response) => {
      try {
        const newSubscriptionUrl = await upgrade(req, res);
        res.status(200).send({
          url: newSubscriptionUrl,
        });
      } catch (error) {
        console.log(`Failed to process api request: ${error}`);
        res.status(500).send(error.message);
      }
    }
  );

  // DELETE api/billing -> Deletes a subscription plan charge. Downgrades to Free.
  app.delete(
    `${billingEndpoint}`,
    verifyRequest(app),
    loadSession(app),
    async (req: RequestWithSession, res: Response) => {
      try {
        const { success } = await downgrade(req, res);
        res.status(200).send({
          success: success,
        });
      } catch (error) {
        console.log(`Failed to process api request: ${error}`);
        res.status(500).send(error.message);
      }
    }
  );

  // GET api/billing/confirm -> Save subscription to database
  app.get(`${billingEndpoint}/confirm`, async (req: Request, res: Response) => {
    try {
      const { shop } = await confirm(req, res);
      res.redirect(
        `https://${shop}/admin/apps/${process.env.APP_SLUG}/settings`
      );
    } catch (error) {
      console.log(`Failed to process api request: ${error}`);
      res.status(500).send(error.message);
    }
  });
}
