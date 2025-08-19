import { Button } from "@/components/ui/button";

interface Event {
  id: number;
  name: string;
  type: string;
  date: string;
  participants: number;
  status: string;
}

interface EventCardProps {
  event: Event;
  onManage?: (eventId: number) => void;
}

export default function EventCard({ event, onManage }: EventCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "En cours":
        return "bg-green-100 text-green-800";
      case "Terminé":
        return "bg-blue-100 text-blue-800";
      case "Annulé":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{event.name}</h3>
          <p className="text-sm text-gray-500">
            {event.type} • {event.date} • {event.participants} participants
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
              event.status
            )}`}
          >
            {event.status}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onManage?.(event.id)}
          >
            Gérer
          </Button>
        </div>
      </div>
    </div>
  );
}
