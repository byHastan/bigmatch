"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateEvent() {
  const [eventData, setEventData] = useState({
    name: "",
    date: "",
    type: "LEAGUE",
    rounds: 7,
    pointsWin: 2,
    pointsDraw: 0,
    pointsLoss: 1,
  });

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici on ajoutera la logique pour créer l'événement
    console.log("Création de l'événement:", eventData);
    router.push("/dashboard/organisateur");
  };

  return (
    <RoleGuard allowedRoles={["ORGANISATEUR"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="p-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Trophy className="h-8 w-8 text-red-500" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Créer un événement
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Event Basic Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Informations de base
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'événement
                  </label>
                  <input
                    type="text"
                    value={eventData.name}
                    onChange={(e) =>
                      setEventData({ ...eventData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Entrez le nom"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de l'événement
                  </label>
                  <input
                    type="date"
                    value={eventData.date}
                    onChange={(e) =>
                      setEventData({ ...eventData, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'événement
                  </label>
                  <select
                    value={eventData.type}
                    onChange={(e) =>
                      setEventData({ ...eventData, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="CUP">CUP</option>
                    <option value="PLAYOFF">PLAYOFF</option>
                    <option value="LEAGUE">LEAGUE</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Event Rules */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Règles du jeu
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de tours
                  </label>
                  <div className="flex items-center space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setEventData({
                          ...eventData,
                          rounds: Math.max(5, eventData.rounds - 1),
                        })
                      }
                      className="w-10 h-10 p-0"
                    >
                      -
                    </Button>
                    <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
                      {eventData.rounds}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setEventData({
                          ...eventData,
                          rounds: Math.min(9, eventData.rounds + 1),
                        })
                      }
                      className="w-10 h-10 p-0"
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Min: 5, Max: 9</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points pour une victoire
                  </label>
                  <div className="flex items-center space-x-4">
                    {[0, 1, 2, 3, 4].map((points) => (
                      <Button
                        key={points}
                        type="button"
                        variant={
                          eventData.pointsWin === points ? "default" : "outline"
                        }
                        onClick={() =>
                          setEventData({ ...eventData, pointsWin: points })
                        }
                        className="w-10 h-10 p-0"
                      >
                        {points}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points pour un match nul
                  </label>
                  <div className="flex items-center space-x-4">
                    {[0, 1, 2].map((points) => (
                      <Button
                        key={points}
                        type="button"
                        variant={
                          eventData.pointsDraw === points
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          setEventData({ ...eventData, pointsDraw: points })
                        }
                        className="w-10 h-10 p-0"
                      >
                        {points}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points pour une défaite
                  </label>
                  <div className="flex items-center space-x-4">
                    {[0, 1, 2].map((points) => (
                      <Button
                        key={points}
                        type="button"
                        variant={
                          eventData.pointsLoss === points
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          setEventData({ ...eventData, pointsLoss: points })
                        }
                        className="w-10 h-10 p-0"
                      >
                        {points}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="px-6 py-2"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Créer l'événement
              </Button>
            </div>
          </form>
        </div>
      </div>
    </RoleGuard>
  );
}
