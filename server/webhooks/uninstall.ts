import shops from "../prisma/database/shops.js";
import sessions from "../prisma/database/sessions.js";

export async function uninstall(shop: string) {
  console.log(`Event: Uninstall on shop ${shop}`);

  await shops.updateShop({
    shop,
    isInstalled: false,
    uninstalledAt: new Date(),
    subscription: {
      update: {
        active: false,
      },
    },
  });

  await sessions.deleteSession(shop);

  // analytics.track({
  //   event: "uninstall",
  //   userId: shop,
  // });
}
