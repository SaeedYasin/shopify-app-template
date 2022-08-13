import shops from "../prisma/database/shops.js";
import sessions from "../prisma/database/sessions.js";

export default {
  customerDataRequest,
  customerRedact,
  shopRedact,
};

async function customerDataRequest(topic, shop, _webhookRequestBody) {
  try {
    // const {
    //     shop_domain,
    //     customer: { id, email },
    //     orders_requested,
    // } = JSON.parse(webhookRequestBody);

    console.log(`Handle ${topic} for ${shop}`);
  } catch (e) {
    console.error(e);
  }
}

async function customerRedact(topic, shop, _webhookRequestBody) {
  try {
    // const {
    //     shop_domain,
    //     customer: { id, email },
    //     orders_to_redact,
    // } = JSON.parse(webhookRequestBody);

    console.log(`Handle ${topic} for ${shop}`);
  } catch (e) {
    console.error(e);
  }
}

async function shopRedact(topic, shop, webhookRequestBody) {
  try {
    const { shop_domain } = JSON.parse(webhookRequestBody);
    await shops.deleteShop(shop_domain);
    await sessions.deleteSession(shop);

    console.log(`Handle ${topic} for ${shop}`);
  } catch (e) {
    console.error(e);
  }
}
