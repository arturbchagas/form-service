import { OrderStatus } from "@prisma/client"
export interface FormItem {
  id: string;
  clientId?: string;
  name?: string;
  empresa?: string;
  phone?: string;
  cep?: string;
  email?: string;
  address?: string;
  aparelho?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  defects?: string;
  defectsHistory?: string;
  /** Fotos do aparelho (data URLs), na ordem de exibição. */
  deviceImages?: string[];
  /** Áudios (data URLs), na ordem de exibição. */
  deviceAudios?: string[];
  price?: number;
  status: OrderStatus;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
