"use client";

import {
  Calendar,
  Target,
  Trophy,
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
import MatchRules from "./MatchRules";
import ChampionnatRules from "./ChampionnatRules";
import CoupeRules from "./CoupeRules";

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

  const handleMatchRuleChange = (field: string, value: any) => {
    handleRuleChange("match", field, value);
  };

  const handleChampionnatRuleChange = (field: string, value: any) => {
    handleRuleChange("championnat", field, value);
  };

  const handleCoupeRuleChange = (field: string, value: any) => {
    handleRuleChange("coupe", field, value);
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
        return (
          <MatchRules
            rules={rules.match}
            onRuleChange={handleMatchRuleChange}
          />
        );
      case "CHAMPIONNAT":
        return (
          <ChampionnatRules
            rules={rules.championnat}
            onRuleChange={handleChampionnatRuleChange}
          />
        );
      case "COUPE":
        return (
          <CoupeRules
            rules={rules.coupe}
            onRuleChange={handleCoupeRuleChange}
          />
        );
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
