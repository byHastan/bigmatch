"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DeviconGoogle } from "@/src/components/auth/DeviconGoogle";
import { signIn } from "@/src/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function ButtonGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="relative group">
      <Button
        variant="outline"
        className={cn(
          "relative w-80 h-14 gap-3 text-lg font-semibold bg-white/90 backdrop-blur-sm border-2 border-gray-200/50 hover:border-blue-300/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg",
          "rounded-xl overflow-hidden group/button"
        )}
        disabled={isLoading}
        onClick={async () => {
          await signIn.social(
            {
              provider: "google",
              callbackURL: "/dashboard",
              newUserCallbackURL: "/welcome",
            },
            {
              onRequest: () => {
                setIsLoading(true);
              },
              onResponse: () => {
                setIsLoading(false);
              },
            }
          );
        }}
      >
        {/* Contenu du bouton */}
        <div className="relative z-10 flex items-center gap-3">
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-blue-600">Connexion en cours...</span>
            </>
          ) : (
            <>
              {/* Texte du bouton */}
              <DeviconGoogle className="w-6 h-6" />
              <div className="text-left">
                <div className="text-gray-800 font-bold">
                  Se connecter avec Google
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Connexion rapide et sécurisée
                </div>
              </div>
            </>
          )}
        </div>

        {/* Indicateur de progression */}
        {isLoading && (
          <div
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse"
            style={{ width: "100%" }}
          />
        )}
      </Button>

      {/* Particules flottantes autour du bouton */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"
            style={{
              left: `${20 + i * 30}%`,
              top: `${-20 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + i * 0.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
