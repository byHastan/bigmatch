"use client";

import { DynamicBackground } from "@/components/ui/bouncing-ball";
import ButtonGoogleAuth from "@/src/components/auth/ButtonGoogleAuth";
import { useUserRole } from "@/src/hooks/useUserRole";
import { useSession } from "@/src/lib/auth-client";
import { Trophy, Users, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();
  const { userRole, isLoading: isUserRoleLoading } = useUserRole();

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

        {/* Fonctionnalités principales avec icônes animées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl animate-fade-in-up animation-delay-600">
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Organisation
            </h3>
            <p className="text-gray-600 text-sm">
              Créez et gérez vos événements sportifs
            </p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Participation
            </h3>
            <p className="text-gray-600 text-sm">
              Rejoignez des équipes et des compétitions
            </p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Performance
            </h3>
            <p className="text-gray-600 text-sm">
              Suivez vos statistiques et progrès
            </p>
          </div>
        </div>

        {/* Bouton de connexion avec animation */}
        <div className="animate-fade-in-up animation-delay-800">
          <ButtonGoogleAuth />
        </div>
      </div>
    </DynamicBackground>
  );
}
