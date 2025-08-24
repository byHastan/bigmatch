import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Récupérer un match spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        teamA: {
          include: {
            players: {
              select: {
                id: true,
                name: true,
                number: true,
                position: true,
              },
            },
          },
        },
        teamB: {
          include: {
            players: {
              select: {
                id: true,
                name: true,
                number: true,
                position: true,
              },
            },
          },
        },
        winner: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            type: true,
            rules: true,
            organizerId: true,
          },
        },
        parentMatch: {
          select: {
            id: true,
            round: true,
            position: true,
          },
        },
        childMatches: {
          select: {
            id: true,
            round: true,
            position: true,
            status: true,
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match non trouvé" }, { status: 404 });
    }

    // Vérification des permissions
    const isOrganizer = match.event.organizerId === session.user.id;

    // TODO: Ajouter la vérification si l'utilisateur est participant
    if (!isOrganizer) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Formater les données de réponse
    const formattedMatch = {
      id: match.id,
      eventId: match.eventId,
      event: match.event,
      teamA: match.teamA,
      teamB: match.teamB,
      winner: match.winner,
      round: match.round,
      position: match.position,
      status: match.status,
      scoreA: match.scoreA,
      scoreB: match.scoreB,
      scheduledAt: match.scheduledAt,
      startedAt: match.startedAt,
      completedAt: match.completedAt,
      parentMatch: match.parentMatch,
      childMatches: match.childMatches,
      liveToken: match.liveToken,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: formattedMatch,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du match:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur lors de la récupération du match",
      },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un match
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
      teamAId,
      teamBId,
      round,
      position,
      status,
      scoreA,
      scoreB,
      winnerId,
      scheduledAt,
      startedAt,
      completedAt,
    } = body;

    // Vérifier que le match existe
    const existingMatch = await prisma.match.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            organizerId: true,
            rules: true,
          },
        },
      },
    });

    if (!existingMatch) {
      return NextResponse.json({ error: "Match non trouvé" }, { status: 404 });
    }

    // Vérification des permissions (seul l'organisateur peut modifier)
    if (existingMatch.event.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "Seul l'organisateur peut modifier un match" },
        { status: 403 }
      );
    }

    // Validation du statut si fourni
    const validStatuses = [
      "SCHEDULED",
      "LIVE",
      "COMPLETED",
      "CANCELLED",
      "WALKOVER",
    ];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Statut invalide",
          validStatuses,
        },
        { status: 400 }
      );
    }

    // Validation des scores (doivent être positifs)
    if (scoreA !== undefined && scoreA < 0) {
      return NextResponse.json(
        { error: "Le score de l'équipe A doit être positif" },
        { status: 400 }
      );
    }

    if (scoreB !== undefined && scoreB < 0) {
      return NextResponse.json(
        { error: "Le score de l'équipe B doit être positif" },
        { status: 400 }
      );
    }

    // Validation des équipes si fournies
    if (teamAId && teamBId && teamAId === teamBId) {
      return NextResponse.json(
        { error: "Une équipe ne peut pas jouer contre elle-même" },
        { status: 400 }
      );
    }

    // Vérifier que les équipes appartiennent à l'événement
    if (teamAId) {
      const teamA = await prisma.team.findFirst({
        where: { id: teamAId, eventId: existingMatch.eventId },
      });
      if (!teamA) {
        return NextResponse.json(
          { error: "Équipe A non trouvée dans cet événement" },
          { status: 400 }
        );
      }
    }

    if (teamBId) {
      const teamB = await prisma.team.findFirst({
        where: { id: teamBId, eventId: existingMatch.eventId },
      });
      if (!teamB) {
        return NextResponse.json(
          { error: "Équipe B non trouvée dans cet événement" },
          { status: 400 }
        );
      }
    }

    // Validation du gagnant si fourni
    if (winnerId) {
      const winner = await prisma.team.findFirst({
        where: { id: winnerId, eventId: existingMatch.eventId },
      });
      if (!winner) {
        return NextResponse.json(
          { error: "Équipe gagnante non trouvée dans cet événement" },
          { status: 400 }
        );
      }

      // Vérifier que le gagnant est l'une des équipes du match
      const finalTeamAId = teamAId || existingMatch.teamAId;
      const finalTeamBId = teamBId || existingMatch.teamBId;

      if (winnerId !== finalTeamAId && winnerId !== finalTeamBId) {
        return NextResponse.json(
          { error: "Le gagnant doit être l'une des équipes du match" },
          { status: 400 }
        );
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Ajouter seulement les champs qui sont définis
    if (teamAId !== undefined) updateData.teamAId = teamAId;
    if (teamBId !== undefined) updateData.teamBId = teamBId;
    if (round !== undefined) updateData.round = round;
    if (position !== undefined) updateData.position = position;
    if (status !== undefined) updateData.status = status;
    if (scoreA !== undefined) updateData.scoreA = scoreA;
    if (scoreB !== undefined) updateData.scoreB = scoreB;
    if (winnerId !== undefined) updateData.winnerId = winnerId;
    if (scheduledAt !== undefined)
      updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    if (startedAt !== undefined)
      updateData.startedAt = startedAt ? new Date(startedAt) : null;
    if (completedAt !== undefined)
      updateData.completedAt = completedAt ? new Date(completedAt) : null;

    // Logique automatique selon le statut
    if (status === "LIVE" && !startedAt) {
      updateData.startedAt = new Date();
    }

    if (status === "COMPLETED" && !completedAt) {
      updateData.completedAt = new Date();
    }

    // Déterminer automatiquement le gagnant si le match est terminé
    if (
      status === "COMPLETED" &&
      !winnerId &&
      (scoreA !== undefined || scoreB !== undefined)
    ) {
      const finalScoreA = scoreA !== undefined ? scoreA : existingMatch.scoreA;
      const finalScoreB = scoreB !== undefined ? scoreB : existingMatch.scoreB;

      if (finalScoreA > finalScoreB) {
        updateData.winnerId = teamAId || existingMatch.teamAId;
      } else if (finalScoreB > finalScoreA) {
        updateData.winnerId = teamBId || existingMatch.teamBId;
      }
      // Pas de gagnant en cas d'égalité (null)
    }

    // Mettre à jour le match
    const updatedMatch = await prisma.match.update({
      where: { id },
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
      },
    });

    return NextResponse.json({
      success: true,
      message: "Match mis à jour avec succès",
      data: {
        id: updatedMatch.id,
        teamA: updatedMatch.teamA,
        teamB: updatedMatch.teamB,
        winner: updatedMatch.winner,
        status: updatedMatch.status,
        scoreA: updatedMatch.scoreA,
        scoreB: updatedMatch.scoreB,
        startedAt: updatedMatch.startedAt,
        completedAt: updatedMatch.completedAt,
        updatedAt: updatedMatch.updatedAt,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du match:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur lors de la mise à jour du match",
      },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un match
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Vérifier que le match existe
    const existingMatch = await prisma.match.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            organizerId: true,
          },
        },
        childMatches: true,
      },
    });

    if (!existingMatch) {
      return NextResponse.json({ error: "Match non trouvé" }, { status: 404 });
    }

    // Vérification des permissions (seul l'organisateur peut supprimer)
    if (existingMatch.event.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "Seul l'organisateur peut supprimer un match" },
        { status: 403 }
      );
    }

    // Vérifier qu'il n'y a pas de matchs enfants (pour l'arbre de tournoi)
    if (existingMatch.childMatches.length > 0) {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer un match qui a des matchs suivants dans le tournoi",
          childMatchesCount: existingMatch.childMatches.length,
        },
        { status: 400 }
      );
    }

    // Vérifier que le match n'est pas en cours ou terminé
    if (existingMatch.status === "LIVE") {
      return NextResponse.json(
        { error: "Impossible de supprimer un match en cours" },
        { status: 400 }
      );
    }

    if (existingMatch.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Impossible de supprimer un match terminé" },
        { status: 400 }
      );
    }

    // Supprimer le match
    await prisma.match.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Match supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du match:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur lors de la suppression du match",
      },
      { status: 500 }
    );
  }
}
