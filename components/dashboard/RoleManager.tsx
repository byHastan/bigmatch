"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RoleType } from "@/src/generated/prisma";
import { useHybridUserRole } from "@/src/hooks/useHybridUserRole";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/src/lib/constants";
import { AlertCircle, CheckCircle, Trophy, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const roleIcons = {
  ORGANISATEUR: Trophy,
  EQUIPE: Users,
  JOUEUR: User,
};

const roleOptions = [
  {
    id: "ORGANISATEUR" as RoleType,
    label: ROLE_LABELS?.ORGANISATEUR || "Organisateur",
    description:
      ROLE_DESCRIPTIONS?.ORGANISATEUR ||
      "Créer et gérer des événements sportifs",
    permissions: [
      "Créer des événements",
      "Gérer les participants",
      "Définir les règles",
    ],
  },
  {
    id: "EQUIPE" as RoleType,
    label: ROLE_LABELS?.EQUIPE || "Équipe",
    description:
      ROLE_DESCRIPTIONS?.EQUIPE || "Rejoindre des événements en tant qu'équipe",
    permissions: [
      "Rejoindre des compétitions",
      "Gérer l'équipe",
      "Suivre les performances",
    ],
  },
  {
    id: "JOUEUR" as RoleType,
    label: ROLE_LABELS?.JOUEUR || "Joueur",
    description:
      ROLE_DESCRIPTIONS?.JOUEUR || "Participer individuellement aux événements",
    permissions: [
      "Rejoindre des événements",
      "Statistiques personnelles",
      "Gérer ses sports",
    ],
  },
];

interface RoleManagerProps {
  showError?: boolean;
  requiredRole?: RoleType;
  onRoleChanged?: () => void;
}

function RoleManager({
  showError = false,
  requiredRole,
  onRoleChanged,
}: RoleManagerProps) {
  const { userRole, changeUserRole, createUserRole, isLoading } =
    useHybridUserRole();
  const [changingRole, setChangingRole] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleRoleChange = async (newRoleType: RoleType) => {
    const userId = userRole?.userId;
    if (!userId) {
      setSuccessMessage("❌ Utilisateur non connecté");
      setTimeout(() => setSuccessMessage(null), 3000);
      return;
    }

    try {
      setChangingRole(true);

      // Si l'utilisateur a un rôle temporaire (id: "local"), créer un nouveau rôle
      // Sinon, changer le rôle existant
      if (userRole?.id === "local") {
        await createUserRole(userId, newRoleType);
      } else {
        await changeUserRole(userId, newRoleType);
      }

      const roleLabel = roleOptions.find((r) => r.id === newRoleType)?.label;
      setSuccessMessage(
        `Rôle changé avec succès ! Vous êtes maintenant ${roleLabel}.`
      );

      // Masquer le message après 3 secondes
      setTimeout(() => setSuccessMessage(null), 3000);

      // Laisser le callback parent gérer la redirection
      if (onRoleChanged) {
        onRoleChanged();
      } else {
        // Seulement rediriger si pas de callback (par défaut)
        router.push(`/dashboard/${newRoleType.toLowerCase()}`);
      }
    } catch (error) {
      console.error("Erreur lors du changement de rôle:", error);
      setSuccessMessage(
        "❌ Impossible de changer le rôle. Veuillez réessayer."
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setChangingRole(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Chargement...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Message de succès/erreur */}
      {successMessage && (
        <Card
          className={`border-2 ${
            successMessage.includes("❌")
              ? "border-red-200 bg-red-50"
              : "border-green-200 bg-green-50"
          }`}
        >
          <CardContent className="p-4">
            <div
              className={`flex items-center space-x-2 ${
                successMessage.includes("❌")
                  ? "text-red-700"
                  : "text-green-700"
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <p className="font-medium">{successMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {showError && requiredRole && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">Permissions insuffisantes</p>
                <p className="text-sm">
                  Vous devez avoir le rôle "
                  {roleOptions.find((r) => r.id === requiredRole)?.label}" pour
                  effectuer cette action.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Gestion des rôles</span>
          </CardTitle>
          <CardDescription>
            Votre rôle actuel détermine les fonctionnalités auxquelles vous avez
            accès.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Rôle actuel */}
          {userRole && (
            <div
              className={`p-4 rounded-lg border ${
                userRole.id === "local"
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle
                    className={`w-5 h-5 ${
                      userRole.id === "local"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  />
                  <div>
                    <p
                      className={`font-medium ${
                        userRole.id === "local"
                          ? "text-yellow-800"
                          : "text-green-800"
                      }`}
                    >
                      {userRole.id === "local"
                        ? "Rôle temporaire"
                        : "Rôle actuel"}
                    </p>
                    <p
                      className={`text-sm ${
                        userRole.id === "local"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {
                        roleOptions.find((r) => r.id === userRole.roleType)
                          ?.label
                      }
                      {userRole.id === "local" && " (non sauvegardé)"}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    userRole.id === "local"
                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                      : "bg-green-100 text-green-800 border-green-200"
                  }
                >
                  {userRole.id === "local" ? "Temporaire" : "Actif"}
                </Badge>
              </div>
              {userRole.id === "local" && (
                <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
                  <p className="text-xs text-yellow-700">
                    💡 Ce rôle n'est pas encore sauvegardé. Choisissez un
                    nouveau rôle ci-dessous pour le confirmer et l'enregistrer
                    définitivement.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Options de rôles */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Changer de rôle</h4>
            <div className="grid gap-3">
              {roleOptions.map((role) => {
                const Icon = roleIcons[role.id];
                const isCurrentRole = userRole?.roleType === role.id;

                return (
                  <div
                    key={role.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isCurrentRole
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0">
                          <Icon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">
                            {role.label}
                          </h5>
                          <p className="text-sm text-gray-600 mt-1">
                            {role.description}
                          </p>
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">
                              Permissions :
                            </p>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {role.permissions.map((permission, index) => (
                                <li
                                  key={index}
                                  className="flex items-center space-x-1"
                                >
                                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                  <span>{permission}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        {isCurrentRole ? (
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800"
                          >
                            Actuel
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRoleChange(role.id)}
                            disabled={changingRole}
                            className="hover:bg-blue-50 hover:border-blue-300"
                          >
                            {changingRole ? "Changement..." : "Choisir"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RoleManager;
