"use client";

import ButtonGoogleAuth from "@/src/components/auth/ButtonGoogleAuth";
import { useSession } from "@/src/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();

  useEffect(() => {
    // Attendre que la session soit chargée
    if (isSessionLoading) return;

    if (session?.user?.id) {
      // Utilisateur connecté, vérifier s'il a un rôle
      const userRole = localStorage.getItem("userRole");
      if (userRole) {
        // Rediriger vers le dashboard correspondant
        router.push(`/dashboard/${userRole}`);
      } else {
        // Pas de rôle, rediriger vers la page de sélection
        router.push("/welcome");
      }
    } else {
      // Pas d'utilisateur connecté, afficher le bouton de connexion
      setIsLoading(false);
    }
  }, [session, isSessionLoading, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bienvenue sur BigMatch
        </h1>
        <p className="text-xl text-gray-600 max-w-md">
          La plateforme de gestion d'événements sportifs
        </p>
      </div>
      <ButtonGoogleAuth />
    </div>
  );
}
