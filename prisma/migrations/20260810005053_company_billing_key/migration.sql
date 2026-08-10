-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "autoRenew" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "billingCustomerKey" TEXT,
ADD COLUMN     "billingKey" TEXT;
