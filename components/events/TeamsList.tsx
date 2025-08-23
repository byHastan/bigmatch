import { Team } from "@/src/types/event";
import { Users, Calendar, MapPin, Trophy } from "lucide-react";

interface TeamsListProps {
  teams: Team[];
  maxTeams?: number;
  currentTeams: number;
}

export default function TeamsList({ teams, maxTeams, currentTeams }: TeamsListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getTeamColor = (index: number) => {
    const colors = [
      "bg-blue-50 border-blue-200",
      "bg-green-50 border-green-200",
      "bg-purple-50 border-purple-200",
      "bg-orange-50 border-orange-200",
      "bg-pink-50 border-pink-200",
      "bg-indigo-50 border-indigo-200",
    ];
    return colors[index % colors.length];
  };

  if (!teams || teams.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Users className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucune équipe inscrite
        </h3>
        <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
          Les équipes apparaîtront ici une fois qu'elles s'inscriront à l'événement
        </p>
        {maxTeams && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg inline-block">
            <p className="text-sm text-blue-700">
              <span className="font-medium">{maxTeams - currentTeams}</span> places restantes
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
              Équipes inscrites
            </h3>
            <p className="text-sm text-gray-600">
              {teams.length} équipe{teams.length > 1 ? "s" : ""} • {teams.reduce((acc, team) => acc + (team.playerCount || 0), 0)} joueurs
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {maxTeams && (
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {maxTeams - currentTeams}
                </div>
                <div className="text-xs text-blue-600 font-medium">
                  Places restantes
                </div>
              </div>
            )}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {currentTeams}
              </div>
              <div className="text-xs text-green-600 font-medium">
                Équipes inscrites
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des équipes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
        {teams.map((team, index) => (
          <div
            key={team.id}
            className={`p-4 rounded-lg border-2 ${getTeamColor(index)} hover:shadow-md transition-all duration-200`}
          >
            {/* En-tête de l'équipe */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {team.logo ? (
                  <img
                    src={team.logo}
                    alt={`Logo ${team.name}`}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center">
                    <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-base sm:text-lg truncate">
                    {team.name}
                  </h4>
                  {team.sport && (
                    <div className="flex items-center space-x-1 mt-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                        {team.sport}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Badge de position si c'est un championnat */}
              {index < 3 && (
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                </div>
              )}
            </div>

            {/* Description de l'équipe */}
            {team.description && (
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                {team.description}
              </p>
            )}

            {/* Informations de l'équipe */}
            <div className="space-y-2">
              {/* Nombre de joueurs */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Joueurs</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {team.playerCount || 0}
                </span>
              </div>

              {/* Date d'inscription */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Inscrit le</span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {formatDate(team.createdAt)}
                </span>
              </div>

              {/* Liste des joueurs (si disponible) */}
              {team.players && team.players.length > 0 && (
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Composition
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {team.players.slice(0, 6).map((player) => (
                      <span
                        key={player.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-200"
                      >
                        {player.name}
                        {player.position && (
                          <span className="ml-1 text-gray-500">
                            ({player.position})
                          </span>
                        )}
                      </span>
                    ))}
                    {team.players.length > 6 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{team.players.length - 6} autres
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pied de page avec informations supplémentaires */}
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">
          {teams.length} équipe{teams.length > 1 ? "s" : ""} inscrite{teams.length > 1 ? "s" : ""} sur {maxTeams || "∞"} possible{maxTeams ? "s" : ""}
        </p>
        {maxTeams && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((currentTeams / maxTeams) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((currentTeams / maxTeams) * 100)}% de remplissage
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
