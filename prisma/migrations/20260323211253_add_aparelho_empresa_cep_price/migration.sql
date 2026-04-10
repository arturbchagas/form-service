/*
  Warnings:

  - Added the required column `aparelho` to the `ServiceOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cep` to the `ServiceOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ServiceOrder" ADD COLUMN     "aparelho" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "cep" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "empresa" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION;

-- Remove defaults after backfill so new rows must supply values
ALTER TABLE "ServiceOrder" ALTER COLUMN "aparelho" DROP DEFAULT;
ALTER TABLE "ServiceOrder" ALTER COLUMN "cep" DROP DEFAULT;
