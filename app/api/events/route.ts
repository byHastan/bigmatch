import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Fonction pour générer un code d'inscription unique
async function generateUniqueRegistrationCode(): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code: string;
  let isUnique = false;

  do {
    // Générer un code de 6 caractères
    code = Array.from(
      { length: 6 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");

    // Vérifier que le code est unique
    const existingEvent = await prisma.event.findUnique({
      where: { registrationCode: code },
    });

    isUnique = !existingEvent;
  } while (!isUnique);

  return code;
}

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
      name,
      description,
      type,
      date,
      time,
      location,
      rules,
      maxTeams,
      maxPlayers,
      isPublic = true, // Par défaut public
    } = body;

    // Validation des champs obligatoires
    if (!name || !type || !date) {
      return NextResponse.json(
        {
          error: "Champs obligatoires manquants",
          required: ["name", "type", "date"],
        },
        { status: 400 }
      );
    }

    // Validation du type d'événement
    const validTypes = ["MATCH", "CHAMPIONNAT", "COUPE"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          error: "Type d'événement invalide",
          validTypes,
        },
        { status: 400 }
      );
    }

    // Validation de la date (doit être dans le futur)
    const eventDate = new Date(date);
    const now = new Date();
    if (eventDate <= now) {
      return NextResponse.json(
        {
          error: "La date de l'événement doit être dans le futur",
        },
        { status: 400 }
      );
    }

    // Utiliser l'ID de l'utilisateur connecté comme organisateur
    const organizerId = session.user.id;

    // Vérifier que l'utilisateur a le rôle d'organisateur
    const userRole = await prisma.userRole.findFirst({
      where: {
        userId: organizerId,
        roleType: "ORGANISATEUR",
        isActive: true,
      },
    });

    if (!userRole) {
      return NextResponse.json(
        {
          error:
            "Vous devez avoir le rôle d'organisateur pour créer un événement",
        },
        { status: 403 }
      );
    }

    // Générer un code d'inscription unique
    const registrationCode = await generateUniqueRegistrationCode();

    // Créer l'événement
    const event = await prisma.event.create({
      data: {
        name,
        description,
        type,
        date: eventDate,
        time,
        location,
        rules: rules || {},
        registrationCode,
        maxTeams: maxTeams || null,
        maxPlayers: maxPlayers || null,
        status: "DRAFT", // Par défaut en mode brouillon
        organizerId,
        // Ajouter le champ isPublic au schéma si nécessaire
        // isPublic: isPublic,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Événement créé avec succès",
      data: {
        id: event.id,
        name: event.name,
        type: event.type,
        date: event.date,
        registrationCode: event.registrationCode,
        status: event.status,
        isPublic: isPublic,
        registrationLink: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/inscription/${event.registrationCode}`,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'événement:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur lors de la création de l'événement",
      },
      { status: 500 }
    );
  }
}

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
    const status = searchParams.get("status");

    // Utiliser l'ID de l'utilisateur connecté
    const organizerId = session.user.id;

    // Construire les filtres
    const where: any = {
      organizerId,
    };

    if (status) {
      where.status = status;
    }

    // Récupérer les événements de l'organisateur
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
