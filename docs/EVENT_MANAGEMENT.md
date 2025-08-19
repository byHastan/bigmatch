# Gestion des Événements

## Vue d'ensemble

La page de gestion des événements permet aux organisateurs de gérer tous leurs événements sportifs en un seul endroit. Cette interface moderne et intuitive offre des fonctionnalités avancées de gestion, de filtrage et d'analyse.

## Fonctionnalités principales

### 📊 Tableau de bord avec statistiques

- **Total des événements** : Nombre total d'événements créés
- **Événements actifs** : Événements en cours avec pourcentage
- **Événements en brouillon** : Événements non encore publiés
- **Événements terminés** : Événements clôturés
- **Événements annulés** : Événements annulés
- **Équipes inscrites** : Nombre total d'équipes avec moyenne par événement
- **Joueurs total** : Nombre total de joueurs avec moyenne par équipe

### 🔍 Filtres et recherche

- **Recherche textuelle** : Recherche dans le nom, la description et le lieu
- **Filtre par statut** : DRAFT, ACTIVE, COMPLETED, CANCELLED
- **Filtre par type** : MATCH, CUP, CHAMPIONNAT
- **Indicateurs visuels** : Affichage des filtres actifs avec possibilité de les effacer

### 🎯 Gestion des événements

Chaque événement est affiché dans une carte détaillée avec :

#### Informations principales

- **Badge "PROPRIÉTAIRE"** : Indique clairement la propriété
- **Statut visuel** : Code couleur pour chaque statut
- **Nom et description** : Informations clés de l'événement
- **Date et heure** : Formatage français
- **Localisation** : Lieu de l'événement

#### Statistiques détaillées

- **Type d'événement** : Match, Coupe, Championnat
- **Nombre d'équipes** : Actuelles vs maximum
- **Nombre de joueurs** : Total des participants
- **Code d'inscription** : Code unique pour les inscriptions

#### Actions rapides

- **Voir** : Accéder aux détails de l'événement
- **Copier le code** : Copier le code d'inscription
- **Partager** : Partager l'événement (API native ou copie)

#### Actions principales

- **Modifier** : Éditer l'événement
- **Supprimer** : Supprimer avec confirmation

### 🚀 Navigation et UX

- **Design responsive** : Adapté mobile et desktop
- **Animations fluides** : Transitions avec Framer Motion
- **Navigation intuitive** : Retour au dashboard principal
- **Gestion d'erreurs** : Affichage des erreurs avec possibilité de réessayer
- **États de chargement** : Indicateurs visuels pendant les opérations

## Structure des composants

### Composants principaux

- `EventManagementPage` : Page principale
- `EventManagementCard` : Carte d'événement avec actions
- `EventFilters` : Filtres et recherche
- `EventManagementStats` : Statistiques du tableau de bord
- `DeleteConfirmation` : Modal de confirmation de suppression

### Composants utilitaires

- `LoadingSpinner` : Indicateur de chargement
- `ErrorMessage` : Affichage des erreurs
- `DashboardHeader` : En-tête avec navigation

## Utilisation

### Accès

La page est accessible via :

- Le bouton "Gérer tous les événements" sur la page d'accueil
- La navigation directe vers `/dashboard/organisateur/events`

### Permissions

- **Rôle requis** : ORGANISATEUR
- **Authentification** : Obligatoire
- **Accès** : Uniquement aux événements de l'utilisateur connecté

### Actions disponibles

1. **Créer un événement** : Redirection vers la page de création
2. **Modifier un événement** : Édition des détails (TODO)
3. **Supprimer un événement** : Suppression avec confirmation (TODO)
4. **Voir un événement** : Consultation des détails (TODO)
5. **Partager un événement** : Partage via API native ou copie du code

## Technologies utilisées

- **Frontend** : React, TypeScript, Tailwind CSS
- **Animations** : Framer Motion
- **État** : React Hooks (useState, useMemo)
- **Navigation** : Next.js Router
- **Authentification** : RoleGuard avec vérification des rôles
- **API** : Hook personnalisé useEvents pour la récupération des données

## Améliorations futures

### Fonctionnalités à implémenter

- [ ] Page d'édition d'événement
- [ ] Page de détail d'événement
- [ ] API de suppression d'événement
- [ ] Notifications de succès/erreur
- [ ] Export des données d'événement
- [ ] Gestion des inscriptions depuis cette page
- [ ] Historique des modifications

### Optimisations possibles

- [ ] Pagination pour les gros volumes d'événements
- [ ] Tri par colonnes (date, nom, statut)
- [ ] Filtres avancés (plage de dates, nombre de participants)
- [ ] Recherche en temps réel
- [ ] Mise en cache des données
- [ ] Mode hors ligne

## Support et maintenance

### Dépendances

- Tous les composants UI de base (`@/components/ui`)
- Hook personnalisé `useEvents` pour la gestion des données
- Constantes des rôles (`@/src/lib/constants`)

### Tests

- Vérifier le rendu sur différents écrans
- Tester les filtres et la recherche
- Valider la gestion des erreurs
- Tester la navigation et les redirections

### Débogage

- Console du navigateur pour les logs
- Vérification des permissions utilisateur
- Validation des données de l'API
- Test des composants individuels
