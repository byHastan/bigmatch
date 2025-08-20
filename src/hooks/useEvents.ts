import { useQuery } from "@tanstack/react-query";
import { eventsApi } from "../lib/api";

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: eventsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
