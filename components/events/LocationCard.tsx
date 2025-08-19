import { MapPin } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationCardProps {
  location: string;
  maxParticipants: number;
  onLocationChange: (location: string) => void;
  onMaxParticipantsChange: (maxParticipants: number) => void;
}

export default function LocationCard({
  location,
  maxParticipants,
  onLocationChange,
  onMaxParticipantsChange,
}: LocationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-purple-600" />
          Lieu et participants
        </CardTitle>
        <CardDescription>Où et avec combien de participants</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lieu */}
          <div className="space-y-2">
            <Label htmlFor="location">Lieu *</Label>
            <Input
              id="location"
              placeholder="Ex: Stade municipal, Terrain de sport..."
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              required
            />
          </div>

          {/* Nombre max de participants */}
          <div className="space-y-2">
            <Label htmlFor="maxParticipants">Nombre max de participants</Label>
            <Input
              id="maxParticipants"
              type="number"
              min="1"
              placeholder="Ex: 24"
              value={maxParticipants || ""}
              onChange={(e) =>
                onMaxParticipantsChange(parseInt(e.target.value) || 0)
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
