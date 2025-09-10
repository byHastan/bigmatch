# API Événements - BigMatch

## Vue d'ensemble

L'API Événements permet de créer, gérer et rechercher des événements sportifs. Chaque événement génère automatiquement un code d'inscription unique pour permettre aux équipes de s'inscrire.

## Base URL

```
/api/events
```

## Authentification

Toutes les routes nécessitent une authentification appropriée. Les organisateurs ne peuvent accéder qu'à leurs propres événements.

## Routes

### 1. Créer un événement

**POST** `/api/events`

Crée un nouvel événement avec génération automatique du code d'inscription.

#### Corps de la requête

```json
{
  "name": "Tournoi de Basketball 2024",
  "description": "Tournoi annuel de football amateur",
  "type": "CUP",
  "date": "2024-12-15T14:00:00Z",
  "time": "14:00",
  "location": "Stade Municipal",
  "rules": {
    "maxPlayersPerTeam": 11,
    "duration": "90 minutes"
  },
  "maxTeams": 16,
  "maxPlayers": 176,
  "organizerId": "uuid-de-l-organisateur"
}
```

#### Paramètres

| Champ         | Type   | Obligatoire | Description                                  |
| ------------- | ------ | ----------- | -------------------------------------------- |
| `name`        | string | ✅          | Nom de l'événement                           |
| `type`        | string | ✅          | Type d'événement (MATCH, CHAMPIONNAT, COUPE) |
| `date`        | string | ✅          | Date et heure de l'événement (ISO 8601)      |
| `organizerId` | string | ✅          | ID de l'utilisateur organisateur             |
| `description` | string | ❌          | Description de l'événement                   |
| `time`        | string | ❌          | Heure de l'événement                         |
| `location`    | string | ❌          | Lieu de l'événement                          |
| `rules`       | object | ❌          | Règles spécifiques à l'événement             |
| `maxTeams`    | number | ❌          | Nombre maximum d'équipes                     |
| `maxPlayers`  | number | ❌          | Nombre maximum de joueurs                    |

#### Réponse

```json
{
  "success": true,
  "message": "Événement créé avec succès",
  "data": {
    "id": "uuid-de-l-evenement",
    "name": "Tournoi de Basketball 2024",
    "type": "CUP",
    "date": "2024-12-15T14:00:00Z",
    "registrationCode": "ABC123",
    "status": "DRAFT",
    "registrationLink": "http://localhost:3000/inscription/ABC123"
  }
}
```

### 2. Récupérer les événements d'un organisateur

**GET** `/api/events?organizerId={id}&status={status}`

Récupère tous les événements créés par un organisateur spécifique.

#### Paramètres de requête

| Paramètre     | Type   | Description                                             |
| ------------- | ------ | ------------------------------------------------------- |
| `organizerId` | string | ID de l'organisateur (obligatoire)                      |
| `status`      | string | Filtre par statut (DRAFT, ACTIVE, COMPLETED, CANCELLED) |

#### Réponse

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Tournoi de Basketball 2024",
      "type": "CUP",
      "date": "2024-12-15T14:00:00Z",
      "status": "ACTIVE",
      "registrationCode": "ABC123",
      "currentTeams": 8,
      "totalPlayers": 88,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 3. Récupérer un événement spécifique

**GET** `/api/events/{id}`

Récupère les détails complets d'un événement.

#### Réponse

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Tournoi de Basketball 2024",
    "description": "Tournoi annuel de football amateur",
    "type": "CUP",
    "date": "2024-12-15T14:00:00Z",
    "time": "14:00",
    "location": "Stade Municipal",
    "rules": { "maxPlayersPerTeam": 11 },
    "status": "ACTIVE",
    "registrationCode": "ABC123",
    "maxTeams": 16,
    "currentTeams": 8,
    "totalPlayers": 88,
    "organizer": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "teams": [
      {
        "id": "team-uuid",
        "name": "Les Champions",
        "sport": "Football",
        "playerCount": 11
      }
    ]
  }
}
```

### 4. Mettre à jour un événement

**PUT** `/api/events/{id}`

Met à jour les informations d'un événement existant.

#### Corps de la requête

```json
{
  "name": "Tournoi de Basketball 2024 - Mise à jour",
  "description": "Description mise à jour",
  "type": "CUP",
  "date": "2024-12-20T14:00:00Z",
  "maxTeams": 20
}
```

#### Réponse

```json
{
  "success": true,
  "message": "Événement mis à jour avec succès",
  "data": {
    "id": "uuid",
    "name": "Tournoi de Basketball 2024 - Mise à jour",
    "type": "CUP",
    "date": "2024-12-20T14:00:00Z",
    "status": "ACTIVE",
    "updatedAt": "2024-01-16T15:30:00Z"
  }
}
```

### 5. Supprimer un événement

**DELETE** `/api/events/{id}`

Supprime un événement (seulement s'il n'y a pas d'équipes inscrites).

#### Réponse

```json
{
  "success": true,
  "message": "Événement supprimé avec succès"
}
```

### 6. Gérer le statut d'un événement

**PATCH** `/api/events/{id}/status`

Change le statut d'un événement (DRAFT, ACTIVE, COMPLETED, CANCELLED).

#### Corps de la requête

```json
{
  "status": "ACTIVE"
}
```

#### Réponse

```json
{
  "success": true,
  "message": "Événement activé avec succès - Les inscriptions sont maintenant ouvertes",
  "data": {
    "id": "uuid",
    "name": "Tournoi de Basketball 2024",
    "status": "ACTIVE",
    "updatedAt": "2024-01-16T15:30:00Z"
  }
}
```

### 7. Récupérer le statut d'un événement

**GET** `/api/events/{id}/status`

Récupère les informations de statut et les actions disponibles.

#### Réponse

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Tournoi de Basketball 2024",
    "status": "DRAFT",
    "date": "2024-12-15T14:00:00Z",
    "registrationCode": "ABC123",
    "statusInfo": {
      "current": "DRAFT",
      "canActivate": true,
      "canDeactivate": false,
      "canComplete": false,
      "canCancel": true,
      "isActive": false,
      "isDraft": true,
      "isCompleted": false,
      "isCancelled": false,
      "hasTeams": false,
      "teamCount": 0
    }
  }
}
```

