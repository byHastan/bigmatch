import { cookies } from "next/headers";

/**
 * Service pour gérer les cookies sécurisés côté serveur UNIQUEMENT
 * À utiliser dans les API routes et Server Components
 */

export interface CookieOptions {
  maxAge?: number; // en secondes
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
}

export class SecureCookieService {
  private static defaultOptions: CookieOptions = {
    maxAge: 7 * 24 * 60 * 60, // 7 jours
    httpOnly: true, // Protection XSS
    secure: process.env.NODE_ENV === "production", // HTTPS en production
    sameSite: "strict", // Protection CSRF
    path: "/",
  };

  /**
   * Définir un cookie sécurisé (côté serveur uniquement)
   */
  static async setSecureCookie(
    name: string,
    value: string,
    options: CookieOptions = {}
  ): Promise<void> {
    const cookieStore = await cookies();
    const finalOptions = { ...this.defaultOptions, ...options };

    cookieStore.set(name, value, finalOptions);
  }

  /**
   * Obtenir un cookie (côté serveur)
   */
  static async getSecureCookie(name: string): Promise<string | undefined> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(name);
    return cookie?.value;
  }

  /**
   * Supprimer un cookie (côté serveur)
   */
  static async deleteSecureCookie(name: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(name);
  }
}

/**
 * Constantes pour les noms de cookies
 */
export const COOKIE_NAMES = {
  USER_ROLE: "bigmatch_user_role",
  PREFERENCES: "bigmatch_preferences",
  THEME: "bigmatch_theme",
} as const;

/**
 * Service spécialisé pour la gestion du rôle utilisateur côté serveur
 */
export class UserRoleCookieService extends SecureCookieService {
  /**
   * Sauvegarder le rôle utilisateur de manière sécurisée
   */
  static async setUserRole(role: string): Promise<void> {
    await this.setSecureCookie(COOKIE_NAMES.USER_ROLE, role, {
      maxAge: 30 * 24 * 60 * 60, // 30 jours pour le rôle
    });
  }

  /**
   * Récupérer le rôle utilisateur
   */
  static async getUserRole(): Promise<string | undefined> {
    return await this.getSecureCookie(COOKIE_NAMES.USER_ROLE);
  }

  /**
   * Supprimer le rôle utilisateur (déconnexion)
   */
  static async clearUserRole(): Promise<void> {
    await this.deleteSecureCookie(COOKIE_NAMES.USER_ROLE);
  }
}
