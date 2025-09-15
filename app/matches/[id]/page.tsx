"use client";

import { ErrorMessage, LoadingSpinner } from "@/components/dashboard";
import { MatchView } from "@/components/matches";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Trophy, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const {
    data: match,
    isLoading,
    error,
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

      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !match?.success) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <ErrorMessage
            message={error?.message || match?.error || "Match introuvable"}
            onRetry={() => router.push("/")}
          />
        </div>
      </div>
    );
  }

  const matchData = match.data;
  const isStandalone = !matchData.eventId;

  const handleBack = () => {
    if (isStandalone) {
      router.push("/");
    } else {
      router.push(`/events/${matchData.eventId}/matches`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
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
                    {matchData.teamA?.name} vs {matchData.teamB?.name}
                  </h1>
                  <p className="text-gray-600">
                    {isStandalone
                      ? "Match standalone"
                      : `Match - ${matchData.event?.name}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                className={
                  isStandalone
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800"
                }
              >
                {isStandalone ? "STANDALONE" : "ÉVÉNEMENT"}
              </Badge>

              <Badge
                variant={
                  matchData.status === "LIVE"
                    ? "destructive"
                    : matchData.status === "COMPLETED"
                    ? "default"
                    : "secondary"
                }
              >
                {matchData.status === "LIVE" && "EN COURS"}
                {matchData.status === "COMPLETED" && "TERMINÉ"}
                {matchData.status === "SCHEDULED" && "PROGRAMMÉ"}
                {matchData.status === "CANCELLED" && "ANNULÉ"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Informations sur les équipes standalone */}
        {isStandalone && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Équipe A */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  {matchData.teamA?.logo ? (
                    <img
                      src={matchData.teamA.logo}
                      alt={matchData.teamA.name}
                      className="w-10 h-10 object-cover rounded-full"
                    />
                  ) : (
                    <Users className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {matchData.teamA?.name}
                  </h3>
                  {matchData.teamA?.description && (
                    <p className="text-sm text-gray-600">
                      {matchData.teamA.description}
                    </p>
                  )}
                  {matchData.teamA?.sport && (
                    <Badge variant="outline" className="mt-1">
                      {matchData.teamA.sport}
                    </Badge>
                  )}
                </div>
              </div>

              {matchData.teamA?.players &&
                matchData.teamA.players.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                      Joueurs
                    </h4>
                    <div className="space-y-1">
                      {matchData.teamA.players.map((player: any) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>{player.name}</span>
                          <div className="flex items-center gap-2 text-gray-500">
                            {player.number && <span>#{player.number}</span>}
                            {player.position && <span>{player.position}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </Card>

            {/* Équipe B */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  {matchData.teamB?.logo ? (
                    <img
                      src={matchData.teamB.logo}
                      alt={matchData.teamB.name}
                      className="w-10 h-10 object-cover rounded-full"
                    />
                  ) : (
                    <Users className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {matchData.teamB?.name}
                  </h3>
                  {matchData.teamB?.description && (
                    <p className="text-sm text-gray-600">
                      {matchData.teamB.description}
                    </p>
                  )}
                  {matchData.teamB?.sport && (
                    <Badge variant="outline" className="mt-1">
                      {matchData.teamB.sport}
                    </Badge>
                  )}
                </div>
              </div>

              {matchData.teamB?.players &&
                matchData.teamB.players.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                      Joueurs
                    </h4>
                    <div className="space-y-1">
                      {matchData.teamB.players.map((player: any) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>{player.name}</span>
                          <div className="flex items-center gap-2 text-gray-500">
                            {player.number && <span>#{player.number}</span>}
                            {player.position && <span>{player.position}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </Card>
          </div>
        )}

        {/* Composant de visualisation du match */}
        <MatchView
          matchId={matchId}
          initialData={matchData}
          isStandalone={isStandalone}
        />
      </div>
    </div>
  );
}
