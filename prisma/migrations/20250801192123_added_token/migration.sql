-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "githubVerified" BOOLEAN NOT NULL DEFAULT false;
