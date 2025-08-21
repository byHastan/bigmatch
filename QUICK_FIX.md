# 🚨 Solution rapide - Erreur de base de données

## Problème actuel

```
INTERNAL_SERVER_ERROR Error [PrismaClientKnownRequestError]: Server has closed the connection.
```

## ⚡ Solution en 5 minutes

### 1. Créer le fichier de configuration

Créez un fichier `.env.local` à la racine du projet :

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/bigmatch_db"
BETTER_AUTH_SECRET="bigmatch-secret-key-minimum-32-characters-long"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Démarrer PostgreSQL avec Docker (solution la plus rapide)

```bash
# Démarrer PostgreSQL
docker run --name bigmatch-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=bigmatch_db \
  -p 5432:5432 -d postgres:15

# Vérifier que ça fonctionne
docker ps
```

### 3. Configurer Prisma

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer le schéma à la base de données
npx prisma db push

# (Optionnel) Ajouter des données de test
npm run seed
```

### 4. Redémarrer l'application

```bash
npm run dev
```

## 🔍 Diagnostic automatique

```bash
# Vérifier la configuration
npm run db:check

# Ouvrir l'interface d'administration de la base de données
npm run db:studio
```

## 🛠️ Autres solutions

### Si vous avez déjà PostgreSQL installé localement :

1. Démarrez PostgreSQL (sur macOS : `brew services start postgresql`)
2. Créez la base de données : `createdb bigmatch_db`
3. Ajustez DATABASE_URL dans `.env.local`

### Si vous préférez une base de données en ligne :

- Utilisez [Supabase](https://supabase.com) (gratuit)
- Utilisez [Neon](https://neon.tech) (gratuit)
- Copiez l'URL de connexion dans `.env.local`

## ✅ Vérification

Après avoir suivi ces étapes, vous devriez pouvoir :

1. Aller sur `/welcome` sans erreur
2. Créer un événement avec le rôle ORGANISATEUR
3. Voir l'interface de gestion des rôles

## 📞 Si le problème persiste

1. Vérifiez les logs de l'application : `npm run dev`
2. Vérifiez la connexion à la base de données : `npm run db:check`
3. Consultez le guide détaillé : `scripts/database-setup.md`
