"use client";

import { Button } from "@/components/ui/button";
import { OptionCard } from "@/components/ui/option-card";
import { RoleType } from "@/src/generated/prisma";
import { useUserRole } from "@/src/hooks/useUserRole";
import { useSession } from "@/src/lib/auth-client";
import {
  ROLES,
  ROLE_COLORS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from "@/src/lib/constants";
import { ArrowRight, Trophy, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Welcome() {
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { createUserRole, getLocalRole } = useUserRole();
  const { data: session, isPending: isSessionLoading } = useSession();

  // Rediriger si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!isSessionLoading && !session?.user?.id) {
      router.push("/");
    }
  }, [session, isSessionLoading, router]);

  const roleOptions = [
    {
      id: ROLES.ORGANISATEUR,
      label: ROLE_LABELS[ROLES.ORGANISATEUR],
      description: ROLE_DESCRIPTIONS[ROLES.ORGANISATEUR],
      icon: Trophy,
      color: ROLE_COLORS[ROLES.ORGANISATEUR],
    },
    {
      id: ROLES.EQUIPE,
      label: ROLE_LABELS[ROLES.EQUIPE],
      description: ROLE_DESCRIPTIONS[ROLES.EQUIPE],
      icon: Users,
      color: ROLE_COLORS[ROLES.EQUIPE],
    },
    {
      id: ROLES.JOUEUR,
      label: ROLE_LABELS[ROLES.JOUEUR],
      description: ROLE_DESCRIPTIONS[ROLES.JOUEUR],
      icon: User,
      color: ROLE_COLORS[ROLES.JOUEUR],
    },
  ];

  const handleContinue = async () => {
    if (!selectedRole) return;
    if (!session?.user?.id) {
      console.error("Aucun utilisateur connecté");
      return;
    }

    try {
      setIsSubmitting(true);

      // Utiliser l'ID de l'utilisateur authentifié
      const userId = session.user.id;

      await createUserRole(userId, selectedRole);

      // Rediriger vers la vue correspondante
      router.push(`/dashboard/${selectedRole.toLowerCase()}`);
    } catch (error) {
      console.error("Erreur lors de la création du rôle:", error);
      // En cas d'erreur, on peut fallback sur localStorage
      localStorage.setItem("userRole", selectedRole.toLowerCase());
      router.push(`/dashboard/${selectedRole.toLowerCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Afficher un loader pendant le chargement de la session
  if (isSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la session...</p>
        </div>
      </div>
    );
  }

  // Rediriger si pas d'utilisateur connecté
  if (!session?.user?.id) {
    return null; // Le useEffect s'occupera de la redirection
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenue sur BigMatch
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choisissez votre rôle pour commencer votre expérience sur la
            plateforme
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {roleOptions.map((role) => (
            <OptionCard
              key={role.id}
              label={role.label}
              description={role.description}
              icon={role.icon}
              color={role.color}
              isSelected={selectedRole === role.id}
              onClick={() => setSelectedRole(role.id)}
            />
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedRole || isSubmitting}
            className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Création...
              </>
            ) : (
              <>
                Continuer
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>

        {/* Instructions */}
        {!selectedRole && (
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Sélectionnez un rôle pour continuer
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
