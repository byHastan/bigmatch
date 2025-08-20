import { useQuery } from "@tanstack/react-query";
import { eventsApi } from "../lib/api";

export function useAllEvents() {
  return useQuery({
    queryKey: ["all-events"],
    queryFn: eventsApi.getAllEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
