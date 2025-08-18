"use client";

import { RoleType } from "@/src/generated/prisma";
import { useUserRole } from "@/src/hooks/useUserRole";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: RoleType[];
  redirectTo?: string;
}

export default function RoleGuard({
  children,
  allowedRoles = [],
  redirectTo = "/welcome",
}: RoleGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { userRole, isLoading: isRoleLoading, getLocalRole } = useUserRole();

  useEffect(() => {
    // Vérifier d'abord le rôle depuis l'API
    if (!isRoleLoading) {
      if (userRole) {
        // Rôle trouvé dans l'API
        if (
          allowedRoles.length === 0 ||
          allowedRoles.includes(userRole.roleType)
        ) {
          setIsAuthorized(true);
        } else {
          router.push(redirectTo);
        }
      } else {
        // Fallback sur localStorage
        const localRole = getLocalRole();
        if (localRole) {
          const roleType = localRole.toUpperCase() as RoleType;
          if (allowedRoles.length === 0 || allowedRoles.includes(roleType)) {
            setIsAuthorized(true);
          } else {
            router.push(redirectTo);
          }
        } else {
          router.push(redirectTo);
        }
      }
      setIsLoading(false);
    }
  }, [userRole, isRoleLoading, allowedRoles, redirectTo, router, getLocalRole]);

  if (isLoading || isRoleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
