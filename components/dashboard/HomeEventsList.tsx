import { useHybridUserRole } from "@/src/hooks/useHybridUserRole";
import { Event } from "@/src/types/event";
import HomeEventCard from "./HomeEventCard";

interface HomeEventsListProps {
  events: Event[];
}

export default function HomeEventsList({ events }: HomeEventsListProps) {
  const { userRole } = useHybridUserRole();
  const currentUserId = userRole?.userId;

  // Filtrer les événements terminés par défaut
  const activeEvents = events?.filter(event => event.status !== "COMPLETED") || [];

  // Vérifier que events existe, est un tableau et n'est pas vide
  if (!activeEvents || !Array.isArray(activeEvents) || activeEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🏀</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucun événement créé
        </h3>
        <p className="text-gray-500 mb-4">
          Commencez par créer votre premier événement sportif
        </p>
        <p className="text-sm text-gray-400">
          Vos événements apparaîtront ici avec un badge "PROPRIÉTAIRE"
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeEvents.map((event) => (
        <HomeEventCard
          key={event.id}
          event={event}
          isOwner={currentUserId === event.organizerId}
        />
      ))}
    </div>
  );
}
