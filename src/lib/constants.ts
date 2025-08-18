import { RoleType } from "../generated/prisma";

export const ROLES = {
  ORGANISATEUR: "ORGANISATEUR" as RoleType,
  EQUIPE: "EQUIPE" as RoleType,
  JOUEUR: "JOUEUR" as RoleType,
} as const;

export const ROLE_ROUTES = {
  [ROLES.ORGANISATEUR]: "/dashboard/organisateur",
  [ROLES.EQUIPE]: "/dashboard/equipe",
  [ROLES.JOUEUR]: "/dashboard/joueur",
} as const;

export const ROLE_LABELS = {
  [ROLES.ORGANISATEUR]: "Organisateur",
  [ROLES.EQUIPE]: "Équipe",
  [ROLES.JOUEUR]: "Joueur",
} as const;

export const ROLE_DESCRIPTIONS = {
  [ROLES.ORGANISATEUR]: "Créez et gérez des événements sportifs",
  [ROLES.EQUIPE]: "Rejoignez des événements en tant qu'équipe",
  [ROLES.JOUEUR]: "Participez individuellement aux événements",
} as const;

export const ROLE_COLORS = {
  [ROLES.ORGANISATEUR]: "#FF004D",
  [ROLES.EQUIPE]: "#00FFD1",
  [ROLES.JOUEUR]: "#00FFD1",
} as const;
