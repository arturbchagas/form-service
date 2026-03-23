"use client";
import { useState } from "react";
import styles from "../../app/page.module.css";
import FormService from "../form/FormService";
import TableService from "../Table/TableService";
import SearchBar from "../search/SearchBar";
import Modal from "../modal/Modal";
import { FormItem } from "../../types/Form-itens/FormItem";
import {
  createServiceOrder,
  updateStatus,
  updateServiceOrder,
  deleteServiceOrder,
  updatePrice,
} from "../../app/action";

interface HomeClientProps {
  initialItems: FormItem[];
}

export default function HomeClient({ initialItems }: HomeClientProps) {
  const [items, setItems] = useState<FormItem[]>(initialItems);
  const [searchValue, setSearchValue] = useState("");
  const [selectedItems, setSelectedItems] = useState<FormItem | null>(null);

  function handleStatusChange(status: FormItem["status"]) {
    if (!selectedItems) return;

    const currentId = selectedItems.id;

    setSelectedItems({ ...selectedItems, status });
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === currentId ? { ...item, status } : item
      )
    );

    updateStatus(currentId, status).catch((error) => {
      console.error("Erro ao atualizar status da ordem de serviço:", error);
    });
  }

  function handleView(item: FormItem) {
    setSelectedItems(item);
  }

  function handleCloseModal() {
    setSelectedItems(null);
  }

  async function handleDelete(item: FormItem) {
    if (!confirm(`Excluir a O.S. de "${item.name}"?`)) return;
    try {
      await deleteServiceOrder(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (error) {
      console.error("Erro ao excluir ordem de serviço:", error);
    }
  }

  async function handleUpdateItem(
    id: string,
    data: Omit<FormItem, "id" | "createdAt" | "updatedAt">
  ) {
    try {
      const updated = await updateServiceOrder(id, data);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } catch (error) {
      console.error("Erro ao atualizar ordem de serviço:", error);
    }
  }

  async function handleUpdatePrice(item: FormItem, price: number) {
    try {
      await updatePrice(item.id, price);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, price } : i))
      );
    } catch (error) {
      console.error("Erro ao atualizar preço:", error);
    }
  }

  async function handleAddItem(
    item: Omit<FormItem, "id" | "createdAt" | "updatedAt">
  ) {
    try {
      const created = await createServiceOrder(item);
      setItems((prev) => [created, ...prev]);
    } catch (error) {
      console.error("Erro ao criar ordem de serviço:", error);
    }
  }

  const searchLower = searchValue.trim().toLowerCase();

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const filteredItems = items.filter((item) => {
    if (!searchLower) return true;
    const matchesName = item.name.toLowerCase().includes(searchLower);
    const matchesEmpresa = (item.empresa ?? "").toLowerCase().includes(searchLower);
    const matchesAparelho = (item.aparelho ?? "").toLowerCase().includes(searchLower);
    const dateStr = formatDate(item.createdAt);
    const matchesDate = dateStr.includes(searchLower);
    return matchesName || matchesEmpresa || matchesAparelho || matchesDate;
  });

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <FormService onAddItem={handleAddItem} />
        <SearchBar value={searchValue} onChange={setSearchValue} />
        <div className={styles.tableSection}>
          <TableService
            items={filteredItems}
            onView={handleView}
            onEdit={handleUpdateItem}
            onDelete={handleDelete}
            onUpdatePrice={handleUpdatePrice}
          />
        </div>
        {selectedItems && (
          <Modal
            items={selectedItems}
            onChangeStatus={handleStatusChange}
            closeModal={handleCloseModal}
          />
        )}
      </main>
    </div>
  );
}
