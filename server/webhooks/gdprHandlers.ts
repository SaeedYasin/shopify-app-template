import shops from "../prisma/database/shops.js";
import sessions from "../prisma/database/sessions.js";

export default {
  customerDataRequest,
  customerRedact,
  shopRedact,
};

async function customerDataRequest(topic, shop, webhookRequestBody) {
  try {
    // const {
    //     shop_domain,
    //     customer: { id, email },
    //     orders_requested,
    // } = JSON.parse(webhookRequestBody);

    console.log(`Handle ${topic} for ${shop}`);
    console.log(webhookRequestBody);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}

async function customerRedact(topic, shop, webhookRequestBody) {
  try {
    // const {
    //     shop_domain,
    //     customer: { id, email },
    //     orders_to_redact,
    // } = JSON.parse(webhookRequestBody);

    console.log(`Handle ${topic} for ${shop}`);
    console.log(webhookRequestBody);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}

async function shopRedact(topic, shop, webhookRequestBody) {
  try {
    // const { shop_domain } = JSON.parse(webhookRequestBody);
    // await shops.deleteShop(shop_domain);
    // await sessions.deleteSession(shop);

    console.log(`Handle ${topic} for ${shop}`);
    console.log(webhookRequestBody);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}
