"use client";

import { ErrorMessage, LoadingSpinner } from "@/components/dashboard";
import { OrganizerDashboard } from "@/components/matches";
import { useEvent } from "@/src/hooks/useEvent";
import {
  useCreateMatch,
  useMatches,
  useTimerActions,
} from "@/src/hooks/useMatches";
import { useSecureUserRole } from "@/src/hooks/useSecureUserRole";
import { useParams, useRouter } from "next/navigation";

export default function EventDashboardPage() {
  const params = useParams();
  const router = useRouter();

  const eventId = params.id as string;

  const {
    data: event,
    isLoading: eventLoading,
    error: eventError,
  } = useEvent(eventId);
  const {
    data: matches,
    isLoading: matchesLoading,
    refetch: refetchMatches,
  } = useMatches(eventId);
  const { userRole, isLoading: roleLoading } = useSecureUserRole();
  const createMatch = useCreateMatch();
  const timerActions = useTimerActions();

  const isLoading = eventLoading || matchesLoading || roleLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <ErrorMessage
            onRetry={() => {}}
            message={eventError?.message || "L'événement demandé n'existe pas."}
          />
        </div>
      </div>
    );
  }

  // Vérifier les permissions
  if (!userRole || userRole.roleType !== "ORGANISATEUR") {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <ErrorMessage
            onRetry={() => {}}
            message="Seul l'organisateur peut accéder au dashboard de gestion."
          />
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    refetchMatches();
  };

  const handleCreateMatch = () => {
    router.push(`/events/${eventId}/matches/create`);
  };

  const handleQuickAction = async (
    matchId: string,
    action: "start" | "pause" | "view"
  ) => {
    switch (action) {
      case "view":
        router.push(`/events/${eventId}/matches/${matchId}`);
        break;
      case "start":
        await timerActions.mutateAsync({
          matchId,
          control: { action: "START" },
        });
        break;
      case "pause":
        await timerActions.mutateAsync({
          matchId,
          control: { action: "PAUSE" },
        });
        break;
    }
  };

  return (
    <OrganizerDashboard
      eventId={eventId}
      eventName={event.name}
      eventType={event.type as "MATCH" | "CHAMPIONNAT" | "COUPE"}
      matches={matches || []}
      teams={(event.teams || []).map((team) => ({
        ...team,
        logo: team.logo ?? null,
      }))}
      isLoading={matchesLoading}
      onRefresh={handleRefresh}
      onCreateMatch={handleCreateMatch}
      onQuickAction={handleQuickAction}
    />
  );
}
