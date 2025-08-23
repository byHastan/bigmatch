import { Button } from "@/components/ui/button";
import { Event } from "@/src/types/event";
import { Calendar, Eye, MapPin, Trophy, Users } from "lucide-react";
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
    <div className="p-4 sm:px-6 sm:py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
      {/* Layout mobile-first */}
      <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        {/* Contenu principal */}
        <div className="flex-1 space-y-3 sm:space-y-2">
          {/* Titre et type */}
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight">
              {event.name}
            </h3>
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">
                {formatType(event.type)}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 font-mono">
                {event.registrationCode}
              </span>
            </div>
          </div>

          {/* Informations principales - Stack vertical sur mobile */}
          <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:space-x-4 sm:text-sm sm:text-gray-500">
            {/* Date */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {formatDate(event.date)}
              </span>
            </div>

            {/* Équipes et joueurs */}
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                {event.currentTeams} équipes • {event.totalPlayers} joueurs
              </span>
            </div>

            {/* Lieu - Masqué sur très petit écran */}
            {event.location && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-700 truncate max-w-[120px] sm:max-w-none">
                  {event.location}
                </span>
              </div>
            )}
          </div>

          {/* Description courte si disponible */}
          {event.description && (
            <p className="text-sm text-gray-600 line-clamp-2 sm:hidden">
              {event.description}
            </p>
          )}
        </div>

        {/* Actions et statut - Réorganisés pour mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          {/* Statut */}
          <div className="flex justify-center sm:justify-end">
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                event.status
              )}`}
            >
              {getStatusLabel(event.status)}
            </span>
          </div>

          {/* Boutons d'action */}
          <div className="flex space-x-2 sm:flex-col sm:space-x-0 sm:space-y-2">
            <Link href={`/events/${event.id}`} className="flex-1 sm:flex-none">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                <span className="sm:hidden">Voir</span>
                <span className="hidden sm:inline">Voir détails</span>
              </Button>
            </Link>
            <Link href={`/events/${event.id}`} className="flex-1 sm:flex-none">
              <Button
                variant="default"
                size="sm"
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                <span className="sm:hidden">Gérer</span>
                <span className="hidden sm:inline">Gérer</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
