"use client";

import { RoleType } from "@/src/generated/prisma";
import { userRolesApi } from "@/src/lib/api";
import { useSession } from "@/src/lib/auth-client";
import apiClient from "@/src/lib/axios";
import { UserRoleCookieService } from "@/src/lib/client-cookies";
import { useCallback, useEffect, useState } from "react";

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

// Cache global pour éviter les appels API répétés
let roleCache: { userRole: UserRole | null; timestamp: number } | null = null;
const CACHE_DURATION = 30000; // 30 secondes

/**
 * Hook hybride pour la gestion des rôles utilisateur
 * Utilise des cookies sécurisés httpOnly via API serveur quand possible,
 * avec fallback sur cookies client et migration depuis localStorage
 */
export function useHybridUserRole() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Utiliser la session Better Auth
  const { data: session, isPending: isSessionLoading } = useSession();

  /**
   * Récupérer le rôle depuis les cookies sécurisés via API serveur
   */
  const getSecureRoleFromServer = async (): Promise<string | null> => {
    try {
      const response = await apiClient.get("/auth/user-role");
      return response.data.userRole;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du rôle depuis le serveur:",
        error
      );
      return null;
    }
  };

  /**
   * Sauvegarder le rôle via API serveur (cookies httpOnly sécurisés)
   */
  const saveSecureRoleToServer = async (role: string): Promise<boolean> => {
    try {
      await apiClient.post("/auth/user-role", { role });
      return true;
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde du rôle sur le serveur:",
        error
      );
      return false;
    }
  };

  /**
   * Supprimer le rôle via API serveur
   */
  const clearSecureRoleFromServer = async (): Promise<boolean> => {
    try {
      await apiClient.delete("/auth/user-role");
      return true;
    } catch (error) {
      console.error(
        "Erreur lors de la suppression du rôle sur le serveur:",
        error
      );
      return false;
    }
  };

  /**
   * Fallback: récupérer depuis cookies client
   */
  const getSecureRoleFromClient = (): string | null => {
    try {
      return UserRoleCookieService.getUserRoleClient();
    } catch (error) {
      console.error("Erreur lors de la récupération du rôle client:", error);
      return null;
    }
  };

  /**
   * Fallback: sauvegarder dans cookies client
   */
  const saveSecureRoleToClient = (role: string): boolean => {
    try {
      UserRoleCookieService.setUserRoleClient(role);
      return true;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du rôle client:", error);
      return false;
    }
  };

  /**
   * Migration depuis localStorage
   */
  const migrateFromLocalStorage = useCallback(async (): Promise<string | null> => {
    if (typeof window === "undefined") return null;

    try {
      const localStorageRole = localStorage.getItem("userRole");
      if (localStorageRole) {
        // Essayer de migrer vers le serveur d'abord
        const serverSuccess = await saveSecureRoleToServer(localStorageRole);

        if (!serverSuccess) {
          // Fallback sur cookies client
          saveSecureRoleToClient(localStorageRole);
        }

        // Supprimer de localStorage
        localStorage.removeItem("userRole");
        console.log("Migration réussie de localStorage vers cookies sécurisés");
        return localStorageRole;
      }
    } catch (error) {
      console.error("Erreur lors de la migration depuis localStorage:", error);
    }
    return null;
  }, []);

  /**
   * Sauvegarder le rôle de manière hybride (serveur d'abord, client en fallback)
   */
  const saveRole = useCallback(async (role: string): Promise<void> => {
    // Essayer le serveur d'abord (plus sécurisé)
    const serverSuccess = await saveSecureRoleToServer(role);

    if (!serverSuccess) {
      // Fallback sur cookies client
      saveSecureRoleToClient(role);
    }
  }, []);

  /**
   * Récupérer le rôle de manière hybride
   */
  const getRole = useCallback(async (): Promise<string | null> => {
    // Essayer le serveur d'abord
    let role = await getSecureRoleFromServer();

    if (!role) {
      // Fallback sur cookies client
      role = getSecureRoleFromClient();
    }

    return role;
  }, []);

  /**
   * Supprimer le rôle de manière hybride
   */
  const clearRole = useCallback(async (): Promise<void> => {
    // Supprimer du serveur
    await clearSecureRoleFromServer();

    // Supprimer aussi côté client pour être sûr
    try {
      UserRoleCookieService.clearUserRoleClient();
    } catch (error) {
      console.error("Erreur lors du nettoyage client:", error);
    }
  }, []);

  /**
   * Récupérer le rôle utilisateur depuis l'API avec cache
   */
  const fetchUserRole = async (userId: string, useCache = true) => {
    try {
      // Vérifier le cache si demandé
      if (
        useCache &&
        roleCache &&
        Date.now() - roleCache.timestamp < CACHE_DURATION
      ) {
        return roleCache.userRole;
      }

      const response = await userRolesApi.getMyRole();

      // Mettre à jour le cache
      roleCache = {
        userRole: response.userRole,
        timestamp: Date.now(),
      };

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

        // Éviter les appels multiples si déjà en cours de chargement ou si on a déjà un rôle valide
        if (userRole && userRole.id !== "local") return;

        // Si l'utilisateur est connecté, récupérer son rôle depuis l'API
        if (session?.user?.id) {
          const apiUserRole = await fetchUserRole(session.user.id);
          if (apiUserRole) {
            setUserRole(apiUserRole);
            await saveRole(apiUserRole.roleType.toLowerCase());
            setIsLoading(false);
            return;
          }
        }

        // Fallback 1: Essayer de récupérer depuis les cookies
        let secureRole = await getRole();

        // Fallback 2: Migration depuis localStorage si pas de cookies
        if (!secureRole) {
          secureRole = await migrateFromLocalStorage();
        }

        // IMPORTANT: Ne créer un rôle temporaire que si l'utilisateur est connecté
        // et qu'il n'y a pas de vrai rôle dans l'API
        // Cela évite les redirections incorrectes sur /welcome
        if (secureRole && session?.user?.id) {
          const tempUserRole: UserRole = {
            id: "local",
            userId: session.user.id,
            roleType: secureRole.toUpperCase() as RoleType,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              id: session.user.id,
              email: session.user.email || "",
              name: session.user.name || null,
            },
          };
          setUserRole(tempUserRole);
        } else {
          // Pas de rôle trouvé, nettoyer les cookies obsolètes
          await clearRole();
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors de l'initialisation du rôle:", error);
        setError("Erreur lors du chargement du rôle utilisateur");
        setIsLoading(false);
      }
    };

    initializeUserRole();
  }, [session, isSessionLoading, userRole, getRole, saveRole, migrateFromLocalStorage, clearRole]);

  /**
   * Créer un nouveau rôle pour l'utilisateur
   */
  const createUserRole = async (userId: string, roleType: RoleType) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await userRolesApi.create({ userId, roleType });
      setUserRole(response);

      // Invalider le cache après création
      roleCache = null;

      // Sauvegarder de manière hybride
      await saveRole(roleType.toLowerCase());

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

      // Utiliser la nouvelle API de changement de rôle
      const newRole = await userRolesApi.change({
        roleType: newRoleType,
      });
      setUserRole(newRole);

      // Invalider le cache après changement
      roleCache = null;

      // Mettre à jour de manière hybride
      await saveRole(newRoleType.toLowerCase());

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
   * Déconnexion sécurisée - nettoie tous les cookies
   */
  const logout = async () => {
    await clearRole();
    setUserRole(null);
    setError(null);
    // Invalider le cache lors de la déconnexion
    roleCache = null;
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
    saveRole,
    clearRole,
    getRole,
  };
}
