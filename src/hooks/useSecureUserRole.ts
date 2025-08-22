"use client";

import { RoleType } from "@/src/generated/prisma";
import { userRolesApi } from "@/src/lib/api";
import { useSession } from "@/src/lib/auth-client";
import { UserRoleCookieService } from "@/src/lib/client-cookies";
import { useEffect, useState } from "react";

interface UserRole {
  id: string;
  userId: string;
  roleType: RoleType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

/**
 * Hook sécurisé pour la gestion des rôles utilisateur
 * Utilise des cookies sécurisés au lieu de localStorage
 */
export function useSecureUserRole() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Utiliser la session Better Auth
  const { data: session, isPending: isSessionLoading } = useSession();

  /**
   * Récupérer le rôle depuis les cookies (fallback sécurisé)
   */
  const getSecureRole = (): string | null => {
    try {
      // Utiliser la version client car on est dans un hook côté client
      return UserRoleCookieService.getUserRoleClient();
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du rôle depuis les cookies:",
        error
      );
      return null;
    }
  };

  /**
   * Sauvegarder le rôle dans les cookies sécurisés
   */
  const saveSecureRole = (role: string) => {
    try {
      UserRoleCookieService.setUserRoleClient(role);
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde du rôle dans les cookies:",
        error
      );
    }
  };

  /**
   * Supprimer le rôle des cookies
   */
  const clearSecureRole = () => {
    try {
      UserRoleCookieService.clearUserRoleClient();
    } catch (error) {
      console.error(
        "Erreur lors de la suppression du rôle des cookies:",
        error
      );
    }
  };

  /**
   * Migration depuis localStorage vers cookies sécurisés
   */
  const migrateFromLocalStorage = () => {
    if (typeof window === "undefined") return null;

    try {
      const localStorageRole = localStorage.getItem("userRole");
      if (localStorageRole) {
        // Migrer vers les cookies sécurisés
        saveSecureRole(localStorageRole);
        // Supprimer de localStorage
        localStorage.removeItem("userRole");
        console.log("Migration réussie de localStorage vers cookies sécurisés");
        return localStorageRole;
      }
    } catch (error) {
      console.error("Erreur lors de la migration depuis localStorage:", error);
    }
    return null;
  };

  /**
   * Récupérer le rôle utilisateur depuis l'API
   */
  const fetchUserRole = async (userId: string) => {
    try {
      const response = await userRolesApi.getMyRole();
      return response.userRole;
    } catch (err) {
      console.error("Erreur lors de la récupération du rôle:", err);
      return null;
    }
  };

  /**
   * Initialiser le rôle utilisateur au chargement
   */
  useEffect(() => {
    const initializeUserRole = async () => {
      try {
        // Attendre que la session soit chargée
        if (isSessionLoading) return;

        // Si l'utilisateur est connecté, récupérer son rôle depuis l'API
        if (session?.user?.id) {
          const apiUserRole = await fetchUserRole(session.user.id);
          if (apiUserRole) {
            setUserRole(apiUserRole);
            saveSecureRole(apiUserRole.roleType.toLowerCase());
            setIsLoading(false);
            return;
          }
        }

        // Fallback 1: Essayer de récupérer depuis les cookies sécurisés
        let secureRole = getSecureRole();

        // Fallback 2: Migration depuis localStorage si pas de cookies
        if (!secureRole) {
          secureRole = migrateFromLocalStorage();
        }

        if (secureRole) {
          const tempUserRole: UserRole = {
            id: "local",
            userId: session?.user?.id || "local",
            roleType: secureRole.toUpperCase() as RoleType,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              id: session?.user?.id || "local",
              email: session?.user?.email || "",
              name: session?.user?.name || null,
            },
          };
          setUserRole(tempUserRole);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors de l'initialisation du rôle:", error);
        setError("Erreur lors du chargement du rôle utilisateur");
        setIsLoading(false);
      }
    };

    initializeUserRole();
  }, [session, isSessionLoading]);

  /**
   * Créer un nouveau rôle pour l'utilisateur
   */
  const createUserRole = async (userId: string, roleType: RoleType) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await userRolesApi.create({ userId, roleType });
      setUserRole(response);

      // Sauvegarder dans les cookies sécurisés
      saveSecureRole(roleType.toLowerCase());

      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Changer le rôle principal d'un utilisateur
   */
  const changeUserRole = async (userId: string, newRoleType: RoleType) => {
    try {
      setIsLoading(true);
      setError(null);

      // Désactiver tous les rôles existants puis créer le nouveau
      const response = await userRolesApi.update(userRole?.id || "", {
        isActive: false,
      });

      const newRole = await userRolesApi.create({
        userId,
        roleType: newRoleType,
      });
      setUserRole(newRole);

      // Mettre à jour les cookies sécurisés
      saveSecureRole(newRoleType.toLowerCase());

      return newRole;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Déconnexion sécurisée - nettoie les cookies
   */
  const logout = () => {
    clearSecureRole();
    setUserRole(null);
    setError(null);
  };

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  const hasRole = (requiredRole: RoleType): boolean => {
    return userRole?.roleType === requiredRole && userRole.isActive;
  };

  /**
   * Vérifier si l'utilisateur a l'un des rôles requis
   */
  const hasAnyRole = (requiredRoles: RoleType[]): boolean => {
    return requiredRoles.some((role) => hasRole(role));
  };

  return {
    userRole,
    isLoading,
    error,
    createUserRole,
    changeUserRole,
    fetchUserRole,
    logout,
    hasRole,
    hasAnyRole,
    // Fonctions utilitaires
    saveSecureRole,
    clearSecureRole,
  };
}
