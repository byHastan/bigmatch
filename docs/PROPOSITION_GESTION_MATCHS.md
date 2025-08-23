# 🏆 Proposition : Gestion des Matchs - BigMatch

## 📋 Vue d'ensemble

Cette proposition détaille l'implémentation complète du système de gestion des matchs pour les trois types d'événements existants :

- **MATCH** : Opposition directe entre équipes avec gestion des scores
- **COUPE** : Tournoi à élimination avec arbre de tournoi et onglets Équipes/Matchs
- **CHAMPIONNAT** : Compétition avec classement et onglets Équipes/Matchs/Classement

---

## 🗃️ Nouveaux Modèles de Base de Données

### 1. Modèle `Match`

```prisma
model Match {
  id            String      @id @default(uuid())
  eventId       String
  event         Event       @relation(fields: [eventId], references: [id], onDelete: Cascade)

  // Équipes participantes
  teamAId       String?
  teamBId       String?
  teamA         Team?       @relation("TeamAMatches", fields: [teamAId], references: [id])
  teamB         Team?       @relation("TeamBMatches", fields: [teamBId], references: [id])

  // Informations du match
  round         Int?        // Phase (8ème, quart, demi, finale, etc.)
  position      Int?        // Position dans l'arbre du tournoi
  status        MatchStatus @default(SCHEDULED)

  // Résultats
  scoreA        Int?        @default(0)
  scoreB        Int?        @default(0)
  winnerId      String?
  winner        Team?       @relation("WinnerMatches", fields: [winnerId], references: [id])

  // Matchs parents pour l'arbre du tournoi
  parentMatchId String?
  parentMatch   Match?      @relation("MatchTree", fields: [parentMatchId], references: [id])
  childMatches  Match[]     @relation("MatchTree")

  // Dates
  scheduledAt   DateTime?
  startedAt     DateTime?
  completedAt   DateTime?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@map("match")
}

enum MatchStatus {
  SCHEDULED   // Planifié
  LIVE        // En cours
  COMPLETED   // Terminé
  CANCELLED   // Annulé
  WALKOVER    // Forfait
}
```

### 2. Modèle `TeamRanking` (pour les championnats)

```prisma
model TeamRanking {
  id          String @id @default(uuid())
  eventId     String
  event       Event  @relation(fields: [eventId], references: [id], onDelete: Cascade)
  teamId      String
  team        Team   @relation(fields: [teamId], references: [id], onDelete: Cascade)

  // Statistiques
  played      Int    @default(0)
  wins        Int    @default(0)
  draws       Int    @default(0)
  losses      Int    @default(0)
  goalsFor    Int    @default(0)
  goalsAgainst Int   @default(0)
  goalDiff    Int    @default(0)
  points      Int    @default(0)
  position    Int    @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([eventId, teamId])
  @@map("team_ranking")
}
```

### 3. Mise à jour du modèle `Team`

```prisma
// Ajouts aux relations existantes
model Team {
  // ... champs existants ...

  // Relations pour les matchs
  matchesA      Match[] @relation("TeamAMatches")
  matchesB      Match[] @relation("TeamBMatches")
  victories     Match[] @relation("WinnerMatches")
  ranking       TeamRanking?

  // ... reste du modèle existant ...
}
```

### 4. Mise à jour du modèle `Event`

```prisma
model Event {
  // ... champs existants ...

  // Relations pour les matchs
  matches       Match[]
  rankings      TeamRanking[]

  // ... reste du modèle existant ...
}
```

---

## 🎨 Architecture des Composants UI

### 1. MATCH Simple - Vue Opposition

```
📁 components/matches/
├── 📄 MatchView.tsx              # Vue principale du match
├── 📄 ScoreBoard.tsx             # Affichage et gestion des scores
├── 📄 TeamVersus.tsx             # Affichage des équipes face à face
├── 📄 MatchControls.tsx          # Contrôles pour l'organisateur (boutons +1,+2,+3,-)
├── 📄 MatchTimer.tsx             # Gestion du chronomètre et règles automatiques
└── 📄 MatchHistory.tsx           # Historique des actions
```

