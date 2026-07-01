export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ClientsPageClient from "@/components/clients/ClientsPageClient";
import type { ClientItem } from "@/types/client/ClientItem";
import { Suspense } from "react";

export default async function ClientesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) redirect("/login");

  const rows = await prisma.client.findMany({
    where: { userId },
    orderBy: [{ empresa: "asc" }, { name: "asc" }],
  });

  const clients: ClientItem[] = rows.map((row) => ({
    id: row.id,
    name: row.name ?? "",
    empresa: row.empresa ?? "",
    phone: row.phone ?? "",
    cep: row.cep ?? "",
    email: row.email ?? "",
    address: row.address ?? "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));

  return (
    <Suspense fallback={null}>
      <ClientsPageClient initialClients={clients} />
    </Suspense>
  );
}
