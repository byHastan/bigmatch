"use client";

import {
  Calendar,
  Clock,
  Target,
  Target as TargetIcon,
  Trophy,
  Users,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EventType = "MATCH" | "CHAMPIONNAT" | "COUPE";

interface EventRulesProps {
  eventType: EventType;
  onRulesChange: (rules: any) => void;
}

export default function EventRules({
  eventType,
  onRulesChange,
}: EventRulesProps) {
  const [rules, setRules] = useState({
    match: {
      format: "1vs1", // 1vs1, 2vs2, 3vs3
      gameMode: "POINTS", // POINTS, TIME
      pointsToWin: 11,
      duration: 15, // en minutes
    },
    championnat: {
      teamsCount: 8,
      rounds: 7,
      pointsWin: 3,
      pointsDraw: 1,
      pointsLoss: 0,
      promotionRelegation: false,
      playoffs: true,
      playoffTeams: 4,
    },
    coupe: {
      groupStage: false,
      teamsCount: 8, // Nombre d'équipes quand pas de phase de groupes
      groupCount: 4,
      groupSize: 4,
      eliminationType: "SIMPLE", // SIMPLE, DOUBLE
      finalType: "SINGLE", // SINGLE, DOUBLE
      thirdPlace: true,
    },
  });

  const handleRuleChange = (category: string, field: string, value: any) => {
    const newRules = {
      ...rules,
      [category]: {
        ...rules[category as keyof typeof rules],
        [field]: value,
      },
    };
    setRules(newRules);
    onRulesChange(newRules);
  };

  const renderMatchRules = () => (
    <div className="space-y-6">
      {/* Format du match */}
      <div className="space-y-3">
        <Label>Format du match</Label>
        <div className="grid grid-cols-3 gap-3">
          {["1vs1", "2vs2", "3vs3"].map((format) => (
            <Button
              key={format}
              type="button"
              variant={rules.match.format === format ? "default" : "outline"}
              className="h-12"
              onClick={() => handleRuleChange("match", "format", format)}
            >
              <Users className="h-4 w-4 mr-2" />
              {format}
            </Button>
          ))}
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
              variant={
                rules.match.gameMode === mode.value ? "default" : "outline"
              }
              className="h-12"
              onClick={() => handleRuleChange("match", "gameMode", mode.value)}
            >
              <mode.icon className="h-4 w-4 mr-2" />
              {mode.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Règles spécifiques selon le mode */}
      {rules.match.gameMode === "POINTS" ? (
        <div className="space-y-2">
          <Label htmlFor="pointsToWin">Points pour gagner</Label>
          <Input
            id="pointsToWin"
            type="number"
            min="5"
            max="21"
            value={rules.match.pointsToWin}
            onChange={(e) =>
              handleRuleChange("match", "pointsToWin", parseInt(e.target.value))
            }
          />
          <p className="text-sm text-gray-500">
            Le premier à atteindre {rules.match.pointsToWin} points gagne
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
            value={rules.match.duration}
            onChange={(e) =>
              handleRuleChange("match", "duration", parseInt(e.target.value))
            }
          />
          <p className="text-sm text-gray-500">
            Le match dure {rules.match.duration} minutes
          </p>
        </div>
      )}
    </div>
  );

  const renderChampionnatRules = () => (
    <div className="space-y-6">
      {/* Configuration des équipes */}
      <div className="space-y-3">
        <Label htmlFor="teamsCount">Nombre d'équipes</Label>
        <div className="grid grid-cols-4 gap-2">
          {[4, 6, 8, 10, 12, 14, 16, 18].map((count) => (
            <Button
              key={count}
              type="button"
              variant={
                rules.championnat.teamsCount === count ? "default" : "outline"
              }
              size="sm"
              onClick={() =>
                handleRuleChange("championnat", "teamsCount", count)
              }
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
            value={rules.championnat.pointsWin}
            onChange={(e) =>
              handleRuleChange(
                "championnat",
                "pointsWin",
                parseInt(e.target.value)
              )
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pointsDraw">Points pour un match nul</Label>
          <Input
            id="pointsDraw"
            type="number"
            min="0"
            max="3"
            value={rules.championnat.pointsDraw}
            onChange={(e) =>
              handleRuleChange(
                "championnat",
                "pointsDraw",
                parseInt(e.target.value)
              )
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pointsLoss">Points pour une défaite</Label>
          <Input
            id="pointsLoss"
            type="number"
            min="0"
            max="2"
            value={rules.championnat.pointsLoss}
            onChange={(e) =>
              handleRuleChange(
                "championnat",
                "pointsLoss",
                parseInt(e.target.value)
              )
            }
          />
        </div>
      </div>

      {/* Phase finale */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            id="playoffs"
            type="checkbox"
            checked={rules.championnat.playoffs}
            onChange={(e) =>
              handleRuleChange("championnat", "playoffs", e.target.checked)
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <Label htmlFor="playoffs">Phase finale (playoffs)</Label>
        </div>

        {rules.championnat.playoffs && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="playoffTeams">Nombre d'équipes en playoffs</Label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 4, 6, 8].map((count) => (
                <Button
                  key={count}
                  type="button"
                  variant={
                    rules.championnat.playoffTeams === count
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    handleRuleChange("championnat", "playoffTeams", count)
                  }
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

  const renderCoupeRules = () => {
    // Calculer le nombre total d'équipes basé sur la phase de groupes ou le nombre direct
    const totalTeams = rules.coupe.groupStage
      ? rules.coupe.groupCount * rules.coupe.groupSize
      : rules.coupe.teamsCount;

    return (
      <div className="space-y-6">
        {/* Configuration des équipes */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              id="groupStage"
              type="checkbox"
              checked={rules.coupe.groupStage}
              onChange={(e) =>
                handleRuleChange("coupe", "groupStage", e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <Label htmlFor="groupStage">Phase de groupes</Label>
          </div>

          {!rules.coupe.groupStage && (
            <div className="space-y-2">
              <Label htmlFor="teamsCount">Nombre d'équipes</Label>
              <div className="grid grid-cols-4 gap-2">
                {[4, 8, 16, 32, 64].map((count) => (
                  <Button
                    key={count}
                    type="button"
                    variant={
                      rules.coupe.teamsCount === count ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      handleRuleChange("coupe", "teamsCount", count)
                    }
                  >
                    {count}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Total :{" "}
                <span className="font-medium">{totalTeams} équipes</span>
              </p>
            </div>
          )}

          {rules.coupe.groupStage && (
            <div className="ml-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupCount">Nombre de groupes</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 5, 6, 8].map((count) => (
                    <Button
                      key={count}
                      type="button"
                      variant={
                        rules.coupe.groupCount === count ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        handleRuleChange("coupe", "groupCount", count)
                      }
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
                      variant={
                        rules.coupe.groupSize === size ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        handleRuleChange("coupe", "groupSize", size)
                      }
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Affichage du nombre total d'équipes */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  Nombre total d'équipes :{" "}
                  <span className="font-bold">{totalTeams}</span>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {rules.coupe.groupCount} groupes × {rules.coupe.groupSize}{" "}
                  équipes
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
                variant={
                  rules.coupe.eliminationType === type.value
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  handleRuleChange("coupe", "eliminationType", type.value)
                }
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
                variant={
                  rules.coupe.finalType === type.value ? "default" : "outline"
                }
                onClick={() =>
                  handleRuleChange("coupe", "finalType", type.value)
                }
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
            checked={rules.coupe.thirdPlace}
            onChange={(e) =>
              handleRuleChange("coupe", "thirdPlace", e.target.checked)
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <Label htmlFor="thirdPlace">Match pour la 3ème place</Label>
        </div>
      </div>
    );
  };

  const getEventTypeIcon = () => {
    switch (eventType) {
      case "MATCH":
        return <Trophy className="h-5 w-5 text-blue-600" />;
      case "CHAMPIONNAT":
        return <Calendar className="h-5 w-5 text-green-600" />;
      case "COUPE":
        return <Target className="h-5 w-5 text-red-600" />;
    }
  };

  const getEventTypeTitle = () => {
    switch (eventType) {
      case "MATCH":
        return "Règles du match";
      case "CHAMPIONNAT":
        return "Règles du championnat";
      case "COUPE":
        return "Règles de la coupe";
    }
  };

  const getEventTypeDescription = () => {
    switch (eventType) {
      case "MATCH":
        return "Configurez le format et les règles de votre match de quartier";
      case "CHAMPIONNAT":
        return "Définissez le système de points, le nombre d'équipes et la phase finale";
      case "COUPE":
        return "Choisissez le format de votre tournoi et les phases de compétition";
    }
  };

  const renderRulesContent = () => {
    switch (eventType) {
      case "MATCH":
        return renderMatchRules();
      case "CHAMPIONNAT":
        return renderChampionnatRules();
      case "COUPE":
        return renderCoupeRules();
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getEventTypeIcon()}
          {getEventTypeTitle()}
        </CardTitle>
        <CardDescription>{getEventTypeDescription()}</CardDescription>
      </CardHeader>
      <CardContent>{renderRulesContent()}</CardContent>
    </Card>
  );
}
