"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/src/hooks/useToast";
import { MatchStatus, MatchWithTeams } from "@/src/types/match";
import {
  AlertTriangle,
  Pause,
  Play,
  RotateCcw,
  Square,
  Target,
  Timer,
  Trophy,
  X,
} from "lucide-react";
import { useState } from "react";

interface MatchControlsProps {
  match: MatchWithTeams;
  onStatusChange?: (matchId: string, newStatus: MatchStatus) => Promise<void>;
  onTimerAction?: (
    matchId: string,
    action: "START" | "PAUSE" | "RESUME" | "RESET" | "END"
  ) => Promise<void>;
  onScoreReset?: (matchId: string) => Promise<void>;
  canModify?: boolean;
}

export default function MatchControls({
  match,
  onStatusChange,
  onTimerAction,
  onScoreReset,
  canModify = false,
}: MatchControlsProps) {
  const [isActing, setIsActing] = useState(false);
  const { showSuccess, showError } = useToast();

  // Fonction générique pour les actions
  const handleAction = async (
    action: () => Promise<void>,
    successMessage: string
  ) => {
    if (!canModify) return;

    try {
      setIsActing(true);
      await action();
      showSuccess(successMessage);
    } catch (error) {
      showError("Impossible d'exécuter cette action");
    } finally {
      setIsActing(false);
    }
  };

  // Actions de status
  const handleStatusChange = async (newStatus: MatchStatus) => {
    if (!onStatusChange) return;
    await handleAction(
      () => onStatusChange(match.id, newStatus),
      `Match ${newStatus.toLowerCase()}`
    );
  };

  // Actions de timer
  const handleTimerAction = async (
    action: "START" | "PAUSE" | "RESUME" | "RESET" | "END"
  ) => {
    if (!onTimerAction) return;
    await handleAction(
      () => onTimerAction(match.id, action),
      `Timer ${action.toLowerCase()}`
    );
  };

  // Reset des scores
  const handleScoreReset = async () => {
    if (!onScoreReset) return;
    await handleAction(() => onScoreReset(match.id), "Scores remis à zéro");
  };

  if (!canModify) {
    return (
      <div className="bg-gray-50 rounded-lg border p-4 text-center text-gray-500">
        <AlertTriangle className="h-5 w-5 mx-auto mb-2" />
        <p className="text-sm">Seul l'organisateur peut contrôler les matchs</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Contrôles organisateur</h3>
        <Badge
          variant={match.status === "LIVE" ? "destructive" : "secondary"}
          className="text-xs"
        >
          {match.status === "LIVE" && "🔴 En direct"}
          {match.status === "SCHEDULED" && "📅 Programmé"}
          {match.status === "COMPLETED" && "✅ Terminé"}
          {match.status === "CANCELLED" && "❌ Annulé"}
          {match.status === "WALKOVER" && "⚠️ Forfait"}
        </Badge>
      </div>

      {/* Actions principales selon le status */}
      <div className="space-y-3">
        {/* Match programmé */}
        {match.status === "SCHEDULED" && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Le match est programmé</p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleTimerAction("START")}
                disabled={isActing}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4" />
                Démarrer le match
              </Button>

              <Button
                variant="outline"
                onClick={() => handleStatusChange(MatchStatus.CANCELLED)}
                disabled={isActing}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Annuler
              </Button>
            </div>
          </div>
        )}

        {/* Match en cours */}
        {match.status === "LIVE" && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Match en cours - Contrôles disponibles
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleTimerAction("PAUSE")}
                disabled={isActing}
                className="flex items-center gap-2"
              >
                <Pause className="h-4 w-4" />
                Pause
              </Button>

              <Button
                variant="outline"
                onClick={() => handleTimerAction("RESET")}
                disabled={isActing}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset timer
              </Button>

              <Button
                variant="destructive"
                onClick={() => handleTimerAction("END")}
                disabled={isActing}
                className="flex items-center gap-2 col-span-2"
              >
                <Square className="h-4 w-4" />
                Terminer le match
              </Button>
            </div>
          </div>
        )}

        {/* Match terminé */}
        {match.status === "COMPLETED" && (
          <div className="space-y-2">
            <p className="text-sm text-green-600">Match terminé</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleStatusChange(MatchStatus.LIVE)}
                disabled={isActing}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Reprendre
              </Button>

              <Button
                variant="outline"
                onClick={handleScoreReset}
                disabled={isActing}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset scores
              </Button>
            </div>
          </div>
        )}

        {/* Match annulé */}
        {match.status === "CANCELLED" && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Match annulé</p>
            <Button
              onClick={() => handleStatusChange(MatchStatus.SCHEDULED)}
              disabled={isActing}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reprogrammer
            </Button>
          </div>
        )}
      </div>

      {/* Informations sur les règles */}
      <div className="border-t pt-3">
        <h4 className="text-sm font-medium mb-2">Règles du match</h4>
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            {match.event.rules?.match?.gameMode === "TIME" ? (
              <Timer className="h-3 w-3" />
            ) : (
              <Target className="h-3 w-3" />
            )}
            <span>
              {match.event.rules?.match?.gameMode === "TIME"
                ? `${match.event.rules.match.duration || 15}min`
                : `${match.event.rules?.match?.pointsToWin || 11}pts`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            <span>
              Auto-end:{" "}
              {match.event.rules?.match?.shouldAutoEnd ? "Oui" : "Non"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions d'urgence */}
      <div className="border-t pt-3">
        <h4 className="text-sm font-medium mb-2 text-red-600">
          Actions d'urgence
        </h4>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleStatusChange(MatchStatus.WALKOVER)}
            disabled={isActing || match.status === "COMPLETED"}
            className="flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50 text-xs"
          >
            <AlertTriangle className="h-3 w-3" />
            Forfait
          </Button>

          <Button
            variant="outline"
            onClick={() => handleStatusChange(MatchStatus.CANCELLED)}
            disabled={isActing || match.status === "COMPLETED"}
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 text-xs"
          >
            <X className="h-3 w-3" />
            Annuler
          </Button>
        </div>
      </div>

      {/* État de loading */}
      {isActing && (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Action en cours...
          </div>
        </div>
      )}
    </div>
  );
}
