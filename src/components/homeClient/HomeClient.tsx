"use client";
import { useState } from "react";
import styles from "../../app/page.module.css";
import FormService from "../form/FormService";
import TableService from "../Table/TableService";
import SearchBar from "../search/SearchBar";
import Modal from "../modal/Modal";
import { FormItem } from "../../types/Form-itens/FormItem";
import { createServiceOrder, updateStatus, updateServiceOrder, deleteServiceOrder } from "../../app/action";

interface HomeClientProps {
  initialItems: FormItem[];
}

export default function HomeClient({ initialItems }: HomeClientProps) {
  const [items, setItems] = useState<FormItem[]>(initialItems);
  const [searchValue, setSearchValue] = useState("");
  const [selectedItems, setSelectedItems] = useState<FormItem | null>(null);
  const [itemToEdit, setItemToEdit] = useState<FormItem | null>(null);

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

  function handleSelectedItems(item: FormItem) {
    setSelectedItems(item);
  }

  function handleCloseModal() {
    setSelectedItems(null);
  }

  function handleEdit() {
    if (selectedItems) {
      setItemToEdit(selectedItems);
      setSelectedItems(null);
    }
  }

  async function handleDelete() {
    if (!selectedItems) return;
    const id = selectedItems.id;
    try {
      await deleteServiceOrder(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedItems(null);
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
      setItemToEdit(null);
    } catch (error) {
      console.error("Erro ao atualizar ordem de serviço:", error);
    }
  }

  async function handleAddItem(
    item: Omit<FormItem, "id" | "createdAt" | "updatedAt">
  ) {
    try {
      const created = await createServiceOrder(item);
      setItems((prev) => [...prev, created]);
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
    const dateStr = formatDate(item.createdAt);
    const matchesDate = dateStr.includes(searchLower);
    return matchesName || matchesDate;
  });

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <FormService
          onAddItem={handleAddItem}
          itemToEdit={itemToEdit}
          onUpdateItem={handleUpdateItem}
          onEditDone={() => setItemToEdit(null)}
        />
        <SearchBar value={searchValue} onChange={setSearchValue} />
        <div className={styles.tableSection}>
          <TableService
            onSelectedItems={handleSelectedItems}
            items={filteredItems}
          />
        </div>
        {selectedItems && (
          <Modal
            items={selectedItems}
            onChangeStatus={handleStatusChange}
            closeModal={handleCloseModal}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}

