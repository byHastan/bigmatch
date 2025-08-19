import { Calendar, Trophy } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

type EventType = "MATCH" | "CHAMPIONNAT" | "COUPE";

interface BasicInfoCardProps {
  formData: {
    name: string;
    description: string;
    type: EventType;
  };
  onInputChange: (field: "name" | "description" | "type", value: any) => void;
}

export default function BasicInfoCard({
  formData,
  onInputChange,
}: BasicInfoCardProps) {
  const getEventTypeInfo = (type: EventType) => {
    switch (type) {
      case "MATCH":
        return {
          label: "Match simple",
          description: "Un match unique entre deux équipes",
          icon: <Trophy className="h-5 w-5" />,
          color: "text-blue-600",
        };
      case "CHAMPIONNAT":
        return {
          label: "Championnat",
          description: "Compétition sur plusieurs matchs avec classement",
          icon: <Trophy className="h-5 w-5" />,
          color: "text-green-600",
        };
      case "COUPE":
        return {
          label: "Coupe",
          description: "Tournoi à élimination directe",
          icon: <Trophy className="h-5 w-5" />,
          color: "text-red-600",
        };
    }
  };

  const eventTypeInfo = getEventTypeInfo(formData.type);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Informations de base
        </CardTitle>
        <CardDescription>
          Les informations essentielles de votre événement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Nom de l'événement */}
        <div className="space-y-2">
          <Label htmlFor="name">Nom de l'événement *</Label>
          <Input
            id="name"
            placeholder="Ex: Tournoi de Football 2024"
            value={formData.name}
            onChange={(e) => onInputChange("name", e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Décrivez votre événement..."
            value={formData.description}
            onChange={(e) => onInputChange("description", e.target.value)}
            rows={3}
          />
        </div>

        {/* Type d'événement */}
        <div className="space-y-2">
          <Label htmlFor="type">Type d'événement *</Label>
          <Select
            value={formData.type}
            onValueChange={(value: EventType) => onInputChange("type", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MATCH">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-blue-600" />
                  Match simple
                </div>
              </SelectItem>
              <SelectItem value="CHAMPIONNAT">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-green-600" />
                  Championnat
                </div>
              </SelectItem>
              <SelectItem value="COUPE">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-red-600" />
                  Coupe
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Info sur le type sélectionné */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className={eventTypeInfo.color}>{eventTypeInfo.icon}</span>
              <span className="font-medium">{eventTypeInfo.label}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {eventTypeInfo.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
