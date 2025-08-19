import { Button } from "@/components/ui/button";
import { Event } from "@/src/hooks/useEvents";
import { Calendar, MapPin, Users, Crown, Edit, Trash2, Eye, Copy, Share2 } from "lucide-react";
import { useState } from "react";

interface EventManagementCardProps {
  event: Event;
  onEdit: (eventId: string) => void;
  onDelete: (eventId: string) => void;
  onView: (eventId: string) => void;
}

export default function EventManagementCard({ event, onEdit, onDelete, onView }: EventManagementCardProps) {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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

  const copyRegistrationCode = () => {
    navigator.clipboard.writeText(event.registrationCode);
    // TODO: Ajouter une notification de succès
  };

  const shareEvent = () => {
    const shareData = {
      title: event.name,
      text: `Rejoignez ${event.name} ! Code d'inscription: ${event.registrationCode}`,
      url: `${window.location.origin}/inscription/${event.registrationCode}`,
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      copyRegistrationCode();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* En-tête de la carte */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5" />
            <span className="text-sm font-semibold">PROPRIÉTAIRE</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(event.status)}`}></div>
            <span className="text-sm font-medium">{getStatusLabel(event.status)}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-2">{event.name}</h3>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.date)} à {formatTime(event.date)}</span>
          </div>
          {event.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Informations détaillées */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Type</p>
            <p className="font-semibold text-gray-900">{formatType(event.type)}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Équipes</p>
            <p className="font-semibold text-gray-900">
              {event.currentTeams}/{event.maxTeams || "∞"}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Joueurs</p>
            <p className="font-semibold text-gray-900">{event.totalPlayers}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Code</p>
            <p className="font-semibold text-gray-900 font-mono text-sm">
              {event.registrationCode}
            </p>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            onClick={() => onView(event.id)}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Voir</span>
          </Button>
          
          <Button
            onClick={copyRegistrationCode}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Copy className="w-4 h-4" />
            <span>Copier le code</span>
          </Button>
          
          <Button
            onClick={shareEvent}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Partager</span>
          </Button>
        </div>

        {/* Actions principales */}
        <div className="flex space-x-2">
          <Button
            onClick={() => onEdit(event.id)}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          
          <Button
            onClick={() => onDelete(event.id)}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
