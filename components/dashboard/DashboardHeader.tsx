"use client";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Home, LogOut, Shield, Trophy, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useHybridUserRole } from "@/src/hooks/useHybridUserRole";
import { signOut } from "@/src/lib/auth-client";

interface DashboardHeaderProps {
  title?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  showNavigation?: boolean;
  onNavigate?: (route: string) => void;
}

export default function DashboardHeader({
  title,
  icon,
  subtitle,
  showNavigation = false,
  onNavigate,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useHybridUserRole();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout(); // Nettoie les cookies sécurisés
    await signOut();
    router.push("/");
  };

  const navigationItems = [
    { id: "home", label: "Accueil", icon: Home, route: "/dashboard" },
    {
      id: "events",
      label: "Événements",
      icon: Calendar,
      route: "/dashboard/events",
    },
    { id: "teams", label: "Équipes", icon: Users, route: "/dashboard/teams" },
  ];

  return (
    <motion.header
      className="bg-gradient-to-r from-white via-gray-50 to-white shadow-lg border-b border-gray-200/50 backdrop-blur-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Section gauche - Logo et titre */}
          <motion.div
            className="flex items-center space-x-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative">
              {icon || (
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="h-7 w-7 text-white" />
                </div>
              )}
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            <div className="flex flex-col">
              {title && (
                <motion.h1
                  className="text-lg font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {title}
                </motion.h1>
              )}
              {subtitle && (
                <motion.p
                  className="text-sm text-gray-600 mt-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* Section centrale - Navigation (optionnelle) */}
          {showNavigation && onNavigate && (
            <motion.nav
              className="hidden md:flex items-center space-x-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {navigationItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => onNavigate(item.route)}
                  className="group relative px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                >
                  <div className="flex items-center space-x-2">
                    <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              ))}
            </motion.nav>
          )}

          {/* Section droite - Actions utilisateur */}
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {/* Bouton de gestion des rôles */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={() => router.push("/profile/roles")}
                className="relative overflow-hidden border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              >
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Rôles</span>
                </div>
              </Button>
            </motion.div>

            {/* Bouton de déconnexion */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="relative overflow-hidden border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
              >
                <AnimatePresence mode="wait">
                  {isLoggingOut ? (
                    <motion.div
                      key="loading"
                      className="flex items-center space-x-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      <span>Déconnexion...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="normal"
                      className="flex items-center space-x-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Déconnexion</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Barre de progression décorative */}
      <motion.div
        className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
      />
    </motion.header>
  );
}
