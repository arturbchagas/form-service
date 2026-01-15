"use client";
import { FormItem } from "../../types/Form-itens/FormItem";
import styles from "./Modal.module.css";
interface UserModalProps {
  items: FormItem;
  closeModal: () => void;
}
export default function Modal({ items, closeModal }: UserModalProps) {
  return (
    <div className={styles.modal}>
      <div className={styles.modal_content}>
        <button className={styles.close} onClick={closeModal}>
          <span>&times;</span>
        </button>

        <div key={items.id} className={styles.modal_body}>
          <h2>{items.name}</h2>
          <p>Telefone: {items.phone}</p>
          <p>E-mail: {items.email}</p>
          <p>Endereço: {items.address}</p>
          <p>Marca: {items.brand}</p>
          <p>Modelo: {items.model}</p>
          <p>Número de série: {items.serialNumber}</p>
          <p>Defeitos: {items.defects}</p>
          <p>Histórico de defeitos: {items.defectsHistory}</p>
        </div>
      </div>
    </div>
  );
}
