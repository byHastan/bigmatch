"use client";

import { ErrorMessage, LoadingSpinner } from "@/components/dashboard";
import { MatchList } from "@/components/matches";
import { Button } from "@/components/ui/button";
import { useEvent } from "@/src/hooks/useEvent";
import {
  useCreateMatch,
  useMatches,
  useTimerActions,
} from "@/src/hooks/useMatches";
import { useSecureUserRole } from "@/src/hooks/useSecureUserRole";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function MatchesPage() {
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
    refetch,
  } = useMatches(eventId);
  const { userRole } = useSecureUserRole();
  const createMatch = useCreateMatch();
  const timerActions = useTimerActions();

  const isOrganizer = userRole?.roleType === "ORGANISATEUR";
  const isLoading = eventLoading || matchesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <ErrorMessage
            message={eventError?.message || "L'événement demandé n'existe pas."}
            onRetry={() => router.push(`/events/${eventId}`)}
          />
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    refetch();
  };

  const handleCreateMatch = async () => {
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push(`/events/${eventId}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Matchs - {event.name}
                </h1>
                <p className="text-gray-600">
                  Gestion des matchs pour cet événement{" "}
                  {event.type?.toLowerCase()}
                </p>
              </div>
            </div>

            {isOrganizer && (
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-2">
                  Mode organisateur
                </div>
                <Button
                  onClick={handleCreateMatch}
                  className="flex items-center gap-2"
                >
                  Nouveau match
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Liste des matchs */}
        <MatchList
          matches={matches || []}
          eventType={event.type as "MATCH" | "CHAMPIONNAT" | "COUPE"}
          isOrganizer={isOrganizer}
          isLoading={matchesLoading}
          onRefresh={handleRefresh}
          onCreateMatch={isOrganizer ? handleCreateMatch : undefined}
          onQuickAction={handleQuickAction}
        />
      </div>
    </div>
  );
}
