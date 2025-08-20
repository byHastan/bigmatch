import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Construire les filtres - seulement les événements actifs
    const where: any = {
      status: "ACTIVE", // Seulement les événements actifs
    };

    if (status) {
      where.status = status;
    }

    // Récupérer tous les événements publics
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
      organizerId: event.organizerId, // Ajouter l'ID de l'organisateur
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
