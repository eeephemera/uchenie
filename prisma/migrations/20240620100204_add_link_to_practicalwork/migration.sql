/*
  Warnings:

  - You are about to drop the column `LinkFile` on the `PracticalWork` table. All the data in the column will be lost.
  - You are about to drop the `FilePractical` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FilePractical" DROP CONSTRAINT "FilePractical_practicalWorkId_fkey";

-- AlterTable
ALTER TABLE "PracticalWork" DROP COLUMN "LinkFile",
ADD COLUMN     "Link" TEXT;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "description" TEXT NOT NULL;

-- DropTable
DROP TABLE "FilePractical";

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimetype" TEXT NOT NULL,
    "practicalWorkId" INTEGER NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_practicalWorkId_fkey" FOREIGN KEY ("practicalWorkId") REFERENCES "PracticalWork"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
