"use client";

import { motion } from "framer-motion";
import { Calendar, Home, Settings, Users } from "lucide-react";
import { useState } from "react";

import RoleGuard from "@/components/auth/RoleGuard";
import {
  DashboardHeader,
  Event,
  EventsList,
  QuickActions,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/src/lib/constants";
import { useRouter } from "next/navigation";

export default function OrganisateurDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
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
    console.log(`Gérer l'événement ${eventId}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Bienvenue ! 👋
              </h2>
              <p className="text-gray-600 mb-4">
                Gérez vos événements sportifs et créez des compétitions
                mémorables.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Événements actifs
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {events.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            <QuickActions />

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Mes Événements
              </h3>
              <EventsList events={events} onManageEvent={handleManageEvent} />
            </div>
          </motion.div>
        );
      case "events":
        return (
          <motion.div
            key="events"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Tous mes événements
              </h2>
              <EventsList events={events} onManageEvent={handleManageEvent} />
            </div>
          </motion.div>
        );
      case "participants":
        return (
          <motion.div
            key="participants"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Gestion des Inscriptions
                </h2>
                <Button
                  onClick={() =>
                    router.push("/dashboard/organisateur/inscriptions")
                  }
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Gérer les inscriptions
                </Button>
              </div>
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Gérez les inscriptions de vos événements
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Consultez les équipes inscrites, exportez les données et
                  contactez les participants
                </p>
                <Button
                  onClick={() =>
                    router.push("/dashboard/organisateur/inscriptions")
                  }
                  variant="outline"
                  className="mt-4"
                >
                  Accéder à la gestion
                </Button>
              </div>
            </div>
          </motion.div>
        );
      case "settings":
        return (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Paramètres
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Notifications</p>
                    <p className="text-sm text-gray-500">Gérer les alertes</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Profil</p>
                    <p className="text-sm text-gray-500">
                      Modifier vos informations
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <RoleGuard allowedRoles={[ROLES.ORGANISATEUR]}>
      <div className="min-h-screen bg-gray-50 pb-20">
        <DashboardHeader title="Organisateur" />

        <div className="max-w-md mx-auto px-4 py-6">{renderTabContent()}</div>

        {/* Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-around py-3">
              <button
                onClick={() => setActiveTab("home")}
                className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 ${
                  activeTab === "home"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-xs font-medium">Accueil</span>
              </button>

              <button
                onClick={() => setActiveTab("events")}
                className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 ${
                  activeTab === "events"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span className="text-xs font-medium">Événements</span>
              </button>

              <button
                onClick={() => setActiveTab("participants")}
                className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 ${
                  activeTab === "participants"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-xs font-medium">Participants</span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 ${
                  activeTab === "settings"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs font-medium">Réglages</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
