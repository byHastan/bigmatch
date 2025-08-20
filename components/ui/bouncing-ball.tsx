"use client";

import { Circle, Gem, Heart, Star, Target, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface SportTheme {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  bgGradient: string;
  ballColor: string;
  shadowColor: string;
  accentColor: string;
}

const sportThemes: SportTheme[] = [
  {
    name: "Football",
    icon: Circle,
    bgGradient: "from-green-50 via-emerald-50 to-teal-100",
    ballColor: "bg-white",
    shadowColor: "shadow-green-200",
    accentColor: "from-green-400 to-emerald-500",
  },
  {
    name: "Basketball",
    icon: Target,
    bgGradient: "from-orange-50 via-amber-50 to-yellow-100",
    ballColor: "bg-orange-500",
    shadowColor: "shadow-orange-200",
    accentColor: "from-orange-400 to-amber-500",
  },
  {
    name: "Tennis",
    icon: Zap,
    bgGradient: "from-lime-50 via-green-50 to-emerald-100",
    ballColor: "bg-green-400",
    shadowColor: "shadow-green-200",
    accentColor: "from-lime-400 to-green-500",
  },
  {
    name: "Volleyball",
    icon: Star,
    bgGradient: "from-blue-50 via-sky-50 to-cyan-100",
    ballColor: "bg-blue-500",
    shadowColor: "shadow-blue-200",
    accentColor: "from-blue-400 to-sky-500",
  },
  {
    name: "Baseball",
    icon: Heart,
    bgGradient: "from-red-50 via-rose-50 to-pink-100",
    ballColor: "bg-red-500",
    shadowColor: "shadow-red-200",
    accentColor: "from-red-400 to-rose-500",
  },
  {
    name: "Rugby",
    icon: Gem,
    bgGradient: "from-purple-50 via-violet-50 to-indigo-100",
    ballColor: "bg-purple-600",
    shadowColor: "shadow-purple-200",
    accentColor: "from-purple-400 to-violet-500",
  },
];

// Composant pour l'arrière-plan dynamique
export function DynamicBackground({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [currentTheme, setCurrentTheme] = useState(sportThemes[0]);
  const [isClient, setIsClient] = useState(false);

  // Éviter l'hydratation en attendant que le composant soit monté côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Positions et délais fixes pour éviter l'hydratation
  const particlePositions = [
    { left: "20%", top: "20%", delay: "0s", duration: "2s" },
    { left: "80%", top: "30%", delay: "0.5s", duration: "2.5s" },
    { left: "40%", top: "70%", delay: "1s", duration: "3s" },
    { left: "70%", top: "80%", delay: "1.5s", duration: "2.8s" },
    { left: "30%", top: "10%", delay: "0.2s", duration: "3.2s" },
    { left: "90%", top: "60%", delay: "0.8s", duration: "2.3s" },
  ];

  return (
    <div
      className={`min-h-screen transition-all duration-1000 ease-in-out bg-gradient-to-br ${currentTheme.bgGradient} ${className} relative overflow-hidden`}
    >
      {/* Motif de fond subtil */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-current to-transparent" />
        <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full bg-gradient-to-br from-current to-transparent" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-current to-transparent" />
      </div>

      {/* Overlay subtil */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

      {children}

      {/* Effet de particules flottantes avec positions fixes */}
      {isClient && (
        <div className="absolute inset-0 pointer-events-none">
          {particlePositions.map((particle, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.delay,
                animationDuration: particle.duration,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
