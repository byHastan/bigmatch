-- CreateEnum
CREATE TYPE "public"."MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED', 'WALKOVER');

-- CreateTable
CREATE TABLE "public"."match" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "teamAId" TEXT,
    "teamBId" TEXT,
    "round" INTEGER,
    "position" INTEGER,
    "status" "public"."MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scoreA" INTEGER DEFAULT 0,
    "scoreB" INTEGER DEFAULT 0,
    "winnerId" TEXT,
    "parentMatchId" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."team_ranking" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "played" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "goalsFor" INTEGER NOT NULL DEFAULT 0,
    "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
    "goalDiff" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_ranking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "team_ranking_teamId_key" ON "public"."team_ranking"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "team_ranking_eventId_teamId_key" ON "public"."team_ranking"("eventId", "teamId");

-- AddForeignKey
ALTER TABLE "public"."match" ADD CONSTRAINT "match_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."match" ADD CONSTRAINT "match_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "public"."team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."match" ADD CONSTRAINT "match_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "public"."team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."match" ADD CONSTRAINT "match_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "public"."team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."match" ADD CONSTRAINT "match_parentMatchId_fkey" FOREIGN KEY ("parentMatchId") REFERENCES "public"."match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_ranking" ADD CONSTRAINT "team_ranking_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_ranking" ADD CONSTRAINT "team_ranking_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
