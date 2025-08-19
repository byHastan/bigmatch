"use client";

import { Button } from "@/components/ui/button";
import { LucideIcon, Plus, Settings, Users, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface ActionButton {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "default" | "outline";
  className?: string;
}

interface QuickActionsProps {
  actions?: ActionButton[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  const router = useRouter();

  const defaultActions: ActionButton[] = [
    {
      icon: Plus,
      label: "Créer un événement",
      onClick: () => router.push("/create-event"),
      variant: "default",
      className:
        "h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl",
    },
    {
      icon: Users,
      label: "Gérer les inscriptions",
      onClick: () => router.push("/dashboard/organisateur/inscriptions"),
      variant: "outline",
      className: "h-20 flex flex-col items-center justify-center space-y-2 rounded-xl border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50",
    },
    {
      icon: Calendar,
      label: "Voir tous les événements",
      onClick: () => {},
      variant: "outline",
      className: "h-20 flex flex-col items-center justify-center space-y-2 rounded-xl border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50",
    },
  ];

  const actionsToRender = actions || defaultActions;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Actions rapides</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actionsToRender.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            className={action.className}
            onClick={action.onClick}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-sm font-medium">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
