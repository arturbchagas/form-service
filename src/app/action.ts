"use server";
import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { FormItem } from "@/types/Form-itens/FormItem";
import { z } from "zod";

const orderStatusSchema = z.nativeEnum(OrderStatus);

const createServiceOrderSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),//campo obrigatório com pelo menos 1 caractere
    phone: z.string().optional(),
    email: z//campo opcional com email válido ou vazio
        .string()
        .email("E-mail inválido")
        .optional()
        .or(z.literal("")),
    address: z.string().optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    serialNumber: z.string().optional(),
    defects: z.string().min(1, "Descrição do defeito é obrigatória"),
    defectsHistory: z.string().optional(),
    status: orderStatusSchema.default(OrderStatus.novo),
});

const updateStatusSchema = z.object({
    id: z.string().min(1, "Id é obrigatório"),
    status: orderStatusSchema,
});

const deleteServiceOrderSchema = z.object({
    id: z.string().min(1, "Id é obrigatório"),
});

export async function createServiceOrder(
    formData: Omit<FormItem, "id" | "createdAt" | "updatedAt">
) {
    const parseResult = createServiceOrderSchema.safeParse(formData);

    if (!parseResult.success) {
        const { fieldErrors, formErrors } = parseResult.error.flatten();
        throw new Error(
            JSON.stringify({
                message: "Falha na validação dos dados da ordem de serviço.",
                fieldErrors,
                formErrors,
            })
        );
    }

    const validData = parseResult.data;

    const created = await prisma.serviceOrder.create({
        data: {
            ...validData,
            status: OrderStatus.novo,
        },
    });

    revalidatePath("/");

    return created as FormItem;
}

export async function updateStatus(id: string, status: OrderStatus) {
    const parseResult = updateStatusSchema.safeParse({ id, status });

    if (!parseResult.success) {
        const { fieldErrors, formErrors } = parseResult.error.flatten();
        throw new Error(
            JSON.stringify({
                message: "Falha na validação ao atualizar o status da ordem de serviço.",
                fieldErrors,
                formErrors,
            })
        );
    }

    try {
        await prisma.serviceOrder.update({
            where: { id: parseResult.data.id },
            data: { status: parseResult.data.status },
        });
    } catch {
        throw new Error("Erro ao atualizar o status da ordem de serviço.");
    }

    revalidatePath("/");
}

export async function deleteServiceOrder(id: string) {
    const parseResult = deleteServiceOrderSchema.safeParse({ id });

    if (!parseResult.success) {
        const { fieldErrors, formErrors } = parseResult.error.flatten();
        throw new Error(
            JSON.stringify({
                message: "Falha na validação ao excluir a ordem de serviço.",
                fieldErrors,
                formErrors,
            })
        );
    }

    try {
        await prisma.serviceOrder.delete({
            where: { id: parseResult.data.id },
        });
    } catch {
        throw new Error("Erro ao excluir a ordem de serviço.");
    }

    revalidatePath("/");
}