"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ChampionnatRulesProps {
  rules: {
    teamsCount: number;
    rounds: number;
    pointsWin: number;
    pointsDraw: number;
    pointsLoss: number;
    promotionRelegation: boolean;
    playoffs: boolean;
    playoffTeams: number;
  };
  onRuleChange: (field: string, value: any) => void;
}

export default function ChampionnatRules({ rules, onRuleChange }: ChampionnatRulesProps) {
  return (
    <div className="space-y-6">
      {/* Configuration des équipes */}
      <div className="space-y-3">
        <Label htmlFor="teamsCount">Nombre d'équipes</Label>
        <div className="grid grid-cols-4 gap-2">
          {[4, 6, 8, 10, 12, 14, 16, 18].map((count) => (
            <Button
              key={count}
              type="button"
              variant={rules.teamsCount === count ? "default" : "outline"}
              size="sm"
              onClick={() => onRuleChange("teamsCount", count)}
            >
              {count}
            </Button>
          ))}
        </div>
      </div>

      {/* Système de points */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pointsWin">Points pour une victoire</Label>
          <Input
            id="pointsWin"
            type="number"
            min="1"
            max="5"
            value={rules.pointsWin}
            onChange={(e) => onRuleChange("pointsWin", parseInt(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pointsDraw">Points pour un match nul</Label>
          <Input
            id="pointsDraw"
            type="number"
            min="0"
            max="3"
            value={rules.pointsDraw}
            onChange={(e) => onRuleChange("pointsDraw", parseInt(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pointsLoss">Points pour une défaite</Label>
          <Input
            id="pointsLoss"
            type="number"
            min="0"
            max="2"
            value={rules.pointsLoss}
            onChange={(e) => onRuleChange("pointsLoss", parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Phase finale */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            id="playoffs"
            type="checkbox"
            checked={rules.playoffs}
            onChange={(e) => onRuleChange("playoffs", e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <Label htmlFor="playoffs">Phase finale (playoffs)</Label>
        </div>

        {rules.playoffs && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="playoffTeams">Nombre d'équipes en playoffs</Label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 4, 6, 8].map((count) => (
                <Button
                  key={count}
                  type="button"
                  variant={rules.playoffTeams === count ? "default" : "outline"}
                  size="sm"
                  onClick={() => onRuleChange("playoffTeams", count)}
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
