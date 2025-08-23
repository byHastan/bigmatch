"use client";

import { Badge } from "@/components/ui/badge";
import { MatchWithTeams } from "@/src/types/match";
import Image from "next/image";

interface TeamVersusProps {
  match: MatchWithTeams;
  showScores?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function TeamVersus({
  match,
  showScores = true,
  size = "md",
}: TeamVersusProps) {
  const sizeClasses = {
    sm: {
      container: "py-4",
      teamSection: "space-y-2",
      teamName: "text-lg font-semibold",
      score: "text-2xl font-bold",
      logo: 48,
      vs: "text-lg",
    },
    md: {
      container: "py-6",
      teamSection: "space-y-3",
      teamName: "text-xl font-semibold",
      score: "text-4xl font-bold",
      logo: 64,
      vs: "text-xl",
    },
    lg: {
      container: "py-8",
      teamSection: "space-y-4",
      teamName: "text-2xl font-bold",
      score: "text-6xl font-bold",
      logo: 80,
      vs: "text-2xl",
    },
  };

  const classes = sizeClasses[size];

  const getStatusBadge = () => {
    const statusConfig = {
      SCHEDULED: { text: "Programmé", variant: "secondary" as const },
      LIVE: { text: "En direct", variant: "destructive" as const },
      COMPLETED: { text: "Terminé", variant: "default" as const },
      CANCELLED: { text: "Annulé", variant: "outline" as const },
      WALKOVER: { text: "Forfait", variant: "outline" as const },
    };

    return statusConfig[match.status] || statusConfig.SCHEDULED;
  };

  const statusBadge = getStatusBadge();

  return (
    <div
      className={`${classes.container} bg-white rounded-lg border shadow-sm`}
    >
      {/* Header avec status */}
      <div className="flex justify-center mb-4">
        <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
      </div>

      {/* Main versus layout */}
      <div className="grid grid-cols-3 items-center gap-6">
        {/* Équipe A */}
        <div className="text-center">
          <div className={classes.teamSection}>
            {/* Logo équipe A */}
            <div className="flex justify-center">
              {match.teamA?.logo ? (
                <Image
                  src={match.teamA.logo}
                  alt={`Logo ${match.teamA.name}`}
                  width={classes.logo}
                  height={classes.logo}
                  className="rounded-full object-cover"
                />
              ) : (
                <div
                  className="rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold"
                  style={{ width: classes.logo, height: classes.logo }}
                >
                  {match.teamA?.name?.charAt(0) || "A"}
                </div>
              )}
            </div>

            {/* Nom équipe A */}
            <div className={`${classes.teamName} text-blue-600`}>
              {match.teamA?.name || "Équipe A"}
            </div>

            {/* Score équipe A */}
            {showScores && (
              <div className={`${classes.score} text-blue-600`}>
                {match.scoreA ?? 0}
              </div>
            )}
          </div>
        </div>

        {/* VS au centre */}
        <div className="text-center">
          <div
            className={`${classes.vs} font-bold text-gray-500 uppercase tracking-wider`}
          >
            VS
          </div>

          {/* Indicateur de gagnant si match terminé */}
          {match.status === "COMPLETED" && match.winner && (
            <div className="mt-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                🏆 {match.winner.name}
              </Badge>
            </div>
          )}

          {/* Match nul */}
          {match.status === "COMPLETED" &&
            !match.winner &&
            match.scoreA === match.scoreB && (
              <div className="mt-2">
                <Badge variant="secondary">Match nul</Badge>
              </div>
            )}
        </div>

        {/* Équipe B */}
        <div className="text-center">
          <div className={classes.teamSection}>
            {/* Logo équipe B */}
            <div className="flex justify-center">
              {match.teamB?.logo ? (
                <Image
                  src={match.teamB.logo}
                  alt={`Logo ${match.teamB.name}`}
                  width={classes.logo}
                  height={classes.logo}
                  className="rounded-full object-cover"
                />
              ) : (
                <div
                  className="rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold"
                  style={{ width: classes.logo, height: classes.logo }}
                >
                  {match.teamB?.name?.charAt(0) || "B"}
                </div>
              )}
            </div>

            {/* Nom équipe B */}
            <div className={`${classes.teamName} text-red-600`}>
              {match.teamB?.name || "Équipe B"}
            </div>

            {/* Score équipe B */}
            {showScores && (
              <div className={`${classes.score} text-red-600`}>
                {match.scoreB ?? 0}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info match */}
      {match.event && (
        <div className="mt-4 text-center text-sm text-gray-500">
          {match.event.name}
          {match.scheduledAt && (
            <span className="ml-2">
              • {new Date(match.scheduledAt).toLocaleString("fr-FR")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
