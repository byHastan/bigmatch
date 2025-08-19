# Système de Rôles - BigMatch

## Vue d'ensemble

Le système de rôles de BigMatch permet de gérer différents types d'utilisateurs avec des permissions et des interfaces spécifiques. Chaque utilisateur peut avoir un rôle principal qui détermine son accès aux fonctionnalités de l'application.

## Types de Rôles

### 1. ORGANISATEUR

- **Description** : Crée et gère des événements sportifs
- **Fonctionnalités** :
  - Créer des événements (CUP, PLAYOFF, LEAGUE)
  - Définir les règles de jeu
  - Gérer les participants
  - Superviser les compétitions
- **Interface** : Dashboard avec statistiques et gestion d'événements

### 2. ÉQUIPE

- **Description** : Rejoint des événements en tant qu'équipe
- **Fonctionnalités** :
  - Rechercher des événements disponibles
  - Rejoindre des compétitions
  - Gérer les membres de l'équipe
  - Suivre les performances
- **Interface** : Dashboard avec recherche d'événements et gestion d'équipe

### 3. JOUEUR

- **Description** : Participe individuellement aux événements
- **Fonctionnalités** :
  - Rechercher des événements individuels
  - Rejoindre des compétitions
  - Suivre les statistiques personnelles
  - Gérer les sports pratiqués
- **Interface** : Dashboard avec recherche d'événements et statistiques personnelles

## Architecture Technique

### Base de Données

```sql
-- Table des rôles utilisateurs
CREATE TABLE user_role (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL CHECK (role_type IN ('ORGANISATEUR', 'EQUIPE', 'JOUEUR')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role_type)
);
```

### Modèles Prisma

```prisma
enum RoleType {
  ORGANISATEUR
  EQUIPE
  JOUEUR
}

model UserRole {
  id        String   @id @default(uuid())
  userId    String
  roleType  RoleType
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, roleType])
  @@map("user_role")
}
```

## API Endpoints

### Gestion des Rôles

#### POST /api/user-roles

Créer un nouveau rôle pour un utilisateur

```json
{
  "userId": "uuid",
  "roleType": "ORGANISATEUR"
}
```

#### GET /api/user-roles?userId={userId}

Récupérer les rôles d'un utilisateur spécifique

#### GET /api/user-roles?roleType={roleType}

Récupérer tous les utilisateurs avec un rôle spécifique

#### PUT /api/user-roles/{id}

Mettre à jour un rôle (activer/désactiver)

```json
{
  "isActive": true
}
```

#### DELETE /api/user-roles/{id}

Supprimer définitivement un rôle

## Gestion Côté Client

### Hook useUserRole

Le hook `useUserRole` fournit toutes les fonctionnalités de gestion des rôles :

```typescript
const {
  userRole, // Rôle actuel de l'utilisateur
  isLoading, // État de chargement
  error, // Erreurs éventuelles
  createUserRole, // Créer un nouveau rôle
  fetchUserRole, // Récupérer le rôle depuis l'API
  changeUserRole, // Changer le rôle principal
  hasRole, // Vérifier si l'utilisateur a un rôle
  getCurrentRoleType, // Obtenir le type de rôle actuel
  logout, // Déconnexion
} = useUserRole();
```

### Composant RoleGuard

Le composant `RoleGuard` protège les routes en vérifiant les permissions :

```typescript
<RoleGuard allowedRoles={["ORGANISATEUR"]}>
  <DashboardOrganisateur />
</RoleGuard>
```

## Flux d'Utilisation

### 1. Première Connexion

1. L'utilisateur se connecte via Google Auth
2. Il est redirigé vers `/welcome`
3. Il choisit son rôle (ORGANISATEUR, ÉQUIPE, ou JOUEUR)
4. Le rôle est créé en base de données
5. L'utilisateur est redirigé vers son dashboard

### 2. Connexions Suivantes

1. L'utilisateur se connecte
2. Le système vérifie son rôle en base de données
3. Il est automatiquement redirigé vers son dashboard

### 3. Changement de Rôle

1. L'utilisateur peut changer son rôle principal
2. L'ancien rôle est désactivé
3. Le nouveau rôle devient actif
4. Redirection vers le nouveau dashboard

## Sécurité

- **Vérification des rôles** : Chaque page protégée vérifie les permissions
- **Fallback localStorage** : En cas d'erreur API, fallback sur localStorage
- **Validation des types** : TypeScript assure la cohérence des types de rôles
- **Contraintes base de données** : Contraintes d'unicité et de validation

## Évolutions Futures

- **Rôles multiples** : Un utilisateur pourrait avoir plusieurs rôles actifs
- **Permissions granulaires** : Système de permissions plus détaillé
- **Rôles personnalisés** : Création de rôles spécifiques aux organisations
- **Audit trail** : Historique des changements de rôles

## Tests

Pour tester le système :

1. **Démarrer l'application** : `npm run dev`
2. **Créer un utilisateur** : Se connecter via Google
3. **Choisir un rôle** : Sur la page `/welcome`
4. **Vérifier l'accès** : Navigation vers le dashboard correspondant
5. **Tester les permissions** : Tentative d'accès aux autres dashboards

## Dépendances

- **Prisma** : ORM pour la gestion de la base de données
- **Next.js** : Framework React pour l'API et le frontend
- **TypeScript** : Typage statique pour la sécurité du code
- **Tailwind CSS** : Framework CSS pour l'interface utilisateur

