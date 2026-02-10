import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function creatServiceOrder(formData: any) {
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