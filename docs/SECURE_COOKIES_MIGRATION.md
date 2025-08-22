# Migration vers les Cookies Sécurisés

## 🔒 Pourquoi migrer vers les cookies sécurisés ?

### Problèmes avec localStorage :

- ❌ **Vulnérable aux attaques XSS** : Accessible via JavaScript malveillant
- ❌ **Pas de protection CSRF** : Aucune restriction sur l'origine des requêtes
- ❌ **Incompatible SSR** : Non accessible côté serveur Next.js
- ❌ **Persistance indéfinie** : Risque de sécurité si compromis
- ❌ **Pas de chiffrement** : Données en clair dans le navigateur

### Avantages des cookies sécurisés :

- ✅ **Protection XSS** : `httpOnly: true` empêche l'accès JavaScript
- ✅ **Protection CSRF** : `sameSite: 'strict'` limite les attaques cross-site
- ✅ **Chiffrement en transit** : `secure: true` force HTTPS
- ✅ **Compatible SSR** : Accessible côté serveur Next.js
- ✅ **Expiration automatique** : `maxAge` pour limiter l'exposition
- ✅ **Aligné avec Better Auth** : Cohérent avec votre système d'authentification

## 🚀 Guide de Migration

### 1. Remplacement du hook existant

**Avant (localStorage) :**

```typescript
import { useUserRole } from "@/src/hooks/useUserRole";

function MyComponent() {
  const { userRole, isLoading } = useUserRole();
  // ...
}
```

**Après (cookies sécurisés) :**

```typescript
import { useHybridUserRole } from "@/src/hooks/useHybridUserRole";

function MyComponent() {
  const { userRole, isLoading } = useHybridUserRole();
  // ...
}
```

### 2. Migration automatique depuis localStorage

Le nouveau hook migre automatiquement les données existantes de localStorage vers les cookies sécurisés :

```typescript
// Migration transparente au premier chargement
const { userRole } = useHybridUserRole(); // Migre automatiquement depuis localStorage
```

### 3. Utilisation de l'API serveur (plus sécurisé)

**Route API pour cookies httpOnly :**

```typescript
// GET /api/auth/user-role - Récupérer le rôle
const response = await fetch("/api/auth/user-role");
const { userRole } = await response.json();

// POST /api/auth/user-role - Sauvegarder le rôle
await fetch("/api/auth/user-role", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ role: "organisateur" }),
});

// DELETE /api/auth/user-role - Supprimer le rôle
await fetch("/api/auth/user-role", { method: "DELETE" });
```

### 4. Service de cookies sécurisés

**Utilisation directe du service :**

```typescript
import { UserRoleCookieService } from "@/src/lib/secure-cookies";

// Côté serveur (plus sécurisé)
await UserRoleCookieService.setUserRole("organisateur");
const role = await UserRoleCookieService.getUserRole();
await UserRoleCookieService.clearUserRole();

// Côté client (fallback)
UserRoleCookieService.setUserRoleClient("organisateur");
const role = UserRoleCookieService.getUserRoleClient();
UserRoleCookieService.clearUserRoleClient();
```

## 📋 Plan de Migration Étape par Étape

### Étape 1: Déployer les nouveaux services

- ✅ Service de cookies sécurisés (`secure-cookies.ts`)
- ✅ API route serveur (`/api/auth/user-role`)
- ✅ Hook hybride (`useHybridUserRole.ts`)

### Étape 2: Remplacer les composants un par un

```typescript
// Remplacer progressivement
- useUserRole() → useHybridUserRole()
- localStorage.setItem() → UserRoleCookieService.setUserRoleClient()
- localStorage.getItem() → UserRoleCookieService.getUserRoleClient()
```

### Étape 3: Tester la migration

- ✅ Vérifier que les rôles existants sont migrés
- ✅ Tester l'authentification avec cookies
- ✅ Valider le SSR/CSR
- ✅ Tester la déconnexion

### Étape 4: Nettoyer l'ancien code

- Supprimer les références localStorage
- Retirer l'ancien hook `useUserRole`
- Nettoyer les imports obsolètes

## 🔧 Configuration de Sécurité

### Cookies sécurisés par défaut :

```typescript
{
  maxAge: 7 * 24 * 60 * 60, // 7 jours
  httpOnly: true,           // Protection XSS
  secure: true,            // HTTPS uniquement en production
  sameSite: 'strict',      // Protection CSRF
  path: '/',               // Disponible partout
}
```

### Variables d'environnement requises :

```env
# Production uniquement
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

## 🚨 Points d'Attention

### Compatibilité

- **SSR/CSR** : Le hook hybride gère automatiquement les deux contextes
- **Migration** : Automatique depuis localStorage au premier chargement
- **Fallback** : Cookies client si l'API serveur échoue

### Débogage

```typescript
// Vérifier la migration
const { userRole, getRole } = useHybridUserRole();

// Debug : vérifier la source du rôle
const currentRole = await getRole();
console.log("Rôle actuel:", currentRole);
```

### Tests

```typescript
// Tester la sécurité
// 1. Vérifier que localStorage est vide après migration
// 2. Confirmer que les cookies httpOnly ne sont pas accessibles en JS
// 3. Valider l'expiration automatique des cookies
```

## 📈 Bénéfices de la Migration

1. **Sécurité renforcée** : Protection contre XSS et CSRF
2. **Performance SSR** : Accès côté serveur pour Better Auth
3. **Expérience utilisateur** : Session persistante mais sécurisée
4. **Conformité** : Respect des bonnes pratiques web
5. **Évolutivité** : Architecture alignée avec Next.js

## 🤝 Support

En cas de problème durant la migration :

1. Vérifier les logs de la console pour les erreurs de migration
2. Confirmer que les variables d'environnement sont correctes
3. Tester en mode incognito pour éviter les conflits de cache
4. Vérifier que HTTPS est activé en production

La migration est conçue pour être **transparente** et **sans interruption** de service. 🚀
