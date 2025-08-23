import { MatchRules, MatchStatus, TimerState } from "@/src/types/match";

// Fonction pour formater le temps en MM:SS
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

// Fonction pour calculer le temps actuel du chronomètre
export function calculateCurrentTime(
  timerState: TimerState,
  matchStatus: MatchStatus,
  totalDurationSeconds: number
): number {
  if (!timerState.currentTime) return 0;

  const now = Date.now();
  let currentTime = timerState.currentTime;

  if (
    !timerState.isPaused &&
    timerState.lastUpdateTimestamp &&
    matchStatus === MatchStatus.LIVE
  ) {
    const elapsedSinceLastUpdate =
      (now - timerState.lastUpdateTimestamp) / 1000;
    currentTime = Math.min(
      totalDurationSeconds,
      currentTime + elapsedSinceLastUpdate
    );
  }

  return currentTime;
}

// Fonction pour déterminer si un match doit se terminer automatiquement
export function shouldMatchEndAutomatically(
  rules: MatchRules,
  scoreA: number,
  scoreB: number,
  currentTime: number
): { shouldEnd: boolean; reason?: string; winner?: string } {
  if (!rules.shouldAutoEnd) {
    return { shouldEnd: false };
  }

  // Mode POINTS : Premier à atteindre le score gagne
  if (rules.gameMode === "POINTS" && rules.pointsToWin) {
    if (scoreA >= rules.pointsToWin || scoreB >= rules.pointsToWin) {
      let winner = undefined;
      if (scoreA > scoreB) winner = "teamA";
      else if (scoreB > scoreA) winner = "teamB";

      return {
        shouldEnd: true,
        reason: "SCORE_LIMIT_REACHED",
        winner,
      };
    }
  }

  // Mode TIME : Temps écoulé
  if (rules.gameMode === "TIME" && rules.duration) {
    const totalDurationSeconds = rules.duration * 60;
    if (currentTime >= totalDurationSeconds) {
      let winner = undefined;
      if (scoreA > scoreB) winner = "teamA";
      else if (scoreB > scoreA) winner = "teamB";

      return {
        shouldEnd: true,
        reason: "TIME_EXPIRED",
        winner,
      };
    }
  }

  return { shouldEnd: false };
}

// Fonction pour extraire les règles d'un match depuis un événement
export function extractMatchRules(eventRules: any): MatchRules {
  if (!eventRules || !eventRules.match) {
    return {
      gameMode: "TIME",
      duration: 15,
      pointsToWin: 11,
      shouldAutoEnd: true,
    };
  }

  return {
    gameMode: eventRules.match.gameMode || "TIME",
    duration: eventRules.match.duration || 15,
    pointsToWin: eventRules.match.pointsToWin || 11,
    shouldAutoEnd: eventRules.match.shouldAutoEnd !== false,
  };
}

// Fonction pour valider les points d'un score
export function validateScorePoints(points: number): boolean {
  const validPoints = [1, 2, 3, -1];
  return validPoints.includes(points);
}

// Fonction pour calculer les nouveaux scores
export function calculateNewScores(
  currentScoreA: number,
  currentScoreB: number,
  teamId: string,
  teamAId: string | null,
  teamBId: string | null,
  points: number
): { newScoreA: number; newScoreB: number; isTeamA: boolean } {
  const isTeamA = teamId === teamAId;
  const isTeamB = teamId === teamBId;

  if (!isTeamA && !isTeamB) {
    throw new Error("L'équipe ne participe pas à ce match");
  }

  let newScoreA = currentScoreA || 0;
  let newScoreB = currentScoreB || 0;

  if (isTeamA) {
    newScoreA = Math.max(0, newScoreA + points);
  } else {
    newScoreB = Math.max(0, newScoreB + points);
  }

  return { newScoreA, newScoreB, isTeamA };
}

// Fonction pour déterminer le gagnant d'un match
export function determineWinner(
  scoreA: number,
  scoreB: number,
  teamAId: string | null,
  teamBId: string | null
): string | null {
  if (scoreA > scoreB) return teamAId;
  if (scoreB > scoreA) return teamBId;
  return null; // Égalité
}

// Fonction pour vérifier si un match peut être modifié
export function canModifyMatch(status: MatchStatus): boolean {
  return (
    status !== MatchStatus.COMPLETED &&
    status !== MatchStatus.CANCELLED &&
    status !== MatchStatus.WALKOVER
  );
}

// Fonction pour vérifier si un match peut être supprimé
export function canDeleteMatch(
  status: MatchStatus,
  hasChildMatches: boolean
): { canDelete: boolean; reason?: string } {
  if (hasChildMatches) {
    return {
      canDelete: false,
      reason:
        "Impossible de supprimer un match qui a des matchs suivants dans le tournoi",
    };
  }

  if (status === MatchStatus.LIVE) {
    return {
      canDelete: false,
      reason: "Impossible de supprimer un match en cours",
    };
  }

  if (status === MatchStatus.COMPLETED) {
    return {
      canDelete: false,
      reason: "Impossible de supprimer un match terminé",
    };
  }

  return { canDelete: true };
}

// Fonction pour créer un état de timer initial
export function createInitialTimerState(durationMinutes: number): TimerState {
  return {
    currentTime: 0,
    isPaused: true,
    totalDuration: durationMinutes * 60,
    startTimestamp: undefined,
    lastUpdateTimestamp: Date.now(),
  };
}
