import axios from 'axios';

// Configuration de base d'axios
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour les requêtes
apiClient.interceptors.request.use(
  (config) => {
    // Vous pouvez ajouter ici des tokens d'authentification si nécessaire
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gestion globale des erreurs
    if (error.response?.status === 401) {
      // Redirection vers la page de connexion si non authentifié
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
