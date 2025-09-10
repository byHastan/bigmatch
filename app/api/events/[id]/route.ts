import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Récupérer un événement spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        teams: {
          include: {
            players: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        {
          error: "Événement non trouvé",
        },
        { status: 404 }
      );
    }

    // Formater les données de réponse
    const formattedEvent = {
      id: event.id,
      name: event.name,
      description: event.description,
      type: event.type,
      date: event.date,
      time: event.time,
      location: event.location,
      rules: event.rules,
      status: event.status,
      registrationCode: event.registrationCode,
      maxTeams: event.maxTeams,
      maxPlayers: event.maxPlayers,
      currentTeams: event.teams.length,
      totalPlayers: event.teams.reduce(
        (total, team) => total + team.players.length,
        0
      ),
      organizer: event.organizer,
      teams: event.teams.map((team) => ({
        id: team.id,
        name: team.name,
        description: team.description,
        sport: team.sport,
        logo: team.logo,
        playerCount: team.players.length,
        createdAt: team.createdAt,
      })),
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: formattedEvent,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'événement:", error);
    return NextResponse.json(
      {
        error:
          "Erreur interne du serveur lors de la récupération de l'événement",
      },
      { status: 500 }
    );
  }
}

// Mettre à jour un événement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
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
      status,
    } = body;

    // Vérifier que l'événement existe et que l'utilisateur est le propriétaire
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: { organizer: true },
    });

    if (!existingEvent) {
      return NextResponse.json(
        {
          error: "Événement non trouvé",
        },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le propriétaire de l'événement
    if (existingEvent.organizerId !== session.user.id) {
      return NextResponse.json(
        {
          error: "Vous n'êtes pas autorisé à modifier cet événement. Seul le propriétaire peut le modifier.",
        },
        { status: 403 }
      );
    }

    // Validation des champs obligatoires seulement si on met à jour ces champs
    if (name !== undefined && (!name || !type || !date)) {
      return NextResponse.json(
        {
          error: "Champs obligatoires manquants",
          required: ["name", "type", "date"],
        },
        { status: 400 }
      );
    }

    // Validation du type d'événement seulement si on le met à jour
    if (type !== undefined) {
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
    }

    // Validation de la date seulement si on la met à jour
    let eventDate: Date | undefined;
    if (date !== undefined) {
      eventDate = new Date(date);
      const now = new Date();
      if (eventDate <= now) {
        return NextResponse.json(
          {
            error: "La date de l'événement doit être dans le futur",
          },
          { status: 400 }
        );
      }
    }

    // Validation du statut
    const validStatuses = [
      "DRAFT",
      "PUBLISHED",
      "REGISTRATION_OPEN",
      "REGISTRATION_CLOSED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED"
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

    // Préparer les données de mise à jour
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Ajouter seulement les champs qui sont définis
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (eventDate !== undefined) updateData.date = eventDate;
    if (time !== undefined) updateData.time = time;
    if (location !== undefined) updateData.location = location;
    if (rules !== undefined) updateData.rules = rules;
    if (maxTeams !== undefined) updateData.maxTeams = maxTeams;
    if (maxPlayers !== undefined) updateData.maxPlayers = maxPlayers;
    if (status !== undefined) updateData.status = status;

    // Mettre à jour l'événement
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Événement mis à jour avec succès",
      data: {
        id: updatedEvent.id,
        name: updatedEvent.name,
        type: updatedEvent.type,
        date: updatedEvent.date,
        status: updatedEvent.status,
        updatedAt: updatedEvent.updatedAt,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'événement:", error);
    return NextResponse.json(
      {
        error:
          "Erreur interne du serveur lors de la mise à jour de l'événement",
      },
      { status: 500 }
    );
  }
}

// Supprimer un événement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Vérifier que l'événement existe et que l'utilisateur est le propriétaire
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: true,
        teams: {
          include: {
            players: true,
          },
        },
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        {
          error: "Événement non trouvé",
        },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le propriétaire de l'événement
    if (existingEvent.organizerId !== session.user.id) {
      return NextResponse.json(
        {
          error: "Vous n'êtes pas autorisé à supprimer cet événement. Seul le propriétaire peut le supprimer.",
        },
        { status: 403 }
      );
    }

    // Vérifier qu'il n'y a pas d'équipes inscrites
    if (existingEvent.teams.length > 0) {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer un événement avec des équipes inscrites",
          teamCount: existingEvent.teams.length,
        },
        { status: 400 }
      );
    }

    // Supprimer l'événement
    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Événement supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'événement:", error);
    return NextResponse.json(
      {
        error:
          "Erreur interne du serveur lors de la suppression de l'événement",
      },
      { status: 500 }
    );
  }
}
