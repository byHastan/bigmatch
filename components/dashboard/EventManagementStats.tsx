import { Event } from "@/src/types/event";
import { Calendar, Users, Trophy, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";

interface EventManagementStatsProps {
  events: Event[];
}

export default function EventManagementStats({ events }: EventManagementStatsProps) {
  // Vérifier que events existe et est un tableau
  if (!events || !Array.isArray(events)) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-center text-gray-500">Chargement...</div>
        </div>
      </div>
    );
  }

  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === "ACTIVE").length;
  const draftEvents = events.filter(e => e.status === "DRAFT").length;
  const completedEvents = events.filter(e => e.status === "COMPLETED").length;
  const cancelledEvents = events.filter(e => e.status === "CANCELLED").length;
  const totalTeams = events.reduce((sum, e) => sum + e.currentTeams, 0);
  const totalPlayers = events.reduce((sum, e) => sum + e.totalPlayers, 0);
  
  // Calculer le taux de participation moyen
  const avgParticipation = totalEvents > 0 ? Math.round((totalTeams / totalEvents) * 100) / 100 : 0;

  const stats = [
    {
      label: "Total événements",
      value: totalEvents,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      trend: null,
    },
    {
      label: "Événements actifs",
      value: activeEvents,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
      trend: totalEvents > 0 ? `${Math.round((activeEvents / totalEvents) * 100)}%` : null,
    },
    {
      label: "En brouillon",
      value: draftEvents,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      trend: null,
    },
    {
      label: "Terminés",
      value: completedEvents,
      icon: CheckCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      trend: null,
    },
    {
      label: "Annulés",
      value: cancelledEvents,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      trend: null,
    },
    {
      label: "Équipes inscrites",
      value: totalTeams,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      trend: `Moy: ${avgParticipation}`,
    },
    {
      label: "Joueurs total",
      value: totalPlayers,
      icon: Trophy,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      trend: totalTeams > 0 ? `Moy: ${Math.round(totalPlayers / totalTeams)}` : null,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              {stat.trend && (
                <p className="text-xs text-gray-500">{stat.trend}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
