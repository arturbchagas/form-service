"use client";
import { FormItem } from "../../types/Form-itens/FormItem";
import styles from "./Modal.module.css";

interface UserModalProps {
  items: FormItem;
  closeModal: () => void;
  onChangeStatus: (status: FormItem["status"]) => void;
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
            <select
              value={items.status}
              onChange={(e) => onChangeStatus(e.target.value as FormItem["status"])}
            >
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
            {items.empresa && <p><strong>Empresa:</strong> {items.empresa}</p>}
            <p><strong>Telefone:</strong> {items.phone || "—"}</p>
            <p><strong>CEP:</strong> {items.cep || "—"}</p>
            <p><strong>E-mail:</strong> {items.email || "—"}</p>
            <p><strong>Endereço:</strong> {items.address || "—"}</p>
            <p><strong>Aparelho:</strong> {items.aparelho}</p>
            <p><strong>Marca:</strong> {items.brand || "—"}</p>
            <p><strong>Modelo:</strong> {items.model || "—"}</p>
            <p><strong>Número de série:</strong> {items.serialNumber || "—"}</p>
            <p><strong>Defeitos:</strong> {items.defects}</p>
            <p><strong>Histórico de defeitos:</strong> {items.defectsHistory || "—"}</p>
            <p>
              <strong>Preço:</strong>{" "}
              {items.price != null
                ? items.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                : "—"}
            </p>
            <p>
              <strong>Data de criação:</strong>{" "}
              {items.createdAt
                ? new Date(items.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
