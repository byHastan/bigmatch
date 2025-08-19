import { Event } from "@/src/hooks/useEvents";
import EventCard from "./EventCard";

interface EventsListProps {
  events: Event[];
}

export default function EventsList({ events }: EventsListProps) {
  if (events.length === 0) {
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
        <h2 className="text-xl font-semibold text-gray-900">Mes événements</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
