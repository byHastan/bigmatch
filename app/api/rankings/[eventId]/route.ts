import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Interface pour les statistiques d'équipe
interface TeamStats {
  teamId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

// Interface pour l'entrée de classement
interface RankingEntry {
  position: number;
  team: {
    id: string;
    name: string;
    logo: string | null;
  };
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

// Fonction pour calculer les statistiques d'une équipe à partir des matchs
function calculateTeamStats(teamId: string, matches: any[]): TeamStats {
  const stats: TeamStats = {
    teamId,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
    points: 0,
  };

  matches.forEach((match) => {
    // Vérifier si cette équipe participe au match et qu'il est terminé
    if (match.status !== "COMPLETED") return;

    const isTeamA = match.teamAId === teamId;
    const isTeamB = match.teamBId === teamId;

    if (!isTeamA && !isTeamB) return;

    stats.played++;

    const teamScore = isTeamA ? match.scoreA : match.scoreB;
    const opponentScore = isTeamA ? match.scoreB : match.scoreA;

    stats.goalsFor += teamScore || 0;
    stats.goalsAgainst += opponentScore || 0;

    // Déterminer le résultat
    if (teamScore > opponentScore) {
      stats.wins++;
      stats.points += 3; // 3 points pour une victoire
    } else if (teamScore === opponentScore) {
      stats.draws++;
      stats.points += 1; // 1 point pour un nul
    } else {
      stats.losses++;
      // 0 point pour une défaite
    }
  });

  stats.goalDiff = stats.goalsFor - stats.goalsAgainst;

  return stats;
}

// Fonction pour trier le classement
function sortRanking(rankings: TeamStats[]): TeamStats[] {
  return rankings.sort((a, b) => {
    // 1. Points (décroissant)
    if (a.points !== b.points) {
      return b.points - a.points;
    }

    // 2. Différentiel de buts (décroissant)
    if (a.goalDiff !== b.goalDiff) {
      return b.goalDiff - a.goalDiff;
    }

    // 3. Buts marqués (décroissant)
    if (a.goalsFor !== b.goalsFor) {
      return b.goalsFor - a.goalsFor;
    }

    // 4. Matchs joués (croissant) - privilégier ceux qui ont joué plus
    return b.played - a.played;
  });
}

// GET - Récupérer le classement actuel
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

