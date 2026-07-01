"use server"; // Diretiva do Next.js: tudo neste arquivo roda exclusivamente no servidor, nunca no browser

import prisma from "@/lib/prisma";
import { OrderStatus, Prisma } from "@prisma/client";
import { getClientForCurrentUser } from "@/app/actions/clients";
import {
  mapServiceOrderToFormItem,
  type ServiceOrderRecord,
} from "@/lib/mappers/serviceOrder";
import { revalidatePath } from "next/cache";
import { FormItem } from "@/types/Form-itens/FormItem";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/server-auth";
import {
    MAX_DEVICE_IMAGES,
    MAX_DATA_URL_LENGTH,
    MAX_DEVICE_IMAGES_TOTAL_BYTES,
    getDeviceImagesTotalBytes,
    formatImageBytes,
} from "@/lib/readImageDataUrls";
import {
    MAX_DEVICE_AUDIOS,
    MAX_AUDIO_DATA_URL_LENGTH,
    MAX_DEVICE_AUDIOS_TOTAL_BYTES,
    getAudiosTotalBytes,
} from "@/lib/formMedia";
import type { CreateServiceOrderInput } from "@/types/service/ServiceOrderInput";

// Converte string vazia ou só espaços em null para persistência no PostgreSQL.
function emptyToNull(value: string | undefined | null): string | null {
    if (value == null) return null;
    const t = value.trim();
    return t === "" ? null : t;
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
    .array(z.string().max(MAX_DATA_URL_LENGTH))
    .max(MAX_DEVICE_IMAGES)
    .optional()
    .default([])
    .refine(
        (images) => getDeviceImagesTotalBytes(images) <= MAX_DEVICE_IMAGES_TOTAL_BYTES,
        {
            message: `O total das imagens não pode ultrapassar ${formatImageBytes(MAX_DEVICE_IMAGES_TOTAL_BYTES)}.`,
        }
    );

const deviceAudiosSchema = z
    .array(z.string().max(MAX_AUDIO_DATA_URL_LENGTH))
    .max(MAX_DEVICE_AUDIOS)
    .optional()
    .default([])
    .refine(
        (audios) =>
            getAudiosTotalBytes([], audios) <= MAX_DEVICE_AUDIOS_TOTAL_BYTES,
        {
            message: `O total dos áudios não pode ultrapassar ${formatImageBytes(MAX_DEVICE_AUDIOS_TOTAL_BYTES)}.`,
        }
    );

const looseOptionalString = z.coerce.string();

const createServiceOrderSchema = z.object({
    clientId: z.string().min(1, "Cliente é obrigatório"),
    aparelho: looseOptionalString.max(500),
    brand: looseOptionalString,
    model: looseOptionalString,
    serialNumber: looseOptionalString,
    defects: looseOptionalString.max(10_000),
    defectsHistory: looseOptionalString,
    deviceImages: deviceImagesSchema,
    deviceAudios: deviceAudiosSchema,
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
    deviceAudios: deviceAudiosSchema,
    status: orderStatusSchema,
});

const updatePriceSchema = z.object({
    id: z.string().min(1, "Id é obrigatório"),
    price: z.number().min(0, "Preço deve ser maior ou igual a zero"),
});

const deleteServiceOrderSchema = z.object({
    id: z.string().min(1, "Id é obrigatório"),
});

type ServiceOrderDeviceFields = {
    aparelho: string;
    brand: string;
    model: string;
    serialNumber: string;
    defects: string;
    defectsHistory: string;
    deviceImages: string[];
    deviceAudios: string[];
};

function serviceFieldsForPrisma(fields: ServiceOrderDeviceFields) {
    return {
        aparelho: emptyToNull(fields.aparelho),
        brand: emptyToNull(fields.brand),
        model: emptyToNull(fields.model),
        serialNumber: emptyToNull(fields.serialNumber),
        defects: emptyToNull(fields.defects),
        defectsHistory: emptyToNull(fields.defectsHistory),
        deviceImages: fields.deviceImages,
        deviceAudios: fields.deviceAudios,
    };
}

function mapOrderToFormItem(order: ServiceOrderRecord) {
  return mapServiceOrderToFormItem(order);
}

// --- CREATE ---
// Cria uma nova ordem de serviço vinculada a um cliente cadastrado.
export async function createServiceOrder(formData: CreateServiceOrderInput) {
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

    const client = await getClientForCurrentUser(validData.clientId);

    const { status, clientId, ...serviceRest } = validData;
    void status;

    const created = await prisma.serviceOrder.create({
        data: {
            clientId,
            name: emptyToNull(client.name),
            empresa: emptyToNull(client.empresa),
            phone: emptyToNull(client.phone),
            cep: emptyToNull(client.cep),
            email: emptyToNull(client.email),
            address: emptyToNull(client.address),
            ...serviceFieldsForPrisma({
                ...serviceRest,
                deviceImages: validData.deviceImages ?? [],
                deviceAudios: validData.deviceAudios ?? [],
            }),
            status: OrderStatus.novo,
            userId,
        } as Prisma.ServiceOrderUncheckedCreateInput,
    });

    revalidatePath("/");

    return mapOrderToFormItem(created as unknown as ServiceOrderRecord);
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
            name: emptyToNull(rest.name),
            empresa: emptyToNull(rest.empresa),
            phone: emptyToNull(rest.phone),
            cep: emptyToNull(rest.cep),
            email: emptyToNull(rest.email),
            address: emptyToNull(rest.address),
            ...serviceFieldsForPrisma({
                aparelho: rest.aparelho,
                brand: rest.brand,
                model: rest.model,
                serialNumber: rest.serialNumber,
                defects: rest.defects,
                defectsHistory: rest.defectsHistory,
                deviceImages: rest.deviceImages ?? [],
                deviceAudios: rest.deviceAudios ?? [],
            }),
            status,
        } as Prisma.ServiceOrderUncheckedUpdateInput,
    });

    revalidatePath("/");
    return mapOrderToFormItem(updated as unknown as ServiceOrderRecord);
}

// --- UPDATE STATUS ---
// Atualiza apenas o campo "status" de uma OS (ex: novo → aguardando autorização → aprovado).
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
