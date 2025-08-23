// Types pour la gestion des matchs
export interface Match {
  id: string;
  eventId: string;
  teamAId: string | null;
  teamBId: string | null;
  round: number | null;
  position: number | null;
  status: MatchStatus;
  scoreA: number | null;
  scoreB: number | null;
  winnerId: string | null;
  parentMatchId: string | null;
  scheduledAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum MatchStatus {
  SCHEDULED = "SCHEDULED",
  LIVE = "LIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  WALKOVER = "WALKOVER",
}

export interface MatchWithTeams extends Match {
  teamA: {
    id: string;
    name: string;
    logo: string | null;
    sport?: string;
  } | null;
  teamB: {
    id: string;
    name: string;
    logo: string | null;
    sport?: string;
  } | null;
  winner: {
    id: string;
    name: string;
    logo: string | null;
  } | null;
  event: {
    id: string;
    name: string;
    type: string;
    rules?: any;
  };
}

export interface MatchWithPlayers extends MatchWithTeams {
  teamA: {
    id: string;
    name: string;
    logo: string | null;
    players: {
      id: string;
      name: string;
      number: number | null;
      position: string | null;
    }[];
  } | null;
  teamB: {
    id: string;
    name: string;
    logo: string | null;
    players: {
      id: string;
      name: string;
      number: number | null;
      position: string | null;
    }[];
  } | null;
}

// Types pour la gestion des scores
export interface ScoreUpdate {
  teamId: string;
  points: 1 | 2 | 3 | -1; // +1, +2, +3 ou -1
  autoCheck?: boolean; // vérifier fin automatique
}

export interface ScoreUpdateResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    status: MatchStatus;
    scoreA: number | null;
    scoreB: number | null;
    teamA: {
      id: string;
      name: string;
      logo: string | null;
    } | null;
    teamB: {
      id: string;
      name: string;
      logo: string | null;
    } | null;
    winner: {
      id: string;
      name: string;
      logo: string | null;
    } | null;
    startedAt: Date | null;
    completedAt: Date | null;
    updatedAt: Date;
  };
  action: {
    teamId: string;
    teamName: string | undefined;
    pointsAdded: number;
    scoreChange: {
      from: number | null;
      to: number;
    };
  };
  autoCompleted?: {
    reason: string;
    rules: any;
    finalScore: string;
  };
}

// Types pour la gestion du chronomètre
export interface TimerState {
  currentTime?: number; // temps écoulé en secondes
  isPaused?: boolean; // état pause/play
  lastUpdateTimestamp?: number; // timestamp de la dernière mise à jour
  totalDuration?: number; // durée totale en secondes
  startTimestamp?: number; // timestamp de début de match
}

export interface TimerControl {
  action: "START" | "PAUSE" | "RESUME" | "RESET" | "END";
  currentTime?: number; // temps spécifique à définir (en secondes)
}

export interface TimerControlResponse {
  success: boolean;
  message: string;
  data: {
    matchId: string;
    status: MatchStatus;
    teamA: {
      id: string;
      name: string;
      logo: string | null;
    } | null;
    teamB: {
      id: string;
      name: string;
      logo: string | null;
    } | null;
    winner: {
      id: string;
      name: string;
      logo: string | null;
    } | null;
    scoreA: number | null;
    scoreB: number | null;
    timer: {
      currentTime: number | undefined;
      currentTimeFormatted: string;
      remainingTime: number;
      remainingTimeFormatted: string;
      totalDuration: number;
      totalDurationFormatted: string;
      isPaused: boolean | undefined;
      gameMode: string;
      action: string;
    };
    completedAt: Date | null;
    updatedAt: Date;
  };
  matchCompleted: boolean;
  autoCompleted: boolean;
}

// Types pour les règles de match
export interface MatchRules {
  gameMode: "TIME" | "POINTS";
  duration?: number; // en minutes (mode TIME)
  pointsToWin?: number; // score limite (mode POINTS)
  shouldAutoEnd: boolean; // arrêt automatique activé
}

export interface EventRules {
  match: MatchRules;
  timerState?: TimerState;
}
