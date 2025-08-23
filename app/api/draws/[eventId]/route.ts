import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Interface pour les résultats du tirage
interface DrawResult {
  success: boolean;
  brackets: any[];
  rounds: number;
  totalMatches: number;
  firstRoundMatches: number;
}

// Fonction pour mélanger un array (algorithme Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Fonction pour calculer la prochaine puissance de 2
function getNextPowerOfTwo(n: number): number {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

// Fonction pour générer l'arbre de tournoi
function generateTournamentBracket(teams: any[]): {
  rounds: number;
  matches: Array<{
    round: number;
    position: number;
    teamAId?: string;
    teamBId?: string;
    parentMatchRound?: number;
    parentMatchPosition?: number;
  }>;
} {
  const numTeams = teams.length;

  if (numTeams < 2) {
    throw new Error("Il faut au moins 2 équipes pour organiser un tournoi");
  }

  // Calculer le nombre de participants nécessaire (prochaine puissance de 2)
  const bracketSize = getNextPowerOfTwo(numTeams);
  const rounds = Math.log2(bracketSize);

  // Mélanger les équipes
  const shuffledTeams = shuffleArray(teams);

  const matches: Array<{
    round: number;
    position: number;
    teamAId?: string;
    teamBId?: string;
    parentMatchRound?: number;
    parentMatchPosition?: number;
  }> = [];

  // Générer les matchs pour chaque round
  for (let round = 1; round <= rounds; round++) {
    const matchesInRound = bracketSize / Math.pow(2, round);

    for (let position = 1; position <= matchesInRound; position++) {
      const match = {
        round,
        position,
        teamAId: undefined as string | undefined,
        teamBId: undefined as string | undefined,
        parentMatchRound: undefined as number | undefined,
        parentMatchPosition: undefined as number | undefined,
      };

      // Premier round : assigner les équipes directement
      if (round === 1) {
        const teamAIndex = (position - 1) * 2;
        const teamBIndex = teamAIndex + 1;

        if (teamAIndex < shuffledTeams.length) {
          match.teamAId = shuffledTeams[teamAIndex].id;
        }
        if (teamBIndex < shuffledTeams.length) {
          match.teamBId = shuffledTeams[teamBIndex].id;
        }
      } else {
        // Rounds suivants : définir les matchs parents
        const parentRound = round - 1;
        const parentPositionA = (position - 1) * 2 + 1;
        const parentPositionB = parentPositionA + 1;

        // Les équipes viendront des gagnants des matchs parents
        // mais on stocke juste la relation pour l'instant
        match.parentMatchRound = parentRound;
        match.parentMatchPosition = parentPositionA; // On stocke le premier parent, le second sera calculé
      }

      matches.push(match);
    }
  }

  return {
    rounds,
    matches,
  };
}

// POST - Effectuer le tirage au sort
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

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

    // Récupérer l'événement avec les équipes et vérifications
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        teams: {
          include: {
            players: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        matches: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Vérification des permissions (seul l'organisateur peut faire le tirage)
    if (event.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "Seul l'organisateur peut effectuer le tirage au sort" },
        { status: 403 }
      );
    }

    // Vérifier que c'est bien un tournoi (COUPE)
    if (event.type !== "COUPE") {
      return NextResponse.json(
        {
          error:
            "Le tirage au sort n'est disponible que pour les événements de type COUPE",
          currentType: event.type,
        },
        { status: 400 }
      );
    }

    // Vérifier qu'il y a assez d'équipes
    if (event.teams.length < 2) {
      return NextResponse.json(
        {
          error: "Il faut au moins 2 équipes pour organiser un tournoi",
          currentTeams: event.teams.length,
        },
        { status: 400 }
      );
    }

    // Vérifier qu'il n'y a pas déjà de matchs créés
    if (event.matches.length > 0) {
      return NextResponse.json(
        {
          error: "Le tirage au sort a déjà été effectué pour cet événement",
          existingMatches: event.matches.length,
          message:
            "Supprimez d'abord tous les matchs existants pour refaire le tirage",
        },
        { status: 400 }
      );
    }

    // Vérifier que l'événement est en cours d'inscription ou prêt
    const validStatuses = ["REGISTRATION_OPEN", "REGISTRATION_CLOSED"];
    if (!validStatuses.includes(event.status)) {
      return NextResponse.json(
        {
          error:
            "L'événement doit être en phase d'inscription pour effectuer le tirage",
          currentStatus: event.status,
          validStatuses,
        },
        { status: 400 }
      );
    }

    // Générer le bracket du tournoi
    let tournamentBracket;
    try {
      tournamentBracket = generateTournamentBracket(event.teams);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Erreur lors de la génération du bracket",
        },
        { status: 400 }
      );
    }

    // Créer les matchs dans la base de données
    const createdMatches = [];
    const matchIdMap = new Map<string, string>(); // Pour stocker les IDs des matchs créés

    // Créer tous les matchs en une seule transaction
    const result = await prisma.$transaction(async (tx) => {
      const matches = [];

      // Première passe : créer tous les matchs sans les relations parent
      for (const matchData of tournamentBracket.matches) {
        const match = await tx.match.create({
          data: {
            eventId: eventId,
            teamAId: matchData.teamAId || null,
            teamBId: matchData.teamBId || null,
            round: matchData.round,
            position: matchData.position,
            status: "SCHEDULED",
            scoreA: 0,
            scoreB: 0,
          },
          include: {
            teamA: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
            teamB: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        });

        matches.push(match);

        // Stocker l'ID pour les relations parent-enfant
        const key = `${matchData.round}-${matchData.position}`;
        matchIdMap.set(key, match.id);
      }

      // Deuxième passe : mettre à jour les relations parent-enfant
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const matchData = tournamentBracket.matches[i];

        if (matchData.parentMatchRound && matchData.parentMatchPosition) {
          // Trouver les deux matchs parents
          const parentKey1 = `${matchData.parentMatchRound}-${matchData.parentMatchPosition}`;
          const parentKey2 = `${matchData.parentMatchRound}-${
            matchData.parentMatchPosition + 1
          }`;

          const parentMatch1Id = matchIdMap.get(parentKey1);
          const parentMatch2Id = matchIdMap.get(parentKey2);

          // Mettre à jour les matchs parents pour qu'ils pointent vers ce match enfant
          if (parentMatch1Id) {
            await tx.match.update({
              where: { id: parentMatch1Id },
              data: { parentMatchId: match.id },
            });
          }

          if (parentMatch2Id) {
            await tx.match.update({
              where: { id: parentMatch2Id },
              data: { parentMatchId: match.id },
            });
          }
        }
      }

      return matches;
    });

    // Mettre à jour le statut de l'événement
    await prisma.event.update({
      where: { id: eventId },
      data: {
        status: "IN_PROGRESS",
      },
    });

    // Formater la réponse
    const drawResult: DrawResult = {
      success: true,
      brackets: result.map((match) => ({
        id: match.id,
        round: match.round,
        position: match.position,
        teamA: match.teamA,
        teamB: match.teamB,
        status: match.status,
        scoreA: match.scoreA,
        scoreB: match.scoreB,
        createdAt: match.createdAt,
      })),
      rounds: tournamentBracket.rounds,
      totalMatches: result.length,
      firstRoundMatches: result.filter((m) => m.round === 1).length,
    };

    return NextResponse.json({
      success: true,
      message: `Tirage au sort effectué avec succès ! ${event.teams.length} équipes réparties en ${tournamentBracket.rounds} rounds.`,
      data: drawResult,
      event: {
        id: event.id,
        name: event.name,
        status: "IN_PROGRESS",
        teamsCount: event.teams.length,
      },
    });
  } catch (error) {
    console.error("Erreur lors du tirage au sort:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur lors du tirage au sort",
      },
      { status: 500 }
    );
  }
}

