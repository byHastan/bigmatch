"use client";

import { RoleType } from "@/src/generated/prisma";
import { useUserRole } from "@/src/hooks/useUserRole";
import { useSession } from "@/src/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: RoleType;
  fallbackPath?: string;
  requireAuth?: boolean;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = "/welcome",
  requireAuth = true,
}: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Utiliser l'authentification Better Auth
  const { data: session, isPending: isSessionLoading } = useSession();
  const { userRole, isLoading: isRoleLoading } = useUserRole();

  useEffect(() => {
    // Attendre que l'authentification et le rôle soient chargés
    if (isSessionLoading || isRoleLoading) return;

    // Si l'authentification n'est pas requise, autoriser l'accès
    if (!requireAuth) {
      setIsAuthorized(true);
      setIsLoading(false);
      return;
    }

    // Vérifier si l'utilisateur est connecté
    if (!session?.user?.id) {
      router.push("/");
      return;
    }

    // Si un rôle spécifique est requis
    if (requiredRole) {
      if (userRole && userRole.roleType === requiredRole && userRole.isActive) {
        // Rôle correct et actif
        setIsAuthorized(true);
      } else {
        // Rôle incorrect ou pas de rôle, rediriger
        if (userRole) {
          // Rediriger vers le bon dashboard
          const dashboardPath = `/dashboard/${userRole.roleType.toLowerCase()}`;
          router.push(dashboardPath);
        } else {
          // Pas de rôle, rediriger vers la page de sélection
          router.push(fallbackPath);
        }
      }
    } else {
      // Pas de rôle requis, juste vérifier l'authentification
      if (userRole) {
        // L'utilisateur a un rôle, rediriger vers son dashboard
        const dashboardPath = `/dashboard/${userRole.roleType.toLowerCase()}`;
        router.push(dashboardPath);
      } else {
        // Pas de rôle, rediriger vers la page de sélection
        router.push(fallbackPath);
      }
    }

    setIsLoading(false);
  }, [
    session,
    userRole,
    isSessionLoading,
    isRoleLoading,
    requiredRole,
    fallbackPath,
    requireAuth,
    router,
  ]);

  // Afficher un loader pendant le chargement
  if (isLoading || isSessionLoading || isRoleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des autorisations...</p>
        </div>
      </div>
    );
  }

  // Rediriger si pas autorisé
  if (!isAuthorized) {
    return null; // Le useEffect s'occupera de la redirection
  }

  return <>{children}</>;
}
