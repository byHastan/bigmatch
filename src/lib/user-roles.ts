import { RoleType } from "../generated/prisma";
import prisma from "./prisma";

export interface CreateUserRoleData {
  userId: string;
  roleType: RoleType;
}

export interface UpdateUserRoleData {
  id: string;
  isActive?: boolean;
}

export class UserRoleService {
  /**
   * Créer un nouveau rôle pour un utilisateur
   */
  static async createUserRole(data: CreateUserRoleData) {
    try {
      const userRole = await prisma.userRole.create({
        data: {
          userId: data.userId,
          roleType: data.roleType,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
      return userRole;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        throw new Error("Cet utilisateur a déjà ce rôle");
      }
      throw error;
    }
  }

  /**
   * Récupérer tous les rôles actifs d'un utilisateur
   */
  static async getUserRoles(userId: string) {
    return await prisma.userRole.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Récupérer le rôle principal d'un utilisateur (le premier rôle actif)
   */
  static async getUserPrimaryRole(userId: string) {
    const userRole = await prisma.userRole.findFirst({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return userRole;
  }

  /**
   * Vérifier si un utilisateur a un rôle spécifique
   */
  static async userHasRole(
    userId: string,
    roleType: RoleType
  ): Promise<boolean> {
    const userRole = await prisma.userRole.findFirst({
      where: {
        userId,
        roleType,
        isActive: true,
      },
    });
    return !!userRole;
  }

  /**
   * Mettre à jour un rôle utilisateur
   */
  static async updateUserRole(data: UpdateUserRoleData) {
    return await prisma.userRole.update({
      where: {
        id: data.id,
      },
      data: {
        isActive: data.isActive,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Désactiver un rôle utilisateur
   */
  static async deactivateUserRole(id: string) {
    return await this.updateUserRole({ id, isActive: false });
  }

  /**
   * Activer un rôle utilisateur
   */
  static async activateUserRole(id: string) {
    return await this.updateUserRole({ id, isActive: true });
  }

  /**
   * Supprimer définitivement un rôle utilisateur
   */
  static async deleteUserRole(id: string) {
    return await prisma.userRole.delete({
      where: {
        id,
      },
    });
  }

  /**
   * Récupérer tous les utilisateurs avec un rôle spécifique
   */
  static async getUsersByRole(roleType: RoleType) {
    return await prisma.userRole.findMany({
      where: {
        roleType,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
      },
    });
  }

  /**
   * Changer le rôle principal d'un utilisateur
   * Désactive l'ancien rôle et active le nouveau
   */
  static async changeUserPrimaryRole(userId: string, newRoleType: RoleType) {
    // Désactiver tous les rôles existants
    await prisma.userRole.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    // Créer ou activer le nouveau rôle
    const existingRole = await prisma.userRole.findFirst({
      where: {
        userId,
        roleType: newRoleType,
      },
    });

    if (existingRole) {
      // Activer le rôle existant
      return await this.activateUserRole(existingRole.id);
    } else {
      // Créer un nouveau rôle
      return await this.createUserRole({
        userId,
        roleType: newRoleType,
      });
    }
  }
}
