"use client";

import { LoadingSpinner } from "@/components/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSecureUserRole } from "@/src/hooks/useSecureUserRole";
import { useToast } from "@/src/hooks/useToast";
import {
  ArrowLeft,
  Calendar,
  Plus,
  Radio,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

interface PlayerForm {
  name: string;
  position?: string;
  number?: number;
}

interface TeamForm {
  name: string;
  description?: string;
  logo?: string;
  players: PlayerForm[];
}

interface StandaloneMatchForm {
  teamA: TeamForm;
  teamB: TeamForm;
  matchName?: string;
  sport?: string;
  scheduledAt?: string;
  createLiveLink?: boolean;
}

export default function CreateStandaloneMatchPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { userRole, isLoading: roleLoading } = useSecureUserRole();
  const { showSuccess, showError } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<StandaloneMatchForm>({
    defaultValues: {
      teamA: { name: "", players: [{ name: "" }] },
      teamB: { name: "", players: [{ name: "" }] },
    },
  });

  const {
    fields: playersA,
    append: appendPlayerA,
    remove: removePlayerA,
  } = useFieldArray({ control, name: "teamA.players" });

  const {
    fields: playersB,
    append: appendPlayerB,
    remove: removePlayerB,
  } = useFieldArray({ control, name: "teamB.players" });

  const watchedTeamA = watch("teamA");
  const watchedTeamB = watch("teamB");
  const watchedCreateLiveLink = watch("createLiveLink");

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!userRole || !["ORGANISATEUR", "EQUIPE"].includes(userRole.roleType)) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Accès refusé
            </h2>
            <p className="text-gray-600 mb-4">
              Vous devez être organisateur ou capitaine d'équipe pour créer un
              match.
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              Retour à l'accueil
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: StandaloneMatchForm) => {
    if (data.teamA.name === data.teamB.name) {
      showError("Les équipes doivent avoir des noms différents");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/matches/standalone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la création du match");
      }

      const result = await response.json();
      showSuccess("Match créé avec succès !");

      // Rediriger vers le match créé
      router.push(`/matches/${result.data.id}`);
    } catch (error: any) {
      console.error("Erreur:", error);
      showError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>

              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Créer un Match Direct
                  </h1>
                  <p className="text-gray-600">
                    Créez un match entre deux équipes sans événement
                  </p>
                </div>
              </div>
            </div>

            <Badge className="bg-purple-100 text-purple-800">STANDALONE</Badge>
          </div>
        </div>

        {/* Indicateur de progression */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                <div className="ml-2 text-sm">
                  {step === 1 && "Équipes"}
                  {step === 2 && "Joueurs"}
                  {step === 3 && "Match"}
                </div>
                {step < 3 && <div className="mx-4 w-12 h-0.5 bg-gray-200" />}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Étape 1: Configuration des équipes */}
          {currentStep === 1 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Configuration des équipes
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Équipe A */}
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-medium text-blue-900">Équipe A</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teamA.name">
                      Nom de l'équipe <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="teamA.name"
                      {...register("teamA.name", {
                        required: "Le nom de l'équipe A est requis",
                      })}
                      placeholder="Ex: Les Lions"
                    />
                    {errors.teamA?.name && (
                      <p className="text-sm text-red-600">
                        {errors.teamA.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teamA.description">
                      Description (optionnel)
                    </Label>
                    <Input
                      id="teamA.description"
                      {...register("teamA.description")}
                      placeholder="Description de l'équipe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teamA.logo">URL du logo (optionnel)</Label>
                    <Input
                      id="teamA.logo"
                      type="url"
                      {...register("teamA.logo")}
                      placeholder="https://exemple.com/logo.png"
                    />
                  </div>
                </div>

                {/* Équipe B */}
                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 pl-4">
                    <h3 className="font-medium text-red-900">Équipe B</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teamB.name">
                      Nom de l'équipe <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="teamB.name"
                      {...register("teamB.name", {
                        required: "Le nom de l'équipe B est requis",
                      })}
                      placeholder="Ex: Les Tigres"
                    />
                    {errors.teamB?.name && (
                      <p className="text-sm text-red-600">
                        {errors.teamB.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teamB.description">
                      Description (optionnel)
                    </Label>
                    <Input
                      id="teamB.description"
                      {...register("teamB.description")}
                      placeholder="Description de l'équipe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teamB.logo">URL du logo (optionnel)</Label>
                    <Input
                      id="teamB.logo"
                      type="url"
                      {...register("teamB.logo")}
                      placeholder="https://exemple.com/logo.png"
                    />
                  </div>
                </div>
              </div>

              {/* Aperçu du match */}
              {watchedTeamA.name && watchedTeamB.name && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-6">
                  <h3 className="font-medium text-blue-900 mb-3">
                    Aperçu du match
                  </h3>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">
                        {watchedTeamA.name}
                      </div>
                    </div>
                    <div className="text-gray-400 font-bold text-xl">VS</div>
                    <div className="text-center">
                      <div className="font-semibold text-red-600">
                        {watchedTeamB.name}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-6">
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!watchedTeamA.name || !watchedTeamB.name}
                >
                  Suivant: Joueurs
                </Button>
              </div>
            </Card>
          )}

          {/* Étape 2: Joueurs */}
          {currentStep === 2 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Ajouter des joueurs (optionnel)
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Joueurs Équipe A */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-blue-900">
                      Joueurs - {watchedTeamA.name}
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendPlayerA({ name: "" })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>

                  {playersA.map((field, index) => (
                    <div
                      key={field.id}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Joueur {index + 1}
                        </span>
                        {playersA.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePlayerA(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          {...register(`teamA.players.${index}.name`)}
                          placeholder="Nom"
                        />
                        <Input
                          type="number"
                          {...register(`teamA.players.${index}.number`, {
                            valueAsNumber: true,
                          })}
                          placeholder="N°"
                          min="1"
                          max="99"
                        />
                      </div>

                      <Input
                        {...register(`teamA.players.${index}.position`)}
                        placeholder="Position (optionnel)"
                      />
                    </div>
                  ))}
                </div>

                {/* Joueurs Équipe B */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-red-900">
                      Joueurs - {watchedTeamB.name}
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendPlayerB({ name: "" })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>

                  {playersB.map((field, index) => (
                    <div
                      key={field.id}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Joueur {index + 1}
                        </span>
                        {playersB.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePlayerB(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          {...register(`teamB.players.${index}.name`)}
                          placeholder="Nom"
                        />
                        <Input
                          type="number"
                          {...register(`teamB.players.${index}.number`, {
                            valueAsNumber: true,
                          })}
                          placeholder="N°"
                          min="1"
                          max="99"
                        />
                      </div>

                      <Input
                        {...register(`teamB.players.${index}.position`)}
                        placeholder="Position (optionnel)"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Précédent
                </Button>
                <Button type="button" onClick={nextStep}>
                  Suivant: Configuration du match
                </Button>
              </div>
            </Card>
          )}

          {/* Étape 3: Configuration du match */}
          {currentStep === 3 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Configuration du match
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="matchName">Nom du match (optionnel)</Label>
                  <Input
                    id="matchName"
                    {...register("matchName")}
                    placeholder="Ex: Match amical"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sport">Sport (optionnel)</Label>
                  <Input
                    id="sport"
                    {...register("sport")}
                    placeholder="Ex: Football, Basketball..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">
                    Date programmée (optionnel)
                  </Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    {...register("scheduledAt")}
                  />
                </div>
              </div>

              {/* Options de suivi en direct */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6 border border-red-200 mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Radio className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-red-900">
                    Suivi en direct
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="createLiveLink"
                      {...register("createLiveLink")}
                      className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                    />
                    <Label htmlFor="createLiveLink" className="text-gray-700">
                      Créer un lien de suivi en direct pour ce match
                    </Label>
                  </div>

                  {watchedCreateLiveLink && (
                    <div className="bg-white rounded-lg p-4 border border-red-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Radio className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-red-900">
                          Lien de suivi en direct activé
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Un lien unique sera généré pour permettre aux
                        spectateurs de suivre le match en temps réel.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Récapitulatif */}
              <div className="bg-gray-50 rounded-lg p-6 mt-6">
                <h3 className="font-semibold mb-4">Récapitulatif</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Équipe A:</span>
                    <span className="font-medium">{watchedTeamA.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Équipe B:</span>
                    <span className="font-medium">{watchedTeamB.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Joueurs Équipe A:</span>
                    <span>
                      {
                        playersA.filter((p) =>
                          watch(`teamA.players.${playersA.indexOf(p)}.name`)
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Joueurs Équipe B:</span>
                    <span>
                      {
                        playersB.filter((p) =>
                          watch(`teamB.players.${playersB.indexOf(p)}.name`)
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Précédent
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <Trophy className="h-4 w-4" />
                      Créer le match
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}
        </form>

        {/* Informations */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="font-semibold mb-3">ℹ️ Informations importantes</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Ce match sera indépendant de tout événement</p>
            <p>
              • Vous pourrez démarrer le match et gérer les scores directement
            </p>
            <p>• Les équipes et joueurs créés seront sauvegardés</p>
            <p>
              • Un lien de partage sera généré si vous activez le suivi en
              direct
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
