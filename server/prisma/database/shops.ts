import { Prisma } from "@prisma/client";
import prisma, { tryCatch } from "./client.js";

export default {
  getActiveShops,
  getShop,
  createShop,
  updateShop,
};

async function getActiveShops() {
  const { data, error } = await tryCatch(async () => {
    const shops = await prisma.shop.findMany({
      where: {
        isInstalled: true,
      },
    });
    return shops.reduce((acc, e) => {
      acc[e.shop] = e.scopes;
      return acc;
    }, {});
  });
  if (!error) return data as { string: string };
  return {};
}

async function getShop(shop: string) {
  const { data, error } = await tryCatch(async () => {
    return await prisma.shop.findFirst({
      where: {
        shop,
      },
      include: {
        subscription: true,
        shopData: true,
      },
    });
  });
  if (!error) return data as Prisma.ShopCreateInput;
  return null;
}

async function createShop(data: Prisma.ShopCreateInput) {
  await tryCatch(async () => {
    return await prisma.shop.create({
      data: {
        ...data,
        subscription: {
          create: {},
        },
      },
    });
  });
}

async function updateShop(data: Prisma.ShopUpdateInput) {
  await tryCatch(async () => {
    return await prisma.shop.update({
      where: {
        shop: data.shop as string,
      },
      data,
    });
  });
}
