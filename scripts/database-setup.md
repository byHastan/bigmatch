# Guide de résolution - Erreur de connexion Prisma

## 🔍 Diagnostic de l'erreur

L'erreur `Server has closed the connection` indique que votre base de données PostgreSQL n'est pas accessible. Voici comment résoudre ce problème :

## 📋 Solutions étape par étape

### 1. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine de votre projet avec :

```env
DATABASE_URL="postgresql://username:password@localhost:5432/bigmatch_db"
BETTER_AUTH_SECRET="votre-cle-secrete-de-32-caracteres-minimum"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Installation et démarrage de PostgreSQL

#### Option A: PostgreSQL local

```bash
# Windows (avec Chocolatey)
choco install postgresql

# macOS (avec Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Option B: Docker (recommandé)

```bash
# Créer et démarrer un conteneur PostgreSQL
docker run --name bigmatch-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=bigmatch_db -p 5432:5432 -d postgres:15

# Vérifier que le conteneur fonctionne
docker ps
```

### 3. Créer la base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres -h localhost

# Créer la base de données
CREATE DATABASE bigmatch_db;

# Créer un utilisateur (optionnel)
CREATE USER bigmatch_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bigmatch_db TO bigmatch_user;
```

### 4. Appliquer les migrations Prisma

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma db push

# Ou utiliser les migrations existantes
npx prisma migrate deploy

# Vérifier la connexion
npx prisma db seed
```

### 5. Vérification de la configuration

```bash
# Tester la connexion à la base de données
npx prisma studio

# Vérifier les variables d'environnement
npm run dev
```

## 🛠️ Commandes de diagnostic

```bash
# Vérifier si PostgreSQL fonctionne
pg_isready -h localhost -p 5432

# Vérifier les processus PostgreSQL
ps aux | grep postgres

# Tester la connexion avec les variables d'environnement
npx prisma db pull
```

## 🔧 Problèmes courants

### Erreur "password authentication failed"

- Vérifiez le nom d'utilisateur et mot de passe dans DATABASE_URL
- Assurez-vous que l'utilisateur existe dans PostgreSQL

### Erreur "database does not exist"

- Créez la base de données avec : `CREATE DATABASE bigmatch_db;`

### Erreur "connection refused"

- Vérifiez que PostgreSQL est démarré
- Vérifiez le port (par défaut 5432)

### Erreur "role does not exist"

- Créez l'utilisateur PostgreSQL ou utilisez 'postgres' comme utilisateur

## 🚀 Configuration rapide avec Docker

Si vous voulez une solution rapide :

```bash
# Créer docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: bigmatch_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# Démarrer avec Docker Compose
docker-compose up -d

# Votre DATABASE_URL sera :
# DATABASE_URL="postgresql://postgres:password@localhost:5432/bigmatch_db"
```

## 📞 Support

Si le problème persiste, vérifiez :

1. Les logs de PostgreSQL
2. Les permissions du fichier .env.local
3. Les règles de firewall
4. La configuration réseau Docker (si utilisé)
