import type { OrderStatus } from "@prisma/client";
import type { FormItem } from "@/types/Form-itens/FormItem";

/** Formato persistido de ServiceOrder (inclui clientId após migração). */
export type ServiceOrderRecord = {
  id: string;
  clientId?: string | null;
  name: string | null;
  empresa: string | null;
  phone: string | null;
  cep: string | null;
  email: string | null;
  address: string | null;
  aparelho: string | null;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  defects: string | null;
  defectsHistory: string | null;
  deviceImages: string[];
  deviceAudios: string[];
  price: number | null;
  status: OrderStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export function mapServiceOrderToFormItem(order: ServiceOrderRecord): FormItem {
  return {
    id: order.id,
    clientId: order.clientId ?? undefined,
    name: order.name ?? "",
    empresa: order.empresa ?? "",
    phone: order.phone ?? "",
    cep: order.cep ?? "",
    email: order.email ?? "",
    address: order.address ?? "",
    aparelho: order.aparelho ?? "",
    brand: order.brand ?? "",
    model: order.model ?? "",
    serialNumber: order.serialNumber ?? "",
    defects: order.defects ?? "",
    defectsHistory: order.defectsHistory ?? "",
    deviceImages: order.deviceImages?.length ? [...order.deviceImages] : [],
    deviceAudios: order.deviceAudios?.length ? [...order.deviceAudios] : [],
    price: order.price ?? undefined,
    status: order.status,
    createdAt: order.createdAt ?? undefined,
    updatedAt: order.updatedAt ?? undefined,
  };
}
