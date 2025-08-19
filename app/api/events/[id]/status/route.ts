import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

    // Déballer les paramètres
    const { id } = await params;

    const body = await request.json();
    const { status } = body;

    // Validation du statut
    const validStatuses = ["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    // Vérifier que l'événement existe et que l'utilisateur est l'organisateur
    const event = await prisma.event.findUnique({
      where: { id },
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
        { error: "Vous n'êtes pas autorisé à modifier cet événement" },
        { status: 403 }
      );
    }

    // Mettre à jour le statut
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { status },
      include: {
        teams: {
          include: {
            players: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Statut de l'événement mis à jour vers ${status}`,
      data: {
        id: updatedEvent.id,
        name: updatedEvent.name,
        status: updatedEvent.status,
        currentTeams: updatedEvent.teams.length,
        maxTeams: updatedEvent.maxTeams,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function GET(
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

    // Déballer les paramètres
    const { id } = await params;

    // Récupérer l'événement
    const event = await prisma.event.findUnique({
      where: { id },
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
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est l'organisateur
    if (event.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à voir cet événement" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: event.id,
        name: event.name,
        status: event.status,
        currentTeams: event.teams.length,
        maxTeams: event.maxTeams,
        canAcceptRegistrations:
          event.status === "DRAFT" || event.status === "ACTIVE",
        statusDescription: getStatusDescription(event.status),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du statut:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

function getStatusDescription(status: string): string {
  switch (status) {
    case "DRAFT":
      return "Brouillon - Les inscriptions sont ouvertes";
    case "ACTIVE":
      return "Actif - Les inscriptions sont ouvertes";
    case "COMPLETED":
      return "Terminé - Les inscriptions sont fermées";
    case "CANCELLED":
      return "Annulé - Les inscriptions sont fermées";
    default:
      return "Statut inconnu";
  }
}
