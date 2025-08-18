import { useEffect, useState } from "react";
import { RoleType } from "../generated/prisma";

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

export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer le rôle depuis localStorage (fallback)
  const getLocalRole = (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userRole");
    }
    return null;
  };

  // Sauvegarder le rôle dans localStorage
  const saveLocalRole = (role: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userRole", role);
    }
  };

  // Supprimer le rôle de localStorage
  const clearLocalRole = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userRole");
    }
  };

  // Récupérer automatiquement le rôle au chargement
  useEffect(() => {
    const initializeUserRole = async () => {
      try {
        // D'abord, essayer de récupérer depuis localStorage
        const localRole = getLocalRole();

        if (localRole) {
          // Convertir le rôle local en format UserRole temporaire
          const tempUserRole: UserRole = {
            id: "local",
            userId: "local",
            roleType: localRole.toUpperCase() as RoleType,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              id: "local",
              email: "",
              name: null,
            },
          };
          setUserRole(tempUserRole);
        }

        // Essayer de récupérer depuis l'API si possible
        // Pour l'instant, on se contente du localStorage
        // TODO: Implémenter la récupération depuis l'API quand l'authentification sera en place
      } catch (error) {
        console.error("Erreur lors de l'initialisation du rôle:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUserRole();
  }, []);

  // Créer un nouveau rôle pour l'utilisateur
  const createUserRole = async (userId: string, roleType: RoleType) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/user-roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, roleType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la création du rôle"
        );
      }

      const newUserRole = await response.json();
      setUserRole(newUserRole);

      // Sauvegarder dans localStorage pour la compatibilité
      saveLocalRole(roleType.toLowerCase());

      return newUserRole;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer le rôle d'un utilisateur depuis l'API
  const fetchUserRole = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/user-roles?userId=${userId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la récupération du rôle"
        );
      }

      const userRoles = await response.json();

      if (userRoles.length > 0) {
        // Prendre le premier rôle actif
        const primaryRole = userRoles.find((role: UserRole) => role.isActive);
        if (primaryRole) {
          setUserRole(primaryRole);
          saveLocalRole(primaryRole.roleType.toLowerCase());
          return primaryRole;
        }
      }

      return null;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Changer le rôle principal d'un utilisateur
  const changeUserRole = async (userId: string, newRoleType: RoleType) => {
    try {
      setIsLoading(true);
      setError(null);

      // Désactiver tous les rôles existants
      if (userRole) {
        await fetch(`/api/user-roles/${userRole.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: false }),
        });
      }

      // Créer le nouveau rôle
      const newUserRole = await createUserRole(userId, newRoleType);
      setUserRole(newUserRole);

      return newUserRole;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (roleType: RoleType): boolean => {
    return userRole?.roleType === roleType && userRole.isActive;
  };

  // Récupérer le type de rôle actuel
  const getCurrentRoleType = (): RoleType | null => {
    return userRole?.roleType || null;
  };

  // Déconnexion (nettoyer le rôle)
  const logout = () => {
    setUserRole(null);
    clearLocalRole();
  };

  return {
    userRole,
    isLoading,
    error,
    createUserRole,
    fetchUserRole,
    changeUserRole,
    hasRole,
    getCurrentRoleType,
    logout,
    getLocalRole,
    saveLocalRole,
    clearLocalRole,
  };
}
