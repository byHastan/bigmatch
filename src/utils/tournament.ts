import {
  BracketMatch,
  BracketNode,
  TournamentBracket,
  TournamentMatch,
  TournamentPhase,
} from "@/src/types/tournament";

// Fonction pour mélanger un array (algorithme Fisher-Yates)
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Fonction pour calculer la prochaine puissance de 2
export function getNextPowerOfTwo(n: number): number {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

// Fonction pour générer l'arbre de tournoi
export function generateTournamentBracket(teams: any[]): TournamentBracket {
  const numTeams = teams.length;

  if (numTeams < 2) {
    throw new Error("Il faut au moins 2 équipes pour organiser un tournoi");
  }

  // Calculer le nombre de participants nécessaire (prochaine puissance de 2)
  const bracketSize = getNextPowerOfTwo(numTeams);
  const rounds = Math.log2(bracketSize);

  // Mélanger les équipes
  const shuffledTeams = shuffleArray(teams);

  const matches: TournamentMatch[] = [];

  // Générer les matchs pour chaque round
  for (let round = 1; round <= rounds; round++) {
    const matchesInRound = bracketSize / Math.pow(2, round);

    for (let position = 1; position <= matchesInRound; position++) {
      const match: TournamentMatch = {
        round,
        position,
      };

      // Premier round : assigner les équipes directement
      if (round === 1) {
        const teamAIndex = (position - 1) * 2;
        const teamBIndex = teamAIndex + 1;

        if (teamAIndex < shuffledTeams.length) {
          match.teamAId = shuffledTeams[teamAIndex].id;
        }
        if (teamBIndex < shuffledTeams.length) {
          match.teamBId = shuffledTeams[teamBIndex].id;
        }
      } else {
        // Rounds suivants : définir les matchs parents
        const parentRound = round - 1;
        const parentPositionA = (position - 1) * 2 + 1;

        match.parentMatchRound = parentRound;
        match.parentMatchPosition = parentPositionA;
      }

      matches.push(match);
    }
  }

  return {
    rounds,
    matches,
  };
}

// Fonction pour déterminer la phase du tournoi selon le round
export function getTournamentPhase(
  round: number,
  totalRounds: number
): TournamentPhase {
  const roundsFromEnd = totalRounds - round + 1;

  switch (roundsFromEnd) {
    case 1:
      return "FINAL";
    case 2:
      return "SEMI_FINAL";
    case 3:
      return "QUARTER_FINAL";
    case 4:
      return "ROUND_OF_16";
    case 5:
      return "ROUND_OF_32";
    default:
      return round === 1 ? "FIRST_ROUND" : "SECOND_ROUND";
  }
}

// Fonction pour obtenir le nom de la phase en français
export function getTournamentPhaseName(phase: TournamentPhase): string {
  const phaseNames: Record<TournamentPhase, string> = {
    QUALIFICATION: "Qualifications",
    FIRST_ROUND: "Premier tour",
    SECOND_ROUND: "Deuxième tour",
    ROUND_OF_32: "32èmes de finale",
    ROUND_OF_16: "16èmes de finale",
    QUARTER_FINAL: "Quarts de finale",
    SEMI_FINAL: "Demi-finales",
    FINAL: "Finale",
  };

  return phaseNames[phase] || "Phase inconnue";
}

// Fonction pour organiser les matchs par rounds
export function organizeMatchesByRounds(
  matches: BracketMatch[]
): Record<number, BracketMatch[]> {
  return matches.reduce((acc, match) => {
    const round = match.round || 1;
    if (!acc[round]) {
      acc[round] = [];
    }
    acc[round].push(match);
    return acc;
  }, {} as Record<number, BracketMatch[]>);
}

// Fonction pour valider qu'un tirage au sort peut être effectué
export function validateDrawConditions(
  event: any,
  teams: any[],
  existingMatches: any[]
): { canDraw: boolean; error?: string } {
  if (event.type !== "COUPE") {
    return {
      canDraw: false,
      error:
        "Le tirage au sort n'est disponible que pour les événements de type COUPE",
    };
  }

  if (teams.length < 2) {
    return {
      canDraw: false,
      error: "Il faut au moins 2 équipes pour organiser un tournoi",
    };
  }

  if (existingMatches.length > 0) {
    return {
      canDraw: false,
      error: "Le tirage au sort a déjà été effectué pour cet événement",
    };
  }

  const validStatuses = ["REGISTRATION_OPEN", "REGISTRATION_CLOSED"];
  if (!validStatuses.includes(event.status)) {
    return {
      canDraw: false,
      error:
        "L'événement doit être en phase d'inscription pour effectuer le tirage",
    };
  }

  return { canDraw: true };
}

// Fonction pour calculer les statistiques d'un tournoi
export function calculateTournamentStats(matches: BracketMatch[]): {
  totalMatches: number;
  completedMatches: number;
  liveMatches: number;
  upcomingMatches: number;
  progressPercentage: number;
} {
  const totalMatches = matches.length;
  const completedMatches = matches.filter(
    (m) => m.status === "COMPLETED"
  ).length;
  const liveMatches = matches.filter((m) => m.status === "LIVE").length;
  const upcomingMatches = matches.filter(
    (m) => m.status === "SCHEDULED"
  ).length;

  const progressPercentage =
    totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;

  return {
    totalMatches,
    completedMatches,
    liveMatches,
    upcomingMatches,
    progressPercentage,
  };
}

// Fonction pour trouver le prochain match d'une équipe dans un tournoi
export function findNextMatch(
  teamId: string,
  matches: BracketMatch[]
): BracketMatch | null {
  // Chercher les matchs où l'équipe doit jouer mais qui ne sont pas encore commencés
  return (
    matches.find(
      (match) =>
        (match.teamA?.id === teamId || match.teamB?.id === teamId) &&
        match.status === "SCHEDULED"
    ) || null
  );
}

// Fonction pour trouver le chemin d'une équipe dans le tournoi
export function getTeamTournamentPath(
  teamId: string,
  matches: BracketMatch[]
): {
  played: BracketMatch[];
  current: BracketMatch | null;
  upcoming: BracketMatch[];
} {
  const teamMatches = matches.filter(
    (match) => match.teamA?.id === teamId || match.teamB?.id === teamId
  );

  const played = teamMatches.filter((match) => match.status === "COMPLETED");
  const current = teamMatches.find((match) => match.status === "LIVE") || null;
  const upcoming = teamMatches.filter((match) => match.status === "SCHEDULED");

  return { played, current, upcoming };
}

// Fonction pour construire l'arbre hiérarchique du bracket
export function buildBracketTree(matches: BracketMatch[]): BracketNode[] {
  const nodeMap = new Map<string, BracketNode>();

  // Créer tous les nœuds
  matches.forEach((match) => {
    const nodeId = `${match.round}-${match.position}`;
    const node: BracketNode = {
      id: nodeId,
      round: match.round,
      position: match.position,
      match,
      childNodes: [],
      isRoot: false,
      isLeaf: match.round === 1,
    };
    nodeMap.set(nodeId, node);
  });

  // Établir les relations parent-enfant
  matches.forEach((match) => {
    if (match.parentMatchId) {
      const parentMatch = matches.find((m) => m.id === match.parentMatchId);
      if (parentMatch) {
        const parentNodeId = `${parentMatch.round}-${parentMatch.position}`;
        const childNodeId = `${match.round}-${match.position}`;

        const parentNode = nodeMap.get(parentNodeId);
        const childNode = nodeMap.get(childNodeId);

        if (parentNode && childNode) {
          parentNode.childNodes.push(childNode);
          childNode.parentNode = parentNode;
        }
      }
    }
  });

  // Identifier les nœuds racine (finale)
  const rootNodes: BracketNode[] = [];
  nodeMap.forEach((node) => {
    if (!node.parentNode) {
      node.isRoot = true;
      rootNodes.push(node);
    }
  });

  return rootNodes;
}

// Fonction pour valider qu'un match peut être supprimé dans un tournoi
export function canDeleteTournamentMatch(
  match: BracketMatch,
  childMatches: BracketMatch[]
): { canDelete: boolean; reason?: string } {
  if (childMatches.length > 0) {
    return {
      canDelete: false,
      reason:
        "Impossible de supprimer un match qui a des matchs suivants dans le tournoi",
    };
  }

  if (match.status === "LIVE") {
    return {
      canDelete: false,
      reason: "Impossible de supprimer un match en cours",
    };
  }

  if (match.status === "COMPLETED") {
    return {
      canDelete: false,
      reason: "Impossible de supprimer un match terminé",
    };
  }

  return { canDelete: true };
}
