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

    // Vérifier si l'utilisateur a déjà ce rôle
    const existingRole = await UserRoleService.getUserRoles(userId);
    const hasRole = existingRole.some(
      (role) => role.roleType === roleType && role.isActive
    );

    if (hasRole) {
      return NextResponse.json(
        { error: "L'utilisateur a déjà ce rôle" },
        { status: 400 }
      );
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

    const { searchParams } = new URL(request.url);
    const roleType = searchParams.get("roleType");

    // Utiliser l'ID de l'utilisateur connecté
    const userId = session.user.id;

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

    // Récupérer les rôles de l'utilisateur connecté
    const userRoles = await UserRoleService.getUserRoles(userId);
    return NextResponse.json(userRoles);
  } catch (error) {
    console.error("Erreur lors de la récupération des rôles:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des rôles" },
      { status: 500 }
    );
  }
}
