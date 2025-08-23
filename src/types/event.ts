export interface User {
  id: string;
  name?: string;
  email: string;
  image?: string;
}

export interface Player {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  number?: number;
  teamId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  sport?: string;
  eventId: string;
  players: Player[];
  createdAt: string;
  updatedAt: string;
  playerCount?: number; // Propriété calculée pour l'affichage
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  type: string;
  date: string;
  time?: string;
  location?: string;
  status: string;
  registrationCode: string;
  registrationLink?: string;
  maxTeams?: number;
  maxPlayers?: number;
  currentTeams: number;
  totalPlayers: number;
  organizerId: string; // ID de l'organisateur de l'événement
  organizer?: User; // Relation avec l'utilisateur organisateur
  isPrivate?: boolean; // Indique si l'événement est privé
  rules?: any; // Règles de l'événement (JSON)
  teams?: Team[]; // Équipes inscrites
  createdAt: string;
  updatedAt: string;
}

export type EventStatus =
  | "draft"
  | "published"
  | "registration_open"
  | "registration_closed"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface CreateEventData {
  name: string;
  description?: string;
  type: string;
  date: string;
  time?: string;
  location?: string;
  maxTeams?: number | null;
  maxPlayers?: number | null;
  status?: EventStatus;
  rules?: any;
  isPrivate?: boolean;
}

export interface UpdateEventData {
  name?: string;
  description?: string;
  type?: string;
  date?: string;
  time?: string;
  location?: string;
  maxTeams?: number;
  maxPlayers?: number;
  status?: EventStatus;
  rules?: any;
}
