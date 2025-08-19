"use client";

import { Button } from "@/components/ui/button";
import { LogOut, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

import { signOut } from "@/src/lib/auth-client";

interface DashboardHeaderProps {
  title: string;
  icon?: React.ReactNode;
}

export default function DashboardHeader({ title, icon }: DashboardHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    localStorage.removeItem("userRole");
    await signOut();
    router.push("/");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {icon || <Trophy className="h-8 w-8 text-red-500" />}
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
