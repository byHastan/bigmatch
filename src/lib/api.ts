import {
  CreateEventData,
  Event,
  EventStatus,
  UpdateEventData,
} from "../types/event";
import apiClient from "./axios";

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// API des événements
export const eventsApi = {
  // Récupérer tous les événements
  getAll: async (): Promise<Event[]> => {
    const response = await apiClient.get("/events");
    return response.data.data || response.data;
  },

  // Récupérer tous les événements (route alternative)
  getAllEvents: async (): Promise<Event[]> => {
    const response = await apiClient.get("/events/all");
    return response.data.data || response.data;
  },

  // Récupérer un événement par ID
  getById: async (eventId: string): Promise<Event> => {
    const response = await apiClient.get(`/events/${eventId}`);
    return response.data.data || response.data;
  },

  // Créer un nouvel événement
  create: async (eventData: CreateEventData): Promise<Event> => {
    const response = await apiClient.post("/events", eventData);
    return response.data.data || response.data;
  },

  // Mettre à jour un événement
  update: async (
    eventId: string,
    eventData: UpdateEventData
  ): Promise<Event> => {
    const response = await apiClient.put(`/events/${eventId}`, eventData);
    return response.data.data || response.data;
  },

  // Supprimer un événement
  delete: async (eventId: string): Promise<void> => {
    await apiClient.delete(`/events/${eventId}`);
  },

  // Mettre à jour le statut d'un événement
  updateStatus: async (
    eventId: string,
    status: EventStatus
  ): Promise<Event> => {
    const response = await apiClient.patch(`/events/${eventId}/status`, {
      status,
    });
    return response.data.data || response.data;
  },

  // Rechercher des événements
  search: async (query: string): Promise<Event[]> => {
    const response = await apiClient.get(
      `/events/search?q=${encodeURIComponent(query)}`
    );
    return response.data.data || response.data;
  },
};

// API des inscriptions
export const inscriptionApi = {
  // Récupérer une inscription par code
  getByCode: async (code: string): Promise<any> => {
    const response = await apiClient.get(`/inscription?code=${code}`);
    return response.data.data || response.data;
  },

  // Créer une inscription
  create: async (inscriptionData: any): Promise<any> => {
    const response = await apiClient.post("/inscription", inscriptionData);
    return response.data.data || response.data;
  },
};

// API des rôles utilisateur
export const userRolesApi = {
  // Récupérer tous les rôles utilisateur
  getAll: async (): Promise<any[]> => {
    const response = await apiClient.get("/user-roles");
    return response.data.data || response.data;
  },

  // Récupérer le rôle de l'utilisateur connecté
  getMyRole: async (): Promise<any> => {
    const response = await apiClient.get("/user-roles/me");
    return response.data.data || response.data;
  },

  // Créer un nouveau rôle utilisateur
  create: async (userRoleData: {
    userId: string;
    roleType: string;
  }): Promise<any> => {
    const response = await apiClient.post("/user-roles", userRoleData);
    return response.data.data || response.data;
  },

  // Mettre à jour un rôle utilisateur
  update: async (userRoleId: string, userRoleData: any): Promise<void> => {
    await apiClient.put(`/user-roles/${userRoleId}`, userRoleData);
  },

  // Supprimer un rôle utilisateur
  delete: async (userRoleId: string): Promise<void> => {
    await apiClient.delete(`/user-roles/${userRoleId}`);
  },

  // Changer le rôle principal de l'utilisateur
  change: async (data: { roleType: string }): Promise<any> => {
    const response = await apiClient.post("/user-roles/change", data);
    return response.data.data || response.data;
  },
};
