import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST - Créer un match standalone avec équipes
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
    const { teamA, teamB, matchName, sport, scheduledAt, createLiveLink } =
      body;

    // Validation des champs obligatoires
    if (!teamA?.name || !teamB?.name) {
      return NextResponse.json(
        {
          error: "Champs obligatoires manquants",
          required: ["teamA.name", "teamB.name"],
        },
        { status: 400 }
      );
    }

    if (teamA.name === teamB.name) {
      return NextResponse.json(
        { error: "Les équipes doivent avoir des noms différents" },
        { status: 400 }
      );
    }

    // Générer un token unique pour le live link si demandé
    let liveToken = null;
    if (createLiveLink) {
      liveToken = `live_standalone_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 15)}`;
    }

    // WORKAROUND: Créer un "événement virtuel" temporaire pour les équipes standalone
    const virtualEvent = await prisma.event.create({
      data: {
        name: `[VIRTUAL] ${matchName || `${teamA.name} vs ${teamB.name}`}`,
        description:
          "Événement virtuel pour match standalone - sera supprimé après création",
        type: "MATCH",
        date: scheduledAt ? new Date(scheduledAt) : new Date(),
        registrationCode: `TEMP_${Date.now()}`,
        organizerId: session.user.id,
        status: "DRAFT",
        isPrivate: true,
      },
    });

    // Créer le match standalone avec les équipes
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'équipe A avec l'événement virtuel
      const createdTeamA = await tx.team.create({
        data: {
          name: teamA.name,
          description: teamA.description || null,
          logo: teamA.logo || null,
          sport: sport || null,
          eventId: virtualEvent.id, // Temporaire
        },
      });

      // Créer l'équipe B avec l'événement virtuel
      const createdTeamB = await tx.team.create({
        data: {
          name: teamB.name,
          description: teamB.description || null,
          logo: teamB.logo || null,
          sport: sport || null,
          eventId: virtualEvent.id, // Temporaire
        },
      });

      // Créer les joueurs pour l'équipe A si fournis
      if (teamA.players && teamA.players.length > 0) {
        await tx.player.createMany({
          data: teamA.players.map((player: any) => ({
            name: player.name,
            email: player.email || null,
            phone: player.phone || null,
            position: player.position || null,
            number: player.number || null,
            teamId: createdTeamA.id,
          })),
        });
      }

      // Créer les joueurs pour l'équipe B si fournis
      if (teamB.players && teamB.players.length > 0) {
        await tx.player.createMany({
          data: teamB.players.map((player: any) => ({
            name: player.name,
            email: player.email || null,
            phone: player.phone || null,
            position: player.position || null,
            number: player.number || null,
            teamId: createdTeamB.id,
          })),
        });
      }

      // Créer le match standalone (sans événement réel)
      const match = await tx.match.create({
        data: {
          teamAId: createdTeamA.id,
          teamBId: createdTeamB.id,
          round: 1, // Round par défaut pour un match standalone
          position: 1,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          status: "SCHEDULED",
          scoreA: 0,
          scoreB: 0,
          liveToken: liveToken,
          eventId: virtualEvent.id, // Temporaire
        },
        include: {
          teamA: {
            select: {
              id: true,
              name: true,
              logo: true,
              description: true,
              sport: true,
              players: {
                select: {
                  id: true,
                  name: true,
                  position: true,
                  number: true,
                },
              },
            },
          },
          teamB: {
            select: {
              id: true,
              name: true,
              logo: true,
              description: true,
              sport: true,
              players: {
                select: {
                  id: true,
                  name: true,
                  position: true,
                  number: true,
                },
              },
            },
          },
        },
      });

      return match;
    });

    // WORKAROUND: Nettoyer - supprimer l'événement virtuel et détacher les équipes
    try {
      await prisma.$transaction(async (tx) => {
        // Détacher les équipes de l'événement virtuel
        await tx.team.updateMany({
          where: { eventId: virtualEvent.id },
          data: { eventId: null },
        });

        // Détacher le match de l'événement virtuel
        await tx.match.update({
          where: { id: result.id },
          data: { eventId: null },
        });

        // Supprimer l'événement virtuel
        await tx.event.delete({
          where: { id: virtualEvent.id },
        });
      });

      console.log("✅ Événement virtuel nettoyé avec succès");
    } catch (cleanupError) {
      console.error(
        "⚠️ Erreur lors du nettoyage de l'événement virtuel:",
        cleanupError
      );
      // On continue malgré l'erreur de nettoyage
    }

    return NextResponse.json({
      success: true,
      message: "Match standalone créé avec succès",
      data: {
        id: result.id,
        teamA: result.teamA,
        teamB: result.teamB,
        status: result.status,
        scheduledAt: result.scheduledAt,
        liveToken: result.liveToken,
        createdAt: result.createdAt,
        isStandalone: true, // Indicateur pour différencier des matchs d'événements
        matchName:
          matchName ||
          `${result.teamA?.name || "Équipe A"} vs ${
            result.teamB?.name || "Équipe B"
          }`,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la création du match standalone:", error);
    return NextResponse.json(
      {
        error:
          "Erreur interne du serveur lors de la création du match standalone",
      },
      { status: 500 }
    );
  }
}
