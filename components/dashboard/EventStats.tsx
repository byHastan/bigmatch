import { Event } from "@/src/hooks/useEvents";
import { Calendar, Trophy, Users } from "lucide-react";

interface EventStatsProps {
  events: Event[];
}

export default function EventStats({ events }: EventStatsProps) {
  const activeEvents = events.filter((e) => e.status === "ACTIVE").length;
  const draftEvents = events.filter((e) => e.status === "DRAFT").length;
  const completedEvents = events.filter((e) => e.status === "COMPLETED").length;
  const totalTeams = events.reduce((sum, e) => sum + e.currentTeams, 0);
  const totalPlayers = events.reduce((sum, e) => sum + e.totalPlayers, 0);

  const stats = [
    {
      label: "Événements actifs",
      value: activeEvents,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "En brouillon",
      value: draftEvents,
      icon: Calendar,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      label: "Équipes inscrites",
      value: totalTeams,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Joueurs total",
      value: totalPlayers,
      icon: Trophy,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}
            >
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
