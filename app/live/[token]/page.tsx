"use client";

import { LoadingSpinner } from "@/components/dashboard";
import { MatchTimer, ScoreBoard, TeamVersus } from "@/components/matches";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MatchRules, MatchWithTeams } from "@/src/types/match";
import { extractMatchRules } from "@/src/utils/match";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Radio, RefreshCw, Trophy, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LiveMatchPage() {
  const params = useParams();
  const token = params.token as string;
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Extraire les règles du match
  const extractRules = (match: MatchWithTeams): MatchRules => {
    return extractMatchRules(match.event?.rules || {});
  };

  // Hook pour récupérer les données du match via le token
  const {
    data: match,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["live-match", token],
    queryFn: async (): Promise<MatchWithTeams> => {
      const response = await fetch(`/api/live/${token}`);

      if (!response.ok) {
        throw new Error("Match non trouvé ou lien expiré");
      }

      const data = await response.json();
      return data.data;
    },
    refetchInterval: isAutoRefresh ? 5000 : false, // Refresh toutes les 5 secondes si activé
    refetchOnWindowFocus: true,
    staleTime: 0, // Toujours considérer les données comme obsolètes pour le live
  });

  // Met à jour l'heure de dernière mise à jour
  useEffect(() => {
    if (match) {
      setLastUpdate(new Date());
    }
  }, [match]);

  const handleManualRefresh = async () => {
    await refetch();
    setLastUpdate(new Date());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Radio className="h-8 w-8 text-red-600 animate-pulse" />
          </div>
          <LoadingSpinner />
          <p className="text-gray-600 mt-2">Chargement du match en direct...</p>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Radio className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Match non trouvé
            </h1>
            <p className="text-gray-600 mb-4">
              Le lien de suivi en direct n'est plus valide ou le match n'existe
              pas.
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "LIVE":
        return "bg-red-100 text-red-800 border-red-200";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "LIVE":
        return "🔴";
      case "SCHEDULED":
        return "📅";
      case "COMPLETED":
        return "✅";
      case "CANCELLED":
        return "❌";
      default:
        return "⚪";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      {/* Header avec statut en direct */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Indicateur Live */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-gray-900">
                  Suivi en Direct
                </span>
              </div>
              <Badge className={`${getStatusColor(match.status)} border`}>
                {getStatusIcon(match.status)}{" "}
                {match.status === "LIVE" ? "EN DIRECT" : match.status}
              </Badge>
            </div>

            {/* Contrôles */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={isAutoRefresh}
                  onChange={(e) => setIsAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="autoRefresh" className="text-sm text-gray-600">
                  Actualisation auto
                </label>
              </div>

              <Button
                onClick={handleManualRefresh}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Actualiser
              </Button>
            </div>
          </div>

          {/* Dernière mise à jour */}
          <div className="mt-2 text-xs text-gray-500">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Informations de l'événement */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {match.event.name}
                </h1>
                <p className="text-gray-600">
                  {match.event.type} • Match{" "}
                  {match.round && `Round ${match.round}`}
                  {match.position && ` • Position ${match.position}`}
                </p>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              {match.scheduledAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Programmé: {new Date(match.scheduledAt).toLocaleString()}
                  </span>
                </div>
              )}

              {match.startedAt && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    Démarré: {new Date(match.startedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scores en temps réel */}
        <div className="grid gap-6">
          {/* Affichage des équipes */}
          <Card>
            <CardContent className="p-0">
              <TeamVersus match={match} showScores={true} size="lg" />
            </CardContent>
          </Card>

          {/* Tableau des scores détaillé */}
          {match.status === "LIVE" && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Radio className="h-5 w-5 text-red-600" />
                  Scores en Direct
                </h3>
                <ScoreBoard match={match} />
              </CardContent>
            </Card>
          )}

          {/* Chronomètre si le match est en direct */}
          {match.status === "LIVE" && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Chronomètre</h3>
                <MatchTimer
                  match={match}
                  rules={extractRules(match)}
                  canControl={false}
                  showControls={false}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Informations de partage */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Radio className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Lien de Partage</h3>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              Partagez ce lien pour permettre à d'autres de suivre le match en
              temps réel.
            </p>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <code className="text-sm text-gray-800 break-all">
                {window.location.href}
              </code>
            </div>
            <Button
              onClick={() =>
                navigator.clipboard.writeText(window.location.href)
              }
              variant="outline"
              size="sm"
              className="mt-3 text-blue-600 border-blue-300 hover:bg-blue-100"
            >
              Copier le lien
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
