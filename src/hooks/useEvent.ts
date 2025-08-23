import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventsApi } from "../lib/api";
import { EventStatus } from "../types/event";

interface UpdateEventDataLocal {
  name?: string;
  description?: string;
  type?: string;
  date?: string;
  time?: string;
  location?: string;
  rules?: any;
  maxTeams?: number;
  maxPlayers?: number;
  status?: EventStatus;
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
    mutationFn: (data: UpdateEventDataLocal) => eventsApi.update(eventId, data),
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
    mutationFn: (status: EventStatus) =>
      eventsApi.updateStatus(eventId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
}
