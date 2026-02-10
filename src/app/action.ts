import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { FormItem } from "@/types/Form-itens/FormItem";

export async function createServiceOrder(formData: Omit<FormItem, 'id' | 'createdAt' | 'updatedAt'>) {
    await prisma.serviceOrder.create({ data: formData });
    revalidatePath("/");
}

export async function updateStatus(id: string, status: OrderStatus) {
    await prisma.serviceOrder.update({
        where: { id },
        data: { status: status }
    });
    revalidatePath("/");
} 