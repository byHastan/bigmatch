import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Interface pour stocker l'état du chronomètre dans les règles du match
interface TimerState {
  currentTime?: number; // temps écoulé en secondes
  isPaused?: boolean; // état pause/play
  lastUpdateTimestamp?: number; // timestamp de la dernière mise à jour
  totalDuration?: number; // durée totale en secondes
  startTimestamp?: number; // timestamp de début de match
}

// PUT - Contrôler le chronomètre d'un match
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;

    // Récupérer la session de l'utilisateur connecté
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      action, // "START" | "PAUSE" | "RESUME" | "RESET" | "END"
      currentTime, // temps spécifique à définir (en secondes)
    } = body;

    // Validation des données
    if (!action) {
      return NextResponse.json(
        {
          error: "Action requise",
          validActions: ["START", "PAUSE", "RESUME", "RESET", "END"],
        },
        { status: 400 }
      );
    }

    const validActions = ["START", "PAUSE", "RESUME", "RESET", "END"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        {
          error: "Action invalide",
          validActions,
        },
        { status: 400 }
      );
    }

    // Récupérer le match avec toutes les informations
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        event: {
          select: {
            id: true,
            organizerId: true,
            rules: true,
            type: true,
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match non trouvé" }, { status: 404 });
    }

    // Vérification de l'existence de l'événement
    if (!match.event) {
      return NextResponse.json(
        { error: "L'événement associé au match est introuvable" },
        { status: 404 }
      );
    }

    // Vérification des permissions (seul l'organisateur peut contrôler le timer)
    if (match.event.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "Seul l'organisateur peut contrôler le chronomètre" },
        { status: 403 }
      );
    }

    // Vérifier que le match n'est pas terminé ou annulé
    if (match.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Impossible de contrôler le chronomètre d'un match terminé" },
        { status: 400 }
      );
    }

    if (match.status === "CANCELLED" || match.status === "WALKOVER") {
      return NextResponse.json(
        { error: "Impossible de contrôler le chronomètre d'un match annulé" },
        { status: 400 }
      );
    }

    // Extraire les règles et l'état du timer
    const rules = match.event.rules as any;
    let matchRules = rules?.match || {};
    let timerState: TimerState = matchRules.timerState || {};

    const now = Date.now();
    const gameMode = matchRules.gameMode || "TIME";
    const duration = matchRules.duration || 15; // durée en minutes
    const totalDurationSeconds = duration * 60;

    // Calculer le temps actuel si le timer est en cours
    let calculatedCurrentTime = timerState.currentTime || 0;

    if (
      !timerState.isPaused &&
      timerState.lastUpdateTimestamp &&
      match.status === "LIVE"
    ) {
      const elapsedSinceLastUpdate =
        (now - timerState.lastUpdateTimestamp) / 1000;
      calculatedCurrentTime = Math.min(
        totalDurationSeconds,
        calculatedCurrentTime + elapsedSinceLastUpdate
      );
    }

    // Traitement selon l'action
    let newTimerState: TimerState = { ...timerState };
    let updateMatchData: any = {
      updatedAt: new Date(),
    };
    let matchCompleted = false;
    let responseMessage = "";

    switch (action) {
      case "START":
        newTimerState = {
          currentTime: 0,
          isPaused: false,
          lastUpdateTimestamp: now,
          totalDuration: totalDurationSeconds,
          startTimestamp: now,
        };
        updateMatchData.status = "LIVE";
        updateMatchData.startedAt = new Date();
        responseMessage = "Chronomètre démarré";
        break;

      case "PAUSE":
        if (match.status !== "LIVE") {
          return NextResponse.json(
            { error: "Le match doit être en cours pour être mis en pause" },
            { status: 400 }
          );
        }
        newTimerState = {
          ...newTimerState,
          currentTime: calculatedCurrentTime,
          isPaused: true,
          lastUpdateTimestamp: now,
        };
        responseMessage = "Match en pause";
        break;

      case "RESUME":
        if (match.status !== "LIVE") {
          return NextResponse.json(
            { error: "Le match doit être en cours pour reprendre" },
            { status: 400 }
          );
        }
        if (!timerState.isPaused) {
          return NextResponse.json(
            { error: "Le match n'est pas en pause" },
            { status: 400 }
          );
        }
        newTimerState = {
          ...newTimerState,
          isPaused: false,
          lastUpdateTimestamp: now,
        };
        responseMessage = "Match repris";
        break;

      case "RESET":
        newTimerState = {
          currentTime: 0,
          isPaused: true,
          lastUpdateTimestamp: now,
          totalDuration: totalDurationSeconds,
          startTimestamp: undefined,
        };
        updateMatchData.status = "SCHEDULED";
        updateMatchData.startedAt = null;
        responseMessage = "Chronomètre remis à zéro";
        break;

      case "END":
        newTimerState = {
          ...newTimerState,
          currentTime:
            currentTime !== undefined ? currentTime : calculatedCurrentTime,
          isPaused: true,
          lastUpdateTimestamp: now,
        };
        updateMatchData.status = "COMPLETED";
        updateMatchData.completedAt = new Date();

        // Déterminer le gagnant selon les scores
        if ((match.scoreA || 0) > (match.scoreB || 0)) {
          updateMatchData.winnerId = match.teamAId;
        } else if ((match.scoreB || 0) > (match.scoreA || 0)) {
          updateMatchData.winnerId = match.teamBId;
        }
        // Pas de gagnant en cas d'égalité

        matchCompleted = true;
        responseMessage = "Match terminé manuellement";
        break;
    }

    // Vérification automatique de fin de match pour le mode TIME
    if (
      gameMode === "TIME" &&
      !matchCompleted &&
      newTimerState.currentTime !== undefined
    ) {
      if (newTimerState.currentTime >= totalDurationSeconds) {
        // Temps écoulé, terminer le match automatiquement
        newTimerState.currentTime = totalDurationSeconds;
        newTimerState.isPaused = true;
        updateMatchData.status = "COMPLETED";
        updateMatchData.completedAt = new Date();

        // Déterminer le gagnant selon les scores
        if ((match.scoreA || 0) > (match.scoreB || 0)) {
          updateMatchData.winnerId = match.teamAId;
        } else if ((match.scoreB || 0) > (match.scoreA || 0)) {
          updateMatchData.winnerId = match.teamBId;
        }

        matchCompleted = true;
        responseMessage = "Match terminé automatiquement - Temps écoulé";
      }
    }

    // Mise à jour des règles avec le nouvel état du timer dans l'événement
    const updatedRules = {
      ...rules,
      match: {
        ...matchRules,
        timerState: newTimerState,
      },
    };

    // Mise à jour séparée de l'événement avec les nouvelles règles
    await prisma.event.update({
      where: { id: match.event.id },
      data: {
        rules: updatedRules,
        updatedAt: new Date(),
      },
    });

    console.log("🕐 Mise à jour du timer:", {
      matchId,
      action,
      newTimerState,
      matchStatus: updateMatchData.status,
    });

    // Mettre à jour le match (sans les rules)
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: updateMatchData,
      include: {
        teamA: {
          select: { id: true, name: true, logo: true },
        },
        teamB: {
          select: { id: true, name: true, logo: true },
        },
        winner: {
          select: { id: true, name: true, logo: true },
        },
      },
    });

    // TODO: Envoyer des notifications temps réel à tous les spectateurs
    // TODO: Déclencher des alertes sonores/visuelles si configuré

    // Formater le temps pour l'affichage
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    };

    const currentTimeFormatted = formatTime(newTimerState.currentTime || 0);
    const remainingTime = Math.max(
      0,
      totalDurationSeconds - (newTimerState.currentTime || 0)
    );
    const remainingTimeFormatted = formatTime(remainingTime);

    return NextResponse.json({
      success: true,
      message: responseMessage,
      data: {
        matchId: updatedMatch.id,
        status: updatedMatch.status,
        teamA: updatedMatch.teamA,
        teamB: updatedMatch.teamB,
        winner: updatedMatch.winner,
        scoreA: updatedMatch.scoreA,
        scoreB: updatedMatch.scoreB,
        timer: {
          currentTime: newTimerState.currentTime,
          currentTimeFormatted,
          remainingTime,
          remainingTimeFormatted,
          totalDuration: totalDurationSeconds,
          totalDurationFormatted: formatTime(totalDurationSeconds),
          isPaused: newTimerState.isPaused,
          gameMode,
          action: action,
        },
        completedAt: updatedMatch.completedAt,
        updatedAt: updatedMatch.updatedAt,
      },
      matchCompleted,
      autoCompleted: matchCompleted && action !== "END",
    });
  } catch (error) {
    console.error("Erreur lors du contrôle du chronomètre:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur lors du contrôle du chronomètre",
      },
      { status: 500 }
    );
  }
}

