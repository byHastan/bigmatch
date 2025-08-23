import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Event, EventStatus } from "@/src/types/event";
import { ArrowRight, Calendar, Settings, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface EventStatusActionsProps {
  event: Event;
  onStatusChange: (status: EventStatus) => void;
  isUpdatingStatus: boolean;
}

const EVENT_STATUSES = [
  {
    value: "draft" as EventStatus,
    label: "Brouillon",
    color: "bg-yellow-100 text-yellow-800",
    description: "L'événement est en cours de création"
  },
  {
    value: "published" as EventStatus,
    label: "Publié",
    color: "bg-green-100 text-green-800",
    description: "L'événement est visible publiquement"
  },
  {
    value: "registration_open" as EventStatus,
    label: "Inscriptions ouvertes",
    color: "bg-blue-100 text-blue-800",
    description: "Les équipes peuvent s'inscrire"
  },
  {
    value: "registration_closed" as EventStatus,
    label: "Inscriptions fermées",
    color: "bg-orange-100 text-orange-800",
    description: "Plus d'inscriptions acceptées"
  },
  {
    value: "in_progress" as EventStatus,
    label: "En cours",
    color: "bg-purple-100 text-purple-800",
    description: "L'événement se déroule actuellement"
  },
  {
    value: "completed" as EventStatus,
    label: "Terminé",
    color: "bg-green-100 text-green-800",
    description: "L'événement est terminé"
  },
  {
    value: "cancelled" as EventStatus,
    label: "Annulé",
    color: "bg-red-100 text-red-800",
    description: "L'événement a été annulé"
  },
];

export default function EventStatusActions({
  event,
  onStatusChange,
  isUpdatingStatus,
}: EventStatusActionsProps) {
  const router = useRouter();

  const getStatusInfo = (status: EventStatus) => {
    return (
      EVENT_STATUSES.find((s) => s.value === status) || {
        label: status,
        color: "bg-gray-100 text-gray-800",
        description: "Statut inconnu"
      }
    );
  };

  const getNextStatuses = (currentStatus: EventStatus) => {
    const statusFlow: Record<EventStatus, EventStatus[]> = {
      draft: ["published", "cancelled"],
      published: ["registration_open", "cancelled"],
      registration_open: ["registration_closed", "cancelled"],
      registration_closed: ["in_progress", "cancelled"],
      in_progress: ["completed", "cancelled"],
      completed: [],
      cancelled: []
    };
    
    return statusFlow[currentStatus] || [];
  };

  const currentStatusInfo = getStatusInfo(event.status as EventStatus);
  const availableNextStatuses = getNextStatuses(event.status as EventStatus);

  return (
    <div className="space-y-4">
      {/* Statut et actions rapides */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>Statut et actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statut actuel */}
          <div>
            <Label className="text-xs sm:text-sm font-medium text-gray-500 mb-2 block">
              Statut actuel
            </Label>
            <Badge
              className={`${
                currentStatusInfo.color
              } text-xs sm:text-sm`}
            >
              {currentStatusInfo.label}
            </Badge>
            <p className="text-xs text-gray-600 mt-1">
              {currentStatusInfo.description}
            </p>
          </div>

          {/* Changer le statut */}
          <div>
            <Label className="text-xs sm:text-sm font-medium text-gray-500 mb-2 block">
              Changer le statut
            </Label>
            <Select
              value={event.status}
              onValueChange={onStatusChange}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${status.color}`}
                      ></div>
                      <span>{status.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Statuts suivants recommandés */}
          {availableNextStatuses.length > 0 && (
            <div>
              <Label className="text-xs sm:text-sm font-medium text-gray-500 mb-2 block">
                Prochaines étapes recommandées
              </Label>
              <div className="flex flex-wrap gap-2">
                {availableNextStatuses.map((nextStatus) => {
                  const nextStatusInfo = getStatusInfo(nextStatus);
                  return (
                    <Button
                      key={nextStatus}
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusChange(nextStatus)}
                      disabled={isUpdatingStatus}
                      className="text-xs"
                    >
                      {nextStatusInfo.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions rapides */}
          <div className="pt-4 border-t space-y-2">
            <Button
              variant="outline"
              className="w-full text-sm"
              onClick={() => router.push(`/dashboard/organisateur`)}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Retour au dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Button>
            <Button
              variant="outline"
              className="w-full text-sm"
              onClick={() => router.push(`/dashboard/organisateur/events`)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">
                Gérer tous les événements
              </span>
              <span className="sm:hidden">Tous les événements</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informations de l'organisateur */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-600" />
            <span>Organisateur</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium text-gray-900 text-sm sm:text-base">
              {event.organizer?.name || "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              {event.organizer?.email || "N/A"}
            </p>
            <p className="text-xs text-gray-400">
              Créé le {new Date(event.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
