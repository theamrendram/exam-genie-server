-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "clerkUserId" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "User_clerkUserId_idx" ON "public"."User"("clerkUserId");
