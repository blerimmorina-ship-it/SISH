import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const p = new PrismaClient();

async function main() {
  const u = await p.user.findFirst({ where: { email: "admin@klinika-demo.sish.local" } });
  if (!u) {
    console.log("USER NOT FOUND");
    return;
  }
  console.log("found:", u.email);
  console.log("passwordHash:", u.passwordHash.slice(0, 50) + "...");
  console.log("verify(1111111111):", await argon2.verify(u.passwordHash, "1111111111"));
  console.log("verify(Admin123!):", await argon2.verify(u.passwordHash, "Admin123!"));

  const allUsers = await p.user.findMany({ select: { email: true, role: true, tenantId: true } });
  console.log("\nAll users:", allUsers.length);
  for (const usr of allUsers) console.log(" •", usr.email, usr.role);
}

main().finally(() => p.$disconnect());
