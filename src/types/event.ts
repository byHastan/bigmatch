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
}
