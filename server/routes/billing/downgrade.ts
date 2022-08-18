import { composeGid } from "@shopify/admin-graphql-api-utilities";
import { Shopify } from "@shopify/shopify-api";
import shops from "../../prisma/database/shops.js";
// import analytics from "../../../lib/segment/index.js";

import type { Response } from "express";
import type { RequestWithSession } from "../../middleware/load-session.js";

export const APP_SUBSCRIPTION_CANCEL = `mutation appSubscriptionCancel(
    $id: ID!
  ) {
    appSubscriptionCancel(
      id: $id
    ) {
      appSubscription {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
}`;

export const downgrade = async (req: RequestWithSession, _res: Response) => {
  const { session } = req;
  const shop = session.shop;

  try {
    // Retrieve shop data
    const shopData = await shops.getShop(shop);
    if (!shopData) {
      throw `Shop ${shop} not found`;
    }

    // Store the active subscription charge id
    const chargeId = shopData.subscription?.chargeId;
    if (!chargeId) {
      throw `No charge id on ${shop}`;
    }

    // Create client
    const client = new Shopify.Clients.Graphql(shop, session.accessToken);

    // Send API request to cancel the subscription
    const res = await client.query({
      data: {
        query: APP_SUBSCRIPTION_CANCEL,
        variables: {
          id: `${composeGid("AppSubscription", chargeId)}`,
        },
      },
    });
    const resBody = res?.body as any;
    if (!resBody?.data?.appSubscriptionCancel) {
      const error = resBody?.data?.appSubscriptionCreate?.userErrors;
      console.error(error);
      throw `Invalid payload returned for ${shop} on ${chargeId}`;
    }

    // Make sure the API call was successful
    const { status } = resBody.data.appSubscriptionCancel.appSubscription;
    if (status !== "CANCELLED") {
      throw `Status of CANCELLED expected but received ${status}`;
    }

    // Delete subscription
    const dbResponse = await shops.updateShop({
      shop,
      subscription: {
        update: {
          active: true,
          plan: "TRIAL",
          createdAt: new Date(),
          upgradedAt: null,
          currentPeriodEnd: null,
          chargeId: null,
        },
      },
    });

    if (!dbResponse) {
      throw `Could not update subscription in the database for ${shop}`;
    }

    // analytics.track({
    //   userId: shop,
    //   event: "Subscription deactivated",
    //   properties: {
    //     chargeId: shopData.subscription.chargeId,
    //     name: shopData.subscription.name,
    //     price: shopData.subscription.price,
    //     isTest: shopData.subscription.test,
    //     status: shopData.subscription.status,
    //     trialDuration: shopData.subscription.trialDays,
    //   },
    // });

    console.log(
      `Event Downgrade: ${shopData.shop} downgraded to trial plan. Cancelled charge id: ${chargeId}`
    );

    return { success: true };
  } catch (err) {
    throw err;
  }
};
