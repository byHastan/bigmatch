"use client";

import { RoleType } from "@/src/generated/prisma";
import { useUserRole } from "@/src/hooks/useUserRole";
import { useSession } from "@/src/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface EventGuardProps {
  children: React.ReactNode;
  eventId?: string;
  allowedRoles?: RoleType[];
  fallbackPath?: string;
}

export default function EventGuard({
  children,
  eventId,
  allowedRoles = [],
  fallbackPath = "/dashboard",
}: EventGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Utiliser l'authentification Better Auth
  const { data: session, isPending: isSessionLoading } = useSession();
  const { userRole, isLoading: isRoleLoading } = useUserRole();

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
      if (
        allowedRoles.length === 0 ||
        allowedRoles.includes(userRole.roleType)
      ) {
        // Rôle autorisé
        setIsAuthorized(true);
      } else {
        // Rôle non autorisé, rediriger vers le dashboard approprié
        const dashboardPath = `/dashboard/${userRole.roleType.toLowerCase()}`;
        router.push(dashboardPath);
      }
    } else {
      // Pas de rôle trouvé, rediriger vers la page de sélection
      router.push("/welcome");
    }

    setIsLoading(false);
  }, [
    session,
    userRole,
    isSessionLoading,
    isRoleLoading,
    allowedRoles,
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
