"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Download,
  Mail,
  Phone,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Player {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  number: number;
}

interface Team {
  id: string;
  name: string;
  description: string;
  sport: string;
  logo: string | null;
  players: Player[];
  createdAt: string;
}

interface Event {
  id: string;
  name: string;
  type: string;
  date: string;
  location: string;
  registrationCode: string;
  maxTeams: number;
  currentTeams: number;
  status: string;
  teams: Team[];
}

export default function GestionInscriptionsPage() {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Données simulées (à remplacer par des appels API)
  const [events] = useState<Event[]>([
    {
      id: "1",
      name: "Tournoi de Basketball 2024",
      type: "CUP",
      date: "15/12/2024",
      location: "Stade Municipal",
      registrationCode: "FOOT24",
      maxTeams: 16,
      currentTeams: 8,
      status: "ACTIVE",
      teams: [
        {
          id: "1",
          name: "Les Champions",
          description: "Équipe expérimentée",
          sport: "Football",
          logo: null,
          players: [
            {
              id: "1",
              name: "Jean Dupont",
              email: "jean@champions.com",
              phone: "06 12 34 56 78",
              position: "Attaquant",
              number: 10,
            },
            {
              id: "2",
              name: "Pierre Martin",
              email: "pierre@champions.com",
              phone: "06 23 45 67 89",
              position: "Défenseur",
              number: 4,
            },
          ],
          createdAt: "2024-12-01",
        },
        {
          id: "2",
          name: "Les Vainqueurs",
          description: "Nouvelle équipe prometteuse",
          sport: "Football",
          logo: null,
          players: [
            {
              id: "3",
              name: "Marc Bernard",
              email: "marc@vainqueurs.com",
              phone: "06 34 56 78 90",
              position: "Milieu",
              number: 8,
            },
          ],
          createdAt: "2024-12-02",
        },
      ],
    },
    {
      id: "2",
      name: "Championnat de Basketball",
      type: "LEAGUE",
      date: "20/12/2024",
      location: "Gymnase Municipal",
      registrationCode: "BASK24",
      maxTeams: 12,
      currentTeams: 6,
      status: "ACTIVE",
      teams: [],
    },
  ]);

  const filteredTeams =
    selectedEvent?.teams.filter((team) => {
      const matchesSearch =
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "recent" && isRecentTeam(team.createdAt));
      return matchesSearch && matchesStatus;
    }) || [];

  function isRecentTeam(createdAt: string): boolean {
    const teamDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - teamDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }

  const exportTeamsToCSV = () => {
    if (!selectedEvent) return;

    const headers = [
      "Équipe",
      "Description",
      "Sport",
      "Joueurs",
      "Date d'inscription",
    ];
    const csvContent = [
      headers.join(","),
      ...selectedEvent.teams.map((team) =>
        [
          team.name,
          team.description,
          team.sport,
          team.players.length,
          new Date(team.createdAt).toLocaleDateString("fr-FR"),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `inscriptions_${selectedEvent.name}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sendEmailToTeam = (team: Team) => {
    // Simuler l'envoi d'email
    alert(`Email envoyé à l'équipe ${team.name}`);
  };

  const removeTeam = (teamId: string) => {
    if (confirm("Êtes-vous sûr de vouloir retirer cette équipe ?")) {
      // Simuler la suppression
      alert("Équipe retirée avec succès");
    }
  };

  if (!selectedEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>

              <h1 className="text-xl font-semibold text-gray-900">
                Gestion des Inscriptions
              </h1>

              <div className="w-16" />
            </div>
          </div>
        </div>

        {/* Sélection d'événement */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Sélectionnez un événement
            </h2>
            <p className="text-gray-600">
              Choisissez l'événement dont vous souhaitez gérer les inscriptions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card
                key={event.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedEvent(event)}
              >
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Trophy className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {event.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {event.type} • {event.date}
                      </p>
                      <div className="flex items-center justify-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>
                            {event.currentTeams}/{event.maxTeams}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <span className="text-xs font-medium text-blue-600">
                        Code: {event.registrationCode}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setSelectedEvent(null)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux événements
            </Button>

            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {selectedEvent.name}
              </h1>
              <p className="text-sm text-gray-600">
                Gestion des inscriptions • {selectedEvent.currentTeams}/
                {selectedEvent.maxTeams} équipes
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={exportTeamsToCSV} size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Informations de l'événement */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {selectedEvent.currentTeams}
                </div>
                <div className="text-sm text-blue-700">Équipes inscrites</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {selectedEvent.maxTeams}
                </div>
                <div className="text-sm text-blue-700">Places disponibles</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {selectedEvent.teams.reduce(
                    (total, team) => total + team.players.length,
                    0
                  )}
                </div>
                <div className="text-sm text-blue-700">Joueurs total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {selectedEvent.registrationCode}
                </div>
                <div className="text-sm text-blue-700">Code d'inscription</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtres et recherche */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="search">Rechercher une équipe</Label>
            <Input
              id="search"
              placeholder="Nom de l'équipe ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <Label htmlFor="filter">Filtrer par</Label>
            <select
              id="filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les équipes</option>
              <option value="recent">Inscriptions récentes (7j)</option>
            </select>
          </div>
        </div>

        {/* Liste des équipes */}
        <div className="space-y-4">
          {filteredTeams.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm || filterStatus !== "all"
                    ? "Aucune équipe ne correspond aux critères de recherche"
                    : "Aucune équipe inscrite pour le moment"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTeams.map((team) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {team.name}
                          </h3>
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {team.sport}
                          </span>
                          {isRecentTeam(team.createdAt) && (
                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Nouveau
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 mb-4">{team.description}</p>

                        {/* Liste des joueurs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {team.players.map((player) => (
                            <div
                              key={player.id}
                              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">
                                  {player.name}
                                </span>
                                <span className="text-sm text-gray-500">
                                  #{player.number}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center space-x-1 mb-1">
                                  <Mail className="w-3 h-3" />
                                  <span>{player.email}</span>
                                </div>
                                <div className="flex items-center space-x-1 mb-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{player.phone}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {player.position}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 text-sm text-gray-500">
                          Inscrit le{" "}
                          {new Date(team.createdAt).toLocaleDateString("fr-FR")}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendEmailToTeam(team)}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Contacter
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTeam(team.id)}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Retirer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
