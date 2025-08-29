"use client";

import { Clock, Target as TargetIcon, Users, Users2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";

interface MatchFormat {
  teams: number;
  playersPerTeam: number;
  totalPlayers: number;
  description: string;
}

interface MatchRulesProps {
  rules: {
    format: string;
    gameMode: string;
    pointsToWin: number;
    duration: number;
  };
  onRuleChange: (field: string, value: any) => void;
}

const MATCH_FORMATS: Record<string, MatchFormat> = {
  "1vs1": { teams: 2, playersPerTeam: 1, totalPlayers: 2, description: "Duel 1 contre 1" },
  "2vs2": { teams: 2, playersPerTeam: 2, totalPlayers: 4, description: "Double 2 contre 2" },
  "3vs3": { teams: 2, playersPerTeam: 3, totalPlayers: 6, description: "Match 3 contre 3" },
  "5vs5": { teams: 2, playersPerTeam: 5, totalPlayers: 10, description: "Match 5 contre 5" },
};

export default function MatchRules({ rules, onRuleChange }: MatchRulesProps) {
  // Get the current format details
  const currentFormat = MATCH_FORMATS[rules.format] || MATCH_FORMATS["1vs1"];
  return (
    <div className="space-y-6">
      {/* Format du match */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Format du match</Label>
          <span className="text-sm text-muted-foreground">
            {currentFormat.description}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {Object.keys(MATCH_FORMATS).map((format) => (
            <Button
              key={format}
              type="button"
              variant={rules.format === format ? "default" : "outline"}
              className="h-12 flex flex-col items-center justify-center gap-1"
              onClick={() => onRuleChange("format", format)}
            >
              <div className="flex items-center">
                <Users2 className="h-4 w-4 mr-1" />
                {format}
              </div>
              <span className="text-xs opacity-70">
                {MATCH_FORMATS[format].totalPlayers} joueurs
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Match Details */}
      <div className="p-4 bg-gray-50 rounded-lg space-y-3">
        <h4 className="font-medium flex items-center gap-2">
          <Shield className="h-4 w-4 text-orange-500" />
          Configuration du match
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Équipes</p>
            <p className="font-medium">{currentFormat.teams} équipes</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Joueurs par équipe</p>
            <p className="font-medium">{currentFormat.playersPerTeam} joueurs</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total joueurs</p>
            <p className="font-medium">{currentFormat.totalPlayers} joueurs</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Type</p>
            <p className="font-medium">
              {currentFormat.playersPerTeam === 1 ? 'Simple' : 'Équipe'}
            </p>
          </div>
        </div>
      </div>

      {/* Mode de jeu */}
      <div className="space-y-3">
        <Label>Mode de jeu</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "POINTS", label: "Au point", icon: TargetIcon },
            { value: "TIME", label: "Au temps", icon: Clock },
          ].map((mode) => (
            <Button
              key={mode.value}
              type="button"
              variant={rules.gameMode === mode.value ? "default" : "outline"}
              className="h-12"
              onClick={() => onRuleChange("gameMode", mode.value)}
            >
              <mode.icon className="h-4 w-4 mr-2" />
              {mode.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Règles spécifiques selon le mode */}
      {rules.gameMode === "POINTS" ? (
        <div className="space-y-2">
          <Label htmlFor="pointsToWin">Points pour gagner</Label>
          <Input
            id="pointsToWin"
            type="number"
            min="5"
            max="21"
            value={rules.pointsToWin}
            onChange={(e) => onRuleChange("pointsToWin", parseInt(e.target.value))}
          />
          <p className="text-sm text-gray-500">
            Le premier à atteindre {rules.pointsToWin} points gagne
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="duration">Durée du match (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min="5"
            max="60"
            value={rules.duration}
            onChange={(e) => onRuleChange("duration", parseInt(e.target.value))}
          />
          <p className="text-sm text-gray-500">
            Le match dure {rules.duration} minutes
          </p>
        </div>
      )}
    </div>
  );
}
