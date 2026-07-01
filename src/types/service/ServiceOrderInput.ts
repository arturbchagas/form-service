import { OrderStatus } from "@prisma/client";

/** Payload para criar O.S. — cliente obrigatório; campos de aparelho opcionais. */
export type CreateServiceOrderInput = {
  clientId: string;
  aparelho?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  defects?: string;
  defectsHistory?: string;
  deviceImages?: string[];
  deviceAudios?: string[];
  status: OrderStatus;
};
