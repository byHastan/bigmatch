import { Calendar, Settings, Trophy, Users } from "lucide-react";

import StatsCard from "./StatsCard";

interface StatsGridProps {
  eventsCount: number;
  participantsCount: number;
  competitionsCount: number;
  activeCount: number;
}

export default function StatsGrid({
  eventsCount,
  participantsCount,
  competitionsCount,
  activeCount,
}: StatsGridProps) {
  const stats = [
    {
      icon: Calendar,
      title: "Événements",
      value: eventsCount,
      iconBgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: Users,
      title: "Participants",
      value: participantsCount,
      iconBgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      icon: Trophy,
      title: "Compétitions",
      value: competitionsCount,
      iconBgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      icon: Settings,
      title: "En cours",
      value: activeCount,
      iconBgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
