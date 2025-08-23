/*
  Warnings:

  - The `status` column on the `event` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "public"."event" DROP COLUMN "status",
ADD COLUMN     "status" "public"."EventStatus" NOT NULL DEFAULT 'DRAFT';
