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
  maxTeams?: number;
  maxPlayers?: number;
  currentTeams: number;
  totalPlayers: number;
  organizerId: string; // ID de l'organisateur de l'événement
  createdAt: string;
  updatedAt: string;
}
