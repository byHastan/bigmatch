import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type");
    const sport = searchParams.get("sport");
    const location = searchParams.get("location");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const status = searchParams.get("status") || "ACTIVE";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Construire les filtres
    const where: any = {
      status: status,
    };

    // Recherche textuelle dans le nom et la description
    if (query) {
      where.OR = [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query,
            mode: "insensitive",
          },
        },
      ];
    }

    // Filtre par type d'événement
    if (type) {
      where.type = type;
    }

    // Filtre par sport (dans les équipes inscrites)
    if (sport) {
      where.teams = {
        some: {
          sport: {
            contains: sport,
            mode: "insensitive",
          },
        },
      };
    }

    // Filtre par lieu
    if (location) {
      where.location = {
        contains: location,
        mode: "insensitive",
      };
    }

    // Filtres de date
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo);
      }
    }

    // Calculer l'offset pour la pagination
    const offset = (page - 1) * limit;

    // Récupérer les événements avec pagination
    const [events, totalCount] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
            },
          },
          teams: {
            select: {
              id: true,
              sport: true,
            },
          },
        },
        orderBy: [{ date: "asc" }, { createdAt: "desc" }],
        skip: offset,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

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
      sports: [
        ...new Set(event.teams.map((team) => team.sport).filter(Boolean)),
      ],
      organizer: event.organizer,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));

    // Informations de pagination
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        events: formattedEvents,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPreviousPage,
          limit,
        },
        filters: {
          query,
          type,
          sport,
          location,
          dateFrom,
          dateTo,
          status,
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors de la recherche d'événements:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur lors de la recherche d'événements",
      },
      { status: 500 }
    );
  }
}
