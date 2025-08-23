"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateMatch } from "@/src/hooks/useMatches";
import { ArrowLeft, Calendar, Clock, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface CreateMatchFormProps {
  eventId: string;
  eventType: "MATCH" | "CHAMPIONNAT" | "COUPE";
  teams: Array<{
    id: string;
    name: string;
    logo: string | null;
  }>;
  onBack?: () => void;
  onSuccess?: (matchId: string) => void;
}

interface FormData {
  teamAId: string;
  teamBId: string;
  round?: number;
  position?: number;
  scheduledAt?: string;
}

export default function CreateMatchForm({
  eventId,
  eventType,
  teams,
  onBack,
  onSuccess,
}: CreateMatchFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createMatch = useCreateMatch();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  const teamAId = watch("teamAId");
  const teamBId = watch("teamBId");

  const availableTeamsB = teams.filter((team) => team.id !== teamAId);

  const onSubmit = async (data: FormData) => {
    if (data.teamAId === data.teamBId) {
      alert("Veuillez sélectionner deux équipes différentes");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createMatch.mutateAsync({
        eventId,
        teamAId: data.teamAId,
        teamBId: data.teamBId,
        round: data.round || 1,
        position: data.position || 1,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      });

      onSuccess?.(result.data.id);
    } catch (error) {
      console.error("Erreur lors de la création du match:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEventTypeConfig = () => {
    switch (eventType) {
      case "MATCH":
        return {
          title: "Match Simple",
          description: "Opposition directe entre deux équipes",
          icon: Users,
          color: "bg-blue-100 text-blue-800",
        };
      case "CHAMPIONNAT":
        return {
          title: "Match de Championnat",
          description: "Match comptant pour le classement",
          icon: Calendar,
          color: "bg-green-100 text-green-800",
        };
      case "COUPE":
        return {
          title: "Match de Tournoi",
          description: "Match éliminatoire",
          icon: Clock,
          color: "bg-purple-100 text-purple-800",
        };
      default:
        return {
          title: "Nouveau Match",
          description: "Créer un nouveau match",
          icon: Users,
          color: "bg-gray-100 text-gray-800",
        };
    }
  };

  const config = getEventTypeConfig();
  const ConfigIcon = config.icon;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Button>
              )}

              <div className="flex items-center gap-3">
                <ConfigIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {config.title}
                  </h1>
                  <p className="text-gray-600">{config.description}</p>
                </div>
              </div>
            </div>

            <Badge className={config.color}>{eventType}</Badge>
          </div>
        </div>

        {/* Formulaire */}
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Sélection des équipes */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Équipe A */}
              <div className="space-y-2">
                <Label htmlFor="teamAId">Équipe A</Label>
                <select
                  id="teamAId"
                  {...register("teamAId", {
                    required: "Veuillez sélectionner l'équipe A",
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner une équipe</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                {errors.teamAId && (
                  <p className="text-sm text-red-600">
                    {errors.teamAId.message}
                  </p>
                )}
              </div>

              {/* Équipe B */}
              <div className="space-y-2">
                <Label htmlFor="teamBId">Équipe B</Label>
                <select
                  id="teamBId"
                  {...register("teamBId", {
                    required: "Veuillez sélectionner l'équipe B",
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!teamAId}
                >
                  <option value="">Sélectionner une équipe</option>
                  {availableTeamsB.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                {errors.teamBId && (
                  <p className="text-sm text-red-600">
                    {errors.teamBId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Aperçu du match */}
            {teamAId && teamBId && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-3">
                  Aperçu du match
                </h3>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">
                      {teams.find((t) => t.id === teamAId)?.name}
                    </div>
                  </div>
                  <div className="text-gray-400 font-bold">VS</div>
                  <div className="text-center">
                    <div className="font-semibold text-red-600">
                      {teams.find((t) => t.id === teamBId)?.name}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Paramètres du match */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Round */}
              {(eventType === "COUPE" || eventType === "CHAMPIONNAT") && (
                <div className="space-y-2">
                  <Label htmlFor="round">Round</Label>
                  <Input
                    id="round"
                    type="number"
                    min="1"
                    {...register("round")}
                    placeholder="1"
                  />
                </div>
              )}

              {/* Position */}
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  type="number"
                  min="1"
                  {...register("position")}
                  placeholder="1"
                />
              </div>

              {/* Date programmée */}
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Date programmée (optionnel)</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  {...register("scheduledAt")}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t">
              {onBack && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !teamAId || !teamBId}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Créer le match
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Informations */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="font-semibold mb-3">Informations</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Le match sera créé avec le statut "Programmé"</p>
            <p>• Les scores seront initialisés à 0-0</p>
            <p>
              • L'organisateur pourra démarrer le match quand il le souhaite
            </p>
            {eventType === "CHAMPIONNAT" && (
              <p>• Ce match comptera dans le classement du championnat</p>
            )}
            {eventType === "COUPE" && (
              <p>• Le gagnant de ce match avancera au round suivant</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
