import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateTimeCardProps {
  date: Date | undefined;
  time: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
}

export default function DateTimeCard({
  date,
  time,
  onDateChange,
  onTimeChange,
}: DateTimeCardProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-green-600" />
          Date et heure
        </CardTitle>
        <CardDescription>Quand se déroulera votre événement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date */}
          <div className="space-y-2">
            <Label>Date *</Label>
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  date.toLocaleDateString("fr-FR")
                ) : (
                  <span className="text-gray-500">Sélectionner une date</span>
                )}
              </Button>

              {showCalendar && (
                <div className="absolute top-full left-0 z-10 mt-1 bg-white border rounded-lg shadow-lg">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      onDateChange(selectedDate);
                      setShowCalendar(false);
                    }}
                    disabled={(selectedDate) => selectedDate < new Date()}
                    initialFocus
                  />
                </div>
              )}
            </div>
          </div>

          {/* Heure */}
          <div className="space-y-2">
            <Label htmlFor="time">Heure *</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
