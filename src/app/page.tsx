export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import HomeClient from "../components/homeClient/HomeClient";
import { FormItem } from "../types/Form-itens/FormItem";
import { OrderStatus } from "@prisma/client";

interface ServiceOrderRow {
  id: string;
  name: string;
  empresa: string | null;
  phone: string | null;
  cep: string;
  email: string | null;
  address: string | null;
  aparelho: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  defects: string;
  defectsHistory: string | null;
  price: number | null;
  status: OrderStatus;
  userId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  if (!userId) redirect("/login");

  const serviceOrders = (await prisma.serviceOrder.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })) as unknown as ServiceOrderRow[];

  const items: FormItem[] = serviceOrders.map((order) => ({
    id: order.id,
    name: order.name,
    empresa: order.empresa ?? "",
    phone: order.phone ?? "",
    cep: order.cep ?? "",
    email: order.email ?? "",
    address: order.address ?? "",
    aparelho: order.aparelho ?? "",
    brand: order.brand ?? "",
    model: order.model ?? "",
    serialNumber: order.serialNumber ?? "",
    defects: order.defects,
    defectsHistory: order.defectsHistory ?? "",
    price: order.price ?? undefined,
    status: order.status,
    createdAt: order.createdAt ?? undefined,
    updatedAt: order.updatedAt ?? undefined,
  }));

  return <HomeClient initialItems={items} />;
}
