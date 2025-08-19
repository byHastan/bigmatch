import { Calendar, Home, Settings, Users } from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabNavigation({
  activeTab,
  onTabChange,
}: TabNavigationProps) {
  const tabs = [
    {
      id: "home",
      label: "Accueil",
      icon: Home,
      active: activeTab === "home",
    },
    {
      id: "events",
      label: "Événements",
      icon: Calendar,
      active: activeTab === "events",
    },
    {
      id: "participants",
      label: "Participants",
      icon: Users,
      active: activeTab === "participants",
    },
    {
      id: "settings",
      label: "Réglages",
      icon: Settings,
      active: activeTab === "settings",
    },
  ];

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 fixed bottom-0 left-0 right-0 z-50 md:hidden block">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 ${
              tab.active
                ? "text-orange-600 bg-orange-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
