import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventsApi } from "../lib/api";

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
    queryFn: () => eventsApi.getById(eventId),
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
    mutationFn: (data: UpdateEventData) => eventsApi.update(eventId, data),
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
    mutationFn: (status: string) =>
      eventsApi.updateStatus(eventId, status as any),
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
