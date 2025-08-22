"use client";

import { DynamicBackground } from "@/components/ui/bouncing-ball";
import { Button } from "@/components/ui/button";
import { OptionCard } from "@/components/ui/option-card";
import { RoleType } from "@/src/generated/prisma";
import { useHybridUserRole } from "@/src/hooks/useHybridUserRole";
import { useSession } from "@/src/lib/auth-client";
import {
  ROLES,
  ROLE_COLORS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from "@/src/lib/constants";
import {
  ArrowRight,
  Sparkles,
  Target,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Welcome() {
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const {
    createUserRole,
    userRole,
    isLoading: isUserRoleLoading,
    saveRole,
  } = useHybridUserRole();
  const { data: session, isPending: isSessionLoading } = useSession();

  // Rediriger si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!isSessionLoading && !session?.user?.id) {
      router.push("/");
    }
  }, [session, isSessionLoading, router]);

  // Rediriger automatiquement si l'utilisateur a déjà un VRAI rôle (pas un rôle temporaire)
  useEffect(() => {
    if (
      !isSessionLoading &&
      !isUserRoleLoading &&
      session?.user?.id &&
      userRole &&
      userRole.id !== "local" // Vérifier que ce n'est pas un rôle temporaire
    ) {
      // L'utilisateur a déjà un vrai rôle, le rediriger vers son dashboard
      const rolePath = userRole.roleType.toLowerCase();
      router.push(`/dashboard/${rolePath}`);
    }
  }, [session, isSessionLoading, isUserRoleLoading, userRole, router]);

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
      // En cas d'erreur, on peut fallback sur cookies client
      await saveRole(selectedRole.toLowerCase());
      router.push(`/dashboard/${selectedRole.toLowerCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Afficher un loader pendant le chargement de la session ou du rôle utilisateur
  if (isSessionLoading || isUserRoleLoading) {
    return (
      <DynamicBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-700 font-medium">
              Chargement de la session...
            </p>
          </div>
        </div>
      </DynamicBackground>
    );
  }

  // Rediriger si pas d'utilisateur connecté ou si l'utilisateur a déjà un VRAI rôle
  if (!session?.user?.id || (userRole && userRole.id !== "local")) {
    return null; // Le useEffect s'occupera de la redirection
  }

  return (
    <DynamicBackground>
      <div className="min-h-screen p-4 relative z-10">
        <div className="mx-auto max-w-5xl">
          {/* Header avec animation */}
          <div className="text-center mb-16 pt-12 animate-fade-in-up">
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Choisissez votre rôle
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Définissez votre profil sur BigMatch pour commencer votre
              expérience sur la plateforme
            </p>
          </div>

          {/* Role Selection avec animations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-fade-in-up animation-delay-200">
            {roleOptions.map((role, index) => (
              <div
                key={role.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <OptionCard
                  label={role.label}
                  description={role.description}
                  icon={role.icon}
                  color={role.color}
                  isSelected={selectedRole === role.id}
                  onClick={() => setSelectedRole(role.id)}
                />
              </div>
            ))}
          </div>

          {/* Continue Button avec animation */}
          <div className="text-center animate-fade-in-up animation-delay-600">
            <Button
              onClick={handleContinue}
              disabled={!selectedRole || isSubmitting}
              className="px-10 py-4 text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Création...
                </>
              ) : (
                <>
                  Continuer
                  <ArrowRight className="ml-3 h-6 w-6" />
                </>
              )}
            </Button>
          </div>

          {/* Instructions avec animation */}
          {!selectedRole && (
            <div className="text-center mt-12 animate-fade-in-up animation-delay-800">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
                <Target className="w-5 h-5 text-blue-600" />
                <p className="text-gray-700 font-medium">
                  Sélectionnez un rôle pour continuer
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DynamicBackground>
  );
}
