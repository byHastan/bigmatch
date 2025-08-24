import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Récupérer les données d'un match via son token live
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Validation du token
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token invalide" }, { status: 400 });
    }

    // Récupérer le match via le token live
    const match = await prisma.match.findUnique({
      where: {
        liveToken: token,
      },
      include: {
        teamA: {
          select: {
            id: true,
            name: true,
            logo: true,
            sport: true,
          },
        },
        teamB: {
          select: {
            id: true,
            name: true,
            logo: true,
            sport: true,
          },
        },
        winner: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            type: true,
            rules: true,
            date: true,
            location: true,
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json(
        {
          error: "Match non trouvé",
          message:
            "Le lien de suivi en direct n'est plus valide ou le match n'existe pas.",
        },
        { status: 404 }
      );
    }

    // Vérifier que le lien est activé (a un token)
    if (!match.liveToken) {
      return NextResponse.json(
        {
          error: "Suivi en direct non activé",
          message: "Le suivi en direct n'a pas été activé pour ce match.",
        },
        { status: 403 }
      );
    }

    // Formater les données de réponse (données publiques uniquement)
    const formattedMatch = {
      id: match.id,
      eventId: match.eventId,
      teamA: match.teamA,
      teamB: match.teamB,
      winner: match.winner,
      round: match.round,
      position: match.position,
      status: match.status,
      scoreA: match.scoreA,
      scoreB: match.scoreB,
      scheduledAt: match.scheduledAt,
      startedAt: match.startedAt,
      completedAt: match.completedAt,
      event: match.event,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
    };

    // Headers pour le cache et le temps réel
    const headers = {
      "Cache-Control": "no-cache, must-revalidate",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedMatch,
        live: {
          status: match.status,
          lastUpdate: new Date().toISOString(),
          autoRefresh: match.status === "LIVE",
        },
      },
      { headers }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération du match live:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        message:
          "Une erreur s'est produite lors de la récupération des données du match.",
      },
      { status: 500 }
    );
  }
}

// OPTIONS - Pour gérer les requêtes CORS préflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
