import { RoleType } from "@/src/generated/prisma";
import { UserRoleService } from "@/src/lib/user-roles";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, roleType } = body;

    if (!userId || !roleType) {
      return NextResponse.json(
        { error: "userId et roleType sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que le roleType est valide
    if (!Object.values(RoleType).includes(roleType)) {
      return NextResponse.json({ error: "roleType invalide" }, { status: 400 });
    }

    const userRole = await UserRoleService.createUserRole({
      userId,
      roleType,
    });

    return NextResponse.json(userRole, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du rôle:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du rôle" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const roleType = searchParams.get("roleType");

    if (userId) {
      // Récupérer les rôles d'un utilisateur spécifique
      const userRoles = await UserRoleService.getUserRoles(userId);
      return NextResponse.json(userRoles);
    }

    if (roleType) {
      // Vérifier que le roleType est valide
      if (!Object.values(RoleType).includes(roleType as RoleType)) {
        return NextResponse.json(
          { error: "roleType invalide" },
          { status: 400 }
        );
      }

      // Récupérer tous les utilisateurs avec un rôle spécifique
      const usersWithRole = await UserRoleService.getUsersByRole(
        roleType as RoleType
      );
      return NextResponse.json(usersWithRole);
    }

    return NextResponse.json(
      { error: "userId ou roleType requis" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des rôles:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des rôles" },
      { status: 500 }
    );
  }
}
