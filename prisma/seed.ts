import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seeding...");

  // Créer un utilisateur de test
  const testUser = await prisma.user.upsert({
    where: { id: "test-user-123" },
    update: {},
    create: {
      id: "test-user-123",
      email: "test@bigmatch.com",
      name: "Utilisateur Test",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("✅ Utilisateur de test créé:", testUser);

  // Créer un rôle pour cet utilisateur (optionnel)
  try {
    const testRole = await prisma.userRole.create({
      data: {
        userId: "test-user-123",
        roleType: "ORGANISATEUR",
        isActive: true,
      },
    });
    console.log("✅ Rôle de test créé:", testRole);
  } catch (error) {
    console.log("ℹ️ Rôle déjà existant ou erreur:", error);
  }

  console.log("🎉 Seeding terminé !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
