import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { registrationCode, teamData } = body;

    console.log("🔍 Données reçues:", {
      registrationCode,
      teamData: {
        name: teamData?.name,
        sport: teamData?.sport,
        playersCount: teamData?.players?.length,
      },
    });

    // Vérifier que le code d'inscription existe et que l'événement est ouvert
    const event = await prisma.event.findUnique({
      where: { registrationCode },
      include: {
        teams: true,
      },
    });

    console.log("🎯 Événement trouvé:", {
      found: !!event,
      status: event?.status,
      currentTeams: event?.teams?.length,
      maxTeams: event?.maxTeams,
    });

    if (!event) {
      console.log("❌ Code d'inscription invalide:", registrationCode);
      return NextResponse.json(
        { error: "Code d'inscription invalide" },
        { status: 404 }
      );
    }

    // Permettre les inscriptions pour les événements draft et registration_open
    if (event.status !== "DRAFT" && event.status !== "REGISTRATION_OPEN") {
      console.log("❌ Statut d'événement invalide:", {
        status: event.status,
        allowed: ["DRAFT", "REGISTRATION_OPEN"],
      });
      return NextResponse.json(
        {
          error: "Les inscriptions ne sont pas ouvertes pour cet événement",
          details: `Statut actuel: ${event.status}`,
        },
        { status: 400 }
      );
    }

    // Vérifier le nombre maximum d'équipes
    if (event.maxTeams && event.teams.length >= event.maxTeams) {
      console.log("❌ Nombre maximum d'équipes atteint:", {
        current: event.teams.length,
        max: event.maxTeams,
      });
      return NextResponse.json(
        {
          error: "Le nombre maximum d'équipes a été atteint",
          details: `${event.teams.length}/${event.maxTeams}`,
        },
        { status: 400 }
      );
    }

    console.log("🏗️ Création de l'équipe...", {
      name: teamData.name,
      sport: teamData.sport,
      eventId: event.id,
    });

    // Créer l'équipe
    const team = await prisma.team.create({
      data: {
        name: teamData.name,
        description: teamData.description || "",
        sport: teamData.sport,
        logo: teamData.logo, // Note: gérer l'upload d'image séparément
        eventId: event.id,
      },
    });

    console.log("✅ Équipe créée:", { teamId: team.id });

    // Validation des données des joueurs
    if (!Array.isArray(teamData.players) || teamData.players.length === 0) {
      throw new Error("Au moins un joueur est requis");
    }

    console.log("👥 Création des joueurs...", {
      count: teamData.players.length,
      names: teamData.players.map((p: any) => p.name),
    });

    // Créer les joueurs avec validation
    const players = await Promise.all(
      teamData.players.map((player: any, index: number) => {
        if (!player.name || player.name.trim() === "") {
          throw new Error(`Le nom du joueur ${index + 1} est requis`);
        }

        return prisma.player.create({
          data: {
            name: player.name.trim(),
            email: player.email || null,
            phone: player.phone || null,
            position: player.position || null,
            number: player.number || null,
            teamId: team.id,
          },
        });
      })
    );

    console.log(
      "✅ Joueurs créés:",
      players.map((p) => ({ id: p.id, name: p.name }))
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
  } catch (error: any) {
    console.error("💥 Erreur lors de l'inscription:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });

    // Gestion spécifique des erreurs Prisma
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error: "Conflit de données - cette donnée existe déjà",
          details: error.meta?.target,
        },
        { status: 400 }
      );
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        {
          error: "Référence invalide - données manquantes",
          details: error.meta?.field_name,
        },
        { status: 400 }
      );
    }

    // Erreurs de validation métier
    if (error.message.includes("joueur") || error.message.includes("requis")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur", details: error.message },
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
