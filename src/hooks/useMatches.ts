"use client";

import { useToast } from "@/src/hooks/useToast";
import {
  MatchStatus,
  MatchWithTeams,
  ScoreUpdate,
  TimerControl,
} from "@/src/types/match";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Hook pour récupérer les matchs d'un événement
export function useMatches(eventId: string) {
  return useQuery({
    queryKey: ["matches", eventId],
    queryFn: async (): Promise<MatchWithTeams[]> => {
      const response = await fetch(`/api/matches?eventId=${eventId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des matchs");
      }

      const data = await response.json();
      return data.data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: (data) => {
      // Polling actif s'il y a des matchs live
      if (!data || !Array.isArray(data)) return false;
      const hasLiveMatches = data.some(
        (match: MatchWithTeams) => match.status === "LIVE"
      );

      return hasLiveMatches ? 5000 : false; // 5s si matchs live
    },
  });
}

// Hook pour récupérer un match individuel
export function useMatch(matchId: string) {
  return useQuery({
    queryKey: ["match", matchId],
    queryFn: async (): Promise<MatchWithTeams> => {
      const response = await fetch(`/api/matches/${matchId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement du match");
      }

      const data = await response.json();
      return data.data;
    },
    staleTime: 30 * 1000, // 30 secondes
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: (data) => {
      // Polling actif si le match est live
      return data &&
        typeof data === "object" &&
        "status" in data &&
        data.status === MatchStatus.LIVE
        ? 3000
        : false; // 3s si live
    },
  });
}

// Hook pour les actions sur les scores
export function useScoreActions() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      matchId,
      update,
    }: {
      matchId: string;
      update: ScoreUpdate;
    }) => {
      const response = await fetch(`/api/matches/${matchId}/score`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(update),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de la mise à jour du score"
        );
      }

      return response.json();
    },
    onMutate: async ({ matchId, update }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["match", matchId] });

      const previousMatch = queryClient.getQueryData<MatchWithTeams>([
        "match",
        matchId,
      ]);

      if (previousMatch) {
        queryClient.setQueryData<MatchWithTeams>(["match", matchId], (old) => {
          if (!old) return old;

          const newMatch = { ...old };
          const isTeamA = update.teamId === old.teamA?.id;

          if (isTeamA) {
            newMatch.scoreA = Math.max(0, (old.scoreA || 0) + update.points);
          } else {
            newMatch.scoreB = Math.max(0, (old.scoreB || 0) + update.points);
          }

          return newMatch;
        });
      }

      return { previousMatch };
    },
    onError: (err, { matchId }, context) => {
      // Rollback optimistic update
      if (context?.previousMatch) {
        queryClient.setQueryData(["match", matchId], context.previousMatch);
      }
      showError(err.message);
    },
    onSuccess: (data, { matchId }) => {
      const teamName = data.action.teamName;
      const points =
        data.action.pointsAdded > 0
          ? `+${data.action.pointsAdded}`
          : `${data.action.pointsAdded}`;
      showSuccess(
        `${teamName}: ${points} point${
          Math.abs(data.action.pointsAdded) > 1 ? "s" : ""
        }`
      );

      // Invalider les queries liées
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

// Hook pour les actions sur le timer
export function useTimerActions() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      matchId,
      control,
    }: {
      matchId: string;
      control: TimerControl;
    }) => {
      const response = await fetch(`/api/matches/${matchId}/timer`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(control),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors du contrôle du timer");
      }

      return response.json();
    },
    onSuccess: (data, { matchId, control }) => {
      const actionLabels = {
        START: "Match démarré",
        PAUSE: "Match en pause",
        RESUME: "Match repris",
        RESET: "Match remis à zéro",
        END: "Match terminé",
      };

      showSuccess(actionLabels[control.action] || "Action exécutée");

      // Invalider les queries liées
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (err) => {
      showError(err.message);
    },
  });
}

// Hook pour les actions sur le status des matchs
export function useMatchStatusActions() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      matchId,
      status,
      data,
    }: {
      matchId: string;
      status: MatchStatus;
      data?: any;
    }) => {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status, ...data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de la modification du match"
        );
      }

      return response.json();
    },
    onSuccess: (data, { matchId, status }) => {
      const statusLabels = {
        SCHEDULED: "Match programmé",
        LIVE: "Match démarré",
        COMPLETED: "Match terminé",
        CANCELLED: "Match annulé",
        WALKOVER: "Forfait déclaré",
      };

      showSuccess(statusLabels[status] || "Match modifié");

      // Invalider les queries liées
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (err) => {
      showError(err.message);
    },
  });
}

// Hook pour créer un nouveau match
export function useCreateMatch() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (matchData: {
      eventId: string;
      teamAId?: string;
      teamBId?: string;
      round?: number;
      position?: number;
      scheduledAt?: Date;
      createLiveLink?: boolean;
    }) => {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(matchData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la création du match");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      showSuccess("Match créé avec succès");

      // Invalider les queries liées
      queryClient.invalidateQueries({
        queryKey: ["matches", variables.eventId],
      });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (err) => {
      showError(err.message);
    },
  });
}

// Hook pour créer un match standalone
export function useCreateStandaloneMatch() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (matchData: {
      teamA: {
        name: string;
        description?: string;
        logo?: string;
        players?: Array<{
          name: string;
          position?: string;
          number?: number;
        }>;
      };
      teamB: {
        name: string;
        description?: string;
        logo?: string;
        players?: Array<{
          name: string;
          position?: string;
          number?: number;
        }>;
      };
      matchName?: string;
      sport?: string;
      scheduledAt?: string;
      createLiveLink?: boolean;
    }) => {
      const response = await fetch("/api/matches/standalone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(matchData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de la création du match standalone"
        );
      }

      return response.json();
    },
    onSuccess: (data) => {
      showSuccess("Match standalone créé avec succès");

      // Invalider les queries des matchs génériques
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["standalone-matches"] });
    },
    onError: (err) => {
      showError(err.message);
    },
  });
}

// Hook pour récupérer les matchs standalone
export function useStandaloneMatches() {
  return useQuery({
    queryKey: ["standalone-matches"],
    queryFn: async () => {
      const response = await fetch("/api/matches?standalone=true", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des matchs standalone");
      }

      return response.json();
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook pour supprimer un match
export function useDeleteMatch() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (matchId: string) => {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de la suppression du match"
        );
      }

      return response.json();
    },
    onSuccess: () => {
      showSuccess("Match supprimé avec succès");

      // Invalider toutes les queries de matchs
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["match"] });
    },
    onError: (err) => {
      showError(err.message);
    },
  });
}
