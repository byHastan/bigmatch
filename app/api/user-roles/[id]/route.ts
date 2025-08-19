import { UserRoleService } from "@/src/lib/user-roles";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive doit être un booléen" },
        { status: 400 }
      );
    }

    const updatedUserRole = await UserRoleService.updateUserRole({
      id,
      isActive,
    });

    return NextResponse.json(updatedUserRole);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rôle:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du rôle" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await UserRoleService.deleteUserRole(id);

    return NextResponse.json({ message: "Rôle supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du rôle:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du rôle" },
      { status: 500 }
    );
  }
}

