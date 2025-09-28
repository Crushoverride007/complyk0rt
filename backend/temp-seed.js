const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

(async () => {
  const prisma = new PrismaClient();
  const hash = bcrypt.hashSync("demo123!", 12);
  const users = [
    { email: "admin@acme.example.com", name: "Alice Johnson" },
    { email: "manager@acme.example.com", name: "Bob Wilson" },
    { email: "sarah@acme.example.com", name: "Sarah Davis" },
    { email: "mike@techstart.example.com", name: "Mike Chen" },
  ];
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, passwordHash: hash, emailVerified: true },
      create: { email: u.email, name: u.name, passwordHash: hash, emailVerified: true },
    });
    console.log("Upserted", u.email);
  }
  await prisma.();
  console.log("Done.");
})();
