import { Shopify } from "@shopify/shopify-api";
import shops from "../../prisma/database/shops.js";

import type { Response } from "express";
import type { RequestWithSession } from "../../middleware/load-session.js";

export const subscriptionPlan = {
  name: "$9.99 Plan",
  price: "9.99",
  trialDuration: 14,
};

export const APP_SUBSCRIPTION_CREATE = `mutation appSubscribe(
  $name: String!
  $returnUrl: URL!
  $trialDays: Int!
  $test: Boolean!
  $price: Decimal!
) {
  appSubscriptionCreate(
    name: $name
    returnUrl: $returnUrl
    trialDays: $trialDays
    test: $test
    lineItems: [
      {
        plan: {
          appRecurringPricingDetails: {
            price: { amount: $price, currencyCode: USD }
          }
        }
      },
    ]
  ) {
    userErrors {
      field
      message
    }
    confirmationUrl
    appSubscription {
      id
    }
  }
}`;

export const upgrade = async (req: RequestWithSession, _res: Response) => {
  const { session } = req;
  const shop = session.shop;

  try {
    const shopData = await shops.getShop(shop);
    if (!shopData) {
      throw `Can't find shop of ${shop}`;
    }

    const client = new Shopify.Clients.Graphql(shop, session.accessToken);
    const isTestCharge = shopData.test;

    const subscriptionInput = {
      name: `${subscriptionPlan.name}`,
      returnUrl: `${process.env.HOST}/api/billing/confirm?shop=${shop}`,
      trialDays: subscriptionPlan.trialDuration,
      test: isTestCharge,
      price: subscriptionPlan.price,
    };

    // Send Creation Query
    const res = await client.query({
      data: {
        query: APP_SUBSCRIPTION_CREATE,
        variables: subscriptionInput,
      },
    });
    const resBody = res?.body as any;
    if (!resBody?.data?.appSubscriptionCreate?.confirmationUrl) {
      const error = resBody?.data?.appSubscriptionCreate?.userErrors;
      console.error(error);
      throw `Invalid payload returned for ${shop}`;
    }

    return resBody.data.appSubscriptionCreate.confirmationUrl;
  } catch (err) {
    throw err;
  }
};
