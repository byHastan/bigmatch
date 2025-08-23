import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return updateEventStatus(request, params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return updateEventStatus(request, params);
}

async function updateEventStatus(
  request: NextRequest,
  params: Promise<{ id: string }>
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
    console.log("Corps de la requête reçu:", body);

    const { status } = body;
    console.log("Statut extrait:", status);

    // Vérifier que le statut est présent
    if (!status) {
      console.log("Erreur: Statut manquant dans le corps de la requête");
      return NextResponse.json(
        {
          error: "Le champ 'status' est requis dans le corps de la requête",
          receivedBody: body,
        },
        { status: 400 }
      );
    }

    // Normaliser le statut reçu (convertir en majuscules et gérer les variations)
    const normalizedStatus = status
      .toString()
      .toUpperCase()
      .replace(/\s+/g, "_")
      .replace(/-/g, "_");

    console.log("Statut normalisé:", normalizedStatus);

    // Validation du statut avec les nouveaux statuts de l'énumération
    const validStatuses = [
      "DRAFT",
      "PUBLISHED",
      "REGISTRATION_OPEN",
      "REGISTRATION_CLOSED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ];

    console.log("Statuts valides:", validStatuses);
    console.log("Statut reçu:", status, "Type:", typeof status);
    console.log("Statut normalisé:", normalizedStatus);

    if (!validStatuses.includes(normalizedStatus)) {
      console.log("Erreur: Statut invalide reçu:", status);
      return NextResponse.json(
        {
          error: "Statut invalide",
          receivedStatus: status,
          normalizedStatus: normalizedStatus,
          validStatuses: validStatuses,
        },
        { status: 400 }
      );
    }

    // Utiliser le statut normalisé pour la suite
    const finalStatus = normalizedStatus;

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
      data: { status: finalStatus },
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
      message: `Statut de l'événement mis à jour vers ${finalStatus}`,
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
          event.status === "DRAFT" ||
          event.status === "PUBLISHED" ||
          event.status === "REGISTRATION_OPEN",
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
      return "Brouillon - L'événement est en cours de création";
    case "PUBLISHED":
      return "Publié - L'événement est visible publiquement";
    case "REGISTRATION_OPEN":
      return "Inscriptions ouvertes - Les équipes peuvent s'inscrire";
    case "REGISTRATION_CLOSED":
      return "Inscriptions fermées - Plus d'inscriptions acceptées";
    case "IN_PROGRESS":
      return "En cours - L'événement se déroule actuellement";
    case "COMPLETED":
      return "Terminé - L'événement est terminé";
    case "CANCELLED":
      return "Annulé - L'événement a été annulé";
    default:
      return "Statut inconnu";
  }
}
