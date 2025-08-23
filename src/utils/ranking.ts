import {
  PerformanceHistory,
  RankingEntry,
  TeamStats,
} from "@/src/types/ranking";

// Fonction pour calculer les statistiques d'une équipe à partir des matchs
export function calculateTeamStats(teamId: string, matches: any[]): TeamStats {
  const stats: TeamStats = {
    teamId,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
    points: 0,
  };

  matches.forEach((match) => {
    // Vérifier si cette équipe participe au match et qu'il est terminé
    if (match.status !== "COMPLETED") return;

    const isTeamA = match.teamAId === teamId;
    const isTeamB = match.teamBId === teamId;

    if (!isTeamA && !isTeamB) return;

    stats.played++;

    const teamScore = isTeamA ? match.scoreA : match.scoreB;
    const opponentScore = isTeamA ? match.scoreB : match.scoreA;

    stats.goalsFor += teamScore || 0;
    stats.goalsAgainst += opponentScore || 0;

    // Déterminer le résultat
    if (teamScore > opponentScore) {
      stats.wins++;
      stats.points += 3; // 3 points pour une victoire
    } else if (teamScore === opponentScore) {
      stats.draws++;
      stats.points += 1; // 1 point pour un nul
    } else {
      stats.losses++;
      // 0 point pour une défaite
    }
  });

  stats.goalDiff = stats.goalsFor - stats.goalsAgainst;

  return stats;
}

// Fonction pour trier le classement selon les règles FIFA
export function sortRanking(rankings: TeamStats[]): TeamStats[] {
  return rankings.sort((a, b) => {
    // 1. Points (décroissant)
    if (a.points !== b.points) {
      return b.points - a.points;
    }

    // 2. Différentiel de buts (décroissant)
    if (a.goalDiff !== b.goalDiff) {
      return b.goalDiff - a.goalDiff;
    }

    // 3. Buts marqués (décroissant)
    if (a.goalsFor !== b.goalsFor) {
      return b.goalsFor - a.goalsFor;
    }

    // 4. Matchs joués (croissant) - privilégier ceux qui ont joué plus
    return b.played - a.played;
  });
}

// Fonction pour convertir TeamStats en RankingEntry
export function convertToRankingEntry(
  stats: TeamStats,
  position: number,
  team: { id: string; name: string; logo: string | null }
): RankingEntry {
  return {
    position,
    team: {
      id: team.id,
      name: team.name,
      logo: team.logo,
    },
    played: stats.played,
    wins: stats.wins,
    draws: stats.draws,
    losses: stats.losses,
    goalsFor: stats.goalsFor,
    goalsAgainst: stats.goalsAgainst,
    goalDifference: stats.goalDiff,
    points: stats.points,
  };
}

// Fonction pour calculer le pourcentage de victoires
export function calculateWinRate(wins: number, played: number): number {
  if (played === 0) return 0;
  return Math.round((wins / played) * 100);
}

// Fonction pour calculer la moyenne de buts par match
export function calculateAverageGoalsPerMatch(
  goalsFor: number,
  played: number
): number {
  if (played === 0) return 0;
  return Math.round((goalsFor / played) * 100) / 100;
}

// Fonction pour déterminer la forme récente d'une équipe (5 derniers matchs)
export function calculateRecentForm(
  teamId: string,
  matches: any[]
): ("W" | "D" | "L")[] {
  const recentMatches = matches
    .filter(
      (match) =>
        match.status === "COMPLETED" &&
        (match.teamAId === teamId || match.teamBId === teamId)
    )
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )
    .slice(0, 5);

  return recentMatches.map((match) => {
    const isTeamA = match.teamAId === teamId;
    const teamScore = isTeamA ? match.scoreA : match.scoreB;
    const opponentScore = isTeamA ? match.scoreB : match.scoreA;

    if (teamScore > opponentScore) return "W";
    if (teamScore === opponentScore) return "D";
    return "L";
  });
}

// Fonction pour créer l'historique de performance
export function createPerformanceHistory(
  teamId: string,
  matches: any[],
  teams: any[]
): PerformanceHistory {
  const teamMatches = matches
    .filter(
      (match) =>
        match.status === "COMPLETED" &&
        (match.teamAId === teamId || match.teamBId === teamId)
    )
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

  const matchHistory = teamMatches.map((match) => {
    const isTeamA = match.teamAId === teamId;
    const opponentId = isTeamA ? match.teamBId : match.teamAId;
    const opponent = teams.find((t) => t.id === opponentId);
    const teamScore = isTeamA ? match.scoreA : match.scoreB;
    const opponentScore = isTeamA ? match.scoreB : match.scoreA;

    let result: "WIN" | "DRAW" | "LOSS";
    let points: number;

    if (teamScore > opponentScore) {
      result = "WIN";
      points = 3;
    } else if (teamScore === opponentScore) {
      result = "DRAW";
      points = 1;
    } else {
      result = "LOSS";
      points = 0;
    }

    return {
      matchId: match.id,
      opponent: opponent?.name || "Équipe inconnue",
      result,
      goalsFor: teamScore,
      goalsAgainst: opponentScore,
      points,
      date: new Date(match.completedAt),
    };
  });

  const recentForm = calculateRecentForm(teamId, matches);

  return {
    teamId,
    matchHistory,
    recentForm,
  };
}

// Fonction pour valider les données de classement
export function validateRankingData(ranking: any): boolean {
  return (
    typeof ranking.played === "number" &&
    typeof ranking.wins === "number" &&
    typeof ranking.draws === "number" &&
    typeof ranking.losses === "number" &&
    typeof ranking.goalsFor === "number" &&
    typeof ranking.goalsAgainst === "number" &&
    typeof ranking.points === "number" &&
    ranking.played >= 0 &&
    ranking.wins >= 0 &&
    ranking.draws >= 0 &&
    ranking.losses >= 0 &&
    ranking.goalsFor >= 0 &&
    ranking.goalsAgainst >= 0 &&
    ranking.points >= 0 &&
    ranking.played === ranking.wins + ranking.draws + ranking.losses
  );
}

// Fonction pour calculer les statistiques globales d'un championnat
export function calculateChampionshipStats(rankings: TeamStats[]): {
  totalMatches: number;
  totalGoals: number;
  averageGoalsPerMatch: number;
  highestScoringTeam: string | null;
  bestDefense: string | null;
} {
  const totalMatches = rankings.reduce((sum, team) => sum + team.played, 0) / 2; // Divisé par 2 car chaque match compte pour 2 équipes
  const totalGoals = rankings.reduce((sum, team) => sum + team.goalsFor, 0);
  const averageGoalsPerMatch = totalMatches > 0 ? totalGoals / totalMatches : 0;

  const highestScoringTeam = rankings.reduce(
    (best, team) => (!best || team.goalsFor > best.goalsFor ? team : best),
    null as TeamStats | null
  );

  const bestDefense = rankings.reduce(
    (best, team) =>
      !best || team.goalsAgainst < best.goalsAgainst ? team : best,
    null as TeamStats | null
  );

  return {
    totalMatches: Math.round(totalMatches),
    totalGoals,
    averageGoalsPerMatch: Math.round(averageGoalsPerMatch * 100) / 100,
    highestScoringTeam: highestScoringTeam?.teamId || null,
    bestDefense: bestDefense?.teamId || null,
  };
}
