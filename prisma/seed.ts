import { MessageSender, PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data (optional - be careful in production)
  console.log("🧹 Clearing existing data...");
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.uploadedPDF.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log("👥 Creating users...");

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "amrendraex@gmail.com",
        name: "Admin User",
        imageUrl:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        role: Role.ADMIN,
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
