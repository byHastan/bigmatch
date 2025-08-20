/**
 * Script utilitaire pour résoudre rapidement les problèmes de permissions de rôle
 * Ce script permet d'assigner le rôle "ORGANISATEUR" à un utilisateur spécifique
 * 
 * Usage: npx ts-node scripts/fix-role-permission.ts <user-email>
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignOrganizerRole(userEmail: string) {
  try {
    console.log(`🔍 Recherche de l'utilisateur avec l'email: ${userEmail}`);
    
    // Trouver l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        userRoles: true
      }
    });

    if (!user) {
      console.error(`❌ Aucun utilisateur trouvé avec l'email: ${userEmail}`);
      return;
    }

    console.log(`✅ Utilisateur trouvé: ${user.name || user.email} (ID: ${user.id})`);

    // Vérifier si l'utilisateur a déjà le rôle ORGANISATEUR
    const existingOrganizerRole = user.userRoles.find(
      role => role.roleType === 'ORGANISATEUR' && role.isActive
    );

    if (existingOrganizerRole) {
      console.log(`ℹ️  L'utilisateur a déjà le rôle ORGANISATEUR actif`);
      return;
    }

    // Désactiver tous les autres rôles
    await prisma.userRole.updateMany({
      where: {
        userId: user.id,
        isActive: true
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    // Vérifier s'il y a un rôle ORGANISATEUR inactif
    const inactiveOrganizerRole = user.userRoles.find(
      role => role.roleType === 'ORGANISATEUR' && !role.isActive
    );

    if (inactiveOrganizerRole) {
      // Réactiver le rôle existant
      await prisma.userRole.update({
        where: { id: inactiveOrganizerRole.id },
        data: {
          isActive: true,
          updatedAt: new Date()
        }
      });
      console.log(`✅ Rôle ORGANISATEUR réactivé pour ${user.email}`);
    } else {
      // Créer un nouveau rôle ORGANISATEUR
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleType: 'ORGANISATEUR'
        }
      });
      console.log(`✅ Nouveau rôle ORGANISATEUR créé pour ${user.email}`);
    }

    console.log(`🎉 L'utilisateur ${user.email} peut maintenant créer des événements !`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'assignation du rôle:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Vérifier les arguments de ligne de commande
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('❌ Veuillez fournir un email utilisateur');
  console.log('Usage: npx ts-node scripts/fix-role-permission.ts <user-email>');
  process.exit(1);
}

// Exécuter le script
assignOrganizerRole(userEmail);
