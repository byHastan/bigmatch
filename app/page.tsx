"use client";

import { DynamicBackground } from "@/components/ui/bouncing-ball";
import ButtonGoogleAuth from "@/src/components/auth/ButtonGoogleAuth";
import { useHybridUserRole } from "@/src/hooks/useHybridUserRole";
import { useSession } from "@/src/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();
  const { userRole, isLoading: isUserRoleLoading } = useHybridUserRole();

  useEffect(() => {
    // Attendre que la session et le rôle soient chargés
    if (isSessionLoading || isUserRoleLoading) return;

    if (session?.user?.id) {
      // Utilisateur connecté, vérifier s'il a un rôle
      if (userRole) {
        // Rediriger vers le dashboard correspondant
        const rolePath = userRole.roleType.toLowerCase();
        router.push(`/dashboard/${rolePath}`);
      } else {
        // Pas de rôle, rediriger vers la page de sélection
        router.push("/welcome");
      }
    } else {
      // Pas d'utilisateur connecté, afficher le bouton de connexion
      setIsLoading(false);
    }
  }, [session, isSessionLoading, userRole, isUserRoleLoading, router]);

  // Afficher un loader pendant le chargement
  if (isLoading || isSessionLoading || isUserRoleLoading) {
    return (
      <DynamicBackground>
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-700 font-medium">Chargement...</p>
          </div>
        </div>
      </DynamicBackground>
    );
  }

  return (
    <DynamicBackground>
      <div className="flex flex-col items-center justify-center min-h-screen relative z-10">
        {/* Logo et titre principal avec animation */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-6xl font-bold pb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-fade-in-up">
            BigMatch
          </h1>

          <p className="text-lg text-gray-600 mt-4 max-w-xl animate-fade-in-up animation-delay-400">
            Organisez, participez et gérez vos compétitions sportives en toute
            simplicité
          </p>
        </div>

        {/* Bouton de connexion avec animation */}
        <div className="animate-fade-in-up animation-delay-800">
          <ButtonGoogleAuth />
        </div>
      </div>
    </DynamicBackground>
  );
}
