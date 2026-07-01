// force-dynamic: impede que o Next.js renderize esta página durante o build.
// Como ela mostra dados ao vivo do banco, precisa ser renderizada a cada requisição.
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { listClients } from "@/app/actions/clients";
import HomeClient from "../components/homeClient/HomeClient";
import {
  mapServiceOrderToFormItem,
  type ServiceOrderRecord,
} from "@/lib/mappers/serviceOrder";

// Este é um SERVER COMPONENT — roda no servidor, tem acesso direto ao banco.
// O usuário nunca vê este código, apenas o HTML resultante.
export default async function Home() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  if (!userId) redirect("/login");

  const [serviceOrders, clients] = await Promise.all([
    prisma.serviceOrder.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    listClients(),
  ]);

  const items = serviceOrders.map((order) =>
    mapServiceOrderToFormItem(order as unknown as ServiceOrderRecord)
  );

  return <HomeClient initialItems={items} initialClients={clients} />;
}
