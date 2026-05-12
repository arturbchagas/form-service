"use server"; // Diretiva do Next.js: tudo neste arquivo roda exclusivamente no servidor, nunca no browser

import prisma from "@/lib/prisma";
import { OrderStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { FormItem } from "@/types/Form-itens/FormItem";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { MAX_DEVICE_IMAGES } from "@/lib/readImageDataUrls";

// Converte string vazia ou só espaços em null para persistência no PostgreSQL.
function emptyToNull(value: string | undefined | null): string | null {
    if (value == null) return null;
    const t = value.trim();
    return t === "" ? null : t;
}

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

const optionalEmail = z.string().refine(
    (s) => s.trim() === "" || z.string().email().safeParse(s.trim()).success,
    { message: "E-mail inválido" }
);

const deviceImagesSchema = z
    .array(z.string().max(6_000_000))
    .max(MAX_DEVICE_IMAGES)
    .optional()
    .default([]);

const looseOptionalString = z.coerce.string();

const createServiceOrderSchema = z.object({
    name: looseOptionalString.max(500),
    empresa: looseOptionalString,
    phone: looseOptionalString,
    cep: looseOptionalString.max(20),
    email: optionalEmail,
    address: looseOptionalString,
    aparelho: looseOptionalString.max(500),
    brand: looseOptionalString,
    model: looseOptionalString,
    serialNumber: looseOptionalString,
    defects: looseOptionalString.max(10_000),
    defectsHistory: looseOptionalString,
    deviceImages: deviceImagesSchema,
    status: orderStatusSchema.default(OrderStatus.novo),
});

const updateStatusSchema = z.object({
    id: z.string().min(1, "Id é obrigatório"),
    status: orderStatusSchema,
});

const updateServiceOrderSchema = z.object({
    id: z.string().min(1, "Id é obrigatório"),
    name: looseOptionalString.max(500),
    empresa: looseOptionalString,
    phone: looseOptionalString,
    cep: looseOptionalString.max(20),
    email: optionalEmail,
    address: looseOptionalString,
    aparelho: looseOptionalString.max(500),
    brand: looseOptionalString,
    model: looseOptionalString,
    serialNumber: looseOptionalString,
    defects: looseOptionalString.max(10_000),
    defectsHistory: looseOptionalString,
    deviceImages: deviceImagesSchema,
    status: orderStatusSchema,
});

const updatePriceSchema = z.object({
    id: z.string().min(1, "Id é obrigatório"),
    price: z.number().min(0, "Preço deve ser maior ou igual a zero"),
});

const deleteServiceOrderSchema = z.object({
    id: z.string().min(1, "Id é obrigatório"),
});

type OrderFormFields = {
    name: string;
    empresa: string;
    phone: string;
    cep: string;
    email: string;
    address: string;
    aparelho: string;
    brand: string;
    model: string;
    serialNumber: string;
    defects: string;
    defectsHistory: string;
    deviceImages: string[];
};

function orderFieldsForPrisma(fields: OrderFormFields) {
    return {
        name: emptyToNull(fields.name),
        empresa: emptyToNull(fields.empresa),
        phone: emptyToNull(fields.phone),
        cep: emptyToNull(fields.cep),
        email: emptyToNull(fields.email),
        address: emptyToNull(fields.address),
        aparelho: emptyToNull(fields.aparelho),
        brand: emptyToNull(fields.brand),
        model: emptyToNull(fields.model),
        serialNumber: emptyToNull(fields.serialNumber),
        defects: emptyToNull(fields.defects),
        defectsHistory: emptyToNull(fields.defectsHistory),
        deviceImages: fields.deviceImages,
    };
}

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

    const { status, ...rest } = validData;
    void status;

    // 4. Insere no banco via Prisma, forçando status "novo" e vinculando ao userId
    const created = await prisma.serviceOrder.create({
        data: {
            ...orderFieldsForPrisma({
                ...rest,
                deviceImages: validData.deviceImages ?? [],
            }),
            status: OrderStatus.novo, // Toda OS começa com status "novo"
            userId,                   // Liga a OS ao usuário que a criou
        } as Prisma.ServiceOrderUncheckedCreateInput,
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

    const { id: orderId, status, ...rest } = parseResult.data;

    // 3. Atualiza no banco filtrando por id E userId — impede que um usuário
    //    edite uma OS que não é dele (segurança extra além do middleware)
    const updated = await prisma.serviceOrder.update({
        where: { id: orderId, userId },
        data: {
            ...orderFieldsForPrisma({
                ...rest,
                deviceImages: rest.deviceImages ?? [],
            }),
            status,
        } as Prisma.ServiceOrderUncheckedUpdateInput,
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
