import { useEffect, useState } from "react";
import { Event } from "../types/event";

interface UseAllEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAllEvents(): UseAllEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/events/all");

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des événements");
      }

      const data = await response.json();

      if (data.success) {
        setEvents(data.data);
      } else {
        throw new Error(data.error || "Erreur inconnue");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  return {
    events,
    loading,
    error,
    refetch: fetchAllEvents,
  };
}
