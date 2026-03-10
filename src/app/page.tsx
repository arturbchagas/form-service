import prisma from "@/lib/prisma";
import HomeClient from "../components/homeClient/HomeClient";
import { FormItem } from "../types/Form-itens/FormItem";

export default async function Home() {
  const serviceOrders = await prisma.serviceOrder.findMany({
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
