"use client";

import { motion } from "framer-motion";
import { Calendar, Settings, Target, Users } from "lucide-react";
import { useState } from "react";

import RoleGuard from "@/components/auth/RoleGuard";
import {
  DashboardHeader,
  ErrorMessage,
  HomeEventsList,
  LoadingSpinner,
  TabNavigation,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/src/hooks/useEvents";
import { ROLES } from "@/src/lib/constants";
import { useRouter } from "next/navigation";

export default function OrganisateurDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const { events, loading, error, refetch } = useEvents();

  const handleManageEvent = (eventId: string) => {
    console.log(`Gérer l'événement ${eventId}`);
    // TODO: Implémenter la navigation vers la page de gestion de l'événement
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
            <div className="bg-white flex flex-col gap-3 justify-center items-center rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                Bienvenue, <span className="text-orange-600">Organisateur</span>
              </h3>
              <Button
                onClick={() => router.push("/dashboard/organisateur/events")}
                variant="outline"
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Gérer mes événements
              </Button>
            </div>
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} onRetry={refetch} />
            ) : (
              <HomeEventsList events={events} />
            )}
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
              {loading ? (
                <LoadingSpinner />
              ) : error ? (
                <ErrorMessage message={error} onRetry={refetch} />
              ) : (
                <HomeEventsList events={events} />
              )}
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
                <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-xl">
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
      <div className="min-h-screen bg-gray-50 pb-20 ">
        <DashboardHeader
          icon={
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="h-7 w-7 text-white" />
            </div>
          }
          showNavigation={true}
          onNavigate={(route) => {
            if (route === "/dashboard") setActiveTab("home");
            else if (route === "/dashboard/events") setActiveTab("events");
            else if (route === "/dashboard/teams") setActiveTab("participants");
          }}
        />

        <div className="max-w-md mx-auto px-4 py-6">{renderTabContent()}</div>

        {/* Bottom Navigation Bar */}
        <TabNavigation
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
        />
      </div>
    </RoleGuard>
  );
}
