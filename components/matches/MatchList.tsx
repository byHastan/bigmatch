"use client";

import { Button } from "@/components/ui/button";
import { MatchWithTeams } from "@/src/types/match";
import { Calendar, Clock, Filter, Plus, RefreshCw, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import MatchCard from "./MatchCard";

interface MatchListProps {
  matches: MatchWithTeams[];
  eventType: "MATCH" | "CHAMPIONNAT" | "COUPE";
  isOrganizer?: boolean;
  isLoading?: boolean;
  onRefresh?: () => void;
  onCreateMatch?: () => void;
  onQuickAction?: (matchId: string, action: "start" | "pause" | "view") => void;
}

type FilterStatus = "ALL" | "SCHEDULED" | "LIVE" | "COMPLETED";
type SortBy = "date" | "status" | "round";

export default function MatchList({
  matches,
  eventType,
  isOrganizer = false,
  isLoading = false,
  onRefresh,
  onCreateMatch,
  onQuickAction,
}: MatchListProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [sortBy, setSortBy] = useState<SortBy>("date");

  // Statistiques des matchs
  const stats = useMemo(() => {
    return {
      total: matches.length,
      scheduled: matches.filter((m) => m.status === "SCHEDULED").length,
      live: matches.filter((m) => m.status === "LIVE").length,
      completed: matches.filter((m) => m.status === "COMPLETED").length,
    };
  }, [matches]);

  // Filtrage et tri des matchs
  const filteredAndSortedMatches = useMemo(() => {
    let filtered = matches;

    // Filtrage par status
    if (filterStatus !== "ALL") {
      filtered = filtered.filter((match) => match.status === filterStatus);
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          const dateA = new Date(a.scheduledAt || a.createdAt).getTime();
          const dateB = new Date(b.scheduledAt || b.createdAt).getTime();
          return dateA - dateB;

        case "status":
          const statusOrder = {
            LIVE: 0,
            SCHEDULED: 1,
            COMPLETED: 2,
            CANCELLED: 3,
            WALKOVER: 4,
          };
          return statusOrder[a.status] - statusOrder[b.status];

        case "round":
          const roundA = a.round || 0;
          const roundB = b.round || 0;
          if (roundA !== roundB) return roundA - roundB;
          return (a.position || 0) - (b.position || 0);

        default:
          return 0;
      }
    });

    return filtered;
  }, [matches, filterStatus, sortBy]);

  const getEventTypeIcon = () => {
    switch (eventType) {
      case "MATCH":
        return Calendar;
      case "CHAMPIONNAT":
        return Trophy;
      case "COUPE":
        return Trophy;
      default:
        return Calendar;
    }
  };

  const EventIcon = getEventTypeIcon();

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <EventIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">
              {eventType === "MATCH" && "Matchs"}
              {eventType === "CHAMPIONNAT" && "Matchs de championnat"}
              {eventType === "COUPE" && "Matchs de tournoi"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {isOrganizer && onCreateMatch && (
              <Button
                onClick={onCreateMatch}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nouveau match
              </Button>
            )}

            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>

          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.scheduled}
            </div>
            <div className="text-sm text-blue-600">Programmés</div>
          </div>

          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.live}</div>
            <div className="text-sm text-red-600">En direct</div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
            <div className="text-sm text-green-600">Terminés</div>
          </div>
        </div>
      </div>

      {/* Filtres et tri */}
      <div className="bg-white rounded-lg border shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Filtres par status */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrer:</span>
            <div className="flex gap-1">
              {[
                { value: "ALL" as const, label: "Tous", count: stats.total },
                {
                  value: "LIVE" as const,
                  label: "En direct",
                  count: stats.live,
                },
                {
                  value: "SCHEDULED" as const,
                  label: "Programmés",
                  count: stats.scheduled,
                },
                {
                  value: "COMPLETED" as const,
                  label: "Terminés",
                  count: stats.completed,
                },
              ].map((filter) => (
                <Button
                  key={filter.value}
                  variant={
                    filterStatus === filter.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setFilterStatus(filter.value)}
                  className="text-xs"
                >
                  {filter.label} ({filter.count})
                </Button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-300" />

          {/* Tri */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Trier par:
            </span>
            <div className="flex gap-1">
              {[
                { value: "date" as const, label: "Date" },
                { value: "status" as const, label: "Status" },
                { value: "round" as const, label: "Round" },
              ].map((sort) => (
                <Button
                  key={sort.value}
                  variant={sortBy === sort.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy(sort.value)}
                  className="text-xs"
                >
                  {sort.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des matchs */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-lg border shadow-sm p-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3 text-gray-500">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Chargement des matchs...
              </div>
            </div>
          </div>
        ) : filteredAndSortedMatches.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                isOrganizer={isOrganizer}
                showActions={true}
                onQuickAction={onQuickAction}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border shadow-sm p-8">
            <div className="text-center text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun match{" "}
                {filterStatus !== "ALL" && filterStatus.toLowerCase()}
              </h3>
              <p className="text-gray-500 mb-4">
                {filterStatus === "ALL"
                  ? "Aucun match n'a été créé pour cet événement."
                  : `Aucun match ${filterStatus.toLowerCase()} trouvé.`}
              </p>
              {isOrganizer && onCreateMatch && filterStatus === "ALL" && (
                <Button
                  onClick={onCreateMatch}
                  className="flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Créer le premier match
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Résumé en bas */}
      {filteredAndSortedMatches.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          {filteredAndSortedMatches.length} match
          {filteredAndSortedMatches.length > 1 ? "es" : ""}
          {filterStatus !== "ALL" && ` ${filterStatus.toLowerCase()}`}
          {stats.total !== filteredAndSortedMatches.length &&
            ` sur ${stats.total} au total`}
        </div>
      )}
    </div>
  );
}
