"use client";

import { Button } from "@/components/ui/button";
import { eventsApi } from "@/src/lib/api";
import {
  CheckCircle,
  Loader2,
  Pause,
  Play,
  Settings,
  XCircle,
} from "lucide-react";
import { useState } from "react";

interface EventStatusManagerProps {
  eventId: string;
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
  className?: string;
}

const STATUS_CONFIG = {
  DRAFT: {
    label: "Brouillon",
    description: "Les inscriptions sont ouvertes",
    color: "bg-yellow-100 text-yellow-800",
    icon: Settings,
    canActivate: true,
    canDeactivate: false,
    canComplete: false,
    canCancel: true,
  },
  ACTIVE: {
    label: "Actif",
    description: "Les inscriptions sont ouvertes",
    color: "bg-green-100 text-green-800",
    icon: Play,
    canActivate: false,
    canDeactivate: true,
    canComplete: true,
    canCancel: true,
  },
  COMPLETED: {
    label: "Terminé",
    description: "Les inscriptions sont fermées",
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircle,
    canActivate: false,
    canDeactivate: false,
    canComplete: false,
    canCancel: false,
  },
  CANCELLED: {
    label: "Annulé",
    description: "Les inscriptions sont fermées",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
    canActivate: false,
    canDeactivate: false,
    canComplete: false,
    canCancel: false,
  },
};

export default function EventStatusManager({
  eventId,
  currentStatus,
  onStatusChange,
  className = "",
}: EventStatusManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config =
    STATUS_CONFIG[currentStatus as keyof typeof STATUS_CONFIG] ||
    STATUS_CONFIG.DRAFT;
  const IconComponent = config.icon;

  const changeStatus = async (newStatus: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await eventsApi.updateStatus(eventId, newStatus as any);
      onStatusChange(newStatus);
    } catch (err) {
      setError("Erreur lors de la mise à jour du statut");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg p-4 border border-gray-200 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <IconComponent className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Statut</span>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
        >
          {config.label}
        </span>
      </div>

      <p className="text-xs text-gray-600 mb-4">{config.description}</p>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {config.canActivate && (
          <Button
            size="sm"
            onClick={() => changeStatus("ACTIVE")}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            <span className="ml-1">Activer</span>
          </Button>
        )}

        {config.canDeactivate && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => changeStatus("DRAFT")}
            disabled={isLoading}
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Pause className="w-3 h-3" />
            )}
            <span className="ml-1">Mettre en pause</span>
          </Button>
        )}

        {config.canComplete && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => changeStatus("COMPLETED")}
            disabled={isLoading}
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <CheckCircle className="w-3 h-3" />
            )}
            <span className="ml-1">Terminer</span>
          </Button>
        )}

        {config.canCancel && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => changeStatus("CANCELLED")}
            disabled={isLoading}
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            <span className="ml-1">Annuler</span>
          </Button>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          <div className="flex justify-between">
            <span>ID:</span>
            <span className="font-mono">{eventId.slice(0, 8)}...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
