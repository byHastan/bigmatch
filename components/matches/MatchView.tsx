"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/src/hooks/useToast";
import {
  MatchRules,
  MatchWithTeams,
  ScoreUpdate,
  TimerControl,
} from "@/src/types/match";
import { extractMatchRules } from "@/src/utils/match";
import { ArrowLeft, Clock, MapPin, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import MatchTimer from "./MatchTimer";
import ScoreBoard from "./ScoreBoard";
import TeamVersus from "./TeamVersus";

interface MatchViewProps {
  match: MatchWithTeams;
  canModify?: boolean; // Si l'utilisateur peut modifier le match (organisateur)
  onScoreUpdate?: (matchId: string, update: ScoreUpdate) => Promise<void>;
  onTimerControl?: (matchId: string, control: TimerControl) => Promise<void>;
  onBack?: () => void;
}

export default function MatchView({
  match: initialMatch,
  canModify = false,
  onScoreUpdate,
  onTimerControl,
  onBack,
}: MatchViewProps) {
  const [match, setMatch] = useState<MatchWithTeams>(initialMatch);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  // Extraire les règles du match
  const rules: MatchRules = extractMatchRules(match.event.rules);

  // Mettre à jour le match local si les props changent
  useEffect(() => {
    setMatch(initialMatch);
  }, [initialMatch]);

  // Fonction pour mettre à jour le score
  const handleScoreUpdate = async (update: ScoreUpdate) => {
    if (!onScoreUpdate) return;

    try {
      setIsLoading(true);
      await onScoreUpdate(match.id, update);

      // Note: Dans une vraie app, le match serait mis à jour via une requête API
      // ou un système de state management global
      showSuccess("Score mis à jour");
    } catch (error) {
      showError("Impossible de mettre à jour le score");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour contrôler le timer
  const handleTimerControl = async (control: TimerControl) => {
    if (!onTimerControl) return;

    try {
      setIsLoading(true);
      await onTimerControl(match.id, control);

      showSuccess(`Action "${control.action}" exécutée`);
    } catch (error) {
      showError("Impossible de contrôler le chronomètre");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
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

            {/* Titre et status */}
            <div className="text-center flex-1 mx-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {match.event.name}
              </h1>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                {match.scheduledAt && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(match.scheduledAt).toLocaleString("fr-FR")}
                  </div>
                )}
                {match.event && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {match.event.type} • Round {match.round || 1}
                  </div>
                )}
              </div>
            </div>

            {/* Badge organisateur */}
            {canModify && (
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                <Settings className="h-3 w-3 mr-1" />
                Organisateur
              </Badge>
            )}
          </div>
        </div>

        {/* Layout principal */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Colonne gauche - Match et scores */}
          <div className="space-y-6">
            {/* Affichage des équipes face à face */}
            <TeamVersus match={match} size="lg" showScores={true} />

            {/* Tableau de score avec contrôles */}
            <ScoreBoard
              match={match}
              onScoreUpdate={handleScoreUpdate}
              canModifyScores={canModify}
            />
          </div>

          {/* Colonne droite - Timer et infos */}
          <div className="space-y-6">
            {/* Chronomètre et règles */}
            <MatchTimer
              match={match}
              rules={rules}
              onTimerControl={handleTimerControl}
              canControlTimer={canModify}
            />

            {/* Informations du match */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">
                Informations du match
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type d'événement:</span>
                  <span className="font-medium">{match.event.type}</span>
                </div>

                {match.round && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Round:</span>
                    <span className="font-medium">Round {match.round}</span>
                  </div>
                )}

                {match.position && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Position:</span>
                    <span className="font-medium">Match #{match.position}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge
                    variant={
                      match.status === "LIVE" ? "destructive" : "secondary"
                    }
                    className="text-xs"
                  >
                    {match.status === "LIVE" && "🔴 En direct"}
                    {match.status === "SCHEDULED" && "📅 Programmé"}
                    {match.status === "COMPLETED" && "✅ Terminé"}
                    {match.status === "CANCELLED" && "❌ Annulé"}
                    {match.status === "WALKOVER" && "⚠️ Forfait"}
                  </Badge>
                </div>

                {match.startedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Démarré à:</span>
                    <span className="font-medium">
                      {new Date(match.startedAt).toLocaleTimeString("fr-FR")}
                    </span>
                  </div>
                )}

                {match.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Terminé à:</span>
                    <span className="font-medium">
                      {new Date(match.completedAt).toLocaleTimeString("fr-FR")}
                    </span>
                  </div>
                )}
              </div>

              {/* Règles du match */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium mb-2">Règles du match</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    • Mode:{" "}
                    {rules.gameMode === "TIME" ? "Au temps" : "Au score"}
                  </p>
                  {rules.gameMode === "TIME" ? (
                    <p>• Durée: {rules.duration} minutes</p>
                  ) : (
                    <p>• Score limite: {rules.pointsToWin} points</p>
                  )}
                  <p>
                    • Arrêt automatique: {rules.shouldAutoEnd ? "Oui" : "Non"}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions rapides pour l'organisateur */}
            {canModify && match.status !== "COMPLETED" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">
                  Actions rapides
                </h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>
                    • Utilisez les boutons [-] [+1] [+2] [+3] pour ajuster les
                    scores
                  </p>
                  <p>• Le match démarre automatiquement au premier point</p>
                  <p>• Le chrono s'arrête selon les règles configurées</p>
                  {match.status === "LIVE" && (
                    <p>
                      • Vous pouvez mettre en pause ou terminer le match
                      manuellement
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overlay de chargement */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Mise à jour en cours...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
