export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import HomeClient from "../components/homeClient/HomeClient";
import { FormItem } from "../types/Form-itens/FormItem";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  if (!userId) redirect("/login");

  const serviceOrders = await prisma.serviceOrder.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const items: FormItem[] = serviceOrders.map((order) => ({
    id: order.id,
    name: order.name,
    phone: order.phone ?? "",
    email: order.email ?? "",
    address: order.address ?? "",
    brand: order.brand ?? "",
    model: order.model ?? "",
    serialNumber: order.serialNumber ?? "",
    defects: order.defects,
    defectsHistory: order.defectsHistory ?? "",
    status: order.status,
    createdAt: order.createdAt ?? undefined,
    updatedAt: order.updatedAt ?? undefined,
  }));

  return <HomeClient initialItems={items} />;
}
