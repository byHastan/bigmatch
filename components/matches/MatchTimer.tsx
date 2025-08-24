"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/src/hooks/useToast";
import { MatchRules, MatchWithTeams, TimerControl } from "@/src/types/match";
import { formatTime } from "@/src/utils/match";
import { Pause, Play, RotateCcw, Square, Target, Timer } from "lucide-react";
import { useEffect, useState } from "react";

interface MatchTimerProps {
  match: MatchWithTeams;
  rules?: MatchRules;
  onTimerControl?: (control: TimerControl) => Promise<void>;
  canControlTimer?: boolean;
  canControl?: boolean;
  showControls?: boolean;
}

export default function MatchTimer({
  match,
  rules,
  onTimerControl,
  canControlTimer = false,
  canControl = false,
  showControls = true,
}: MatchTimerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isControlling, setIsControlling] = useState(false);
  const { showSuccess, showError } = useToast();

  // Durée totale en secondes (valeur par défaut : 15 minutes)
  const totalDuration = rules?.duration ? rules.duration * 60 : 15 * 60;
  const remainingTime = Math.max(0, totalDuration - currentTime);
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  // Effet pour le décompte du temps
  useEffect(() => {
    if (match.status === "LIVE" && !isPaused) {
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 1;

          // Vérification automatique de fin de temps
          if (rules?.gameMode === "TIME" && newTime >= totalDuration) {
            // Le match devrait se terminer automatiquement
            if (onTimerControl && canControlTimer) {
              onTimerControl({ action: "END", currentTime: totalDuration });
            }
            return totalDuration;
          }

          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [
    match.status,
    isPaused,
    totalDuration,
    rules?.gameMode,
    onTimerControl,
    canControlTimer,
  ]);

  // Fonction pour contrôler le timer
  const handleTimerControl = async (action: TimerControl["action"]) => {
    if (!onTimerControl || !canControlTimer) return;

    try {
      setIsControlling(true);
      await onTimerControl({ action });

      // Mise à jour locale de l'état
      switch (action) {
        case "START":
          setCurrentTime(0);
          setIsPaused(false);
          showSuccess("Match démarré");
          break;
        case "PAUSE":
          setIsPaused(true);
          showSuccess("Match en pause");
          break;
        case "RESUME":
          setIsPaused(false);
          showSuccess("Match repris");
          break;
        case "RESET":
          setCurrentTime(0);
          setIsPaused(true);
          showSuccess("Match remis à zéro");
          break;
        case "END":
          setIsPaused(true);
          showSuccess("Match terminé");
          break;
      }
    } catch (error) {
      showError("Impossible de contrôler le chronomètre");
    } finally {
      setIsControlling(false);
    }
  };

  // Couleur du timer selon le temps restant
  const getTimerColor = () => {
    if (remainingTime <= 60) return "text-red-600"; // Dernière minute
    if (remainingTime <= 300) return "text-orange-500"; // 5 dernières minutes
    return "text-green-600";
  };

  // Son d'alerte (à implémenter)
  const playSound = (type: "warning" | "end") => {
    // TODO: Implémenter les sons d'alerte
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      {/* Header avec mode de jeu */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {rules?.gameMode === "TIME" ? (
            <Timer className="h-5 w-5 text-blue-600" />
          ) : (
            <Target className="h-5 w-5 text-green-600" />
          )}
          <h2 className="text-lg font-semibold">
            {rules?.gameMode === "TIME" ? "Mode Temps" : "Mode Points"}
          </h2>
        </div>

        <Badge variant={rules?.gameMode === "TIME" ? "default" : "secondary"}>
          {rules?.gameMode === "TIME"
            ? `${rules?.duration || 15} minutes`
            : `${rules?.pointsToWin || 11} points`}
        </Badge>
      </div>

      {/* Affichage du temps */}
      <div className="text-center mb-6">
        <div className={`text-6xl font-mono font-bold mb-2 ${getTimerColor()}`}>
          {
            rules?.gameMode === "TIME"
              ? formatTime(remainingTime) // Temps restant
              : formatTime(currentTime) // Temps écoulé
          }
        </div>

        <div className="text-sm text-gray-500 mb-4">
          {rules?.gameMode === "TIME"
            ? `Temps restant sur ${formatTime(totalDuration)}`
            : `Temps écoulé • Limite: ${rules?.pointsToWin || 11} points`}
        </div>

        {/* Barre de progression */}
        {rules?.gameMode === "TIME" && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${
                progress > 80
                  ? "bg-red-500"
                  : progress > 60
                  ? "bg-orange-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Contrôles du timer */}
      {(canControlTimer || canControl) && showControls && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {/* Bouton Start/Resume */}
          {(match.status === "SCHEDULED" ||
            (match.status === "LIVE" && isPaused)) && (
            <Button
              onClick={() =>
                handleTimerControl(
                  match.status === "SCHEDULED" ? "START" : "RESUME"
                )
              }
              disabled={isControlling}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4" />
              {match.status === "SCHEDULED" ? "Démarrer" : "Reprendre"}
            </Button>
          )}

          {/* Bouton Pause */}
          {match.status === "LIVE" && !isPaused && (
            <Button
              onClick={() => handleTimerControl("PAUSE")}
              disabled={isControlling}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          )}

          {/* Bouton Reset */}
          {match.status !== "COMPLETED" && (
            <Button
              onClick={() => handleTimerControl("RESET")}
              disabled={isControlling}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}

          {/* Bouton Terminer */}
          {match.status === "LIVE" && (
            <Button
              onClick={() => handleTimerControl("END")}
              disabled={isControlling}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Terminer
            </Button>
          )}
        </div>
      )}

      {/* Informations sur les règles */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Mode de jeu:</span>
            <span className="font-medium">
              {rules?.gameMode === "TIME" ? "Au temps" : "Au score"}
            </span>
          </div>

          {rules?.gameMode === "TIME" ? (
            <div className="flex justify-between">
              <span className="text-gray-600">Durée du match:</span>
              <span className="font-medium">
                {rules?.duration || 15} minutes
              </span>
            </div>
          ) : (
            <div className="flex justify-between">
              <span className="text-gray-600">Score à atteindre:</span>
              <span className="font-medium">
                {rules?.pointsToWin || 11} points
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-600">Arrêt automatique:</span>
            <span className="font-medium">
              {rules?.shouldAutoEnd ? "Activé ✅" : "Désactivé ❌"}
            </span>
          </div>

          {/* Status du match */}
          <div className="flex justify-between pt-2 border-t">
            <span className="text-gray-600">Status:</span>
            <Badge
              variant={match.status === "LIVE" ? "destructive" : "secondary"}
              className="text-xs"
            >
              {match.status === "LIVE" && "🔴 En cours"}
              {match.status === "SCHEDULED" && "📅 Programmé"}
              {match.status === "COMPLETED" && "✅ Terminé"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages d'aide */}
      {!canControlTimer && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Seul l'organisateur peut contrôler le chronomètre
        </div>
      )}

      {/* Alertes temps réel */}
      {rules?.gameMode === "TIME" &&
        remainingTime <= 60 &&
        remainingTime > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
            <span className="text-red-700 font-medium">
              ⏰ Dernière minute ! {formatTime(remainingTime)} restant
            </span>
          </div>
        )}
    </div>
  );
}
