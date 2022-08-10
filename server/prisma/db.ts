import Prisma1, * as Prisma2 from "@prisma/client";
const Prisma = Prisma1 || Prisma2;

class Db {
  prisma: InstanceType<typeof Prisma.PrismaClient>;

  constructor() {
    this.prisma = new Prisma.PrismaClient();
  }

  async destructor() {
    await this.prisma.$disconnect();
  }

  getActiveShopifyShopsDict = async () => {
    const activeShops = await this.prisma.shopifyShops.findMany({
      where: {
        active: true,
      },
    });

    return activeShops.reduce((acc, e) => {
      acc[e.shop] = e.scope;
      return acc;
    }, {});
  };

  setShopifyShopActive = async (shop: string, active: boolean) => {
    await this.prisma.shopifyShops.update({
      where: {
        shop,
      },
      data: {
        active,
      },
    });
  };

  setShopifyShopScope = async (shop: string, scope: string) => {
    await this.prisma.shopifyShops.upsert({
      where: {
        shop,
      },
      update: { scope, active: true },
      create: { shop, scope, active: true },
    });
  };
}

const db = new Db();
export default db;
