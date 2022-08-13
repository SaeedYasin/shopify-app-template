import { Prisma } from "@prisma/client";
import Prisma1, * as Prisma2 from "@prisma/client";
const Prisma3 = Prisma1 || Prisma2;

// type PrismaClient = InstanceType<typeof Prisma3.PrismaClient>;

const prisma = new Prisma3.PrismaClient({ errorFormat: "minimal" });
export default prisma;

export async function tryCatch(cb: () => Promise<unknown>) {
  try {
    return { data: await cb(), error: undefined };
  } catch (e) {
    return { error: processError(e), data: undefined };
  }
}

function processError(e: unknown) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") {
      return {
        code: e.code,
        msg: "There is a unique constraint violation",
        prismaMsg: e.message,
      };
    }
  }
  console.log(e);
  return { code: "UNKNOWN", msg: "Unknown error" };
}
