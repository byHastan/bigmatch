"use client";

import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToastContainer } from "@/components/ui/toast";
import {
  useEvent,
  useUpdateEvent,
  useUpdateEventStatus,
} from "@/src/hooks/useEvent";
import { useToast } from "@/src/hooks/useToast";
import { EventStatus, UpdateEventData } from "@/src/types/event";
import { ArrowLeft, Edit, Eye, FileText, Save, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EVENT_TYPES = [
  { value: "MATCH", label: "Match" },
  { value: "CHAMPIONNAT", label: "Championnat" },
  { value: "COUPE", label: "Coupe" },
];

const EVENT_STATUSES = [
  {
    value: "draft" as EventStatus,
    label: "Brouillon",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "published" as EventStatus,
    label: "Publié",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "registration_open" as EventStatus,
    label: "Inscriptions ouvertes",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "registration_closed" as EventStatus,
    label: "Inscriptions fermées",
    color: "bg-orange-100 text-orange-800",
  },
  {
    value: "in_progress" as EventStatus,
    label: "En cours",
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "completed" as EventStatus,
    label: "Terminé",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "cancelled" as EventStatus,
    label: "Annulé",
    color: "bg-red-100 text-red-800",
  },
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    return timeString;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
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
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Événements", href: "/dashboard/organisateur/events" },
          { label: event.name },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? "Modifier l'événement" : event.name}
            </h1>
            <p className="text-gray-600">
              Code d'inscription: {event.registrationCode}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Voir
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Informations de base</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom de l'événement *</Label>
                      <Input
                        id="name"
                        value={formData.name || ""}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type d'événement *</Label>
                      <Select
                        value={formData.type || ""}
                        onValueChange={(value) =>
                          handleInputChange("type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date || ""}
                        onChange={(e) =>
                          handleInputChange("date", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Heure</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time || ""}
                        onChange={(e) =>
                          handleInputChange("time", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location">Lieu</Label>
                    <Input
                      id="location"
                      value={formData.location || ""}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxTeams">Nombre max d'équipes</Label>
                      <Input
                        id="maxTeams"
                        type="number"
                        value={formData.maxTeams || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "maxTeams",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxPlayers">Nombre max de joueurs</Label>
                      <Input
                        id="maxPlayers"
                        type="number"
                        value={formData.maxPlayers || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "maxPlayers",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateEventMutation.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateEventMutation.isPending
                        ? "Sauvegarde..."
                        : "Sauvegarder"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Nom
                      </Label>
                      <p className="text-gray-900">{event.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Type
                      </Label>
                      <p className="text-gray-900">
                        {EVENT_TYPES.find((t) => t.value === event.type)
                          ?.label || event.type}
                      </p>
                    </div>
                  </div>
                  {event.description && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Description
                      </Label>
                      <p className="text-gray-900">{event.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Date
                      </Label>
                      <p className="text-gray-900">{formatDate(event.date)}</p>
                    </div>
                    {event.time && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Heure
                        </Label>
                        <p className="text-gray-900">
                          {formatTime(event.time)}
                        </p>
                      </div>
                    )}
                  </div>
                  {event.location && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Lieu
                      </Label>
                      <p className="text-gray-900">{event.location}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Équipes max
                      </Label>
                      <p className="text-gray-900">
                        {event.maxTeams || "Illimité"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Joueurs max
                      </Label>
                      <p className="text-gray-900">
                        {event.maxPlayers || "Illimité"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Équipes inscrites */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Équipes inscrites ({event.teams?.length || 0})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!event.teams || event.teams.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucune équipe inscrite pour le moment
                </p>
              ) : (
                <div className="space-y-3">
                  {event.teams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {team.logo && (
                          <img
                            src={team.logo}
                            alt={`Logo ${team.name}`}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {team.name}
                          </h4>
                          {team.description && (
                            <p className="text-sm text-gray-500">
                              {team.description}
                            </p>
                          )}
                          {team.sport && (
                            <p className="text-sm text-gray-500">
                              {team.sport}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {team.playerCount || 0} joueur
                          {(team.playerCount || 0) > 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-gray-400">
                          Inscrit le {formatDate(team.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Statut et actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Statut et actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500 mb-2 block">
                  Statut actuel
                </Label>
                <Badge
                  className={`${
                    EVENT_STATUSES.find((s) => s.value === event.status)
                      ?.color || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {EVENT_STATUSES.find((s) => s.value === event.status)
                    ?.label || event.status}
                </Badge>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500 mb-2 block">
                  Changer le statut
                </Label>
                <Select
                  value={event.status}
                  onValueChange={handleStatusChange}
                  disabled={updateStatusMutation.isPending}
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

              <div className="pt-4 border-t space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/dashboard/organisateur`)}
                >
                  Retour au dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/dashboard/organisateur/events`)}
                >
                  Gérer tous les événements
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    Équipes inscrites
                  </span>
                </div>
                <span className="font-semibold text-lg">
                  {event.currentTeams}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Total joueurs</span>
                </div>
                <span className="font-semibold text-lg">
                  {event.totalPlayers}
                </span>
              </div>
              {event.maxTeams && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-gray-600">
                      Places restantes
                    </span>
                  </div>
                  <span className="font-semibold text-lg">
                    {event.maxTeams - event.currentTeams}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations de l'organisateur */}
          <Card>
            <CardHeader>
              <CardTitle>Organisateur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">
                  {event.organizer?.name || "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  {event.organizer?.email || "N/A"}
                </p>
                <p className="text-xs text-gray-400">
                  Créé le {formatDate(event.createdAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
