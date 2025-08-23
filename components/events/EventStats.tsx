import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Event } from "@/src/types/event";
import { Calendar, Check, Copy, TrendingUp, Users } from "lucide-react";
import { useState } from "react";

interface EventStatsProps {
  event: Event;
}

export default function EventStats({ event }: EventStatsProps) {
  const [copiedCode, setCopiedCode] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getProgressPercentage = (current: number, max: number) => {
    if (!max) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-red-500";
    if (percentage >= 60) return "bg-orange-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(event.registrationCode);
      setCopiedCode(true);

      // Reset l'état après 2 secondes
      setTimeout(() => {
        setCopiedCode(false);
      }, 2000);
    } catch (err) {
      console.error("Erreur lors de la copie:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Statistiques principales */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Statistiques</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Équipes inscrites */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">
                Équipes inscrites
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-xl text-blue-900">
                {event.currentTeams}
              </span>
              {event.maxTeams && (
                <p className="text-xs text-blue-600">/ {event.maxTeams}</p>
              )}
            </div>
          </div>

          {/* Total joueurs */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700 font-medium">
                Total joueurs
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-xl text-green-900">
                {event.totalPlayers}
              </span>
              {event.maxPlayers && (
                <p className="text-xs text-green-600">/ {event.maxPlayers}</p>
              )}
            </div>
          </div>

          {/* Places restantes équipes */}
          {event.maxTeams && (
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-orange-700 font-medium">
                  Places restantes
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-xl text-orange-900">
                  {event.maxTeams - event.currentTeams}
                </span>
                <p className="text-xs text-orange-600">équipes</p>
              </div>
            </div>
          )}

          {/* Barre de progression équipes */}
          {event.maxTeams && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Remplissage équipes</span>
                <span className="font-medium text-gray-900">
                  {Math.round(
                    getProgressPercentage(event.currentTeams, event.maxTeams)
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                    getProgressPercentage(event.currentTeams, event.maxTeams)
                  )}`}
                  style={{
                    width: `${getProgressPercentage(
                      event.currentTeams,
                      event.maxTeams
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations rapides */}
      <Card>
        <CardHeader className="">
          <CardTitle className="text-base sm:text-lg">
            Informations rapides
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          {/* Code d'inscription */}
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-700 uppercase tracking-wide mb-2">
              Code d'inscription
            </p>
            <div className="flex items-center space-x-2">
              <code className="px-2 py-1 bg-white rounded border border-purple-300 text-sm font-mono text-purple-900 font-bold flex-1 text-center">
                {event.registrationCode}
              </code>
              <button
                onClick={handleCopyCode}
                className={`px-3 py-1 text-xs font-medium rounded transition-all duration-300 flex items-center space-x-1 ${
                  copiedCode
                    ? "bg-green-100 text-green-700 border border-green-300 scale-105"
                    : "text-purple-700 border border-purple-300 hover:bg-purple-100 hover:scale-105"
                }`}
                disabled={copiedCode}
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>

            {/* Message de confirmation */}
            {copiedCode && (
              <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded text-center">
                <p className="text-xs text-green-700 font-medium animate-pulse">
                  ✓ Code copié dans le presse-papiers !
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">
            Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Gérer les inscriptions
              </span>
            </div>
          </button>

          <button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Voir les statistiques
              </span>
            </div>
          </button>

          <button className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">
                Modifier l'événement
              </span>
            </div>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