**Interface MatchView.tsx :**

- Header avec nom de l'événement et statut
- Section centrale avec TeamA vs TeamB
- Scores en gros caractères au centre
- Chronomètre/indicateur de règles (mode TIME ou POINTS)
- Contrôles de score par équipe : [-] [+1] [+2] [+3]
- Boutons "Pause/Play" et "Terminer le match"
- Arrêt automatique selon les règles définies

### 2. COUPE - Vue Tournoi

```
📁 components/tournament/
├── 📄 TournamentView.tsx         # Vue principale avec onglets
├── 📄 TournamentBracket.tsx      # Arbre du tournoi (design image)
├── 📄 TeamsTab.tsx              # Onglet équipes participantes
├── 📄 MatchesTab.tsx            # Onglet des matchs
├── 📄 BracketNode.tsx           # Nœud de l'arbre (match individuel)
├── 📄 MatchModal.tsx            # Modal de gestion d'un match
└── 📄 DrawManager.tsx           # Tirage au sort initial
```

**Interface TournamentView.tsx :**

- Navigation par onglets : "Équipes" | "Matchs"
- Onglet Équipes : Liste des équipes avec logos
- Onglet Matchs : Arbre visuel du tournoi (style image fournie)
- Possibilité de cliquer sur chaque match pour gérer le score

### 3. CHAMPIONNAT - Vue Championnat

```
📁 components/championship/
├── 📄 ChampionshipView.tsx      # Vue principale avec onglets
├── 📄 TeamsTab.tsx             # Onglet équipes
├── 📄 MatchesTab.tsx           # Onglet matchs (planning)
├── 📄 RankingTab.tsx           # Onglet classement
├── 📄 RankingTable.tsx         # Tableau de classement
├── 📄 MatchFixtures.tsx        # Calendrier des matchs
└── 📄 StatsCard.tsx            # Statistiques d'équipe
```

**Interface ChampionshipView.tsx :**

- Navigation par onglets : "Équipes" | "Matchs" | "Classement"
- Onglet Classement : Tableau avec Position, Équipe, J, G, N, P, BP, BC, Diff, Pts
- Auto-calcul du classement après chaque résultat

---

## ⚖️ Logique des Règles Automatiques

### Gestion des Modes de Jeu selon les Règles JSON

La gestion des matchs s'adapte automatiquement selon les règles définies dans l'événement :

#### 1. Mode "Au Temps" (TIME)

```javascript
// Structure de règle
{
  match: {
    gameMode: "TIME",
    duration: 15,        // durée en minutes
    pointsToWin: 11      // affiché pour info
  }
}

// Comportement automatique :
- ⏱️ Décompte automatique du temps (15:00 → 00:00)
- 🛑 Arrêt automatique du match à 00:00
- 🏆 Victoire à l'équipe avec le plus de points
- ⏸️ Possibilité de pause/reprendre le chronomètre
- 📈 Boutons de score : [-] [+1] [+2] [+3]
```

#### 2. Mode "Au Point" (POINTS)

```javascript
// Structure de règle
{
  match: {
    gameMode: "POINTS",
    pointsToWin: 11,     // premier à atteindre ce score gagne
    duration: 15         // affiché pour info/limite max
  }
}

// Comportement automatique :
- 🎯 Surveillance du score en temps réel
- 🛑 Arrêt automatique quand une équipe atteint 11 points
- 🏆 Victoire immédiate à la première équipe qui atteint le score
- ⏱️ Chronomètre informatif (pas d'arrêt automatique)
- 📈 Boutons de score : [-] [+1] [+2] [+3]
```

### Interface de Contrôle des Scores

**Boutons par équipe :**

```typescript
interface ScoreControls {
  decrease: () => void; // [-] : -1 point seulement
  addOne: () => void; // [+1] : +1 point
  addTwo: () => void; // [+2] : +2 points (panier à 2 pts)
  addThree: () => void; // [+3] : +3 points (panier à 3 pts)
}
```

### États du Match selon les Règles

