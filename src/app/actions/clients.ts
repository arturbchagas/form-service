"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/server-auth";
import type { ClientFormValues, ClientItem } from "@/types/client/ClientItem";

function emptyToNull(value: string | undefined | null): string | null {
  if (value == null) return null;
  const t = value.trim();
  return t === "" ? null : t;
}

const optionalEmail = z.string().refine(
  (s) => s.trim() === "" || z.string().email().safeParse(s.trim()).success,
  { message: "E-mail inválido" }
);

const looseOptionalString = z.coerce.string();

const clientFormSchema = z.object({
  name: looseOptionalString.max(500),
  empresa: looseOptionalString,
  phone: looseOptionalString,
  cep: looseOptionalString.max(20),
  email: optionalEmail,
  address: looseOptionalString,
});

function mapClientRow(row: {
  id: string;
  name: string | null;
  empresa: string | null;
  phone: string | null;
  cep: string | null;
  email: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ClientItem {
  return {
    id: row.id,
    name: row.name ?? "",
    empresa: row.empresa ?? "",
    phone: row.phone ?? "",
    cep: row.cep ?? "",
    email: row.email ?? "",
    address: row.address ?? "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function clientFieldsForPrisma(fields: ClientFormValues) {
  return {
    name: emptyToNull(fields.name),
    empresa: emptyToNull(fields.empresa),
    phone: emptyToNull(fields.phone),
    cep: emptyToNull(fields.cep),
    email: emptyToNull(fields.email),
    address: emptyToNull(fields.address),
  };
}

export async function listClients(): Promise<ClientItem[]> {
  const userId = await getCurrentUserId();
  const rows = await prisma.client.findMany({
    where: { userId },
    orderBy: [{ empresa: "asc" }, { name: "asc" }],
  });
  return rows.map(mapClientRow);
}

/** Busca cliente do usuário logado; lança se não existir. */
export async function getClientForCurrentUser(clientId: string): Promise<ClientItem> {
  const userId = await getCurrentUserId();
  const row = await prisma.client.findFirst({
    where: { id: clientId, userId },
  });
  if (!row) {
    throw new Error("Cliente não encontrado ou não pertence ao usuário.");
  }
  return mapClientRow(row);
}

export async function createClient(formData: ClientFormValues): Promise<ClientItem> {
  const userId = await getCurrentUserId();
  const parseResult = clientFormSchema.safeParse(formData);

  if (!parseResult.success) {
    const { fieldErrors, formErrors } = parseResult.error.flatten();
    throw new Error(
      JSON.stringify({
        message: "Falha na validação dos dados do cliente.",
        fieldErrors,
        formErrors,
      })
    );
  }

  const created = await prisma.client.create({
    data: {
      ...clientFieldsForPrisma(parseResult.data),
      userId,
    },
  });

  revalidatePath("/");
  revalidatePath("/clientes");

  return mapClientRow(created);
}

export async function updateClient(
  id: string,
  formData: ClientFormValues
): Promise<ClientItem> {
  const userId = await getCurrentUserId();
  const parseResult = clientFormSchema.safeParse(formData);

  if (!parseResult.success) {
    const { fieldErrors, formErrors } = parseResult.error.flatten();
    throw new Error(
      JSON.stringify({
        message: "Falha na validação ao atualizar o cliente.",
        fieldErrors,
        formErrors,
      })
    );
  }

  const updated = await prisma.client.update({
    where: { id, userId },
    data: clientFieldsForPrisma(parseResult.data),
  });

  revalidatePath("/clientes");
  revalidatePath("/");

  return mapClientRow(updated);
}

export async function deleteClient(id: string): Promise<void> {
  const userId = await getCurrentUserId();

  const ordersCount = await prisma.serviceOrder.count({
    where: { clientId: id, userId },
  });

  if (ordersCount > 0) {
    throw new Error(
      "Não é possível excluir um cliente com ordens de serviço vinculadas."
    );
  }

  await prisma.client.delete({
    where: { id, userId },
  });

  revalidatePath("/clientes");
  revalidatePath("/");
}
