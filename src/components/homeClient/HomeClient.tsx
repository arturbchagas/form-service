"use client";
import { useState } from "react";
import styles from "../../app/page.module.css";
import FormService from "../form/FormService";
import TableService from "../Table/TableService";
import SearchBar from "../search/SearchBar";
import Modal from "../modal/Modal";
import { FormItem } from "../../types/Form-itens/FormItem";
import { createServiceOrder, updateStatus } from "../../app/action";

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

  function handleSelectedItems(item: FormItem) {
    setSelectedItems(item);
  }

  function handleCloseModal() {
    setSelectedItems(null);
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

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <FormService onAddItem={handleAddItem} />
        <SearchBar value={searchValue} onChange={setSearchValue} />
        <TableService
          onSelectedItems={handleSelectedItems}
          items={filteredItems}
        />
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

