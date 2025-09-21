/*
  Warnings:

  - You are about to drop the `PDF` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."PDF" DROP CONSTRAINT "PDF_userId_fkey";

-- DropTable
DROP TABLE "public"."PDF";

-- CreateTable
CREATE TABLE "public"."uploadedPDF" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "uploadedPDF_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."uploadedPDF" ADD CONSTRAINT "uploadedPDF_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
