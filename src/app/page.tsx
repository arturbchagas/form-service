"use client";

import styles from "./page.module.css";
import FormService from "../components/form/FormService";
import { FormItem } from "../components/Form-itens/FormItem";
import { useState } from "react";
import TableService from "../components/Table/TableService";
export default function Home() {
  const [items, setItems] = useState<FormItem[]>([]);

  function handleAddItem(item: Omit<FormItem, "id">) {
    const newItem: FormItem = {
      id: items.length + 1,
      ...item,
    };
    setItems((prev) => [...prev, newItem]);
  }
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <FormService onAddItem={handleAddItem} />
        <TableService items={items} />
      </main>
    </div>
  );
}
