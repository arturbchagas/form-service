-- Registros com "cancelado" passam para "reprovado" antes de remover o valor do enum
UPDATE "ServiceOrder" SET status = 'reprovado' WHERE status = 'cancelado';

-- Recria o enum sem "cancelado"
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
CREATE TYPE "OrderStatus" AS ENUM (
  'novo',
  'aguardando_autorizacao',
  'aprovado',
  'reprovado',
  'pronto',
  'entregue'
);
ALTER TABLE "ServiceOrder" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ServiceOrder"
  ALTER COLUMN "status" TYPE "OrderStatus"
  USING ("status"::text::"OrderStatus");
ALTER TABLE "ServiceOrder" ALTER COLUMN "status" SET DEFAULT 'novo';
DROP TYPE "OrderStatus_old";
