import EventCard from "./EventCard";

interface Event {
  id: number;
  name: string;
  type: string;
  date: string;
  participants: number;
  status: string;
}

interface EventsListProps {
  events: Event[];
  onManageEvent?: (eventId: number) => void;
}

export default function EventsList({ events, onManageEvent }: EventsListProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Mes événements</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {events.map((event) => (
          <EventCard key={event.id} event={event} onManage={onManageEvent} />
        ))}
      </div>
    </div>
  );
}
