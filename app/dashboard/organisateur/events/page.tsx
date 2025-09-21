"use client";

import { motion } from "framer-motion";
import { Calendar, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import RoleGuard from "@/components/auth/RoleGuard";
import {
  DashboardHeader,
  DeleteConfirmation,
  ErrorMessage,
  EventFilters,
  EventManagementCard,
  EventManagementStats,
  LoadingSpinner,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/src/hooks/useEvents";
import { ROLES } from "@/src/lib/constants";
import { useRouter } from "next/navigation";

export default function EventManagementPage() {
  const router = useRouter();
  const { data: events = [], isLoading: loading, error, refetch } = useEvents();

  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // État pour la confirmation de suppression
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    eventId: string;
    eventName: string;
  }>({
    isOpen: false,
    eventId: "",
    eventName: "",
  });

  // Filtrer les événements
  const filteredEvents = useMemo(() => {
    if (!events || !Array.isArray(events)) {
      return [];
    }
    return events.filter((event) => {
      const matchesSearch =
        searchQuery === "" ||
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        statusFilter === "" ||
        event.status === statusFilter;
      const matchesType =
        typeFilter === "ALL" || typeFilter === "" || event.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [events, searchQuery, statusFilter, typeFilter]);

  // Gestionnaires d'actions
  const handleEditEvent = (eventId: string) => {
    router.push(`/events/${eventId}?edit=true`);
  };

  const handleDeleteEvent = (eventId: string) => {
    const event =
      events && Array.isArray(events)
        ? events.find((e) => e.id === eventId)
        : null;
    if (event) {
      setDeleteModal({
        isOpen: true,
        eventId,
        eventName: event.name,
      });
    }
  };

  const confirmDeleteEvent = async () => {
    try {
      const response = await fetch(`/api/events/${deleteModal.eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Échec de la suppression de l\'événement');
      }

      // Rafraîchir la liste des événements
      refetch();
      
      // Afficher un message de succès
      if (typeof window !== 'undefined') {
        alert('Événement supprimé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error);
      if (typeof window !== 'undefined') {
        alert('Erreur lors de la suppression de l\'événement. Veuillez réessayer.');
      }
    } finally {
      setDeleteModal({ isOpen: false, eventId: "", eventName: "" });
    }
  };

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleCreateEvent = () => {
    router.push("/create-event");
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={[ROLES.ORGANISATEUR]}>
        <div className="min-h-screen bg-gray-50">
          <DashboardHeader
            icon={
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="h-7 w-7 text-white" />
              </div>
            }
            showNavigation={true}
            onNavigate={(route) => {
              if (route === "/dashboard")
                router.push("/dashboard/organisateur");
              else if (route === "/dashboard/events")
                router.push("/dashboard/organisateur/events");
              else if (route === "/dashboard/teams")
                router.push("/dashboard/organisateur/inscriptions");
            }}
          />
          <div className="max-w-6xl mx-auto px-4 py-6">
            <LoadingSpinner />
          </div>
        </div>
      </RoleGuard>
    );
  }

  if (error) {
    return (
      <RoleGuard allowedRoles={[ROLES.ORGANISATEUR]}>
        <div className="min-h-screen bg-gray-50">
          <DashboardHeader
            icon={
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="h-7 w-7 text-white" />
              </div>
            }
            showNavigation={true}
            onNavigate={(route) => {
              if (route === "/dashboard")
                router.push("/dashboard/organisateur");
              else if (route === "/dashboard/events")
                router.push("/dashboard/organisateur/events");
              else if (route === "/dashboard/teams")
                router.push("/dashboard/organisateur/inscriptions");
            }}
          />
          <div className="max-w-6xl mx-auto px-4 py-6">
            <ErrorMessage message={error.message} onRetry={refetch} />
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={[ROLES.ORGANISATEUR]}>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          icon={
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="h-7 w-7 text-white" />
            </div>
          }
          showNavigation={true}
          onNavigate={(route) => {
            if (route === "/dashboard") router.push("/dashboard/organisateur");
            else if (route === "/dashboard/events")
              router.push("/dashboard/organisateur/events");
            else if (route === "/dashboard/teams")
              router.push("/dashboard/organisateur/inscriptions");
          }}
        />

        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* En-tête de la page */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="flex flex-col gap-3 md:flex-row items-start md:items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Gestion des Événements
                </h1>
                <p className="text-gray-600">
                  Gérez tous vos événements sportifs en un seul endroit
                </p>
              </div>
              <Button
                onClick={handleCreateEvent}
                variant="outline"
                className="text-orange-600 border-orange-300 hover:bg-orange-50 md:w-auto w-full"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer un événement
              </Button>
            </div>

            {/* Statistiques */}
            <EventManagementStats
              events={events && Array.isArray(events) ? events : []}
            />
          </motion.div>

          {/* Filtres */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <EventFilters
              onSearch={setSearchQuery}
              onStatusFilter={setStatusFilter}
              onTypeFilter={setTypeFilter}
              onClearFilters={handleClearFilters}
            />
          </motion.div>

          {/* Liste des événements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {filteredEvents.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-12 h-12 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {events.length === 0
                    ? "Aucun événement créé"
                    : "Aucun événement trouvé"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {events.length === 0
                    ? "Commencez par créer votre premier événement sportif"
                    : "Essayez de modifier vos filtres de recherche"}
                </p>
                {events.length === 0 && (
                  <Button
                    onClick={handleCreateEvent}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un événement
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventManagementCard
                    key={event.id}
                    event={event}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                    onView={handleViewEvent}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmation
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, eventId: "", eventName: "" })
        }
        onConfirm={confirmDeleteEvent}
        eventName={deleteModal.eventName}
      />
    </RoleGuard>
  );
}
