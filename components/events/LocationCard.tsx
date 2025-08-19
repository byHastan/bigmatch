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
  onLocationChange: (location: string) => void;
}

export default function LocationCard({
  location,
  onLocationChange,
}: LocationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-purple-600" />
          Lieu
        </CardTitle>
        <CardDescription>Où se déroule votre événement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
      </CardContent>
    </Card>
  );
}
