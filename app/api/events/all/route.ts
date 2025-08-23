import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Récupérer la session de l'utilisateur connecté
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Construire les filtres
    const where: any = {};

    if (status) {
      where.status = status;
    }

    // Si l'utilisateur est connecté, il peut voir :
    // 1. Tous les événements publics
    // 2. Ses propres événements privés
    if (session?.user?.id) {
      where.OR = [
        { isPrivate: false }, // Événements publics
        {
          AND: [
            { isPrivate: true }, // Événements privés
            { organizerId: session.user.id }, // Créés par l'utilisateur connecté
          ],
        },
      ];
    } else {
      // Si l'utilisateur n'est pas connecté, seulement les événements publics
      where.isPrivate = false;
    }

    // Récupérer les événements selon les filtres
    const events = await prisma.event.findMany({
      where,
      include: {
        teams: {
          include: {
            players: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Formater les données de réponse
    const formattedEvents = events.map((event) => ({
      id: event.id,
      name: event.name,
      description: event.description,
      type: event.type,
      date: event.date,
      time: event.time,
      location: event.location,
      status: event.status,
      registrationCode: event.registrationCode,
      maxTeams: event.maxTeams,
      maxPlayers: event.maxPlayers,
      currentTeams: event.teams.length,
      totalPlayers: event.teams.reduce(
        (total, team) => total + team.players.length,
        0
      ),
      organizerId: event.organizerId,
      isPrivate: event.isPrivate, // Ajouter le champ isPrivate
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedEvents,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des événements:", error);
    return NextResponse.json(
      {
        error:
          "Erreur interne du serveur lors de la récupération des événements",
      },
      { status: 500 }
    );
  }
}
