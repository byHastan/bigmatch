# Système d'Authentification et de Protection des Routes

## Vue d'ensemble

Le système d'authentification de BigMatch utilise Better Auth avec une gestion des rôles utilisateur intégrée. Il inclut plusieurs composants de protection pour sécuriser les routes et rediriger automatiquement les utilisateurs vers leurs dashboards appropriés.

## Composants de Protection

### 1. ProtectedRoute

Composant de base pour protéger les routes avec authentification et vérification de rôles.

```tsx
import { ProtectedRoute } from '@/components/auth';

// Route protégée avec authentification uniquement
<ProtectedRoute>
  <MonComposant />
</ProtectedRoute>

// Route protégée avec rôle spécifique
<ProtectedRoute requiredRole="ORGANISATEUR">
  <CreateEventForm />
</ProtectedRoute>

// Route publique (pas d'authentification requise)
<ProtectedRoute requireAuth={false}>
  <PublicPage />
</ProtectedRoute>
```

### 2. RoleGuard

Composant pour protéger les composants avec vérification de rôles spécifiques.

```tsx
import { RoleGuard } from "@/components/auth";

<RoleGuard allowedRoles={["ORGANISATEUR", "EQUIPE"]}>
  <AdminPanel />
</RoleGuard>;
```

### 3. DashboardGuard

Composant spécialisé pour protéger les routes de dashboard et rediriger vers le bon rôle.

```tsx
import { DashboardGuard } from "@/components/auth";

<DashboardGuard requiredRole="ORGANISATEUR">
  <OrganisateurDashboard />
</DashboardGuard>;
```

### 4. EventGuard

Composant pour protéger les routes d'événements avec vérification de rôles.

```tsx
import { EventGuard } from "@/components/auth";

<EventGuard allowedRoles={["ORGANISATEUR", "EQUIPE"]}>
  <EventManagement />
</EventGuard>;
```

## Flux d'Authentification

### 1. Page d'Accueil (/)

- **Utilisateur non connecté** : Affiche le bouton de connexion
- **Utilisateur connecté avec rôle** : Redirige automatiquement vers `/dashboard/{role}`
- **Utilisateur connecté sans rôle** : Redirige vers `/welcome`

### 2. Page de Sélection de Rôle (/welcome)

- **Utilisateur non connecté** : Redirige vers `/`
- **Utilisateur connecté avec rôle** : Redirige automatiquement vers `/dashboard/{role}`
- **Utilisateur connecté sans rôle** : Affiche la sélection de rôle

### 3. Dashboard Principal (/dashboard)

- **Utilisateur non connecté** : Redirige vers `/`
- **Utilisateur connecté avec rôle** : Redirige automatiquement vers `/dashboard/{role}`
- **Utilisateur connecté sans rôle** : Affiche la sélection de rôle

### 4. Dashboards Spécifiques (/dashboard/{role})

- **Utilisateur non connecté** : Redirige vers `/`
- **Utilisateur connecté avec mauvais rôle** : Redirige vers le bon dashboard
- **Utilisateur connecté avec bon rôle** : Affiche le dashboard

## Middleware

Le middleware gère les redirections au niveau des routes :

- **Routes publiques** : `/`, `/welcome`
- **Routes protégées** : Toutes les autres routes
- **Redirection automatique** : Utilisateurs connectés vers `/dashboard`

## Utilisation des Hooks

### useUserRole

```tsx
import { useUserRole } from "@/src/hooks/useUserRole";

const { userRole, isLoading, createUserRole } = useUserRole();

// Vérifier si l'utilisateur a un rôle
if (userRole) {
  console.log("Rôle:", userRole.roleType);
}

// Créer un nouveau rôle
await createUserRole(userId, "ORGANISATEUR");
```

### useSession

```tsx
import { useSession } from "@/src/lib/auth-client";

const { data: session, isPending } = useSession();

if (session?.user?.id) {
  console.log("Utilisateur connecté:", session.user.email);
}
```

## Exemples d'Implémentation

### Protection d'une Page d'Administration

```tsx
import { ProtectedRoute } from "@/components/auth";

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="ORGANISATEUR">
      <div>
        <h1>Page d'Administration</h1>
        {/* Contenu protégé */}
      </div>
    </ProtectedRoute>
  );
}
```

### Protection d'un Composant avec Rôles Multiples

```tsx
import { RoleGuard } from "@/components/auth";

export default function TeamManagement() {
  return (
    <RoleGuard allowedRoles={["ORGANISATEUR", "EQUIPE"]}>
      <div>
        <h1>Gestion des Équipes</h1>
        {/* Contenu accessible aux organisateurs et équipes */}
      </div>
    </RoleGuard>
  );
}
```

### Redirection Automatique dans un Composant

```tsx
import { useUserRole } from "@/src/hooks/useUserRole";
import { useRouter } from "next/navigation";

export default function MyComponent() {
  const { userRole } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (userRole) {
      // Rediriger vers le bon dashboard
      router.push(`/dashboard/${userRole.roleType.toLowerCase()}`);
    }
  }, [userRole, router]);

  return <div>Redirection en cours...</div>;
}
```

## Gestion des Erreurs

### Rôles Non Trouvés

Si un utilisateur n'a pas de rôle :

1. Redirection vers `/welcome`
2. Affichage de la sélection de rôle
3. Création du rôle via l'API

### Rôles Incorrects

Si un utilisateur accède à un dashboard avec le mauvais rôle :

1. Détection automatique du bon rôle
2. Redirection vers le bon dashboard
3. Affichage d'un message de redirection

### Sessions Expirées

Si la session expire :

1. Nettoyage automatique des données locales
2. Redirection vers la page d'accueil
3. Demande de reconnexion

## Sécurité

- **Vérification côté client et serveur** : Double vérification des autorisations
- **Tokens d'authentification** : Gestion sécurisée des sessions
- **Protection des routes** : Middleware et composants de protection
- **Redirection sécurisée** : Évite les boucles de redirection
- **Gestion des états** : États de chargement et d'erreur appropriés

## Bonnes Pratiques

1. **Toujours utiliser les composants de protection** pour les routes sensibles
2. **Gérer les états de chargement** pour une meilleure UX
3. **Utiliser les hooks appropriés** pour la gestion des rôles
4. **Implémenter la redirection automatique** pour une navigation fluide
5. **Tester les différents scénarios** d'authentification et de rôles
