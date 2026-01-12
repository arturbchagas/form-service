"use client";
import { useState } from "react";
import { FormItem } from "../Form-itens/FormItem";
import styles from "./TableService.module.css";
interface UserTableProps {
  items: FormItem[];
}
export default function TableService({ items }: UserTableProps) {
  if (!items || items.length === 0) {
    return <p>Nenhum item para exibir.</p>;
  }
  return (
    <div>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tr}>
            <th className={styles.th}>Nome</th>
            <th className={styles.th}>Telefone</th>
            <th className={styles.th}>Endereço</th>
            <th className={styles.th}>Marca</th>
            <th className={styles.th}>Modelo</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr className={styles.tr} key={item.id}>
              <td className={styles.td}>{item.name}</td>
              <td className={styles.td}>{item.phone}</td>
              <td className={styles.td}>{item.address}</td>
              <td className={styles.td}>{item.brand}</td>
              <td className={styles.td}>{item.model}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
