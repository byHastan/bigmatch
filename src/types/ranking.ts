// Types pour la gestion des classements de championnat

export interface TeamStats {
  teamId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

export interface RankingEntry {
  position: number;
  team: {
    id: string;
    name: string;
    logo: string | null;
  };
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface TeamRanking {
  id: string;
  eventId: string;
  teamId: string;
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RankingResponse {
  success: boolean;
  message: string;
  data: {
    rankings: RankingEntry[];
    hasStoredRankings?: boolean;
    totalTeams: number;
    completedMatches: number;
    resetToZero?: boolean;
    event: {
      id: string;
      name: string;
      type: string;
      status: string;
    };
  };
}

export interface CreateRankingRequest {
  resetToZero?: boolean;
}

// Types pour les statistiques d'équipe
export interface TeamStatistics {
  teamId: string;
  teamName: string;
  matchesPlayed: number;
  victories: number;
  draws: number;
  defeats: number;
  goalsScored: number;
  goalsConceded: number;
  goalDifference: number;
  totalPoints: number;
  averageGoalsPerMatch: number;
  winRate: number; // pourcentage
}

// Types pour l'historique de performance
export interface PerformanceHistory {
  teamId: string;
  matchHistory: {
    matchId: string;
    opponent: string;
    result: "WIN" | "DRAW" | "LOSS";
    goalsFor: number;
    goalsAgainst: number;
    points: number;
    date: Date;
  }[];
  recentForm: ("W" | "D" | "L")[];  // 5 derniers matchs
}