// GET - Récupérer l'arbre du tirage existant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

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

    // Récupérer l'événement avec les matchs
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        matches: {
          include: {
            teamA: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
            teamB: {
              select: {
                id: true,
                name: true,
                logo: true,
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
          orderBy: [{ round: "asc" }, { position: "asc" }],
        },
        teams: {
          select: {
            id: true,
            name: true,
            logo: true,
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

    // Vérification des permissions (organisateur ou participants)
    const isOrganizer = event.organizerId === session.user.id;

    // TODO: Ajouter la vérification si l'utilisateur est participant
    if (!isOrganizer) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Vérifier que c'est bien un tournoi
    if (event.type !== "COUPE") {
      return NextResponse.json(
        {
          error: "Cette API est disponible seulement pour les tournois (COUPE)",
          currentType: event.type,
        },
        { status: 400 }
      );
    }

    // Si aucun match n'existe, le tirage n'a pas encore été fait
    if (event.matches.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Aucun tirage au sort effectué pour cet événement",
        data: {
          hasDrawn: false,
          event: {
            id: event.id,
            name: event.name,
            type: event.type,
            status: event.status,
            teamsCount: event.teams.length,
            teams: event.teams,
          },
        },
      });
    }

    // Organiser les matchs par rounds pour faciliter l'affichage
    const matchesByRound = event.matches.reduce((acc, match) => {
      const round = match.round || 1;
      if (!acc[round]) {
        acc[round] = [];
      }
      acc[round].push({
        id: match.id,
        position: match.position,
        teamA: match.teamA,
        teamB: match.teamB,
        winner: match.winner,
        status: match.status,
        scoreA: match.scoreA,
        scoreB: match.scoreB,
        scheduledAt: match.scheduledAt,
        startedAt: match.startedAt,
        completedAt: match.completedAt,
        parentMatchId: match.parentMatchId,
      });
      return acc;
    }, {} as Record<number, any[]>);

    const rounds = Object.keys(matchesByRound)
      .map(Number)
      .sort((a, b) => a - b);
    const maxRound = Math.max(...rounds);

    return NextResponse.json({
      success: true,
      message: "Tirage au sort récupéré avec succès",
      data: {
        hasDrawn: true,
        brackets: event.matches.map((match) => ({
          id: match.id,
          round: match.round,
          position: match.position,
          teamA: match.teamA,
          teamB: match.teamB,
          winner: match.winner,
          status: match.status,
          scoreA: match.scoreA,
          scoreB: match.scoreB,
          scheduledAt: match.scheduledAt,
          startedAt: match.startedAt,
          completedAt: match.completedAt,
          parentMatchId: match.parentMatchId,
          createdAt: match.createdAt,
          updatedAt: match.updatedAt,
        })),
        matchesByRound,
        rounds: maxRound,
        totalMatches: event.matches.length,
        firstRoundMatches: matchesByRound[1]?.length || 0,
        event: {
          id: event.id,
          name: event.name,
          type: event.type,
          status: event.status,
          teamsCount: event.teams.length,
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du tirage au sort:", error);
    return NextResponse.json(
      {
        error:
          "Erreur interne du serveur lors de la récupération du tirage au sort",
      },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer le tirage au sort (remettre à zéro)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

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

    // Récupérer l'événement
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        matches: {
          select: {
            id: true,
            status: true,
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

    // Vérification des permissions (seul l'organisateur)
    if (event.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "Seul l'organisateur peut supprimer le tirage au sort" },
        { status: 403 }
      );
    }

    // Vérifier qu'aucun match n'est en cours ou terminé
    const activeMatches = event.matches.filter(
      (m) => m.status === "LIVE" || m.status === "COMPLETED"
    );

    if (activeMatches.length > 0) {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer le tirage : des matchs sont déjà en cours ou terminés",
          activeMatches: activeMatches.length,
        },
        { status: 400 }
      );
    }

    // Supprimer tous les matchs de l'événement
    await prisma.match.deleteMany({
      where: { eventId },
    });

    // Remettre l'événement en phase d'inscription
    await prisma.event.update({
      where: { id: eventId },
      data: {
        status: "REGISTRATION_CLOSED",
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Tirage au sort supprimé avec succès. L'événement est remis en phase d'inscription.",
      data: {
        eventId: event.id,
        deletedMatches: event.matches.length,
        newStatus: "REGISTRATION_CLOSED",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du tirage au sort:", error);
    return NextResponse.json(
      {
        error:
          "Erreur interne du serveur lors de la suppression du tirage au sort",
      },
      { status: 500 }
    );
  }
}
