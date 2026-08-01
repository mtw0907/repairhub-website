-- AlterTable
ALTER TABLE "Company" ADD COLUMN "seoDescription" TEXT;

-- CreateTable
CREATE TABLE "SeoPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "introText" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "SeoPage_type_idx" ON "SeoPage"("type");

-- CreateIndex
CREATE UNIQUE INDEX "SeoPage_type_keyword_key" ON "SeoPage"("type", "keyword");