1. **EN_COURS** : Match actif, chronomètre/score surveillé
2. **TERMINÉ_TEMPS** : Arrêt automatique par le temps
3. **TERMINÉ_SCORE** : Arrêt automatique par le score
4. **TERMINÉ_MANUEL** : Arrêt manuel par l'organisateur
5. **EN_PAUSE** : Match temporairement suspendu

### Composant MatchTimer.tsx

```typescript
interface MatchTimerProps {
  rules: EventRules;
  matchId: string;
  onMatchEnd: (reason: 'TIME' | 'SCORE' | 'MANUAL') => void;
}

// Fonctionnalités :
- Gestion du décompte selon les règles
- Auto-arrêt selon le mode (temps/score)
- Notifications visuelles/sonores
- Synchronisation temps réel avec tous les spectateurs
```

---

## 🔗 APIs Nécessaires

### 1. API Matchs - `/api/matches`

```typescript
// GET /api/matches/[eventId] - Récupérer tous les matchs d'un événement
// POST /api/matches - Créer un nouveau match
// PUT /api/matches/[matchId] - Mettre à jour un match (scores, statut)
// DELETE /api/matches/[matchId] - Supprimer un match

interface CreateMatchData {
  eventId: string;
  teamAId?: string;
  teamBId?: string;
  round?: number;
  position?: number;
  scheduledAt?: string;
}

interface UpdateMatchData {
  scoreA?: number;
  scoreB?: number;
  status?: MatchStatus;
  winnerId?: string;
  completedAt?: string;
  currentTime?: number; // temps écoulé en secondes (mode TIME)
  isPaused?: boolean; // état pause/play du chronomètre
}
```

### 2. API Tirage au Sort - `/api/draws`

```typescript
// POST /api/draws/[eventId] - Effectuer le tirage au sort
// GET /api/draws/[eventId] - Récupérer l'arbre du tirage

interface DrawResponse {
  success: boolean;
  brackets: Match[];
  rounds: number;
}
```

### 3. API Gestion Temps Réel - `/api/matches/live`

```typescript
// PUT /api/matches/[matchId]/score - Mettre à jour le score
// PUT /api/matches/[matchId]/timer - Gérer le chronomètre
// GET /api/matches/[matchId]/rules - Récupérer les règles du match

interface ScoreUpdate {
  teamId: string;
  points: 1 | 2 | 3 | -1; // +1, +2, +3 ou -1
  autoCheck: boolean; // vérifier fin automatique
}

interface TimerControl {
  action: "START" | "PAUSE" | "RESUME" | "RESET";
  currentTime?: number; // en secondes
}

interface MatchRulesResponse {
  gameMode: "TIME" | "POINTS";
  duration?: number; // en minutes (mode TIME)
  pointsToWin?: number; // score limite (mode POINTS)
  shouldAutoEnd: boolean; // arrêt automatique activé
}
```

### 4. API Classement - `/api/rankings`

```typescript
// GET /api/rankings/[eventId] - Récupérer le classement
// PUT /api/rankings/[eventId] - Recalculer le classement

interface RankingEntry {
  position: number;
  team: Team;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}
```

---

## 📱 Interfaces Utilisateur Détaillées

### 1. MATCH - Page Opposition

```
┌─────────────────────────────────────────┐
│ ← Tournoi de Basketball 3x3             │
├─────────────────────────────────────────┤
│                                         │
│    🏀 TEAM A      VS      TEAM B 🏀     │
│      Street Lions        LA Dogs        │
│                                         │
│         [ 15 ]    -    [ 12 ]          │
│                                         │
│  [−] [+1] [+2] [+3]  [−] [+1] [+2] [+3] │
│                                         │
│        ⏱️ 08:34 / 15:00                │
│        (Mode: Au temps - 11 pts)        │
│                                         │
│              [⏸️ PAUSE]                  │
│            [✅ TERMINER]                 │
│                                         │
│    🕒 12:45   📍 Venice Beach          │
└─────────────────────────────────────────┘
```

### 2. COUPE - Arbre du Tournoi (Style image fournie)

