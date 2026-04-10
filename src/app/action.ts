"use server"; // Diretiva do Next.js: tudo neste arquivo roda exclusivamente no servidor, nunca no browser

import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { FormItem } from "@/types/Form-itens/FormItem";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Helper reutilizável: lê a sessão ativa e retorna o ID do usuário logado.
// Se não houver sessão (usuário não autenticado), lança erro imediatamente.
// Usado em TODAS as actions para garantir que só usuários logados operam.
async function getCurrentUserId(): Promise<string> {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) throw new Error("Não autorizado.");
    return userId;
}

// --- SCHEMAS DE VALIDAÇÃO (Zod) ---
// Zod valida os dados ANTES de qualquer operação no banco.
// Se um campo obrigatório vier vazio ou com formato errado, o erro é capturado aqui.

const orderStatusSchema = z.nativeEnum(OrderStatus); // Aceita apenas os valores do enum do banco

const createServiceOrderSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    empresa: z.string().optional(),
    phone: z.string().optional(),
    cep: z.string().min(1, "CEP é obrigatório"),
    email: z
        .string()
        .email("E-mail inválido")
        .optional()
        .or(z.literal("")), // Aceita e-mail válido OU string vazia
    address: z.string().optional(),
    aparelho: z.string().min(1, "Aparelho é obrigatório"),
    brand: z.string().optional(),
    model: z.string().optional(),
    serialNumber: z.string().optional(),
    defects: z.string().min(1, "Descrição do defeito é obrigatória"),
    defectsHistory: z.string().optional(),
    status: orderStatusSchema.default(OrderStatus.novo), // Status padrão ao criar
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

// --- CREATE ---
// Cria uma nova ordem de serviço associada ao usuário logado.
export async function createServiceOrder(
    formData: Omit<FormItem, "id" | "createdAt" | "updatedAt">
) {
    // 1. Verifica se há um usuário autenticado
    const userId = await getCurrentUserId();

    // 2. Valida os dados do formulário com o schema Zod
    const parseResult = createServiceOrderSchema.safeParse(formData);

    // 3. Se a validação falhar, lança erro com os campos problemáticos
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

    // 4. Insere no banco via Prisma, forçando status "novo" e vinculando ao userId
    const created = await prisma.serviceOrder.create({
        data: {
            ...validData,
            status: OrderStatus.novo, // Toda OS começa com status "novo"
            userId,                   // Liga a OS ao usuário que a criou
        },
    });

    // 5. Invalida o cache da página "/" para exibir a nova OS imediatamente
    revalidatePath("/");

    return created as unknown as FormItem;
}

// --- UPDATE (dados completos) ---
// Atualiza todos os campos de uma OS existente.
export async function updateServiceOrder(
    id: string,
    formData: Omit<FormItem, "id" | "createdAt" | "updatedAt">
) {
    // 1. Garante que o usuário está autenticado
    const userId = await getCurrentUserId();

    // 2. Valida os dados incluindo o id da OS
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

    // 3. Atualiza no banco filtrando por id E userId — impede que um usuário
    //    edite uma OS que não é dele (segurança extra além do middleware)
    const updated = await prisma.serviceOrder.update({
        where: { id: orderId, userId },
        data,
    });

    revalidatePath("/");
    return updated as unknown as FormItem;
}

// --- UPDATE STATUS ---
// Atualiza apenas o campo "status" de uma OS (ex: novo → aprovado → pago).
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
        // Atualiza só o campo status, filtrando também pelo userId
        await prisma.serviceOrder.update({
            where: { id: parseResult.data.id, userId },
            data: { status: parseResult.data.status },
        });
    } catch {
        throw new Error("Erro ao atualizar o status da ordem de serviço.");
    }

    revalidatePath("/");
}

// --- DELETE ---
// Remove permanentemente uma OS do banco.
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
        // Deleta filtrando por id E userId — um usuário só pode deletar suas próprias OS
        await prisma.serviceOrder.delete({
            where: { id: parseResult.data.id, userId },
        });
    } catch {
        throw new Error("Erro ao excluir a ordem de serviço.");
    }

    revalidatePath("/");
}

// --- UPDATE PRICE ---
// Atualiza apenas o campo "price" de uma OS.
// Usa $executeRaw (SQL direto) pois o campo price foi adicionado ao banco
// fora do fluxo padrão de migration do Prisma.
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
        // SQL parametrizado — os valores são passados como parâmetros (não concatenados),
        // o que previne SQL Injection
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
