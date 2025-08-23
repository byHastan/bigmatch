"use client";

import { ErrorMessage, LoadingSpinner } from "@/components/dashboard";
import { CreateMatchForm } from "@/components/matches";
import { useEvent } from "@/src/hooks/useEvent";
import { useSecureUserRole } from "@/src/hooks/useSecureUserRole";
import { useParams, useRouter } from "next/navigation";

export default function CreateMatchPage() {
  const params = useParams();
  const router = useRouter();

  const eventId = params.id as string;

  const {
    data: event,
    isLoading: eventLoading,
    error: eventError,
  } = useEvent(eventId);
  const { userRole, isLoading: roleLoading } = useSecureUserRole();

  const isLoading = eventLoading || roleLoading;

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
        <div className="max-w-4xl mx-auto">
          <ErrorMessage
            message={eventError?.message || "L'événement demandé n'existe pas."}
            onRetry={() => router.push(`/events/${eventId}`)}
          />
        </div>
      </div>
    );
  }

  // Vérifier les permissions
  if (!userRole || userRole.roleType !== "ORGANISATEUR") {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <ErrorMessage
            message="Seul l'organisateur peut créer des matchs."
            onRetry={() => router.push(`/events/${eventId}`)}
          />
        </div>
      </div>
    );
  }

  const handleBack = () => {
    router.push(`/events/${eventId}/matches`);
  };

  const handleSuccess = (matchId: string) => {
    router.push(`/events/${eventId}/matches/${matchId}`);
  };

  return (
    <CreateMatchForm
      eventId={eventId}
      eventType={event.type as "MATCH" | "CHAMPIONNAT" | "COUPE"}
      teams={(event.teams || []).map((team) => ({
        ...team,
        logo: team.logo ?? null,
      }))}
      onBack={handleBack}
      onSuccess={handleSuccess}
    />
  );
}
