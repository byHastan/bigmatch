import { Button } from "@/components/ui/button";
import { Event } from "@/src/hooks/useEvents";
import { Calendar, Eye, MapPin, Users } from "lucide-react";
import Link from "next/link";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Actif";
      case "COMPLETED":
        return "Terminé";
      case "CANCELLED":
        return "Annulé";
      case "DRAFT":
        return "Brouillon";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
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

  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {event.name}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>
                {event.currentTeams} équipes • {event.totalPlayers} joueurs
              </span>
            </div>
            {event.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {formatType(event.type)} • Code: {event.registrationCode}
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
              event.status
            )}`}
          >
            {getStatusLabel(event.status)}
          </span>
          <Link href={`/events/${event.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Voir
            </Button>
          </Link>
          <Link href={`/events/${event.id}`}>
            <Button variant="outline" size="sm">
              Gérer
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