    // Récupérer l'événement avec équipes, matchs et classements
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        teams: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
          orderBy: {
            name: "asc",
          },
        },
        matches: {
          where: {
            status: "COMPLETED",
          },
          select: {
            teamAId: true,
            teamBId: true,
            scoreA: true,
            scoreB: true,
            status: true,
          },
        },
        rankings: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
          orderBy: {
            position: "asc",
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

    // Vérifier que c'est bien un championnat
    if (event.type !== "CHAMPIONNAT") {
      return NextResponse.json(
        {
          error:
            "Le classement n'est disponible que pour les événements de type CHAMPIONNAT",
          currentType: event.type,
        },
        { status: 400 }
      );
    }

    // Si aucun classement n'existe encore, le calculer automatiquement
    if (event.rankings.length === 0 && event.teams.length > 0) {
      // Calculer le classement en temps réel
      const calculatedStats = event.teams.map((team) =>
        calculateTeamStats(team.id, event.matches)
      );

      const sortedStats = sortRanking(calculatedStats);

      const rankings: RankingEntry[] = sortedStats.map((stats, index) => {
        const team = event.teams.find((t) => t.id === stats.teamId)!;
        return {
          position: index + 1,
          team: {
            id: team.id,
            name: team.name,
            logo: team.logo,
          },
          played: stats.played,
          wins: stats.wins,
          draws: stats.draws,
          losses: stats.losses,
          goalsFor: stats.goalsFor,
          goalsAgainst: stats.goalsAgainst,
          goalDifference: stats.goalDiff,
          points: stats.points,
        };
      });

      return NextResponse.json({
        success: true,
        message: "Classement calculé en temps réel",
        data: {
          rankings,
          hasStoredRankings: false,
          totalTeams: event.teams.length,
          completedMatches: event.matches.length,
          event: {
            id: event.id,
            name: event.name,
            type: event.type,
            status: event.status,
          },
        },
      });
    }

    // Retourner le classement stocké
    const rankings: RankingEntry[] = event.rankings.map((ranking) => ({
      position: ranking.position,
      team: {
        id: ranking.team.id,
        name: ranking.team.name,
        logo: ranking.team.logo,
      },
      played: ranking.played,
      wins: ranking.wins,
      draws: ranking.draws,
      losses: ranking.losses,
      goalsFor: ranking.goalsFor,
      goalsAgainst: ranking.goalsAgainst,
      goalDifference: ranking.goalDiff,
      points: ranking.points,
    }));

    return NextResponse.json({
      success: true,
      message: "Classement récupéré avec succès",
      data: {
        rankings,
        hasStoredRankings: true,
        totalTeams: event.teams.length,
        completedMatches: event.matches.length,
        event: {
          id: event.id,
          name: event.name,
          type: event.type,
          status: event.status,
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du classement:", error);
    return NextResponse.json(
      {
        error:
          "Erreur interne du serveur lors de la récupération du classement",
      },
      { status: 500 }
    );
  }
}

// PUT - Recalculer le classement
export async function PUT(
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
        teams: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        matches: {
          where: {
            status: "COMPLETED",
          },
          select: {
            teamAId: true,
            teamBId: true,
            scoreA: true,
            scoreB: true,
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

    // Vérification des permissions (seul l'organisateur peut recalculer)
    if (event.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "Seul l'organisateur peut recalculer le classement" },
        { status: 403 }
      );
    }

    // Vérifier que c'est bien un championnat
    if (event.type !== "CHAMPIONNAT") {
      return NextResponse.json(
        {
          error: "Le classement n'est disponible que pour les championnats",
          currentType: event.type,
        },
        { status: 400 }
      );
    }

    // Calculer les nouvelles statistiques
    const calculatedStats = event.teams.map((team) =>
      calculateTeamStats(team.id, event.matches)
    );

    const sortedStats = sortRanking(calculatedStats);

    // Mettre à jour ou créer les classements en base
    await prisma.$transaction(async (tx) => {
      // Supprimer les anciens classements
      await tx.teamRanking.deleteMany({
        where: { eventId },
      });

      // Créer les nouveaux classements
      for (let i = 0; i < sortedStats.length; i++) {
        const stats = sortedStats[i];
        await tx.teamRanking.create({
          data: {
            eventId,
            teamId: stats.teamId,
            position: i + 1,
            played: stats.played,
            wins: stats.wins,
            draws: stats.draws,
            losses: stats.losses,
            goalsFor: stats.goalsFor,
            goalsAgainst: stats.goalsAgainst,
            goalDiff: stats.goalDiff,
            points: stats.points,
          },
        });
      }
    });

    // Récupérer le nouveau classement avec les données d'équipe
    const updatedRankings = await prisma.teamRanking.findMany({
      where: { eventId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
      orderBy: {
        position: "asc",
      },
    });

    const rankings: RankingEntry[] = updatedRankings.map((ranking) => ({
      position: ranking.position,
      team: {
        id: ranking.team.id,
        name: ranking.team.name,
        logo: ranking.team.logo,
      },
      played: ranking.played,
      wins: ranking.wins,
      draws: ranking.draws,
      losses: ranking.losses,
      goalsFor: ranking.goalsFor,
      goalsAgainst: ranking.goalsAgainst,
      goalDifference: ranking.goalDiff,
      points: ranking.points,
    }));

    return NextResponse.json({
      success: true,
      message: `Classement recalculé avec succès à partir de ${event.matches.length} matchs terminés`,
      data: {
        rankings,
        totalTeams: event.teams.length,
        completedMatches: event.matches.length,
        event: {
          id: event.id,
          name: event.name,
          type: event.type,
          status: event.status,
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors du recalcul du classement:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur lors du recalcul du classement",
      },
      { status: 500 }
    );
  }
}

// POST - Créer/Réinitialiser le classement
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

    const body = await request.json();
    const { resetToZero = false } = body;

    // Récupérer l'événement
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        teams: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        matches: {
          where: {
            status: "COMPLETED",
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

    // Vérifications
    if (event.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "Seul l'organisateur peut créer le classement" },
        { status: 403 }
      );
    }

    if (event.type !== "CHAMPIONNAT") {
      return NextResponse.json(
        {
          error: "Le classement n'est disponible que pour les championnats",
          currentType: event.type,
        },
        { status: 400 }
      );
    }

    if (event.teams.length === 0) {
      return NextResponse.json(
        {
          error: "Aucune équipe inscrite dans cet événement",
        },
        { status: 400 }
      );
    }

    // Créer le classement initial
    await prisma.$transaction(async (tx) => {
      // Supprimer l'ancien classement s'il existe
      await tx.teamRanking.deleteMany({
        where: { eventId },
      });

      // Créer le nouveau classement
      for (let i = 0; i < event.teams.length; i++) {
        const team = event.teams[i];

        let stats: TeamStats;

        if (resetToZero) {
          // Réinitialiser tout à zéro
          stats = {
            teamId: team.id,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDiff: 0,
            points: 0,
          };
        } else {
          // Calculer à partir des matchs existants
          stats = calculateTeamStats(team.id, event.matches);
        }

        await tx.teamRanking.create({
          data: {
            eventId,
            teamId: team.id,
            position: i + 1, // Position temporaire, sera recalculée si nécessaire
            played: stats.played,
            wins: stats.wins,
            draws: stats.draws,
            losses: stats.losses,
            goalsFor: stats.goalsFor,
            goalsAgainst: stats.goalsAgainst,
            goalDiff: stats.goalDiff,
            points: stats.points,
          },
        });
      }
    });

    // Si on ne remet pas à zéro, recalculer les positions
    if (!resetToZero) {
      // Recalculer le tri
      const rankings = await prisma.teamRanking.findMany({
        where: { eventId },
      });

      const sortedRankings = sortRanking(rankings);

      // Mettre à jour les positions
      await prisma.$transaction(async (tx) => {
        for (let i = 0; i < sortedRankings.length; i++) {
          await tx.teamRanking.update({
            where: {
              eventId_teamId: {
                eventId,
                teamId: sortedRankings[i].teamId,
              },
            },
            data: {
              position: i + 1,
            },
          });
        }
      });
    }

    // Récupérer le classement créé
    const createdRankings = await prisma.teamRanking.findMany({
      where: { eventId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
      orderBy: {
        position: "asc",
      },
    });

    const rankings: RankingEntry[] = createdRankings.map((ranking) => ({
      position: ranking.position,
      team: {
        id: ranking.team.id,
        name: ranking.team.name,
        logo: ranking.team.logo,
      },
      played: ranking.played,
      wins: ranking.wins,
      draws: ranking.draws,
      losses: ranking.losses,
      goalsFor: ranking.goalsFor,
      goalsAgainst: ranking.goalsAgainst,
      goalDifference: ranking.goalDiff,
      points: ranking.points,
    }));

    return NextResponse.json({
      success: true,
      message: resetToZero
        ? "Classement réinitialisé à zéro avec succès"
        : `Classement créé avec succès à partir de ${event.matches.length} matchs`,
      data: {
        rankings,
        totalTeams: event.teams.length,
        completedMatches: event.matches.length,
        resetToZero,
        event: {
          id: event.id,
          name: event.name,
          type: event.type,
          status: event.status,
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors de la création du classement:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur lors de la création du classement",
      },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer le classement
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
      select: {
        id: true,
        organizerId: true,
        type: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Vérifications
    if (event.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "Seul l'organisateur peut supprimer le classement" },
        { status: 403 }
      );
    }

    // Compter les classements avant suppression
    const rankingsCount = await prisma.teamRanking.count({
      where: { eventId },
    });

    if (rankingsCount === 0) {
      return NextResponse.json(
        { error: "Aucun classement à supprimer" },
        { status: 404 }
      );
    }

    // Supprimer tous les classements de l'événement
    await prisma.teamRanking.deleteMany({
      where: { eventId },
    });

    return NextResponse.json({
      success: true,
      message: `${rankingsCount} entrées de classement supprimées avec succès`,
      data: {
        eventId: event.id,
        deletedEntries: rankingsCount,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du classement:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur lors de la suppression du classement",
      },
      { status: 500 }
    );
  }
}
