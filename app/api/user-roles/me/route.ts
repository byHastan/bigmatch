import { auth } from "@/src/lib/auth";
import { UserRoleService } from "@/src/lib/user-roles";
import { NextRequest, NextResponse } from "next/server";

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

    // Récupérer le rôle de l'utilisateur connecté
    const userRoles = await UserRoleService.getUserRoles(session.user.id);

    if (userRoles.length === 0) {
      return NextResponse.json({ userRole: null });
    }

    // Retourner le premier rôle actif
    const primaryRole = userRoles.find((role) => role.isActive);
    return NextResponse.json({ userRole: primaryRole || null });
  } catch (error) {
    console.error("Erreur lors de la récupération du rôle:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du rôle" },
      { status: 500 }
    );
  }
}
