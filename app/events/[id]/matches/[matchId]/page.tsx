"use client";

import { useParams, useRouter } from "next/navigation";
import { MatchView } from "@/components/matches";
import { LoadingSpinner } from "@/components/dashboard";
import {
  useMatch,
  useScoreActions,
  useTimerActions,
} from "@/src/hooks/useMatches";
import { useSecureUserRole } from "@/src/hooks/useSecureUserRole";

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();

  const eventId = params.id as string;
  const matchId = params.matchId as string;

  const { data: match, isLoading, error } = useMatch(matchId);
  const { userRole } = useSecureUserRole();
  const scoreActions = useScoreActions();
  const timerActions = useTimerActions();

  const canModify = userRole?.roleType === "ORGANISATEUR";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Match non trouvé
          </h1>
          <p className="text-gray-600 mb-6">
            {error?.message ||
              "Le match demandé n'existe pas ou vous n'avez pas les permissions pour le voir."}
          </p>
          <button
            onClick={() => router.push(`/events/${eventId}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour à l'événement
          </button>
        </div>
      </div>
    );
  }

  const handleScoreUpdate = async (matchId: string, update: any) => {
    await scoreActions.mutateAsync({ matchId, update });
  };

  const handleTimerControl = async (matchId: string, control: any) => {
    await timerActions.mutateAsync({ matchId, control });
  };

  const handleBack = () => {
    router.push(`/events/${eventId}`);
  };

  return (
    <MatchView
      matchId={matchId}
      initialData={match}
      canModify={canModify}
      onBack={handleBack}
    />
  );
}
