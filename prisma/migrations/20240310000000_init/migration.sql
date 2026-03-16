-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('novo', 'aprovado', 'reprovado', 'pago', 'pronto', 'entregue', 'cancelado');

-- CreateTable
CREATE TABLE "ServiceOrder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "defects" TEXT NOT NULL,
    "defectsHistory" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'novo',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ServiceOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceOrder_id_key" ON "ServiceOrder"("id");
CREATE UNIQUE INDEX "ServiceOrder_serialNumber_key" ON "ServiceOrder"("serialNumber");
