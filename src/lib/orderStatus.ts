import { OrderStatus } from "@prisma/client";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.novo]: "Novo",
  [OrderStatus.aguardando_autorizacao]: "Aguardando autorização",
  [OrderStatus.aprovado]: "Aprovado",
  [OrderStatus.reprovado]: "Reprovado",
  [OrderStatus.pronto]: "Pronto",
  [OrderStatus.entregue]: "Entregue",
  [OrderStatus.cancelado]: "Cancelado",
};

export const ORDER_STATUS_ORDER: OrderStatus[] = [
  OrderStatus.novo,
  OrderStatus.aguardando_autorizacao,
  OrderStatus.aprovado,
  OrderStatus.reprovado,
  OrderStatus.pronto,
  OrderStatus.entregue,
  OrderStatus.cancelado,
];

export const ORDER_STATUS_OPTIONS = ORDER_STATUS_ORDER.map((value) => ({
  value,
  label: ORDER_STATUS_LABELS[value],
}));

export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

/** Status que ainda exigem ação (bolinha com pulso no badge). */
export const ORDER_STATUS_PENDING = new Set<OrderStatus>([
  OrderStatus.novo,
  OrderStatus.aguardando_autorizacao,
]);
