"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/src/hooks/useToast";
import { MatchWithTeams, ScoreUpdate } from "@/src/types/match";
import { Loader2, Minus } from "lucide-react";
import { useState } from "react";

interface ScoreBoardProps {
  match: MatchWithTeams;
  onScoreUpdate?: (update: ScoreUpdate) => Promise<void>;
  canModifyScores?: boolean;
}

export default function ScoreBoard({
  match,
  onScoreUpdate,
  canModifyScores = false,
}: ScoreBoardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { showSuccess, showError } = useToast();

  // Fonction pour mettre à jour le score
  const handleScoreUpdate = async (teamId: string, points: 1 | 2 | 3 | -1) => {
    if (!onScoreUpdate || !canModifyScores) return;

    try {
      setIsUpdating(true);
      await onScoreUpdate({ teamId, points, autoCheck: true });

      const teamName =
        teamId === match.teamA?.id ? match.teamA?.name : match.teamB?.name;
      const action = points > 0 ? `+${points}` : `${points}`;

      showSuccess(`${teamName}: ${action} point${Math.abs(points) > 1 ? "s" : ""
      }`);
    } catch (error) {
      showError("Impossible de mettre à jour le score");
    } finally {
      setIsUpdating(false);
    }
  };

  // Fonction pour les boutons de score
  const ScoreControls = ({
    teamId,
    teamColor,
  }: {
    teamId: string;
    teamColor: string;
  }) => (
    <div className="flex gap-2 justify-center">
      {/* Bouton -1 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleScoreUpdate(teamId, -1)}
        disabled={!canModifyScores || isUpdating}
        className={`w-10 h-10 p-0 border-2 border-${teamColor}-200 hover:bg-${teamColor}-50`}
      >
        <Minus className="h-4 w-4" />
      </Button>

      {/* Bouton +1 */}
      <Button
        variant="default"
        size="sm"
        onClick={() => handleScoreUpdate(teamId, 1)}
        disabled={!canModifyScores || isUpdating}
        className={`w-12 h-10 p-0 bg-${teamColor}-600 hover:bg-${teamColor}-700 text-white`}
      >
        +1
      </Button>

      {/* Bouton +2 */}
      <Button
        variant="default"
        size="sm"
        onClick={() => handleScoreUpdate(teamId, 2)}
        disabled={!canModifyScores || isUpdating}
        className={`w-12 h-10 p-0 bg-${teamColor}-600 hover:bg-${teamColor}-700 text-white`}
      >
        +2
      </Button>

      {/* Bouton +3 */}
      <Button
        variant="default"
        size="sm"
        onClick={() => handleScoreUpdate(teamId, 3)}
        disabled={!canModifyScores || isUpdating}
        className={`w-12 h-10 p-0 bg-${teamColor}-600 hover:bg-${teamColor}-700 text-white`}
      >
        +3
      </Button>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Tableau de score</h2>
        {isUpdating && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Mise à jour...
          </div>
        )}
      </div>

      {/* Scores et contrôles */}
      <div className="grid grid-cols-2 gap-8">
        {/* Équipe A */}
        <div className="text-center space-y-4">
          {/* Nom et score équipe A */}
          <div>
            <div className="text-lg font-semibold text-blue-600 mb-2">
              {match.teamA?.name || "Équipe A"}
            </div>
            <div className="text-6xl font-bold text-blue-600 mb-4">
              {match.scoreA ?? 0}
            </div>
          </div>

          {/* Contrôles équipe A */}
          {canModifyScores && match.teamA?.id && (
            <ScoreControls teamId={match.teamA.id} teamColor="blue" />
          )}
        </div>

        {/* Équipe B */}
        <div className="text-center space-y-4">
          {/* Nom et score équipe B */}
          <div>
            <div className="text-lg font-semibold text-red-600 mb-2">
              {match.teamB?.name || "Équipe B"}
            </div>
            <div className="text-6xl font-bold text-red-600 mb-4">
              {match.scoreB ?? 0}
            </div>
          </div>

          {/* Contrôles équipe B */}
          {canModifyScores && match.teamB?.id && (
            <ScoreControls teamId={match.teamB.id} teamColor="red" />
          )}
        </div>
      </div>

      {/* Status du match */}
      <div className="mt-6 text-center">
        <Badge
          variant={match.status === "LIVE" ? "destructive" : "secondary"}
          className="text-sm"
        >
          {match.status === "LIVE" && "🔴 En direct"}
          {match.status === "SCHEDULED" && "📅 Programmé"}
          {match.status === "COMPLETED" && "✅ Terminé"}
          {match.status === "CANCELLED" && "❌ Annulé"}
          {match.status === "WALKOVER" && "⚠️ Forfait"}
        </Badge>

        {/* Indicateur de gagnant */}
        {match.status === "COMPLETED" && match.winner && (
          <div className="mt-2">
            <Badge variant="default" className="bg-green-100 text-green-800">
              🏆 Gagnant: {match.winner.name}
            </Badge>
          </div>
        )}

        {/* Instructions pour l'organisateur */}
        {canModifyScores && match.status !== "COMPLETED" && (
          <div className="mt-4 text-sm text-gray-500">
            <p>
              Utilisez les boutons [−] [+1] [+2] [+3] pour modifier les scores
            </p>
            {match.status === "SCHEDULED" && (
              <p className="mt-1 text-blue-600">
                Le match démarrera automatiquement au premier point
              </p>
            )}
          </div>
        )}

        {/* Message si pas de permissions */}
        {!canModifyScores && (
          <div className="mt-4 text-sm text-gray-500">
            Seul l'organisateur peut modifier les scores
          </div>
        )}
      </div>
    </div>
  );
}