### 8. Rechercher des événements publics

**GET** `/api/events/search?q={query}&type={type}&sport={sport}&location={location}&dateFrom={date}&dateTo={date}&status={status}&page={page}&limit={limit}`

Recherche des événements avec filtres et pagination.

#### Paramètres de requête

| Paramètre  | Type   | Description                                       |
| ---------- | ------ | ------------------------------------------------- |
| `q`        | string | Recherche textuelle dans le nom et la description |
| `type`     | string | Filtre par type d'événement                       |
| `sport`    | string | Filtre par sport                                  |
| `location` | string | Filtre par lieu                                   |
| `dateFrom` | string | Date de début (ISO 8601)                          |
| `dateTo`   | string | Date de fin (ISO 8601)                            |
| `status`   | string | Statut des événements (défaut: ACTIVE)            |
| `page`     | number | Numéro de page (défaut: 1)                        |
| `limit`    | number | Nombre d'événements par page (défaut: 10)         |

#### Réponse

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "uuid",
        "name": "Tournoi de Basketball 2024",
        "type": "CUP",
        "date": "2024-12-15T14:00:00Z",
        "location": "Stade Municipal",
        "status": "ACTIVE",
        "currentTeams": 8,
        "sports": ["Football"],
        "organizer": {
          "id": "uuid",
          "name": "John Doe"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 50,
      "hasNextPage": true,
      "hasPreviousPage": false,
      "limit": 10
    },
    "filters": {
      "query": "football",
      "type": "CUP",
      "sport": "Football",
      "status": "ACTIVE"
    }
  }
}
```

## Codes de statut

### Statuts des événements

- **DRAFT** : Événement en mode brouillon (inscriptions fermées)
- **ACTIVE** : Événement actif (inscriptions ouvertes)
- **COMPLETED** : Événement terminé
- **CANCELLED** : Événement annulé

### Types d'événements

- **MATCH** : Match simple
- **CHAMPIONNAT** : Championnat sur plusieurs journées
- **COUPE** : Tournoi à élimination directe

## Codes d'erreur

### 400 - Bad Request

- Champs obligatoires manquants
- Type d'événement invalide
- Date dans le passé
- Statut invalide

### 404 - Not Found

- Événement non trouvé
- Organisateur non trouvé

### 500 - Internal Server Error

- Erreur de base de données
- Erreur de génération de code

## Exemples d'utilisation

### Créer un événement avec JavaScript

```javascript
const createEvent = async (eventData) => {
  try {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    const result = await response.json();

    if (result.success) {
      console.log("Événement créé:", result.data);
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Erreur lors de la création:", error);
    throw error;
  }
};

// Utilisation
const newEvent = await createEvent({
  name: "Mon Tournoi",
  type: "CUP",
  date: "2024-12-15T14:00:00Z",
  organizerId: "user-uuid",
});
```

### Activer un événement

```javascript
const activateEvent = async (eventId) => {
  try {
    const response = await fetch(`/api/events/${eventId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "ACTIVE" }),
    });

    const result = await response.json();

    if (result.success) {
      console.log("Événement activé:", result.message);
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Erreur lors de l'activation:", error);
    throw error;
  }
};
```

### Rechercher des événements

```javascript
const searchEvents = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/events/search?${params}`);

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    throw error;
  }
};

// Utilisation
const results = await searchEvents({
  q: "football",
  type: "CUP",
  status: "ACTIVE",
  page: 1,
  limit: 20,
});
```

## Sécurité

- **Validation des données** : Tous les champs sont validés côté serveur
- **Contrôle d'accès** : Les organisateurs ne peuvent accéder qu'à leurs événements
- **Codes uniques** : Génération automatique de codes d'inscription uniques
- **Validation des dates** : Les événements ne peuvent pas être créés dans le passé
- **Protection contre la suppression** : Impossible de supprimer un événement avec des équipes inscrites

## Performance

- **Pagination** : Support de la pagination pour les grandes listes
- **Indexation** : Optimisation des requêtes de base de données
- **Mise en cache** : Possibilité d'implémenter du cache pour les événements publics
- **Requêtes optimisées** : Utilisation de `include` et `select` pour minimiser les requêtes

## Maintenance

- **Logs** : Toutes les opérations sont loggées
- **Gestion d'erreurs** : Messages d'erreur détaillés et codes de statut appropriés
- **Validation** : Validation robuste des données d'entrée
- **Tests** : Routes testées et validées
