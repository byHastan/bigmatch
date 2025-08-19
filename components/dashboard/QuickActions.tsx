"use client";

import { Button } from "@/components/ui/button";
import { LucideIcon, Plus, Settings, Users } from "lucide-react";
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
        "h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white",
    },
    {
      icon: Users,
      label: "Gérer les équipes",
      onClick: () => {},
      variant: "outline",
      className: "h-20 flex flex-col items-center justify-center space-y-2",
    },
    {
      icon: Settings,
      label: "Paramètres",
      onClick: () => {},
      variant: "outline",
      className: "h-20 flex flex-col items-center justify-center space-y-2",
    },
  ];

  const actionsToRender = actions || defaultActions;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
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
            <span>{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
