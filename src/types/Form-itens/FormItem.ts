import { OrderStatus } from "@prisma/client"
export interface FormItem {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  defects: string;
  defectsHistory?: string;
  status: OrderStatus;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
