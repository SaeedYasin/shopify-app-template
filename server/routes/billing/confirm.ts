import { Shopify } from "@shopify/shopify-api";
import shops from "../../prisma/database/shops.js";
// import analytics from "../../../lib/segment/index.js";

import type { Request, Response } from "express";
import type { Plan } from "@prisma/client";

const GET_ACTIVE_SUBSCRIPTION = `{ 
	appInstallation {
        activeSubscriptions {
            test
            createdAt
            currentPeriodEnd
            name
            trialDays
            status
        }
    }
}`;

export const confirm = async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const { charge_id, shop } = query;

  try {
    // Create client
    const session = await Shopify.Utils.loadOfflineSession(shop);
    const client = new Shopify.Clients.Graphql(shop, session.accessToken);

    // Send API request to get the active subscription
    const response = await client.query({
      data: GET_ACTIVE_SUBSCRIPTION,
    });
    const resBody = response?.body as any;
    if (
      !resBody?.data?.appInstallation?.activeSubscriptions ||
      !resBody.data.appInstallation.activeSubscriptions.length
    ) {
      throw `Invalid payload returned for ${shop} on ${charge_id}`;
    }

    // Get the active subscription
    const activeSubscription =
      resBody?.data?.appInstallation?.activeSubscriptions[0];
    if (activeSubscription.status !== "ACTIVE") {
      throw `${shop} subscription status is not active on charge_id ${charge_id}`;
    }

    const plan: Plan = "PAID"; // TODO: add query parameter
    const subscriptionData = {
      chargeId: charge_id,
      plan,
      active: activeSubscription.status === "ACTIVE",
      test: activeSubscription.test,
      trialDays: activeSubscription.trialDays,
      currentPeriodEnd: activeSubscription.currentPeriodEnd,
      createdAt: activeSubscription.createdAt,
      upgradedAt: new Date(),
    };

    // Update database
    const shopData = await shops.getShop(shop);
    await shops.updateShop({
      shop,
      subscribeCount: shopData.subscribeCount + 1,
      subscription: {
        update: subscriptionData,
      },
    });

    // analytics.track({
    //   userId: shop,
    //   event: "Subscription activated",
    //   properties: subscriptionData,
    // });

    console.log(`Event Upgrade: ${shopData.shop} upgraded to paid plan.`);

    return { success: true, shop };
  } catch (err) {
    throw err;
  }
};
