/**
 * Service pour gérer les cookies côté client uniquement
 * Alternative sécurisée au localStorage pour l'état utilisateur
 */

export interface CookieOptions {
  maxAge?: number; // en secondes
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
}

export class ClientCookieService {
  private static defaultOptions: CookieOptions = {
    maxAge: 7 * 24 * 60 * 60, // 7 jours
    secure: process.env.NODE_ENV === "production", // HTTPS en production
    sameSite: "strict", // Protection CSRF
    path: "/",
  };

  /**
   * Définir un cookie côté client
   */
  static setClientCookie(
    name: string,
    value: string,
    options: Partial<CookieOptions> = {}
  ): void {
    if (typeof window === "undefined") return;

    const finalOptions = {
      ...this.defaultOptions,
      ...options,
    };

    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (finalOptions.maxAge) {
      const expires = new Date(Date.now() + finalOptions.maxAge * 1000);
      cookieString += `; expires=${expires.toUTCString()}`;
    }

    if (finalOptions.path) {
      cookieString += `; path=${finalOptions.path}`;
    }

    if (finalOptions.secure) {
      cookieString += "; secure";
    }

    if (finalOptions.sameSite) {
      cookieString += `; samesite=${finalOptions.sameSite}`;
    }

    document.cookie = cookieString;
  }

  /**
   * Obtenir un cookie côté client
   */
  static getClientCookie(name: string): string | null {
    if (typeof window === "undefined") return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(";").shift();
      return cookieValue ? decodeURIComponent(cookieValue) : null;
    }

    return null;
  }

  /**
   * Supprimer un cookie côté client
   */
  static deleteClientCookie(name: string): void {
    if (typeof window === "undefined") return;

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
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
 * Service spécialisé pour la gestion du rôle utilisateur côté client
 */
export class UserRoleCookieService extends ClientCookieService {
  /**
   * Sauvegarder le rôle utilisateur côté client
   */
  static setUserRoleClient(role: string): void {
    this.setClientCookie(COOKIE_NAMES.USER_ROLE, role, {
      maxAge: 30 * 24 * 60 * 60, // 30 jours pour le rôle
    });
  }

  /**
   * Récupérer le rôle côté client
   */
  static getUserRoleClient(): string | null {
    return this.getClientCookie(COOKIE_NAMES.USER_ROLE);
  }

  /**
   * Supprimer le rôle côté client
   */
  static clearUserRoleClient(): void {
    this.deleteClientCookie(COOKIE_NAMES.USER_ROLE);
  }
}
