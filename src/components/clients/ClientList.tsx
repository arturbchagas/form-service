"use client";

import { ClipboardList, Pencil, Trash2 } from "lucide-react";
import type { ClientItem } from "@/types/client/ClientItem";
import { clientDisplayLabel } from "@/types/client/ClientItem";
import styles from "./ClientList.module.css";

type ClientListProps = {
  clients: ClientItem[];
  busyClientId?: string | null;
  onEdit: (client: ClientItem) => void;
  onDelete: (client: ClientItem) => void;
  onViewServices: (client: ClientItem) => void;
};

export default function ClientList({
  clients,
  busyClientId = null,
  onEdit,
  onDelete,
  onViewServices,
}: ClientListProps) {
  if (clients.length === 0) {
    return <p className={styles.empty}>Nenhum cliente cadastrado.</p>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Cliente</th>
            <th className={styles.th}>Telefone</th>
            <th className={styles.th}>E-mail</th>
            <th className={styles.th}>CEP</th>
            <th className={styles.th}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const busy = busyClientId === client.id;
            return (
              <tr key={client.id} className={busy ? styles.rowBusy : undefined}>
                <td className={styles.td}>{clientDisplayLabel(client)}</td>
                <td className={styles.td}>{client.phone?.trim() || "—"}</td>
                <td className={styles.td}>{client.email?.trim() || "—"}</td>
                <td className={styles.td}>{client.cep?.trim() || "—"}</td>
                <td className={styles.td}>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionServices}`}
                      title="Ver serviços"
                      aria-label={`Ver serviços de ${clientDisplayLabel(client)}`}
                      onClick={() => onViewServices(client)}
                      disabled={busy}
                    >
                      <ClipboardList size={14} />
                      <span className={styles.actionLabel}>Ver serviços</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionEdit}`}
                      title="Editar"
                      aria-label={`Editar ${clientDisplayLabel(client)}`}
                      onClick={() => onEdit(client)}
                      disabled={busy}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionDelete}`}
                      title="Excluir"
                      aria-label={`Excluir ${clientDisplayLabel(client)}`}
                      onClick={() => onDelete(client)}
                      disabled={busy}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
