"use client";
import { Button } from "@/components/ui/button";
import { useHybridUserRole } from "@/src/hooks/useHybridUserRole";
import { signOut, useSession } from "@/src/lib/auth-client";
import { ROLES, ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/src/lib/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const {
    userRole,
    isLoading: isUserRoleLoading,
    saveRole,
  } = useHybridUserRole();
  const { data: session, isPending: isSessionLoading } = useSession();

  // Rediriger automatiquement vers le bon rôle si l'utilisateur en a déjà un
  useEffect(() => {
    if (!isSessionLoading && !isUserRoleLoading && userRole) {
      const rolePath = userRole.roleType.toLowerCase();
      router.push(`/dashboard/${rolePath}`);
    }
  }, [userRole, isUserRoleLoading, isSessionLoading, router]);

  // Rediriger si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!isSessionLoading && !session?.user?.id) {
      router.push("/");
    }
  }, [session, isSessionLoading, router]);

  // Ce useEffect n'est plus nécessaire car useHybridUserRole gère automatiquement la récupération

  const handleRoleSelect = async (role: string) => {
    await saveRole(role);
    setSelectedRole(role);

    // Rediriger vers le bon dashboard
    switch (role) {
      case "organisateur":
        router.push("/dashboard/organisateur");
        break;
      case "equipe":
        router.push("/dashboard/equipe");
        break;
      case "joueur":
        router.push("/dashboard/joueur");
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    // Le hook useHybridUserRole nettoiera automatiquement les cookies lors de la déconnexion
    setSelectedRole(null);
    await signOut();
    router.push("/");
  };

  // Afficher un loader pendant le chargement
  if (isSessionLoading || isUserRoleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-700 font-medium">
            Chargement du dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Rediriger si pas d'utilisateur connecté
  if (!session?.user?.id) {
    return null; // Le useEffect s'occupera de la redirection
  }

  // Si l'utilisateur a déjà un rôle, ne pas afficher cette page (redirection en cours)
  if (userRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-700 font-medium">
            Redirection vers votre dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dashboard BigMatch
          </h1>
          <p className="text-lg text-gray-600">
            Sélectionnez votre rôle pour accéder à votre espace personnel
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(ROLES).map(([key, role]) => (
            <div
              key={role}
              className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-lg ${
                selectedRole === key.toLowerCase()
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => handleRoleSelect(key.toLowerCase())}
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {ROLE_LABELS[role]}
                </h3>
                <p className="text-gray-600 text-sm">
                  {ROLE_DESCRIPTIONS[role]}
                </p>
              </div>
              <Button
                className="w-full"
                variant={
                  selectedRole === key.toLowerCase() ? "default" : "outline"
                }
              >
                {selectedRole === key.toLowerCase()
                  ? "Rôle sélectionné"
                  : "Sélectionner"}
              </Button>
            </div>
          ))}
        </div>

        {selectedRole && (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Rôle actuel :{" "}
              <span className="font-semibold capitalize">{selectedRole}</span>
            </p>
            <div className="space-x-4">
              <Button
                onClick={() => {
                  switch (selectedRole) {
                    case "organisateur":
                      router.push("/dashboard/organisateur");
                      break;
                    case "equipe":
                      router.push("/dashboard/equipe");
                      break;
                    case "joueur":
                      router.push("/dashboard/joueur");
                      break;
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Accéder au dashboard
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Changer de rôle
              </Button>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <Button variant="ghost" onClick={handleLogout}>
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  );
}
