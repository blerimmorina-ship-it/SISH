import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const p = new PrismaClient();

async function main() {
  const newHash = await argon2.hash("1111111111", { type: argon2.argon2id });
  const result = await p.user.updateMany({
    data: { passwordHash: newHash },
  });
  console.log(`✓ Reset password për ${result.count} user(s) → "1111111111"`);

  const all = await p.user.findMany({ select: { email: true, role: true } });
  console.log("\nUser-at:");
  for (const u of all) console.log(" •", u.email.padEnd(40), u.role);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => p.$disconnect());
