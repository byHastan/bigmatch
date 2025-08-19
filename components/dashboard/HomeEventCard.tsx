import { Button } from "@/components/ui/button";
import { Event } from "@/src/hooks/useEvents";
import { Crown, MapPin, Users } from "lucide-react";
import Link from "next/link";

interface HomeEventCardProps {
  event: Event;
}

export default function HomeEventCard({ event }: HomeEventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return "AUJOURD'HUI";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "DEMAIN";
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatType = (type: string) => {
    switch (type) {
      case "CUP":
        return "Coupe";
      case "CHAMPIONNAT":
        return "Championnat";
      case "MATCH":
        return "Match";
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500";
      case "COMPLETED":
        return "bg-blue-500";
      case "CANCELLED":
        return "bg-red-500";
      case "DRAFT":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl overflow-hidden shadow-lg mb-4">
      {/* Image de fond avec overlay */}
      <div className="relative h-48 bg-gradient-to-br from-orange-400 to-red-500">
        {/* Icône de sport en arrière-plan */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
            <span className="text-6xl">🏀</span>
          </div>
        </div>

        {/* Badge propriétaire */}
        <div className="absolute top-4 right-4">
          <div className="bg-white text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
            <Crown className="w-3 h-3" />
            <span>PROPRIÉTAIRE</span>
          </div>
        </div>

        {/* Informations de l'événement */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          {/* Localisation */}
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">
              {event.location || "Lieu à définir"}
            </span>
          </div>

          {/* Nom de l'événement */}
          <h3 className="text-xl font-bold mb-3">{event.name}</h3>

          {/* Badges d'information */}
          <div className="flex flex-wrap gap-2">
            <div className="bg-white text-orange-600 bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
              {formatDate(event.date)} | {formatTime(event.date)}
            </div>
            <div className="bg-white text-orange-600 bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>
                {event.currentTeams}/{event.maxTeams || "∞"} équipes
              </span>
            </div>
            <div className="bg-white text-orange-600 bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
              {formatType(event.type)}
            </div>
          </div>
        </div>
      </div>

      {/* Section d'actions */}
      <div className="p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${getStatusColor(event.status)}`}
            ></div>
            <span className="text-sm text-gray-600">
              {event.status === "ACTIVE"
                ? "Actif"
                : event.status === "DRAFT"
                ? "Brouillon"
                : event.status === "COMPLETED"
                ? "Terminé"
                : "Annulé"}
            </span>
          </div>
          <Link href={`/events/${event.id}`}>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">
              Gérer
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
