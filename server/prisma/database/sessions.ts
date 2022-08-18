import type { SessionInterface } from "@shopify/shopify-api";
import prisma, { tryCatch } from "./client.js";

export default {
  storeCallback,
  loadCallback,
  deleteCallback,
  deleteSession,
};

async function storeCallback(session: SessionInterface) {
  console.log(`storeCallback called with session ${JSON.stringify(session)}`);
  const { error } = await tryCatch(async () => {
    return await prisma.session.upsert({
      where: {
        id: session.id,
      },
      update: {
        id: session.id,
        session: JSON.stringify(session),
        shop: session.shop,
      },
      create: {
        id: session.id,
        session: JSON.stringify(session),
        shop: session.shop,
      },
    });
  });
  if (error) return false;
  return true;
}

async function loadCallback(id: string) {
  console.log(`loadCallback called with id ${id}`);
  const { data, error } = await tryCatch(async () => {
    return await prisma.session.findFirst({
      where: {
        id,
      },
    });
  });
  if (!error) {
    return JSON.parse(data.session) as SessionInterface;
  }
  return undefined;
}

async function deleteCallback(id: string) {
  console.log(`deleteCallback called with id ${id}`);
  const { error } = await tryCatch(async () => {
    return await prisma.session.delete({
      where: {
        id,
      },
    });
  });
  if (error) return false;
  return true;
}

async function deleteSession(shop: string) {
  console.log(`deleteSession called with shop ${shop}`);
  const { error } = await tryCatch(async () => {
    return await prisma.session.deleteMany({
      where: {
        shop,
      },
    });
  });
  if (error) return false;
  return true;
}
