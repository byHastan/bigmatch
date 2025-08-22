"use client";

import { RoleType } from "@/src/generated/prisma";
import { useHybridUserRole } from "@/src/hooks/useHybridUserRole";
import { useSession } from "@/src/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DashboardGuardProps {
  children: React.ReactNode;
  requiredRole: RoleType;
  fallbackPath?: string;
}

export default function DashboardGuard({
  children,
  requiredRole,
  fallbackPath = "/welcome",
}: DashboardGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Utiliser l'authentification Better Auth
  const { data: session, isPending: isSessionLoading } = useSession();
  const { userRole, isLoading: isRoleLoading } = useHybridUserRole();

  useEffect(() => {
    // Attendre que l'authentification et le rôle soient chargés
    if (isSessionLoading || isRoleLoading) return;

    // Vérifier si l'utilisateur est connecté
    if (!session?.user?.id) {
      router.push("/");
      return;
    }

    // Vérifier le rôle
    if (userRole) {
      if (userRole.roleType === requiredRole && userRole.isActive) {
        // Rôle correct et actif
        setIsAuthorized(true);
      } else {
        // Rôle incorrect, rediriger vers le bon dashboard
        const correctPath = `/dashboard/${userRole.roleType.toLowerCase()}`;
        router.push(correctPath);
      }
    } else {
      // Pas de rôle trouvé, rediriger vers la page de sélection
      router.push(fallbackPath);
    }

    setIsLoading(false);
  }, [
    session,
    userRole,
    isSessionLoading,
    isRoleLoading,
    requiredRole,
    fallbackPath,
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
