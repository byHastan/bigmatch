"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchWithTeams } from "@/src/types/match";
import { Clock, Eye, Pause, Play, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface MatchCardProps {
  match: MatchWithTeams;
  isOrganizer?: boolean;
  showActions?: boolean;
  onQuickAction?: (matchId: string, action: "start" | "pause" | "view") => void;
}

export default function MatchCard({
  match,
  isOrganizer = false,
  showActions = true,
  onQuickAction,
}: MatchCardProps) {
  const getStatusConfig = () => {
    const configs = {
      SCHEDULED: {
        text: "Programmé",
        variant: "secondary" as const,
        color: "text-gray-600",
        bg: "bg-gray-50",
        icon: Clock,
      },
      LIVE: {
        text: "En direct",
        variant: "destructive" as const,
        color: "text-red-600",
        bg: "bg-red-50",
        icon: Play,
      },
      COMPLETED: {
        text: "Terminé",
        variant: "default" as const,
        color: "text-green-600",
        bg: "bg-green-50",
        icon: Trophy,
      },
      CANCELLED: {
        text: "Annulé",
        variant: "outline" as const,
        color: "text-gray-500",
        bg: "bg-gray-50",
        icon: Clock,
      },
      WALKOVER: {
        text: "Forfait",
        variant: "outline" as const,
        color: "text-orange-600",
        bg: "bg-orange-50",
        icon: Clock,
      },
    };

    return configs[match.status] || configs.SCHEDULED;
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={`rounded-lg border shadow-sm p-4 transition-all hover:shadow-md ${statusConfig.bg}`}
    >
      {/* Header avec status et round */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
          <Badge variant={statusConfig.variant} className="text-xs">
            {statusConfig.text}
          </Badge>
          {match.status === "LIVE" && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-red-600 font-medium">LIVE</span>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          {match.round && `Round ${match.round}`}
          {match.position && ` • Match #${match.position}`}
        </div>
      </div>

      {/* Équipes face à face */}
      <div className="grid grid-cols-5 items-center gap-3 mb-4">
        {/* Équipe A */}
        <div className="col-span-2 flex items-center gap-2">
          {match.teamA?.logo ? (
            <Image
              src={match.teamA.logo}
              alt={`Logo ${match.teamA.name}`}
              width={32}
              height={32}
              className="rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm flex-shrink-0">
              {match.teamA?.name?.charAt(0) || "A"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm text-blue-600 truncate">
              {match.teamA?.name || "Équipe A"}
            </div>
          </div>
        </div>

        {/* Scores et VS */}
        <div className="col-span-1 text-center">
          {match.status !== "SCHEDULED" ? (
            <div className="flex items-center justify-center gap-1 text-lg font-bold">
              <span className="text-blue-600">{match.scoreA ?? 0}</span>
              <span className="text-gray-400 text-sm">-</span>
              <span className="text-red-600">{match.scoreB ?? 0}</span>
            </div>
          ) : (
            <div className="text-xs text-gray-400 font-medium">VS</div>
          )}
        </div>

        {/* Équipe B */}
        <div className="col-span-2 flex items-center gap-2 justify-end">
          <div className="min-w-0 flex-1 text-right">
            <div className="font-medium text-sm text-red-600 truncate">
              {match.teamB?.name || "Équipe B"}
            </div>
          </div>
          {match.teamB?.logo ? (
            <Image
              src={match.teamB.logo}
              alt={`Logo ${match.teamB.name}`}
              width={32}
              height={32}
              className="rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-medium text-sm flex-shrink-0">
              {match.teamB?.name?.charAt(0) || "B"}
            </div>
          )}
        </div>
      </div>

      {/* Winner si match terminé */}
      {match.status === "COMPLETED" && match.winner && (
        <div className="mb-3 text-center">
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 text-xs"
          >
            🏆 Gagnant: {match.winner.name}
          </Badge>
        </div>
      )}

      {/* Temps et événement */}
      <div className="text-xs text-gray-500 mb-4 text-center">
        <div>{match.event.name}</div>
        {match.scheduledAt && (
          <div className="mt-1">
            {new Date(match.scheduledAt).toLocaleString("fr-FR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2">
          {/* Bouton voir */}
          <Link href={`/matches/${match.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Voir
            </Button>
          </Link>

          {/* Actions organisateur */}
          {isOrganizer && (
            <>
              {match.status === "SCHEDULED" && onQuickAction && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onQuickAction(match.id, "start")}
                  className="bg-green-600 hover:bg-green-700 text-xs"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Démarrer
                </Button>
              )}

              {match.status === "LIVE" && onQuickAction && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onQuickAction(match.id, "pause")}
                  className="text-xs"
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
