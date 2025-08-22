import { UserRoleCookieService } from "@/src/lib/secure-cookies";
import { NextRequest, NextResponse } from "next/server";

/**
 * API pour gérer les cookies de rôle utilisateur côté serveur (plus sécurisé)
 */

/**
 * GET /api/auth/user-role
 * Récupérer le rôle utilisateur depuis les cookies sécurisés
 */
export async function GET() {
  try {
    const userRole = await UserRoleCookieService.getUserRole();

    return NextResponse.json({
      success: true,
      userRole: userRole || null,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du rôle:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/user-role
 * Définir le rôle utilisateur dans des cookies sécurisés
 */
export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json();

    if (!role || typeof role !== "string") {
      return NextResponse.json(
        { success: false, error: "Rôle invalide" },
        { status: 400 }
      );
    }

    // Valider que c'est un rôle autorisé
    const validRoles = ["organisateur", "equipe", "joueur"];
    if (!validRoles.includes(role.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "Rôle non autorisé" },
        { status: 400 }
      );
    }

    await UserRoleCookieService.setUserRole(role.toLowerCase());

    return NextResponse.json({
      success: true,
      message: "Rôle sauvegardé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du rôle:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/user-role
 * Supprimer le rôle utilisateur des cookies
 */
export async function DELETE() {
  try {
    await UserRoleCookieService.clearUserRole();

    return NextResponse.json({
      success: true,
      message: "Rôle supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du rôle:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
