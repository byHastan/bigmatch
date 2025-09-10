"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import { DashboardHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Calendar, Search, Trophy, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EquipeDashboard() {
  const [availableEvents, setAvailableEvents] = useState([
    {
      id: 1,
      name: "Tournoi de Basket-ball 2024",
      type: "CUP",
      date: "15/12/2024",
      participants: "8/16",
      organizer: "Club Sportif Local",
      status: "Inscriptions ouvertes",
    },
    {
      id: 2,
      name: "Championnat de Basketball",
      type: "LEAGUE",
      date: "20/12/2024",
      participants: "12/20",
      organizer: "Fédération Régionale",
      status: "Inscriptions ouvertes",
    },
  ]);

  const [myEvents, setMyEvents] = useState([
    {
      id: 3,
      name: "Tournoi de Tennis",
      type: "PLAYOFF",
      date: "10/12/2024",
      participants: "16/16",
      organizer: "Tennis Club",
      status: "En cours",
    },
  ]);

  const router = useRouter();

  return (
    <RoleGuard allowedRoles={["EQUIPE"]}>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="Dashboard Équipe"
          subtitle="Gérez vos participations aux événements"
          icon={
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="h-7 w-7 text-white" />
            </div>
          }
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Événements rejoints
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {myEvents.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Victoires</p>
                  <p className="text-2xl font-bold text-gray-900">5</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Membres équipe
                  </p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Search className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Disponibles
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {availableEvents.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Events */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Rechercher des événements
              </h2>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white">
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableEvents.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {event.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.status === "Inscriptions ouvertes"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Type:</strong> {event.type}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Date:</strong> {event.date}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Participants:</strong> {event.participants}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    <strong>Organisateur:</strong> {event.organizer}
                  </p>
                  <Button
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                    size="sm"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Rejoindre
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* My Events */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Mes événements
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {myEvents.map((event) => (
                <div key={event.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {event.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {event.type} • {event.date} • {event.participants}{" "}
                        participants • {event.organizer}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          event.status === "En cours"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {event.status}
                      </span>
                      <Button variant="outline" size="sm">
                        Voir détails
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
