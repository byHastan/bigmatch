import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { registrationCode, teamData } = body;

    // Vérifier que le code d'inscription existe et que l'événement est ouvert
    const event = await prisma.event.findUnique({
      where: { registrationCode },
      include: {
        teams: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Code d'inscription invalide" },
        { status: 404 }
      );
    }

    // Permettre les inscriptions pour les événements DRAFT et ACTIVE
    if (event.status !== "DRAFT" && event.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Les inscriptions ne sont pas ouvertes pour cet événement" },
        { status: 400 }
      );
    }

    // Vérifier le nombre maximum d'équipes
    if (event.maxTeams && event.teams.length >= event.maxTeams) {
      return NextResponse.json(
        { error: "Le nombre maximum d'équipes a été atteint" },
        { status: 400 }
      );
    }

    // Créer l'équipe
    const team = await prisma.team.create({
      data: {
        name: teamData.name,
        description: teamData.description,
        sport: teamData.sport,
        logo: teamData.logo, // Note: gérer l'upload d'image séparément
        eventId: event.id,
      },
    });

    // Créer les joueurs
    const players = await Promise.all(
      teamData.players.map((player: any) =>
        prisma.player.create({
          data: {
            name: player.name,
            email: player.email,
            phone: player.phone,
            position: player.position,
            number: player.number,
            teamId: team.id,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: "Équipe inscrite avec succès",
      data: {
        team,
        players,
        event: {
          id: event.id,
          name: event.name,
          type: event.type,
          date: event.date,
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Code d'inscription requis" },
        { status: 400 }
      );
    }

    // Récupérer les informations de l'événement
    const event = await prisma.event.findUnique({
      where: { registrationCode: code },
      include: {
        teams: {
          include: {
            players: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Code d'inscription invalide" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: event.id,
        name: event.name,
        description: event.description,
        type: event.type,
        date: event.date,
        time: event.time,
        location: event.location,
        maxTeams: event.maxTeams,
        currentTeams: event.teams.length,
        status: event.status,
        teams: event.teams.map((team) => ({
          id: team.id,
          name: team.name,
          playerCount: team.players.length,
        })),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'événement:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
