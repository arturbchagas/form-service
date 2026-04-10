import { OrderStatus } from "@prisma/client"
export interface FormItem {
  id: string;
  name: string;
  empresa?: string;
  phone?: string;
  cep: string;
  email?: string;
  address?: string;
  aparelho: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  defects: string;
  defectsHistory?: string;
  price?: number;
  status: OrderStatus;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
