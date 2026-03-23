"use server";
import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { FormItem } from "@/types/Form-itens/FormItem";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function getCurrentUserId(): Promise<string> {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) throw new Error("Não autorizado.");
    return userId;
}

const orderStatusSchema = z.nativeEnum(OrderStatus);

const createServiceOrderSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    empresa: z.string().optional(),
    phone: z.string().optional(),
    cep: z.string().min(1, "CEP é obrigatório"),
    email: z
        .string()
        .email("E-mail inválido")
        .optional()
        .or(z.literal("")),
    address: z.string().optional(),
    aparelho: z.string().min(1, "Aparelho é obrigatório"),
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

const updateServiceOrderSchema = z.object({
    id: z.string().min(1, "Id é obrigatório"),
    name: z.string().min(1, "Nome é obrigatório"),
    empresa: z.string().optional(),
    phone: z.string().optional(),
    cep: z.string().min(1, "CEP é obrigatório"),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    address: z.string().optional(),
    aparelho: z.string().min(1, "Aparelho é obrigatório"),
    brand: z.string().optional(),
    model: z.string().optional(),
    serialNumber: z.string().optional(),
    defects: z.string().min(1, "Descrição do defeito é obrigatória"),
    defectsHistory: z.string().optional(),
    status: orderStatusSchema,
});

const updatePriceSchema = z.object({
    id: z.string().min(1, "Id é obrigatório"),
    price: z.number().min(0, "Preço deve ser maior ou igual a zero"),
});

const deleteServiceOrderSchema = z.object({
    id: z.string().min(1, "Id é obrigatório"),
});

export async function createServiceOrder(
    formData: Omit<FormItem, "id" | "createdAt" | "updatedAt">
) {
    const userId = await getCurrentUserId();

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
            userId,
        },
    });

    revalidatePath("/");

    return created as unknown as FormItem;
}

export async function updateServiceOrder(
    id: string,
    formData: Omit<FormItem, "id" | "createdAt" | "updatedAt">
) {
    const userId = await getCurrentUserId();

    const parseResult = updateServiceOrderSchema.safeParse({ id, ...formData });

    if (!parseResult.success) {
        const { fieldErrors, formErrors } = parseResult.error.flatten();
        throw new Error(
            JSON.stringify({
                message: "Falha na validação ao atualizar a ordem de serviço.",
                fieldErrors,
                formErrors,
            })
        );
    }

    const { id: orderId, ...data } = parseResult.data;

    const updated = await prisma.serviceOrder.update({
        where: { id: orderId, userId },
        data,
    });

    revalidatePath("/");
    return updated as unknown as FormItem;
}

export async function updateStatus(id: string, status: OrderStatus) {
    const userId = await getCurrentUserId();

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
            where: { id: parseResult.data.id, userId },
            data: { status: parseResult.data.status },
        });
    } catch {
        throw new Error("Erro ao atualizar o status da ordem de serviço.");
    }

    revalidatePath("/");
}

export async function deleteServiceOrder(id: string) {
    const userId = await getCurrentUserId();

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
            where: { id: parseResult.data.id, userId },
        });
    } catch {
        throw new Error("Erro ao excluir a ordem de serviço.");
    }

    revalidatePath("/");
}

export async function updatePrice(id: string, price: number) {
    const userId = await getCurrentUserId();

    const parseResult = updatePriceSchema.safeParse({ id, price });

    if (!parseResult.success) {
        const { fieldErrors, formErrors } = parseResult.error.flatten();
        throw new Error(
            JSON.stringify({
                message: "Falha na validação ao atualizar o preço.",
                fieldErrors,
                formErrors,
            })
        );
    }

    try {
        await prisma.$executeRaw`
            UPDATE "ServiceOrder"
            SET "price" = ${parseResult.data.price}
            WHERE "id" = ${parseResult.data.id}
            AND "userId" = ${userId}
        `;
    } catch {
        throw new Error("Erro ao atualizar o preço da ordem de serviço.");
    }

    revalidatePath("/");
}
