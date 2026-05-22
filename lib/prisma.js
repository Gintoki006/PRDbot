import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis;

let _prisma;

const prisma = new Proxy({}, {
  get(target, prop) {
    if (prop === "then") return undefined; // Promise chaining fix
    if (!_prisma) {
      const connectionString = process.env.DATABASE_URL;
      const pool = new Pool({ connectionString });
      const adapter = new PrismaPg(pool);
      
      _prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = _prisma;
      }
    }
    const value = _prisma[prop];
    if (typeof value === "function") {
      return value.bind(_prisma);
    }
    return value;
  }
});

export default prisma;
