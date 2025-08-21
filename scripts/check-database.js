#!/usr/bin/env node

/**
 * Script de diagnostic pour la base de données BigMatch
 * Vérifie la connexion PostgreSQL et la configuration Prisma
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🔍 Diagnostic de la base de données BigMatch\n");

// Vérifier les fichiers de configuration
function checkConfigFiles() {
  console.log("📋 Vérification des fichiers de configuration...");

  const envFiles = [".env", ".env.local", ".env.development"];
  let envFound = false;

  envFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      console.log(`✅ Fichier ${file} trouvé`);
      envFound = true;
    }
  });

  if (!envFound) {
    console.log("❌ Aucun fichier de configuration d'environnement trouvé");
    console.log("   Créez un fichier .env.local avec DATABASE_URL");
    return false;
  }

  return true;
}

// Vérifier la variable DATABASE_URL
function checkDatabaseUrl() {
  console.log("\n🔗 Vérification de DATABASE_URL...");

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log("❌ DATABASE_URL non définie");
    console.log(
      '   Ajoutez DATABASE_URL="postgresql://user:password@localhost:5432/database" à votre .env.local'
    );
    return false;
  }

  console.log(
    `✅ DATABASE_URL définie: ${databaseUrl.replace(/:[^:@]+@/, ":***@")}`
  );
  return true;
}

// Vérifier si PostgreSQL est en cours d'exécution
function checkPostgres() {
  console.log("\n🐘 Vérification de PostgreSQL...");

  try {
    // Essayer pg_isready si disponible
    execSync("pg_isready -h localhost -p 5432", { stdio: "ignore" });
    console.log("✅ PostgreSQL est accessible sur localhost:5432");
    return true;
  } catch (error) {
    console.log("❌ PostgreSQL n'est pas accessible sur localhost:5432");

    // Vérifier si Docker est utilisé
    try {
      const containers = execSync(
        'docker ps --format "table {{.Names}}\\t{{.Status}}"',
        { encoding: "utf8" }
      );
      if (containers.includes("postgres")) {
        console.log("📦 Conteneur PostgreSQL Docker détecté");
        return true;
      }
    } catch (dockerError) {
      console.log("   Docker non disponible ou aucun conteneur PostgreSQL");
    }

    console.log("   Solutions possibles :");
    console.log(
      "   - Démarrer PostgreSQL: brew services start postgresql (macOS)"
    );
    console.log(
      "   - Ou utiliser Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres"
    );
    return false;
  }
}

// Vérifier Prisma
function checkPrisma() {
  console.log("\n⚡ Vérification de Prisma...");

  try {
    // Vérifier si le client Prisma est généré
    if (!fs.existsSync("src/generated/prisma")) {
      console.log("❌ Client Prisma non généré");
      console.log("   Exécutez: npx prisma generate");
      return false;
    }

    console.log("✅ Client Prisma généré");

    // Tester la connexion à la base de données
    execSync("npx prisma db pull --schema=prisma/schema.prisma", {
      stdio: "ignore",
    });
    console.log("✅ Connexion à la base de données réussie");

    return true;
  } catch (error) {
    console.log(
      "❌ Impossible de se connecter à la base de données via Prisma"
    );
    console.log("   Erreur:", error.message.split("\n")[0]);

    console.log("\n🔧 Solutions suggérées :");
    console.log("   1. Vérifiez que PostgreSQL fonctionne");
    console.log("   2. Vérifiez DATABASE_URL dans .env.local");
    console.log("   3. Créez la base de données: CREATE DATABASE bigmatch_db;");
    console.log("   4. Appliquez les migrations: npx prisma db push");

    return false;
  }
}

// Suggestions de correction
function showSolutions() {
  console.log("\n🚀 Configuration rapide recommandée:");
  console.log("\n1. Installer PostgreSQL avec Docker:");
  console.log("   docker run --name bigmatch-postgres \\");
  console.log("     -e POSTGRES_PASSWORD=password \\");
  console.log("     -e POSTGRES_DB=bigmatch_db \\");
  console.log("     -p 5432:5432 -d postgres:15");

  console.log("\n2. Créer .env.local:");
  console.log(
    '   DATABASE_URL="postgresql://postgres:password@localhost:5432/bigmatch_db"'
  );
  console.log('   BETTER_AUTH_SECRET="your-32-char-secret-key"');

  console.log("\n3. Configurer Prisma:");
  console.log("   npx prisma generate");
  console.log("   npx prisma db push");

  console.log("\n4. Redémarrer l'application:");
  console.log("   npm run dev");
}

// Exécution du diagnostic
async function runDiagnostic() {
  const checks = [
    checkConfigFiles(),
    checkDatabaseUrl(),
    checkPostgres(),
    checkPrisma(),
  ];

  const allPassed = checks.every(Boolean);

  console.log("\n" + "=".repeat(50));
  if (allPassed) {
    console.log("🎉 Toutes les vérifications sont passées !");
    console.log("   Votre base de données devrait fonctionner correctement.");
  } else {
    console.log("⚠️  Certaines vérifications ont échoué.");
    showSolutions();
  }
  console.log("=".repeat(50));
}

// Vérifier si le script est exécuté directement
if (require.main === module) {
  runDiagnostic().catch(console.error);
}

module.exports = { runDiagnostic };
