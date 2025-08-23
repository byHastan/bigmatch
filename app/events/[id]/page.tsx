"use client";

import {
  EventBasicInfo,
  EventStats,
  EventStatusActions,
  TeamsList,
} from "@/components/events";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { ToastContainer } from "@/components/ui/toast";
import {
  useEvent,
  useUpdateEvent,
  useUpdateEventStatus,
} from "@/src/hooks/useEvent";
import { useToast } from "@/src/hooks/useToast";
import { EventStatus, UpdateEventData } from "@/src/types/event";
import { ArrowLeft, Edit, Eye } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EVENT_TYPES = [
  { value: "MATCH", label: "Match" },
  { value: "CHAMPIONNAT", label: "Championnat" },
  { value: "COUPE", label: "Coupe" },
];

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateEventData>({});
  const { toasts, showSuccess, showError, removeToast } = useToast();

  const eventId = params.id as string;

  // Récupérer l'événement
  const { data: event, isLoading, error } = useEvent(eventId);

  // Callback pour fermer le mode édition après la mise à jour
  const handleUpdateSuccess = () => {
    setIsEditing(false);
    showSuccess("Événement mis à jour avec succès");
  };

  const handleUpdateError = (error: Error) => {
    showError(error.message);
  };

  const handleStatusSuccess = () => {
    showSuccess("Statut mis à jour avec succès");
  };

  const handleStatusError = (error: Error) => {
    showError(error.message);
  };

  // Mutation pour mettre à jour l'événement
  const updateEventMutation = useUpdateEvent(
    eventId,
    handleUpdateSuccess,
    handleUpdateError
  );

  // Mutation pour changer le statut
  const updateStatusMutation = useUpdateEventStatus(
    eventId,
    handleStatusSuccess,
    handleStatusError
  );

  useEffect(() => {
    if (event && isEditing) {
      setFormData({
        name: event.name,
        description: event.description || "",
        type: event.type,
        date: event.date.split("T")[0],
        time: event.time || "",
        location: event.location || "",
        rules: event.rules || {},
        maxTeams: event.maxTeams || 0,
        maxPlayers: event.maxPlayers || 0,
        status: event.status as EventStatus,
      });
    }
  }, [event, isEditing]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEventMutation.mutate(formData);
  };

  const handleStatusChange = (status: EventStatus) => {
    updateStatusMutation.mutate(status);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 sm:w-1/4 mb-4"></div>
          <div className="h-48 sm:h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Événement non trouvé
          </h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Breadcrumb - Masqué sur mobile pour économiser l'espace */}
      <div className="hidden sm:block mb-6">
        <Breadcrumb
          items={[
            { label: "Événements", href: "/dashboard/organisateur/events" },
            { label: event.name },
          ]}
        />
      </div>

      {/* Header mobile-first */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="sm:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="hidden sm:flex"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <Button
            variant={isEditing ? "outline" : "default"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Voir</span>
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Modifier</span>
              </>
            )}
          </Button>
        </div>

        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {isEditing ? "Modifier l'événement" : event.name}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Code d'inscription: {event.registrationCode}
          </p>
        </div>
      </div>

      {/* Grille responsive - Mobile first */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Colonne principale - Priorité aux équipes inscrites */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Équipes inscrites - Mise en avant sur mobile */}
          <Card className="order-1 lg:order-2">
            <CardContent className="p-0">
              <TeamsList
                teams={event.teams || []}
                maxTeams={event.maxTeams}
                currentTeams={event.currentTeams}
              />
            </CardContent>
          </Card>

          {/* Informations de base */}
          <div className="order-2 lg:order-1">
            <EventBasicInfo
              event={event}
              isEditing={isEditing}
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              onCancel={() => setIsEditing(false)}
              isSubmitting={updateEventMutation.isPending}
            />
          </div>
        </div>

        {/* Colonne latérale - Réorganisée pour mobile */}
        <div className="space-y-4 sm:space-y-6 order-3">
          {/* Statut et actions rapides */}
          <EventStatusActions
            event={event}
            onStatusChange={handleStatusChange}
            isUpdatingStatus={updateStatusMutation.isPending}
          />

          {/* Statistiques - Mise en avant sur mobile */}
          <EventStats event={event} />
        </div>
      </div>

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