```
┌─────────────────────────────────────────┐
│ 3x3 National Championship              │
├─────────────────────────────────────────┤
│  [Équipes] [Matchs]                     │
├─────────────────────────────────────────┤
│                                         │
│  🏆 FINALE                             │
│  ┌─────────────┐                       │
│  │   Winner    │                       │
│  │   Finals    │                       │
│  └─────────────┘                       │
│         ▲                               │
│    ┌─────┴─────┐                       │
│  DEMI-FINALES                           │
│  ┌───────┐   ┌───────┐                 │
│  │Team A │   │Team B │                 │
│  │  12   │   │  15   │                 │
│  └───────┘   └───────┘                 │
│      ▲           ▲                     │
│  ┌───┴───┐   ┌───┴───┐                 │
│ QUARTS DE FINALE                        │
│ [...arbre complet...]                   │
└─────────────────────────────────────────┘
```

### 3. CHAMPIONNAT - Classement

```
┌─────────────────────────────────────────┐
│ Championnat Basketball                   │
├─────────────────────────────────────────┤
│ [Équipes] [Matchs] [Classement]         │
├─────────────────────────────────────────┤
│                                         │
│ Pos │ Équipe      │J│G│N│P│BP│BC│Diff│Pts│
│ ────┼─────────────┼─┼─┼─┼─┼──┼──┼────┼───│
│  1  │🥇 Lakers    │8│7│1│0│95│72│+23│22 │
│  2  │🥈 Warriors  │8│6│0│2│88│78│+10│18 │
│  3  │🥉 Bulls     │8│5│2│1│82│75│ +7│17 │
│  4  │   Celtics   │8│4│1│3│79│81│ -2│13 │
│ ────┼─────────────┼─┼─┼─┼─┼──┼──┼────┼───│
│                                         │
│ 🔄 Dernière MàJ: il y a 2 min          │
└─────────────────────────────────────────┘
```

---

## 🚀 Plan de Développement Suggéré

### Phase 1 : Base de données et APIs

1. Migration Prisma pour les nouveaux modèles
2. APIs CRUD pour les matchs
3. API de tirage au sort
4. API de calcul de classement

### Phase 2 : MATCH Simple

1. Composant `MatchView` avec gestion scores
2. Interface intuitive pour l'organisateur
3. Validation et historique des actions

### Phase 3 : COUPE Tournoi

1. Générateur d'arbre de tournoi
2. Interface visuelle des brackets
3. Navigation par onglets
4. Tirage au sort automatique

### Phase 4 : CHAMPIONNAT

1. Système de classement automatique
2. Interface de gestion des journées
3. Onglet classement avec statistiques
4. Calculs automatiques (points, différentiel)

### Phase 5 : Améliorations

1. Notifications temps réel
2. Export des résultats
3. Statistiques avancées
4. Mode spectateur

---

## 🎯 Points Clés d'Innovation

1. **Arbre Visuel Intuitif** : Reproduction du design fourni pour les tournois
2. **Gestion Temps Réel** : Mise à jour instantanée des scores et classements
3. **Flexibilité** : Adaptation automatique selon le type d'événement
4. **UX Optimisée** : Interface tactile adaptée aux organisateurs sur terrain
5. **Évolutivité** : Architecture prête pour de futures fonctionnalités

---

## 🤔 Questions pour Validation

1. **Design** : Le design des brackets correspond-il à votre vision ? oui
2. **Contrôles de score** : Les boutons [-] [+1] [+2] [+3] conviennent-ils ? oui
3. **Règles automatiques** : L'arrêt automatique selon les règles vous convient ? oui
4. **Chronomètre** : Faut-il des alertes sonores/visuelles lors des fins de match ? ouii un coup de sifflet final
5. **Fonctionnalités** : Faut-il ajouter d'autres stats pour les championnats ? Non pas besoin pour l'instant
6. **Tirage au sort** : Manuel ou automatique par défaut ? auto toujours
7. **Permissions** : Seuls les organisateurs peuvent modifier les scores ? oui
8. **Notifications** : Alerts temps réel pour les participants ? oui ce serait super

---

**🎉 Prêt pour validation et développement !**

Cette proposition couvre tous vos besoins exprimés avec une architecture solide et évolutive. Validez les points qui vous conviennent et nous commencerons le développement étape par étape.
