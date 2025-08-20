# 🏆 BigMatch - Plateforme de Gestion d'Événements Sportifs

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.14.0-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

BigMatch est une plateforme moderne et intuitive de gestion d'événements sportifs, construite avec Next.js 15, React 19 et TypeScript. Elle permet aux organisateurs de créer et gérer des événements sportifs, aux équipes de s'inscrire, et aux joueurs de rejoindre des équipes.

## ✨ Fonctionnalités Principales

### 🎯 Gestion des Événements

- **Création d'événements** : Coupes, Playoffs, Ligues
- **Gestion des inscriptions** : Codes d'inscription uniques
- **Statuts d'événements** : Brouillon, Actif, Terminé, Annulé
- **Limites configurables** : Nombre maximum d'équipes et de joueurs

### 👥 Système de Rôles

- **Organisateur** : Création et gestion complète des événements
- **Équipe** : Inscription et gestion des joueurs
- **Joueur** : Rejoindre des équipes et participer aux événements

### 🔐 Authentification

- **Connexion Google** via Better Auth
- **Gestion des sessions** sécurisée
- **Rôles utilisateur** dynamiques

### 📱 Interface Moderne

- **Design responsive** avec Tailwind CSS
- **Animations fluides** avec Framer Motion
- **Composants UI** personnalisables
- **Navigation intuitive** entre les différents dashboards

## 🚀 Technologies Utilisées

- **Frontend** : Next.js 15, React 19, TypeScript
- **Styling** : Tailwind CSS 4, Radix UI
- **Base de données** : PostgreSQL avec Prisma ORM
- **Authentification** : Better Auth
- **État global** : TanStack React Query
- **Animations** : Framer Motion
- **Gestion des dates** : date-fns, react-day-picker

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- [pnpm](https://pnpm.io/) (gestionnaire de paquets recommandé)
- [PostgreSQL](https://www.postgresql.org/) (base de données)
- [Git](https://git-scm.com/)

## 🛠️ Installation et Configuration

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/bigmatch.git
cd bigmatch
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configuration de l'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/bigmatch"

# Google OAuth (optionnel pour le développement)
GOOGLE_CLIENT_ID="votre-client-id"
GOOGLE_CLIENT_SECRET="votre-client-secret"

# Clé secrète pour l'authentification
AUTH_SECRET="votre-clé-secrète-aléatoire"
```

### 4. Configuration de la base de données

```bash
# Générer le client Prisma
pnpm prisma generate

# Créer et appliquer les migrations
pnpm prisma migrate dev

# (Optionnel) Peupler la base avec des données de test
pnpm run seed
```

### 5. Lancer le serveur de développement

```bash
pnpm dev
```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000)

## 🏗️ Structure du Projet

```
bigmatch/
├── app/                    # Pages et routes Next.js 15 (App Router)
│   ├── actions/           # Actions serveur
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboards par rôle
│   ├── events/            # Pages des événements
│   └── inscription/       # Système d'inscription
├── components/            # Composants React réutilisables
│   ├── auth/             # Composants d'authentification
│   ├── dashboard/        # Composants du tableau de bord
│   ├── events/           # Composants des événements
│   └── ui/               # Composants UI de base
├── lib/                   # Utilitaires et configurations
├── prisma/                # Schéma et migrations de base de données
├── src/                   # Code source principal
│   ├── components/        # Composants spécifiques
│   ├── hooks/             # Hooks React personnalisés
│   └── lib/               # Bibliothèques et configurations
└── public/                # Assets statiques
```

## 🎮 Utilisation

### Pour les Organisateurs

1. **Connexion** avec votre compte Google
2. **Création d'événements** via le dashboard organisateur
3. **Gestion des inscriptions** et des équipes
4. **Suivi des statistiques** et des performances

### Pour les Équipes

1. **Inscription** avec le code d'événement
2. **Gestion des joueurs** de l'équipe
3. **Suivi des événements** et des résultats

### Pour les Joueurs

1. **Rejoindre une équipe** existante
2. **Participer aux événements** sportifs
3. **Suivre vos performances** et statistiques

## 🧪 Scripts Disponibles

```bash
# Développement
pnpm dev              # Lance le serveur de développement
pnpm build            # Construit l'application pour la production
pnpm start            # Lance l'application en mode production
pnpm lint             # Vérifie la qualité du code

# Base de données
pnpm prisma generate  # Génère le client Prisma
pnpm prisma migrate   # Applique les migrations
pnpm prisma studio    # Ouvre l'interface Prisma Studio
pnpm run seed         # Peuple la base avec des données de test
```

## 🔧 Configuration Avancée

### Variables d'Environnement

| Variable               | Description                         | Requis |
| ---------------------- | ----------------------------------- | ------ |
| `DATABASE_URL`         | URL de connexion PostgreSQL         | ✅     |
| `AUTH_SECRET`          | Clé secrète pour l'authentification | ✅     |
| `GOOGLE_CLIENT_ID`     | ID client Google OAuth              | ❌     |
| `GOOGLE_CLIENT_SECRET` | Secret client Google OAuth          | ❌     |

### Personnalisation du Design

Le projet utilise Tailwind CSS avec un système de design personnalisable. Modifiez le fichier `design.json` pour ajuster les couleurs et les composants.

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement à chaque push

### Autres Plateformes

Le projet est compatible avec toutes les plateformes supportant Next.js :

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. **Fork** le projet
2. **Créez** une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. **Commitez** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Poussez** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrez** une Pull Request

## 📚 Documentation

- [Documentation des événements](docs/EVENT_MANAGEMENT.md)
- [API des événements](docs/EVENTS_API.md)
- [Système d'inscription](docs/INSCRIPTION_SYSTEM.md)
- [Système de rôles](docs/ROLES_SYSTEM.md)

## 🐛 Dépannage

### Problèmes Courants

**Erreur de base de données**

```bash
# Vérifiez que PostgreSQL est en cours d'exécution
# Régénérez le client Prisma
pnpm prisma generate
```

**Erreur d'authentification**

```bash
# Vérifiez vos variables d'environnement
# Redémarrez le serveur de développement
```

**Problèmes de dépendances**

```bash
# Supprimez node_modules et réinstallez
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :

- 📧 **Email** : support@bigmatch.com
- 🐛 **Issues** : [GitHub Issues](https://github.com/votre-username/bigmatch/issues)
- 💬 **Discussions** : [GitHub Discussions](https://github.com/votre-username/bigmatch/discussions)

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) pour le framework
- [Prisma](https://www.prisma.io/) pour l'ORM
- [Tailwind CSS](https://tailwindcss.com/) pour le styling
- [Better Auth](https://better-auth.com/) pour l'authentification

---

**BigMatch** - Rendez le sport accessible à tous ! 🏆⚽🏀🎾
