# Migration de Fetch vers Axios et TanStack Query

## Vue d'ensemble

Ce document décrit la migration complète des appels `fetch` vers `axios` et l'utilisation de `TanStack Query` pour la gestion d'état côté client.

## Changements effectués

### 1. Installation des dépendances

- `axios` : Client HTTP pour les requêtes API
- `@tanstack/react-query` : Déjà installé, utilisé pour la gestion d'état et du cache

### 2. Configuration Axios

**Fichier :** `src/lib/axios.ts`

- Client axios configuré avec une base URL `/api`
- Intercepteurs pour la gestion globale des erreurs
- Gestion automatique des redirections 401

### 3. API centralisée

**Fichier :** `src/lib/api.ts`

- Toutes les fonctions API regroupées dans des objets organisés par domaine
- `eventsApi` : Gestion des événements
- `inscriptionApi` : Gestion des inscriptions
- `userRolesApi` : Gestion des rôles utilisateur

### 4. Hooks mis à jour

#### `useEvents` (`src/hooks/useEvents.ts`)
- Remplacé `useState` + `useEffect` par `useQuery`
- Cache automatique avec TanStack Query
- Gestion des états de chargement et d'erreur intégrée

#### `useAllEvents` (`src/hooks/useAllEvents.ts`)
- Même approche que `useEvents`
- Query key distincte : `['all-events']`

#### `useEvent` (`src/hooks/useEvent.ts`)
- Utilise `useQuery` pour récupérer un événement
- `useMutation` pour les mises à jour
- Invalidation automatique du cache

#### `useUserRole` (`src/hooks/useUserRole.ts`)
- Appels API remplacés par les fonctions de `userRolesApi`
- Logique métier préservée

### 5. Composants mis à jour

#### `EventStatusManager`
- Utilise `eventsApi.updateStatus()` au lieu de `fetch`

#### `CreateEventPage`
- Utilise `eventsApi.create()` au lieu de `fetch`

#### `InscriptionPage`
- Utilise `inscriptionApi.getByCode()` et `inscriptionApi.create()`

### 6. Types mis à jour

**Fichier :** `src/types/event.ts`

- Ajout de `EventStatus` : union type des statuts possibles
- Ajout de `CreateEventData` : interface pour la création
- Ajout de `UpdateEventData` : interface pour les mises à jour

## Avantages de la migration

### Axios
- Gestion automatique des erreurs HTTP
- Intercepteurs pour la logique globale
- Configuration centralisée
- Meilleure gestion des timeouts et retry

### TanStack Query
- Cache automatique des données
- Gestion des états de chargement/erreur
- Synchronisation automatique entre composants
- Optimistic updates
- Gestion des mutations avec invalidation du cache

## Utilisation

### Requêtes simples
```typescript
const { data: events, isLoading, error } = useEvents();
```

### Mutations
```typescript
const updateEvent = useUpdateEvent(eventId, {
  onSuccess: () => console.log('Événement mis à jour'),
  onError: (error) => console.error('Erreur:', error)
});

// Utilisation
updateEvent.mutate(newEventData);
```

### API directe
```typescript
import { eventsApi } from '@/src/lib/api';

// Créer un événement
const newEvent = await eventsApi.create(eventData);

// Mettre à jour un événement
await eventsApi.update(eventId, updateData);
```

## Configuration TanStack Query

Le provider est configuré dans `src/lib/query-provider.tsx` avec :
- `staleTime` : 1 minute (données considérées fraîches)
- `retry` : 1 tentative en cas d'échec
- DevTools activés en développement

## Migration complète

Tous les appels `fetch` ont été remplacés par :
1. Des fonctions API utilisant axios
2. Des hooks TanStack Query pour la gestion d'état
3. Une meilleure gestion des erreurs et du cache

La migration préserve toute la logique métier existante tout en améliorant significativement la gestion des requêtes HTTP et l'expérience utilisateur.
