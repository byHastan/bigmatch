"use client";

import { useState } from "react";

import RoleGuard from "@/components/auth/RoleGuard";
import {
  DashboardHeader,
  Event,
  EventsList,
  QuickActions,
  StatsGrid,
} from "@/components/dashboard";
import { ROLES } from "@/src/lib/constants";

export default function OrganisateurDashboard() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      name: "Tournoi de Football 2024",
      type: "CUP",
      date: "15/12/2024",
      participants: 8,
      status: "En cours",
    },
  ]);

  const handleManageEvent = (eventId: number) => {
    // Logique pour gérer l'événement
    console.log(`Gérer l'événement ${eventId}`);
  };

  return (
    <RoleGuard allowedRoles={[ROLES.ORGANISATEUR]}>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader title="Dashboard Organisateur" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StatsGrid
            eventsCount={events.length}
            participantsCount={24}
            competitionsCount={3}
            activeCount={1}
          />

          <QuickActions />

          <EventsList events={events} onManageEvent={handleManageEvent} />
        </div>
      </div>
    </RoleGuard>
  );
}
