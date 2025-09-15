import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Récupérer un match spécifique
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

    const { id } = await params;

    const match = await prisma.match.findUnique({
      where: { id },
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
        event: {
          select: {
            id: true,
            name: true,
            type: true,
            organizerId: true,
          },
        },
        winner: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match non trouvé" }, { status: 404 });
    }

    // Vérifier les permissions
    // Pour les matchs d'événements, vérifier que l'utilisateur est organisateur ou participant
    if (match.eventId) {
      const isOrganizer = match.event?.organizerId === session.user.id;

      // TODO: Ajouter la vérification si l'utilisateur est participant à l'événement
      if (!isOrganizer) {
        return NextResponse.json(
          { error: "Accès refusé - Vous n'avez pas accès à ce match" },
          { status: 403 }
        );
      }
    }
    // Pour les matchs standalone, tous les utilisateurs authentifiés peuvent voir

    return NextResponse.json({
      success: true,
      data: match,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du match:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur lors de la récupération du match",
      },
      { status: 500 }
    );
  }
}
