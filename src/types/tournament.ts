// Types pour la gestion des tournois (COUPE)

export interface TournamentBracket {
  rounds: number;
  matches: TournamentMatch[];
}

export interface TournamentMatch {
  round: number;
  position: number;
  teamAId?: string;
  teamBId?: string;
  parentMatchRound?: number;
  parentMatchPosition?: number;
}

export interface DrawResult {
  success: boolean;
  brackets: BracketMatch[];
  rounds: number;
  totalMatches: number;
  firstRoundMatches: number;
}

export interface BracketMatch {
  id: string;
  round: number;
  position: number;
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
  status: string;
  scoreA: number | null;
  scoreB: number | null;
  scheduledAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  parentMatchId: string | null;
  createdAt: Date;
  updatedAt?: Date;
}

export interface DrawResponse {
  success: boolean;
  message: string;
  data: DrawResult;
  event: {
    id: string;
    name: string;
    status: string;
    teamsCount: number;
  };
}

export interface TournamentTree {
  hasDrawn: boolean;
  brackets?: BracketMatch[];
  matchesByRound?: Record<number, BracketMatch[]>;
  rounds?: number;
  totalMatches?: number;
  firstRoundMatches?: number;
  event: {
    id: string;
    name: string;
    type: string;
    status: string;
    teamsCount: number;
    teams?: {
      id: string;
      name: string;
      logo: string | null;
    }[];
  };
}

export interface TournamentTreeResponse {
  success: boolean;
  message: string;
  data: TournamentTree;
}

// Types pour les phases de tournoi
export type TournamentPhase = 
  | "QUALIFICATION"
  | "FIRST_ROUND"
  | "SECOND_ROUND" 
  | "ROUND_OF_32"
  | "ROUND_OF_16"
  | "QUARTER_FINAL"
  | "SEMI_FINAL"
  | "FINAL";

export interface TournamentPhaseInfo {
  phase: TournamentPhase;
  round: number;
  totalMatches: number;
  completedMatches: number;
  nextPhase?: TournamentPhase;
}

// Types pour les bracket nodes (nœuds de l'arbre)
export interface BracketNode {
  id: string;
  round: number;
  position: number;
  match: BracketMatch | null;
  parentNode?: BracketNode;
  childNodes: BracketNode[];
  isRoot: boolean;
  isLeaf: boolean;
}

// Types pour le rendu visuel du bracket
export interface BracketRenderNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  match: BracketMatch | null;
  connections: {
    to: string;
    path: string; // SVG path string
  }[];
}
