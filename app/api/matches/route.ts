import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Récupérer tous les matchs d'un événement
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status");
    const round = searchParams.get("round");

    // Validation du paramètre eventId
    if (!eventId) {
      return NextResponse.json(
        {
          error: "eventId requis",
          message:
            "Utilisez ?eventId=<id> pour récupérer les matchs d'un événement",
        },
        { status: 400 }
      );
    }

    // Vérifier que l'événement existe et que l'utilisateur a accès
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organizer: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Vérification des permissions (organisateur ou participants)
    const isOrganizer = event.organizerId === session.user.id;

    // TODO: Ajouter la vérification si l'utilisateur est participant à l'événement
    // Pour l'instant, on autorise seulement l'organisateur
    if (!isOrganizer) {
      return NextResponse.json(
        { error: "Accès refusé - Seul l'organisateur peut voir les matchs" },
        { status: 403 }
      );
    }

    // Construire les filtres
    const where: any = {
      eventId,
    };

    if (status) {
      where.status = status;
    }

    if (round) {
      where.round = parseInt(round);
    }

    // Récupérer les matchs avec toutes les relations
    const matches = await prisma.match.findMany({
      where,
      include: {
        teamA: {
          select: {
            id: true,
            name: true,
            logo: true,
            sport: true,
          },
        },
        teamB: {
          select: {
            id: true,
            name: true,
            logo: true,
            sport: true,
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
          },
        },
      },
      orderBy: [{ round: "asc" }, { position: "asc" }, { createdAt: "asc" }],
    });

    // Formater les données de réponse
    const formattedMatches = matches.map((match) => ({
      id: match.id,
      eventId: match.eventId,
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
      parentMatchId: match.parentMatchId,
      liveToken: match.liveToken,
      event: match.event,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedMatches,
      count: formattedMatches.length,
      eventInfo: {
        id: event.id,
        name: event.name,
        type: event.type,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur lors de la récupération des matchs",
      },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau match
export async function POST(request: NextRequest) {
  try {
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
      eventId,
      teamAId,
      teamBId,
      round,
      position,
      scheduledAt,
      parentMatchId,
      createLiveLink,
    } = body;

    // Validation des champs obligatoires
    if (!eventId) {
      return NextResponse.json(
        {
          error: "Champs obligatoires manquants",
          required: ["eventId"],
        },
        { status: 400 }
      );
    }

    // Vérifier que l'événement existe et que l'utilisateur est organisateur
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organizer: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    if (event.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "Seul l'organisateur peut créer des matchs" },
        { status: 403 }
      );
    }

    // Vérifier que les équipes existent et appartiennent à l'événement
    if (teamAId) {
      const teamA = await prisma.team.findFirst({
        where: { id: teamAId, eventId },
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
        where: { id: teamBId, eventId },
      });
      if (!teamB) {
        return NextResponse.json(
          { error: "Équipe B non trouvée dans cet événement" },
          { status: 400 }
        );
      }
    }

    // Vérifier que les équipes sont différentes
    if (teamAId && teamBId && teamAId === teamBId) {
      return NextResponse.json(
        { error: "Une équipe ne peut pas jouer contre elle-même" },
        { status: 400 }
      );
    }

    // Vérifier le match parent s'il existe
    if (parentMatchId) {
      const parentMatch = await prisma.match.findFirst({
        where: { id: parentMatchId, eventId },
      });
      if (!parentMatch) {
        return NextResponse.json(
          { error: "Match parent non trouvé" },
          { status: 400 }
        );
      }
    }

    // Conversion et validation des champs numériques
    let roundValue = null;
    let positionValue = null;

    if (round !== undefined && round !== null) {
      const parsedRound = parseInt(String(round), 10);
      if (isNaN(parsedRound) || parsedRound < 0) {
        return NextResponse.json(
          { error: "La valeur 'round' doit être un nombre entier positif" },
          { status: 400 }
        );
      }
      roundValue = parsedRound;
    }

    if (position !== undefined && position !== null) {
      const parsedPosition = parseInt(String(position), 10);
      if (isNaN(parsedPosition) || parsedPosition < 0) {
        return NextResponse.json(
          { error: "La valeur 'position' doit être un nombre entier positif" },
          { status: 400 }
        );
      }
      positionValue = parsedPosition;
    }

    // Générer un token unique pour le live link si demandé
    let liveToken = null;
    if (createLiveLink) {
      liveToken = `live_${eventId}_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 15)}`;
    }

    console.log("🏗️ Création du match avec les données:", {
      eventId,
      teamAId,
      teamBId,
      round: roundValue,
      position: positionValue,
      scheduledAt,
      createLiveLink,
      liveToken,
    });

    // Créer le match
    const match = await prisma.match.create({
      data: {
        eventId,
        teamAId: teamAId || null,
        teamBId: teamBId || null,
        round: roundValue,
        position: positionValue,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        parentMatchId: parentMatchId || null,
        status: "SCHEDULED",
        scoreA: 0,
        scoreB: 0,
        liveToken: liveToken,
      },
      include: {
        teamA: {
          select: { id: true, name: true, logo: true },
        },
        teamB: {
          select: { id: true, name: true, logo: true },
        },
        event: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Match créé avec succès",
      data: {
        id: match.id,
        eventId: match.eventId,
        teamA: match.teamA,
        teamB: match.teamB,
        round: match.round,
        position: match.position,
        status: match.status,
        scheduledAt: match.scheduledAt,
        liveToken: match.liveToken,
        createdAt: match.createdAt,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la création du match:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur lors de la création du match",
      },
      { status: 500 }
    );
  }
}
