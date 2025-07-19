-- CreateTable
CREATE TABLE "Project" (
    "projectName" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "username" TEXT,
    "createdAt" TIMESTAMP(3),
    "lastModified" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_projectName_key" ON "Project"("projectName");
