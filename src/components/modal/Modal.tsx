"use client";
import { FormItem } from "../../types/Form-itens/FormItem";
import styles from "./Modal.module.css";
interface UserModalProps {
  items: FormItem;
  closeModal: () => void;
  onChangeStatus: (status: FormItem['status']) => void;
  onEdit: () => void;
  onDelete: () => void;
}
export default function Modal({ items, closeModal, onChangeStatus, onEdit, onDelete }: UserModalProps) {


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
            <p>Data de criação: {items.createdAt ? new Date(items.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }) : "—"}</p>
          </div>
          <div className={styles.modal_actions}>
            <button type="button" className={styles.editButton} onClick={onEdit}>
              Editar
            </button>
            <button type="button" className={styles.deleteButton} onClick={onDelete}>
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
