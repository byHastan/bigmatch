import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PUT - Mettre à jour le score d'un match
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
      teamId,
      points, // 1 | 2 | 3 | -1 pour +1, +2, +3 ou -1
      autoCheck = true, // vérifier automatiquement la fin de match selon les règles
    } = body;

    // Validation des données
    if (!teamId || !points) {
      return NextResponse.json(
        {
          error: "Champs obligatoires manquants",
          required: ["teamId", "points"],
        },
        { status: 400 }
      );
    }

    // Validation des points
    const validPoints = [1, 2, 3, -1];
    if (!validPoints.includes(points)) {
      return NextResponse.json(
        {
          error: "Points invalides",
          validPoints: "1, 2, 3 (ajout de points) ou -1 (retrait de points)",
        },
        { status: 400 }
      );
    }

    // Récupérer le match avec toutes les informations nécessaires
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
        teamA: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        teamB: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match non trouvé" }, { status: 404 });
    }

    // Vérification des permissions (seul l'organisateur peut modifier les scores)
    if (match.event.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "Seul l'organisateur peut modifier les scores" },
        { status: 403 }
      );
    }

    // Vérifier que le match n'est pas terminé ou annulé
    if (match.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Impossible de modifier le score d'un match terminé" },
        { status: 400 }
      );
    }

    if (match.status === "CANCELLED" || match.status === "WALKOVER") {
      return NextResponse.json(
        {
          error: "Impossible de modifier le score d'un match annulé ou forfait",
        },
        { status: 400 }
      );
    }

    // Vérifier que l'équipe appartient au match
    const isTeamA = teamId === match.teamAId;
    const isTeamB = teamId === match.teamBId;

    if (!isTeamA && !isTeamB) {
      return NextResponse.json(
        { error: "L'équipe ne participe pas à ce match" },
        { status: 400 }
      );
    }

    // Calculer les nouveaux scores
    let newScoreA = match.scoreA || 0;
    let newScoreB = match.scoreB || 0;

    if (isTeamA) {
      newScoreA = Math.max(0, newScoreA + points); // Ne peut pas être négatif
    } else {
      newScoreB = Math.max(0, newScoreB + points); // Ne peut pas être négatif
    }

    // Préparer les données de mise à jour
    let updateData: any = {
      scoreA: newScoreA,
      scoreB: newScoreB,
      updatedAt: new Date(),
    };

    // Démarrer le match automatiquement s'il ne l'est pas déjà
    if (match.status === "SCHEDULED") {
      updateData.status = "LIVE";
      updateData.startedAt = new Date();
    }

    // Vérification automatique des règles de fin de match
    let matchCompleted = false;
    let winner = null;

    if (autoCheck && match.event.rules) {
      const rules = match.event.rules as any;
      const matchRules = rules.match;

      if (matchRules) {
        // Mode POINTS : Premier à atteindre le score gagne
        if (matchRules.gameMode === "POINTS" && matchRules.pointsToWin) {
          const pointsToWin = matchRules.pointsToWin;

          if (newScoreA >= pointsToWin || newScoreB >= pointsToWin) {
            matchCompleted = true;

            if (newScoreA > newScoreB) {
              winner = match.teamAId;
            } else if (newScoreB > newScoreA) {
              winner = match.teamBId;
            }
            // Pas de gagnant en cas d'égalité exacte au score limite
          }
        }

        // Mode TIME : La vérification du temps sera gérée par l'API timer
        // Ici on ne fait que vérifier si le score dépasse les limites
      }
    }

    // Appliquer la fin de match automatique
    if (matchCompleted) {
      updateData.status = "COMPLETED";
      updateData.completedAt = new Date();
      updateData.winnerId = winner;
    }

    // Mettre à jour le match
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: updateData,
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
        event: {
          select: {
            id: true,
            name: true,
            rules: true,
          },
        },
      },
    });

    // TODO: Mettre à jour le classement si c'est un championnat
    // TODO: Envoyer des notifications temps réel
    // TODO: Déclencher le calcul du match suivant si c'est un tournoi

    // Formater la réponse avec informations détaillées
    const response: any = {
      success: true,
      message: matchCompleted
        ? `Match terminé ! ${
            winner ? updatedMatch.winner?.name + " a gagné" : "Match nul"
          }`
        : "Score mis à jour avec succès",
      data: {
        id: updatedMatch.id,
        status: updatedMatch.status,
        scoreA: updatedMatch.scoreA,
        scoreB: updatedMatch.scoreB,
        teamA: updatedMatch.teamA,
        teamB: updatedMatch.teamB,
        winner: updatedMatch.winner,
        startedAt: updatedMatch.startedAt,
        completedAt: updatedMatch.completedAt,
        updatedAt: updatedMatch.updatedAt,
      },
    };

    // Ajouter des informations sur l'action effectuée
    response.action = {
      teamId,
      teamName: isTeamA ? updatedMatch.teamA?.name : updatedMatch.teamB?.name,
      pointsAdded: points,
      scoreChange: {
        from: isTeamA ? match.scoreA : match.scoreB,
        to: isTeamA ? newScoreA : newScoreB,
      },
    };

    // Ajouter des informations sur la fin automatique
    if (matchCompleted) {
      response.autoCompleted = {
        reason: "SCORE_LIMIT_REACHED",
        rules: match.event.rules,
        finalScore: `${newScoreA} - ${newScoreB}`,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du score:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur lors de la mise à jour du score",
      },
      { status: 500 }
    );
  }
}

// GET - Récupérer les scores et règles d'un match
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

    // Récupérer le match avec les scores et règles
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
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        teamB: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        winner: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match non trouvé" }, { status: 404 });
    }

    // Vérification des permissions (organisateur ou participants)
    const isOrganizer = match.event.organizerId === session.user.id;

    // TODO: Ajouter la vérification si l'utilisateur est participant
    if (!isOrganizer) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Extraire les règles du match
    const rules = match.event.rules as any;
    let matchRules = null;

    if (rules && rules.match) {
      matchRules = {
        gameMode: rules.match.gameMode || "TIME",
        duration: rules.match.duration || 15,
        pointsToWin: rules.match.pointsToWin || 11,
        shouldAutoEnd: rules.match.shouldAutoEnd !== false,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        id: match.id,
        status: match.status,
        scoreA: match.scoreA,
        scoreB: match.scoreB,
        teamA: match.teamA,
        teamB: match.teamB,
        winner: match.winner,
        scheduledAt: match.scheduledAt,
        startedAt: match.startedAt,
        completedAt: match.completedAt,
        event: {
          id: match.event.id,
          name: match.event.name,
          type: match.event.type,
        },
        rules: matchRules,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des scores:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur lors de la récupération des scores",
      },
      { status: 500 }
    );
  }
}
