-- Adiciona o novo status após "novo"
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'aguardando_autorizacao' AFTER 'novo';

-- Registros com "pago" passam para "aprovado" antes de remover o valor do enum
UPDATE "ServiceOrder" SET status = 'aprovado' WHERE status = 'pago';

-- Recria o enum sem "pago"
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
CREATE TYPE "OrderStatus" AS ENUM (
  'novo',
  'aguardando_autorizacao',
  'aprovado',
  'reprovado',
  'pronto',
  'entregue',
  'cancelado'
);
ALTER TABLE "ServiceOrder" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ServiceOrder"
  ALTER COLUMN "status" TYPE "OrderStatus"
  USING ("status"::text::"OrderStatus");
ALTER TABLE "ServiceOrder" ALTER COLUMN "status" SET DEFAULT 'novo';
DROP TYPE "OrderStatus_old";
