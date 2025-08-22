"use client";

import { ProtectedRoute } from "@/components/auth";
import { RoleManager } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHybridUserRole } from "@/src/hooks/useHybridUserRole";
import { ArrowLeft, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserRolesPage() {
  const router = useRouter();
  const { userRole } = useHybridUserRole();

  const handleGoBack = () => {
    if (userRole) {
      router.push(`/dashboard/${userRole.roleType.toLowerCase()}`);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </Button>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Gestion des rôles
                  </h1>
                  <p className="text-gray-600">
                    Gérez vos rôles et permissions sur BigMatch
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations sur les rôles */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>À propos des rôles</span>
                </CardTitle>
                <CardDescription>
                  Les rôles déterminent les fonctionnalités auxquelles vous avez
                  accès sur BigMatch.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-lg border border-purple-200 bg-purple-50">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">O</span>
                      </div>
                      <h3 className="font-semibold text-purple-900">
                        Organisateur
                      </h3>
                    </div>
                    <p className="text-sm text-purple-700 mb-3">
                      Créez et gérez des événements sportifs, définissez les
                      règles et supervisez les compétitions.
                    </p>
                    <ul className="text-xs text-purple-600 space-y-1">
                      <li>• Créer des événements</li>
                      <li>• Gérer les participants</li>
                      <li>• Définir les règles</li>
                      <li>• Superviser les compétitions</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">É</span>
                      </div>
                      <h3 className="font-semibold text-blue-900">Équipe</h3>
                    </div>
                    <p className="text-sm text-blue-700 mb-3">
                      Rejoignez des événements en tant qu'équipe et gérez vos
                      membres.
                    </p>
                    <ul className="text-xs text-blue-600 space-y-1">
                      <li>• Rejoindre des compétitions</li>
                      <li>• Gérer l'équipe</li>
                      <li>• Suivre les performances</li>
                      <li>• Statistiques d'équipe</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border border-green-200 bg-green-50">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">J</span>
                      </div>
                      <h3 className="font-semibold text-green-900">Joueur</h3>
                    </div>
                    <p className="text-sm text-green-700 mb-3">
                      Participez individuellement aux événements et suivez vos
                      statistiques.
                    </p>
                    <ul className="text-xs text-green-600 space-y-1">
                      <li>• Rejoindre des événements</li>
                      <li>• Statistiques personnelles</li>
                      <li>• Gérer ses sports</li>
                      <li>• Suivi des performances</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gestionnaire de rôles */}
          <RoleManager
            onRoleChanged={() => {
              // Rediriger vers le nouveau dashboard après changement de rôle
              setTimeout(() => {
                handleGoBack();
              }, 1000);
            }}
          />

          {/* Note importante */}
          <div className="mt-8">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-2">
                      Important à savoir
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Vous pouvez changer votre rôle à tout moment</li>
                      <li>
                        • Le changement de rôle est immédiat et vous redirigera
                        vers le dashboard correspondant
                      </li>
                      <li>
                        • Certaines fonctionnalités nécessitent des rôles
                        spécifiques
                      </li>
                      <li>
                        • Vos données et préférences sont conservées lors du
                        changement de rôle
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