// GET - Récupérer l'état actuel du chronomètre
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;

    // Récupérer la session de l'utilisateur connecté
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 }
      );
    }

    // Récupérer le match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            rules: true,
            type: true,
            organizerId: true,
          },
        },
        teamA: {
          select: { id: true, name: true, logo: true },
        },
        teamB: {
          select: { id: true, name: true, logo: true },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match non trouvé" }, { status: 404 });
    }

    // Vérification de l'existence de l'événement
    if (!match.event) {
      return NextResponse.json(
        { error: "L'événement associé au match est introuvable" },
        { status: 404 }
      );
    }

    // Vérification des permissions (organisateur ou participants)
    const isOrganizer = match.event.organizerId === session.user.id;
    const teams = [match.teamA, match.teamB].filter(Boolean);
    const teamIds = teams.map(team => team?.id).filter(Boolean) as string[];
    
    // Vérifier si l'utilisateur est membre d'une des équipes du match
    const userTeams = await prisma.team.findMany({
      where: {
        id: { in: teamIds },
        players: {
          some: {
            id: session.user.id
          }
        }
      },
      select: { id: true }
    });
    
    const isParticipant = userTeams.length > 0;

    if (!isOrganizer && !isParticipant) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Extraire les règles et l'état du timer
    const rules = match.event.rules as any;
    const matchRules = rules?.match || {};
    const timerState: TimerState = matchRules.timerState || {};

    const gameMode = matchRules.gameMode || "TIME";
    const duration = matchRules.duration || 15; // durée en minutes
    const totalDurationSeconds = duration * 60;

    // Calculer le temps actuel
    let currentTime = timerState.currentTime || 0;
    const now = Date.now();

    if (
      !timerState.isPaused &&
      timerState.lastUpdateTimestamp &&
      match.status === "LIVE"
    ) {
      const elapsedSinceLastUpdate =
        (now - timerState.lastUpdateTimestamp) / 1000;
      currentTime = Math.min(
        totalDurationSeconds,
        currentTime + elapsedSinceLastUpdate
      );
    }

    // Formater les temps
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    };

    const currentTimeFormatted = formatTime(currentTime);
    const remainingTime = Math.max(0, totalDurationSeconds - currentTime);
    const remainingTimeFormatted = formatTime(remainingTime);

    // Vérifier si le temps est écoulé
    const timeExpired = currentTime >= totalDurationSeconds;
    const shouldAutoEnd = matchRules.shouldAutoEnd !== false;

    return NextResponse.json({
      success: true,
      data: {
        id: match.id,
        eventId: match.event?.id || null,
        eventName: match.event?.name || 'Événement inconnu',
        teamA: match.teamA,
        teamB: match.teamB,
        scoreA: match.scoreA,
        scoreB: match.scoreB,
        timer: {
          currentTime,
          currentTimeFormatted,
          remainingTime,
          remainingTimeFormatted,
          totalDuration: totalDurationSeconds,
          totalDurationFormatted: formatTime(totalDurationSeconds),
          isPaused: timerState.isPaused || match.status !== "LIVE",
          gameMode,
          timeExpired,
          shouldAutoEnd,
          startTimestamp: timerState.startTimestamp,
          lastUpdateTimestamp: timerState.lastUpdateTimestamp,
        },
        rules: {
          gameMode,
          duration,
          pointsToWin: matchRules.pointsToWin,
          shouldAutoEnd,
        },
        event: {
          id: match.event.id,
          name: match.event.name,
          type: match.event.type,
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du chronomètre:", error);
    return NextResponse.json(
      {
        error:
          "Erreur interne du serveur lors de la récupération du chronomètre",
      },
      { status: 500 }
    );
  }
}
