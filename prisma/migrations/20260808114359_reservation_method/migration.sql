-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "method" TEXT NOT NULL DEFAULT 'VISIT',
ADD COLUMN     "visitAddress" TEXT;
