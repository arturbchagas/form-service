// force-dynamic: impede que o Next.js renderize esta página durante o build.
// Como ela mostra dados ao vivo do banco, precisa ser renderizada a cada requisição.
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import HomeClient from "../components/homeClient/HomeClient";
import { FormItem } from "../types/Form-itens/FormItem";
import { OrderStatus } from "@prisma/client";

// Tipo que representa uma linha do banco como o Prisma retorna
interface ServiceOrderRow {
  id: string;
  name: string | null;
  empresa: string | null;
  phone: string | null;
  cep: string | null;
  email: string | null;
  address: string | null;
  aparelho: string | null;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  defects: string | null;
  defectsHistory: string | null;
  deviceImages: string[];
  deviceAudios: string[];
  price: number | null;
  status: OrderStatus;
  userId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// Este é um SERVER COMPONENT — roda no servidor, tem acesso direto ao banco.
// O usuário nunca vê este código, apenas o HTML resultante.
export default async function Home() {
  // 1. Lê a sessão do usuário logado no servidor
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  // 2. Se não estiver logado, redireciona para /login antes de qualquer coisa
  if (!userId) redirect("/login");

  // 3. Busca APENAS as ordens do usuário logado, ordenadas da mais recente para a mais antiga
  const serviceOrders = (await prisma.serviceOrder.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })) as unknown as ServiceOrderRow[];

  // 4. Transforma os dados do banco no formato que o componente espera (FormItem),
  //    substituindo null por string vazia ou undefined onde necessário
  const items: FormItem[] = serviceOrders.map((order) => ({
    id: order.id,
    name: order.name ?? "",
    empresa: order.empresa ?? "",
    phone: order.phone ?? "",
    cep: order.cep ?? "",
    email: order.email ?? "",
    address: order.address ?? "",
    aparelho: order.aparelho ?? "",
    brand: order.brand ?? "",
    model: order.model ?? "",
    serialNumber: order.serialNumber ?? "",
    defects: order.defects ?? "",
    defectsHistory: order.defectsHistory ?? "",
    deviceImages: order.deviceImages?.length ? [...order.deviceImages] : [],
    deviceAudios: order.deviceAudios?.length ? [...order.deviceAudios] : [],
    price: order.price ?? undefined,
    status: order.status,
    createdAt: order.createdAt ?? undefined,
    updatedAt: order.updatedAt ?? undefined,
  }));

  // 5. Passa os dados para o Client Component que gerencia toda a interatividade
  return <HomeClient initialItems={items} />;
}
