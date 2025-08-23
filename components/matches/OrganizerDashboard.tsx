"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchWithTeams } from "@/src/types/match";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  Settings,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";
import MatchCard from "./MatchCard";
import MatchList from "./MatchList";

interface OrganizerDashboardProps {
  eventId: string;
  eventName: string;
  eventType: "MATCH" | "CHAMPIONNAT" | "COUPE";
  matches: MatchWithTeams[];
  teams: Array<{
    id: string;
    name: string;
    logo: string | null;
  }>;
  isLoading?: boolean;
  onRefresh?: () => void;
  onCreateMatch?: () => void;
  onQuickAction?: (matchId: string, action: "start" | "pause" | "view") => void;
}

type DashboardTab = "overview" | "matches" | "analytics";

export default function OrganizerDashboard({
  eventId,
  eventName,
  eventType,
  matches,
  teams,
  isLoading = false,
  onRefresh,
  onCreateMatch,
  onQuickAction,
}: OrganizerDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  // Statistiques générales
  const stats = useMemo(() => {
    const liveMatches = matches.filter((m) => m.status === "LIVE");
    const completedMatches = matches.filter((m) => m.status === "COMPLETED");
    const scheduledMatches = matches.filter((m) => m.status === "SCHEDULED");
    const cancelledMatches = matches.filter(
      (m) => m.status === "CANCELLED" || m.status === "WALKOVER"
    );

    // Calcul du pourcentage de progression
    const totalPossibleMatches =
      eventType === "COUPE"
        ? Math.max(1, teams.length * 2 - 1) // Approximation pour tournoi
        : eventType === "CHAMPIONNAT"
        ? Math.max(1, (teams.length * (teams.length - 1)) / 2) // Tous contre tous
        : matches.length;

    const progressPercentage =
      totalPossibleMatches > 0
        ? Math.round((completedMatches.length / totalPossibleMatches) * 100)
        : 0;

    return {
      total: matches.length,
      live: liveMatches.length,
      completed: completedMatches.length,
      scheduled: scheduledMatches.length,
      cancelled: cancelledMatches.length,
      progressPercentage,
      teamsCount: teams.length,
    };
  }, [matches, teams, eventType]);

  // Matchs urgents nécessitant une attention
  const urgentMatches = useMemo(() => {
    return matches.filter(
      (match) =>
        match.status === "LIVE" ||
        (match.status === "SCHEDULED" &&
          match.scheduledAt &&
          new Date(match.scheduledAt).getTime() - Date.now() < 30 * 60 * 1000) // Dans les 30 prochaines minutes
    );
  }, [matches]);

  const getEventTypeConfig = () => {
    switch (eventType) {
      case "MATCH":
        return {
          title: "Match Simple",
          icon: Calendar,
          description: "Opposition directe entre équipes",
        };
      case "CHAMPIONNAT":
        return {
          title: "Championnat",
          icon: Trophy,
          description: "Système de classement avec points",
        };
      case "COUPE":
        return {
          title: "Tournoi",
          icon: Target,
          description: "Élimination directe avec brackets",
        };
      default:
        return {
          title: "Événement",
          icon: Calendar,
          description: "Événement sportif",
        };
    }
  };

  const eventConfig = getEventTypeConfig();
  const EventIcon = eventConfig.icon;

  const renderOverview = () => (
    <div className="space-y-6">
      {/* En-tête de l'événement */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <EventIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">{eventName}</h1>
              <p className="text-gray-600">{eventConfig.description}</p>
            </div>
          </div>

          <div className="text-right">
            <Badge variant="default" className="mb-2">
              {eventConfig.title}
            </Badge>
            <div className="text-sm text-gray-500">
              {stats.teamsCount} équipe{stats.teamsCount > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progression de l'événement</span>
            <span className="font-medium">{stats.progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex gap-3">
          <Button onClick={onRefresh} variant="outline" disabled={isLoading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Actualiser
          </Button>

          {onCreateMatch && (
            <Button onClick={onCreateMatch}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau match
            </Button>
          )}

          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
        </div>
      </div>

      {/* Statistiques en grille */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">Total matchs</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Activity className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {stats.live}
              </div>
              <div className="text-sm text-gray-600">En direct</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.scheduled}
              </div>
              <div className="text-sm text-gray-600">Programmés</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Trophy className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stats.completed}
              </div>
              <div className="text-sm text-gray-600">Terminés</div>
            </div>
          </div>
        </div>
      </div>

      {/* Matchs urgents / En cours */}
      {urgentMatches.length > 0 && (
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold">Attention requise</h2>
            <Badge variant="destructive" className="ml-auto">
              {urgentMatches.length}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {urgentMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                isOrganizer={true}
                showActions={true}
                onQuickAction={onQuickAction}
              />
            ))}
          </div>
        </div>
      )}

      {/* Prochains matchs programmés */}
      {stats.scheduled > 0 && (
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Prochains matchs</h2>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("matches")}
              className="text-blue-600"
            >
              Voir tout →
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matches
              .filter((m) => m.status === "SCHEDULED")
              .slice(0, 6)
              .map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  isOrganizer={true}
                  showActions={true}
                  onQuickAction={onQuickAction}
                />
              ))}
          </div>
        </div>
      )}

      {/* État vide */}
      {stats.total === 0 && (
        <div className="bg-white rounded-lg border shadow-sm p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun match créé
          </h3>
          <p className="text-gray-500 mb-4">
            Commencez par créer votre premier match pour cet événement.
          </p>
          {onCreateMatch && (
            <Button onClick={onCreateMatch}>
              <Plus className="h-4 w-4 mr-2" />
              Créer le premier match
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Analytiques</h2>
      <div className="text-center text-gray-500 py-8">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Fonctionnalité analytiques à venir...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Onglets de navigation */}
        <div className="bg-white rounded-lg border shadow-sm p-1">
          <div className="flex gap-1">
            {[
              {
                id: "overview" as const,
                label: "Vue d'ensemble",
                icon: BarChart3,
              },
              {
                id: "matches" as const,
                label: "Tous les matchs",
                icon: Activity,
              },
              {
                id: "analytics" as const,
                label: "Analytiques",
                icon: TrendingUp,
              },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 flex-1"
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === "overview" && renderOverview()}

        {activeTab === "matches" && (
          <MatchList
            matches={matches}
            eventType={eventType}
            isOrganizer={true}
            isLoading={isLoading}
            onRefresh={onRefresh}
            onCreateMatch={onCreateMatch}
            onQuickAction={onQuickAction}
          />
        )}

        {activeTab === "analytics" && renderAnalytics()}
      </div>
    </div>
  );
}
