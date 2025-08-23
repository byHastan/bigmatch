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
import { Event, UpdateEventData } from "@/src/types/event";
import {
  Calendar,
  Check,
  Clock,
  Copy,
  Edit,
  FileText,
  MapPin,
  Trophy,
} from "lucide-react";
import { useState } from "react";

interface EventBasicInfoProps {
  event: Event;
  isEditing: boolean;
  formData: UpdateEventData;
  onInputChange: (field: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const EVENT_TYPES = [
  { value: "MATCH", label: "Match" },
  { value: "CHAMPIONNAT", label: "Championnat" },
  { value: "COUPE", label: "Coupe" },
];

export default function EventBasicInfo({
  event,
  isEditing,
  formData,
  onInputChange,
  onSubmit,
  onCancel,
  isSubmitting,
}: EventBasicInfoProps) {
  const [copiedCode, setCopiedCode] = useState(false);

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

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(event.registrationCode);
      setCopiedCode(true);

      // Reset l'état après 2 secondes
      setTimeout(() => {
        setCopiedCode(false);
      }, 2000);
    } catch (err) {
      console.error("Erreur lors de la copie:", err);
    }
  };

  if (isEditing) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Edit className="w-5 h-5 text-orange-600" />
            <span>Modifier l'événement</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom de l'événement *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => onInputChange("name", e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="type">Type d'événement *</Label>
                <Select
                  value={formData.type || ""}
                  onValueChange={(value) => onInputChange("type", value)}
                >
                  <SelectTrigger className="mt-1">
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
                onChange={(e) => onInputChange("description", e.target.value)}
                rows={3}
                className="mt-1"
                placeholder="Décrivez votre événement..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) => onInputChange("date", e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="time">Heure</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time || ""}
                  onChange={(e) => onInputChange("time", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Lieu</Label>
              <Input
                id="location"
                value={formData.location || ""}
                onChange={(e) => onInputChange("location", e.target.value)}
                className="mt-1"
                placeholder="Adresse ou nom du lieu"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxTeams">Nombre max d'équipes</Label>
                <Input
                  id="maxTeams"
                  type="number"
                  value={formData.maxTeams || ""}
                  onChange={(e) =>
                    onInputChange("maxTeams", parseInt(e.target.value) || 0)
                  }
                  className="mt-1"
                  placeholder="Illimité si vide"
                />
              </div>
              <div>
                <Label htmlFor="maxPlayers">Nombre max de joueurs</Label>
                <Input
                  id="maxPlayers"
                  type="number"
                  value={formData.maxPlayers || ""}
                  onChange={(e) =>
                    onInputChange("maxPlayers", parseInt(e.target.value) || 0)
                  }
                  className="mt-1"
                  placeholder="Illimité si vide"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <FileText className="w-5 h-5 text-green-600" />
          <span>Informations de base</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Informations principales en format mobile-friendly */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <Trophy className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div className="min-w-0">
                <Label className="text-xs font-medium text-yellow-700 uppercase tracking-wide">
                  Type
                </Label>
                <p className="text-sm font-semibold text-yellow-900 truncate">
                  {EVENT_TYPES.find((t) => t.value === event.type)?.label ||
                    event.type}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <Label className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                  Date
                </Label>
                <p className="text-sm font-semibold text-blue-900">
                  {formatDate(event.date)}
                </p>
              </div>
            </div>
          </div>

          {event.time && (
            <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <Clock className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <Label className="text-xs font-medium text-green-700 uppercase tracking-wide">
                  Heure
                </Label>
                <p className="text-sm font-semibold text-green-900">
                  {formatTime(event.time)}
                </p>
              </div>
            </div>
          )}

          {event.location && (
            <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border border-red-200">
              <MapPin className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="min-w-0">
                <Label className="text-xs font-medium text-red-700 uppercase tracking-wide">
                  Lieu
                </Label>
                <p className="text-sm font-semibold text-red-900">
                  {event.location}
                </p>
              </div>
            </div>
          )}

          {event.description && (
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2 block">
                Description
              </Label>
              <p className="text-sm text-gray-900 leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 text-center">
              <Label className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1 block">
                Équipes max
              </Label>
              <p className="text-lg font-bold text-blue-900">
                {event.maxTeams || "∞"}
              </p>
              {event.maxTeams && (
                <p className="text-xs text-blue-600 mt-1">
                  {event.maxTeams - event.currentTeams} places restantes
                </p>
              )}
            </div>

            <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 text-center">
              <Label className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1 block">
                Joueurs max
              </Label>
              <p className="text-lg font-bold text-green-900">
                {event.maxPlayers || "∞"}
              </p>
              {event.maxPlayers && (
                <p className="text-xs text-green-600 mt-1">
                  {event.maxPlayers - event.totalPlayers} places restantes
                </p>
              )}
            </div>
          </div>

          {/* Code d'inscription */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
            <Label className="text-xs font-medium text-purple-700 uppercase tracking-wide mb-2 block">
              Code d'inscription
            </Label>
            <div className="flex items-center space-x-2">
              <code className="px-3 py-2 bg-white rounded border border-purple-300 text-sm font-mono text-purple-900 font-bold flex-1 text-center">
                {event.registrationCode}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                disabled={copiedCode}
                className={`transition-all duration-300 flex items-center space-x-2 ${
                  copiedCode
                    ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-100 scale-105"
                    : "text-purple-700 border-purple-300 hover:bg-purple-50"
                }`}
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copier</span>
                  </>
                )}
              </Button>
            </div>

            {/* Message de confirmation */}
            {copiedCode && (
              <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded text-center">
                <p className="text-xs text-green-700 font-medium animate-pulse">
                  ✓ Code copié dans le presse-papiers !
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
