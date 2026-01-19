"use client";
import { FormItem } from "../../types/Form-itens/FormItem";
import styles from "./Modal.module.css";
interface UserModalProps {
  items: FormItem;
  closeModal: () => void;
  onChangeStatus: (status: FormItem['status']) => void;
}
export default function Modal({ items, closeModal, onChangeStatus }: UserModalProps) {


  return (
    <div className={styles.modal}>
      <div className={styles.modal_content}>
        <button className={styles.close} onClick={closeModal}>
          <span>&times;</span>
        </button>

        <div key={items.id} className={styles.modal_body}>
          <div>
            <select value={items.status} onChange={(e) => onChangeStatus(e.target.value as FormItem['status'])}>
              <option value="novo">Novo</option>
              <option value="aprovado">Aprovado</option>
              <option value="reprovado">Reprovado</option>
              <option value="pago">Pago</option>
              <option value="pronto">Pronto</option>
              <option value="entregue">Entregue</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div>
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
    </div>
  );
}
