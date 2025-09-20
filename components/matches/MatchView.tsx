"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMatchStatusActions } from "@/src/hooks/useMatches";
import { useToast } from "@/src/hooks/useToast";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Clock,
  Copy,
  ExternalLink,
  MapPin,
  Pause,
  Play,
  Radio,
  Settings,
  Share2,
  Square,
  Users,
} from "lucide-react";
import Image from "next/image";

interface MatchViewProps {
  matchId: string;
  initialData?: any;
  isStandalone?: boolean;
  canModify?: boolean;
  onBack?: () => void;
}

export default function MatchView({
  matchId,
  initialData,
  isStandalone = false,
  canModify = false,
  onBack,
}: MatchViewProps) {
  const { showSuccess, showError } = useToast();
  const scoreActions = useMatchStatusActions();

  // Récupérer les données du match
  const {
    data: matchData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["match", matchId],
    queryFn: async () => {
      const response = await fetch(`/api/matches/${matchId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de la récupération du match"
        );
      }

      const result = await response.json();
      return result.data;
    },
    initialData: initialData,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <Card className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Erreur</h2>
        <p className="text-gray-600 mb-4">
          {error?.message || "Impossible de charger les données du match"}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Réessayer
        </Button>
      </Card>
    );
  }

  const handleScoreUpdate = async (teamId: string, points: number) => {
    try {
      const response = await fetch(`/api/matches/${matchId}/score`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          teamId,
          points,
          autoCheck: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du score");
      }

      await refetch();
      showSuccess("Score mis à jour");
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleTimerAction = async (action: string) => {
    try {
      const response = await fetch(`/api/matches/${matchId}/timer`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          control: { action: action as any },
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'action du timer");
      }
      await refetch();
      showSuccess(`Action "${action}" exécutée`);
    } catch (error: any) {
      showError(error.message);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* En-tête du match */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          {/* Bouton retour */}
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>

          {/* Titre et informations */}
          <div className="text-center flex-1 mx-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isStandalone
                ? `${matchData.teamA?.name} vs ${matchData.teamB?.name}`
                : matchData.event?.name}
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              {matchData.scheduledAt && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(matchData.scheduledAt).toLocaleString("fr-FR")}
                </div>
              )}
              {!isStandalone && matchData.event && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {matchData.event.type} • Round {matchData.round || 1}
                </div>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2">
            {canModify && (
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                <Settings className="h-3 w-3 mr-1" />
                Organisateur
              </Badge>
            )}
            <Badge
              variant={
                matchData.status === "LIVE"
                  ? "destructive"
                  : matchData.status === "COMPLETED"
                  ? "default"
                  : "secondary"
              }
            >
              {matchData.status === "LIVE" && "🔴 EN COURS"}
              {matchData.status === "COMPLETED" && "✅ TERMINÉ"}
              {matchData.status === "SCHEDULED" && "📅 PROGRAMMÉ"}
              {matchData.status === "CANCELLED" && "❌ ANNULÉ"}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Layout principal */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Colonne gauche - Match et scores */}
        <div className="space-y-6">
          {/* Affichage des équipes face à face */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              {/* Équipe A */}
              <div className="text-center flex-1">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  {matchData.teamA?.logo ? (
                    <Image
                      src={matchData.teamA.logo}
                      alt={matchData.teamA.name}
                      width={56}
                      height={56}
                      className="object-cover rounded-full"
                    />
                  ) : (
                    <Users className="h-8 w-8 text-blue-600" />
                  )}
                </div>
                <h3 className="font-semibold text-lg">
                  {matchData.teamA?.name}
                </h3>
                <div className="text-3xl font-bold text-blue-600 mt-2">
                  {matchData.scoreA || 0}
                </div>
              </div>

              {/* VS */}
              <div className="px-6">
                <div className="text-2xl font-bold text-gray-400">VS</div>
              </div>

              {/* Équipe B */}
              <div className="text-center flex-1">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  {matchData.teamB?.logo ? (
                    <Image
                      src={matchData.teamB.logo}
                      alt={matchData.teamB.name}
                      width={56}
                      height={56}
                      className="object-cover rounded-full"
                    />
                  ) : (
                    <Users className="h-8 w-8 text-red-600" />
                  )}
                </div>
                <h3 className="font-semibold text-lg">
                  {matchData.teamB?.name}
                </h3>
                <div className="text-3xl font-bold text-red-600 mt-2">
                  {matchData.scoreB || 0}
                </div>
              </div>
            </div>
          </Card>

          {/* Contrôles des scores (si organisateur) */}
          {canModify && matchData.status !== "COMPLETED" && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Contrôle des scores
              </h3>

              <div className="grid grid-cols-2 gap-6">
                {/* Contrôles équipe A */}
                <div>
                  <h4 className="font-medium text-blue-900 mb-3">
                    {matchData.teamA?.name}
                  </h4>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleScoreUpdate(matchData.teamAId, -1)}
                      variant="outline"
                      size="sm"
                      disabled={!matchData.scoreA || matchData.scoreA <= 0}
                    >
                      -1
                    </Button>
                    <Button
                      onClick={() => handleScoreUpdate(matchData.teamAId, 1)}
                      variant="outline"
                      size="sm"
                    >
                      +1
                    </Button>
                    <Button
                      onClick={() => handleScoreUpdate(matchData.teamAId, 2)}
                      variant="outline"
                      size="sm"
                    >
                      +2
                    </Button>
                    <Button
                      onClick={() => handleScoreUpdate(matchData.teamAId, 3)}
                      variant="outline"
                      size="sm"
                    >
                      +3
                    </Button>
                  </div>
                </div>

                {/* Contrôles équipe B */}
                <div>
                  <h4 className="font-medium text-red-900 mb-3">
                    {matchData.teamB?.name}
                  </h4>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleScoreUpdate(matchData.teamBId, -1)}
                      variant="outline"
                      size="sm"
                      disabled={!matchData.scoreB || matchData.scoreB <= 0}
                    >
                      -1
                    </Button>
                    <Button
                      onClick={() => handleScoreUpdate(matchData.teamBId, 1)}
                      variant="outline"
                      size="sm"
                    >
                      +1
                    </Button>
                    <Button
                      onClick={() => handleScoreUpdate(matchData.teamBId, 2)}
                      variant="outline"
                      size="sm"
                    >
                      +2
                    </Button>
                    <Button
                      onClick={() => handleScoreUpdate(matchData.teamBId, 3)}
                      variant="outline"
                      size="sm"
                    >
                      +3
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Colonne droite - Contrôles et infos */}
        <div className="space-y-6">
          {/* Contrôles du match */}
          {canModify && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contrôles du match</h3>

              <div className="flex gap-3">
                {matchData.status === "SCHEDULED" && (
                  <Button
                    onClick={() => handleTimerAction("START")}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Démarrer
                  </Button>
                )}

                {matchData.status === "LIVE" && (
                  <>
                    <Button
                      onClick={() => handleTimerAction("PAUSE")}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Pause className="h-4 w-4" />
                      Pause
                    </Button>
                    <Button
                      onClick={() => handleTimerAction("END")}
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <Square className="h-4 w-4" />
                      Terminer
                    </Button>
                  </>
                )}
              </div>
            </Card>
          )}

          {/* Informations du match */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Informations du match
            </h3>

            <div className="space-y-3 text-sm">
              {!isStandalone && matchData.event && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Événement:</span>
                  <span className="font-medium">{matchData.event.name}</span>
                </div>
              )}

              {isStandalone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">Match standalone</span>
                </div>
              )}

              {matchData.teamA?.sport && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Sport:</span>
                  <span className="font-medium">{matchData.teamA.sport}</span>
                </div>
              )}

              {matchData.round && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Round:</span>
                  <span className="font-medium">Round {matchData.round}</span>
                </div>
              )}

              {matchData.startedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Démarré à:</span>
                  <span className="font-medium">
                    {new Date(matchData.startedAt).toLocaleTimeString("fr-FR")}
                  </span>
                </div>
              )}

              {matchData.completedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Terminé à:</span>
                  <span className="font-medium">
                    {new Date(matchData.completedAt).toLocaleTimeString(
                      "fr-FR"
                    )}
                  </span>
                </div>
              )}

              {matchData.winner && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Vainqueur:</span>
                  <span className="font-medium text-green-600">
                    {matchData.winner.name}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Lien de suivi en direct */}
          {matchData.liveToken && (
            <Card className="p-6 bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <Radio className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900">
                    Suivi en Direct
                  </h3>
                  <p className="text-sm text-red-700">
                    Partagez ce lien pour permettre aux spectateurs de suivre le
                    match en temps réel
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-red-100 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Radio className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-900">
                    Lien de suivi public
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <code className="text-sm text-gray-800 break-all">
                    {typeof window !== "undefined"
                      ? `${window.location.origin}/live/${matchData.liveToken}`
                      : `/live/${matchData.liveToken}`}
                  </code>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* Bouton copier le lien */}
                <Button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      const liveUrl = `${window.location.origin}/live/${matchData.liveToken}`;
                      navigator.clipboard.writeText(liveUrl);
                      showSuccess("Lien copié dans le presse-papiers!");
                    }
                  }}
                  variant="outline"
                  className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Copy className="h-4 w-4" />
                  Copier le lien
                </Button>

                {/* Bouton ouvrir le lien */}
                <Button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      const liveUrl = `${window.location.origin}/live/${matchData.liveToken}`;
                      window.open(liveUrl, "_blank");
                    }
                  }}
                  variant="outline"
                  className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ouvrir le suivi
                </Button>

                {/* Bouton partager natif */}
                <Button
                  onClick={() => {
                    if (typeof window !== "undefined" && navigator.share) {
                      const liveUrl = `${window.location.origin}/live/${matchData.liveToken}`;
                      navigator
                        .share({
                          title: `Match en direct - ${matchData.teamA?.name} vs ${matchData.teamB?.name}`,
                          text: `Suivez le match en temps réel sur BigMatch`,
                          url: liveUrl,
                        })
                        .catch(console.error);
                    } else {
                      showError(
                        "Le partage natif n'est pas supporté sur ce navigateur"
                      );
                    }
                  }}
                  variant="default"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                >
                  <Share2 className="h-4 w-4" />
                  Partager
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
