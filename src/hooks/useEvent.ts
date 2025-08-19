import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Event {
  id: string;
  name: string;
  description?: string;
  type: string;
  date: string;
  time?: string;
  location?: string;
  rules?: any;
  status: string;
  registrationCode: string;
  maxTeams?: number;
  maxPlayers?: number;
  currentTeams: number;
  totalPlayers: number;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
  teams: Array<{
    id: string;
    name: string;
    description?: string;
    sport?: string;
    logo?: string;
    playerCount: number;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface UpdateEventData {
  name?: string;
  description?: string;
  type?: string;
  date?: string;
  time?: string;
  location?: string;
  rules?: any;
  maxTeams?: number;
  maxPlayers?: number;
  status?: string;
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: async (): Promise<Event> => {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de l'événement");
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!eventId,
  });
}

export function useUpdateEvent(
  eventId: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateEventData) => {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'événement");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
}

export function useUpdateEventStatus(
  eventId: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du statut");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
}
