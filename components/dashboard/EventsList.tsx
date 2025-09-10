import { Event } from "@/src/types/event";
import EventCard from "./EventCard";
import { Button } from "@/components/ui/button";
import { Archive, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface EventsListProps {
  events: Event[];
}

export default function EventsList({ events }: EventsListProps) {
  const [showCompleted, setShowCompleted] = useState(false);

  // Séparer les événements actifs et terminés
  const activeEvents = events?.filter(event => event.status !== "COMPLETED") || [];
  const completedEvents = events?.filter(event => event.status === "COMPLETED") || [];
  
  // Événements à afficher selon le filtre
  const eventsToShow = showCompleted ? [...activeEvents, ...completedEvents] : activeEvents;

  // Vérifier que events existe, est un tableau et n'est pas vide
  if (!events || !Array.isArray(events) || events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Mes événements
          </h2>
        </div>
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500 mb-4">
            Aucun événement créé pour le moment
          </p>
          <p className="text-sm text-gray-400">
            Commencez par créer votre premier événement sportif
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Mes événements</h2>
          
          {/* Bouton pour afficher/masquer les événements terminés */}
          {completedEvents.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center space-x-2"
            >
              {showCompleted ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Masquer terminés</span>
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4" />
                  <span>Voir terminés ({completedEvents.length})</span>
                </>
              )}
            </Button>
          )}
        </div>
        
        {/* Indicateur du nombre d'événements */}
        <div className="mt-2 text-sm text-gray-500">
          {activeEvents.length} événement{activeEvents.length > 1 ? 's' : ''} actif{activeEvents.length > 1 ? 's' : ''}
          {completedEvents.length > 0 && (
            <span> • {completedEvents.length} terminé{completedEvents.length > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {eventsToShow.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 mb-4">
              {showCompleted ? "Aucun événement trouvé" : "Aucun événement actif"}
            </p>
            <p className="text-sm text-gray-400">
              {showCompleted 
                ? "Tous vos événements sont affichés" 
                : "Les événements terminés sont masqués par défaut"
              }
            </p>
          </div>
        ) : (
          <>
            {/* Événements actifs */}
            {activeEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
            
            {/* Séparateur et événements terminés si affichés */}
            {showCompleted && completedEvents.length > 0 && (
              <>
                <div className="px-6 py-3 bg-gray-50 border-t-2 border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Archive className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Événements terminés
                    </span>
                  </div>
                </div>
                {completedEvents.map((event) => (
                  <div key={event.id} className="opacity-75">
                    <EventCard event={event} />
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
