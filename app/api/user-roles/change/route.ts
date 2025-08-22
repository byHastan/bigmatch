import { RoleType } from "@/src/generated/prisma";
import { auth } from "@/src/lib/auth";
import { UserRoleService } from "@/src/lib/user-roles";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { roleType } = body;

    if (!roleType) {
      return NextResponse.json(
        { error: "roleType est requis" },
        { status: 400 }
      );
    }

    // Vérifier que le roleType est valide
    if (!Object.values(RoleType).includes(roleType)) {
      return NextResponse.json({ error: "roleType invalide" }, { status: 400 });
    }

    // Utiliser l'ID de l'utilisateur connecté
    const userId = session.user.id;

    // Changer le rôle principal de l'utilisateur
    const userRole = await UserRoleService.changeUserPrimaryRole(
      userId,
      roleType
    );

    // Récupérer le rôle complet avec les détails de l'utilisateur
    const fullUserRole = await UserRoleService.getUserPrimaryRole(userId);

    return NextResponse.json(fullUserRole, { status: 200 });
  } catch (error) {
    console.error("Erreur lors du changement de rôle:", error);
    return NextResponse.json(
      { error: "Erreur lors du changement de rôle" },
      { status: 500 }
    );
  }
}
