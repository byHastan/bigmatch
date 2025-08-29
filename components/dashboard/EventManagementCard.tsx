import { Button } from "@/components/ui/button";
import { Event } from "@/src/types/event";
import { Calendar, MapPin, Crown, Edit, Trash2, Eye, Copy, Share2, Check } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/src/hooks/useToast";
import { toast } from "sonner";

interface EventManagementCardProps {
  event: Event;
  onEdit: (eventId: string) => void;
  onDelete: (eventId: string) => void;
  onView: (eventId: string) => void;
}

export default function EventManagementCard({ event, onEdit, onDelete, onView }: EventManagementCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const { showSuccess, showError } = useToast();

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

  const copyRegistrationCode = async () => {
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(event.registrationCode);
      setCopySuccess(true);
      toast("Le code d'inscription a été copié dans le presse-papier.");
      
      // Reset the copy success state after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Erreur lors de la copie:", err);
      toast("Impossible de copier le code. Veuillez réessayer.");
    } finally {
      setIsCopying(false);
    }
  };

  const shareEvent = async () => {
    if (navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share({
          title: event.name,
          text: `Rejoignez ${event.name} ! Code d'inscription: ${event.registrationCode}`,
          url: `${window.location.origin}/inscription/${event.registrationCode}`,
        });
      } catch (err) {
        // Sharing was cancelled, no need to show an error
        if (err.name !== 'AbortError') {
          toast("Le partage a échoué. Veuillez réessayer.");
          console.error(err);
        }
      } finally {
        setIsSharing(false);
      }
    } else {
      await copyRegistrationCode();
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
            disabled={isCopying}
            aria-label="Copier le code d'inscription"
          >
            {copySuccess ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span>{copySuccess ? 'Copié !' : 'Copier le code'}</span>
          </Button>
          
          <Button
            onClick={shareEvent}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
            disabled={isSharing}
            aria-label="Partager l'événement"
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
            onClick={() => setShowDeleteDialog(true)}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
            aria-label="Supprimer l'événement"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Voulez-vous vraiment supprimer l'événement "{event.name}" ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(event.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Supprimer définitivement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
