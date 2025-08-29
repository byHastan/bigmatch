"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface CoupeRulesProps {
  rules: {
    groupStage: boolean;
    teamsCount: number;
    groupCount: number;
    groupSize: number;
    eliminationType: string;
    finalType: string;
    thirdPlace: boolean;
  };
  onRuleChange: (field: string, value: any) => void;
}

export default function CoupeRules({ rules, onRuleChange }: CoupeRulesProps) {
  // Calculer le nombre total d'équipes basé sur la phase de groupes ou le nombre direct
  const totalTeams = rules.groupStage
    ? rules.groupCount * rules.groupSize
    : rules.teamsCount;

  return (
    <div className="space-y-6">
      {/* Configuration des équipes */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            id="groupStage"
            type="checkbox"
            checked={rules.groupStage}
            onChange={(e) => onRuleChange("groupStage", e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <Label htmlFor="groupStage">Phase de groupes</Label>
        </div>

        {!rules.groupStage && (
          <div className="space-y-2">
            <Label htmlFor="teamsCount">Nombre d'équipes</Label>
            <div className="grid grid-cols-4 gap-2">
              {[4, 8, 16, 32, 64].map((count) => (
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
            <p className="text-sm text-gray-500">
              Total : <span className="font-medium">{totalTeams} équipes</span>
            </p>
          </div>
        )}

        {rules.groupStage && (
          <div className="ml-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupCount">Nombre de groupes</Label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 5, 6, 8].map((count) => (
                  <Button
                    key={count}
                    type="button"
                    variant={rules.groupCount === count ? "default" : "outline"}
                    size="sm"
                    onClick={() => onRuleChange("groupCount", count)}
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupSize">Taille des groupes</Label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 4, 5, 6].map((size) => (
                  <Button
                    key={size}
                    type="button"
                    variant={rules.groupSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => onRuleChange("groupSize", size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Affichage du nombre total d'équipes */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                Nombre total d'équipes : <span className="font-bold">{totalTeams}</span>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {rules.groupCount} groupes × {rules.groupSize} équipes
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Type d'élimination */}
      <div className="space-y-3">
        <Label>Type d'élimination</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "SIMPLE", label: "Élimination simple" },
            { value: "DOUBLE", label: "Élimination double" },
          ].map((type) => (
            <Button
              key={type.value}
              type="button"
              variant={rules.eliminationType === type.value ? "default" : "outline"}
              onClick={() => onRuleChange("eliminationType", type.value)}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Finale */}
      <div className="space-y-3">
        <Label>Type de finale</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "SINGLE", label: "Finale unique" },
            { value: "DOUBLE", label: "Finale aller-retour" },
          ].map((type) => (
            <Button
              key={type.value}
              type="button"
              variant={rules.finalType === type.value ? "default" : "outline"}
              onClick={() => onRuleChange("finalType", type.value)}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Match pour la 3ème place */}
      <div className="flex items-center space-x-2">
        <input
          id="thirdPlace"
          type="checkbox"
          checked={rules.thirdPlace}
          onChange={(e) => onRuleChange("thirdPlace", e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <Label htmlFor="thirdPlace">Match pour la 3ème place</Label>
      </div>
    </div>
  );
}
