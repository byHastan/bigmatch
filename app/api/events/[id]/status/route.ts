import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Mettre à jour le statut d'un événement
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    // Validation du statut
    const validStatuses = ["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Statut invalide",
          validStatuses,
        },
        { status: 400 }
      );
    }

    // Vérifier que l'événement existe
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json(
        {
          error: "Événement non trouvé",
        },
        { status: 404 }
      );
    }

    // Vérifications spécifiques selon le statut
    if (status === "ACTIVE") {
      // Vérifier que l'événement a une date dans le futur
      const eventDate = new Date(existingEvent.date);
      const now = new Date();
      if (eventDate <= now) {
        return NextResponse.json(
          {
            error: "Impossible d'activer un événement avec une date passée",
          },
          { status: 400 }
        );
      }

      // Vérifier que l'événement a les informations minimales requises
      if (!existingEvent.name || !existingEvent.type || !existingEvent.date) {
        return NextResponse.json(
          {
            error:
              "L'événement doit avoir un nom, un type et une date pour être activé",
          },
          { status: 400 }
        );
      }
    }

    if (status === "COMPLETED") {
      // Vérifier que l'événement était actif
      if (existingEvent.status !== "ACTIVE") {
        return NextResponse.json(
          {
            error:
              "Seuls les événements actifs peuvent être marqués comme terminés",
          },
          { status: 400 }
        );
      }
    }

    if (status === "CANCELLED") {
      // Vérifier que l'événement n'est pas déjà terminé
      if (existingEvent.status === "COMPLETED") {
        return NextResponse.json(
          {
            error: "Impossible d'annuler un événement déjà terminé",
          },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le statut
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    // Message de confirmation selon le statut
    let message = "Statut de l'événement mis à jour";
    switch (status) {
      case "ACTIVE":
        message =
          "Événement activé avec succès - Les inscriptions sont maintenant ouvertes";
        break;
      case "DRAFT":
        message =
          "Événement remis en mode brouillon - Les inscriptions sont fermées";
        break;
      case "COMPLETED":
        message = "Événement marqué comme terminé";
        break;
      case "CANCELLED":
        message = "Événement annulé";
        break;
    }

    return NextResponse.json({
      success: true,
      message,
      data: {
        id: updatedEvent.id,
        name: updatedEvent.name,
        status: updatedEvent.status,
        updatedAt: updatedEvent.updatedAt,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur lors de la mise à jour du statut",
      },
      { status: 500 }
    );
  }
}

// Récupérer le statut actuel d'un événement
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        status: true,
        date: true,
        registrationCode: true,
        teams: {
          select: {
            id: true,
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

    // Informations sur le statut
    const statusInfo = {
      current: event.status,
      canActivate: event.status === "DRAFT",
      canDeactivate: event.status === "ACTIVE",
      canComplete: event.status === "ACTIVE",
      canCancel: ["DRAFT", "ACTIVE"].includes(event.status),
      isActive: event.status === "ACTIVE",
      isDraft: event.status === "DRAFT",
      isCompleted: event.status === "COMPLETED",
      isCancelled: event.status === "CANCELLED",
      hasTeams: event.teams.length > 0,
      teamCount: event.teams.length,
    };

    return NextResponse.json({
      success: true,
      data: {
        id: event.id,
        name: event.name,
        status: event.status,
        date: event.date,
        registrationCode: event.registrationCode,
        statusInfo,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du statut:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur lors de la récupération du statut",
      },
      { status: 500 }
    );
  }
}
