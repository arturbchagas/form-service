"use client";

import styles from "./page.module.css";
import FormService from "../components/form/FormService";
import { FormItem } from "../types/Form-itens/FormItem";
import { useState } from "react";
import TableService from "../components/Table/TableService";
import SearchBar from "../components/search/SearchBar";
import Modal from "@/components/modal/Modal";

export default function Home() {
  const [items, setItems] = useState<FormItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedItems, setSelectedItems] = useState<FormItem | null>(null);
  const [newStatus, setNewStatus] = useState<FormItem['status']>("novo");
  
  
  function handleStatusChange( status: FormItem['status']) {
    if (selectedItems) {
      setSelectedItems({...selectedItems, status:status})
    }
    setItems((prevItems) => prevItems.map((item)=> 
      item.id === selectedItems?.id ? {...item, status:status} : item
    ))
    setNewStatus(status);
  }
  function handleSelectedItems(items: FormItem) {
    setSelectedItems(items);

  }
  function handleCloseModal() {
    setSelectedItems(null);
  }

  function handleAddItem(item: Omit<FormItem, "id" | "status">) {
    const newItem: FormItem = {
      status: newStatus,
      id: items.length + 1,
      ...item,
    };
    setItems((prev) => [...prev, newItem]);
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
          <Modal items={selectedItems} onChangeStatus={handleStatusChange} closeModal={handleCloseModal} />
        )}
      </main>
    </div>
  );
}
