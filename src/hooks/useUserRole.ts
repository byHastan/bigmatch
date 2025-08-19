import { useEffect, useState } from "react";
import { RoleType } from "../generated/prisma";
import { useSession } from "../lib/auth-client";

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

  // Utiliser la session Better Auth
  const { data: session, isPending: isSessionLoading } = useSession();

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
        // Attendre que la session soit chargée
        if (isSessionLoading) return;

        // Si l'utilisateur est connecté, récupérer son rôle depuis l'API
        if (session?.user?.id) {
          const apiUserRole = await fetchUserRole(session.user.id);
          if (apiUserRole) {
            setUserRole(apiUserRole);
            saveLocalRole(apiUserRole.roleType.toLowerCase());
            setIsLoading(false);
            return;
          }
        }

        // Fallback sur localStorage si pas de rôle dans l'API
        const localRole = getLocalRole();
        if (localRole) {
          const tempUserRole: UserRole = {
            id: "local",
            userId: session?.user?.id || "local",
            roleType: localRole.toUpperCase() as RoleType,
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
        setIsLoading(false);
      }
    };

    initializeUserRole();
  }, [session, isSessionLoading]);

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

  // Récupérer le rôle de l'utilisateur connecté depuis l'API
  const fetchUserRole = async (userId: string) => {
    try {
      const response = await fetch("/api/user-roles/me");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la récupération du rôle"
        );
      }

      const data = await response.json();
      return data.userRole;
    } catch (err) {
      console.error("Erreur lors de la récupération du rôle:", err);
      return null;
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

  // Récupérer l'ID de l'utilisateur connecté
  const getCurrentUserId = (): string | null => {
    return session?.user?.id || null;
  };

  return {
    userRole,
    isLoading: isLoading || isSessionLoading,
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
    getCurrentUserId,
    isAuthenticated: !!session?.user?.id,
  };
}
