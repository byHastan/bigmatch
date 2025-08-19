"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  ActionButtons,
  BasicInfoCard,
  CreateEventHeader,
  DateTimeCard,
  EventRules,
  LocationCard,
} from "@/components/events";

type EventType = "MATCH" | "CHAMPIONNAT" | "COUPE";

interface CreateEventForm {
  name: string;
  description: string;
  type: EventType;
  date: Date | undefined;
  time: string;
  location: string;
  maxParticipants: number;
  rules: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateEventForm>({
    name: "",
    description: "",
    type: "MATCH",
    date: undefined,
    time: "",
    location: "",
    maxParticipants: 0,
    rules: "",
  });

  const [eventRules, setEventRules] = useState<any>({});

  const handleInputChange = (field: keyof CreateEventForm, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date) {
      alert("Veuillez sélectionner une date");
      return;
    }

    // Ici on ajoutera la logique pour sauvegarder l'événement
    const eventData = {
      ...formData,
      rules: eventRules,
    };
    console.log("Création de l'événement:", eventData);

    // Redirection vers le dashboard après création
    router.push("/dashboard/organisateur");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <CreateEventHeader />

        <form onSubmit={handleSubmit} className="space-y-8">
          <BasicInfoCard
            formData={formData}
            onInputChange={handleInputChange}
          />

          <DateTimeCard
            date={formData.date}
            time={formData.time}
            onDateChange={(date) => handleInputChange("date", date)}
            onTimeChange={(time) => handleInputChange("time", time)}
          />

          <LocationCard
            location={formData.location}
            maxParticipants={formData.maxParticipants}
            onLocationChange={(location) =>
              handleInputChange("location", location)
            }
            onMaxParticipantsChange={(maxParticipants) =>
              handleInputChange("maxParticipants", maxParticipants)
            }
          />

          <EventRules eventType={formData.type} onRulesChange={setEventRules} />

          <ActionButtons onSubmit={(e) => handleSubmit(e)} />
        </form>
      </div>
    </div>
  );
}
