-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_projectName_fkey" FOREIGN KEY ("projectName") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
