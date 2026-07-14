"use client";

import { useEffect, useState } from "react";
import { listServiceOrdersByClient } from "@/app/actions/clients";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import type { ClientItem } from "@/types/client/ClientItem";
import { clientDisplayLabel } from "@/types/client/ClientItem";
import type { FormItem } from "@/types/Form-itens/FormItem";
import styles from "./ClientServices.module.css";

type ClientServicesProps = {
  open: boolean;
  client: ClientItem | null;
  onClose: () => void;
};

function formatOrderDate(value?: Date | string): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatPrice(price?: number): string {
  if (price == null) return "—";
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ClientServices({ open, client, onClose }: ClientServicesProps) {
  const [orders, setOrders] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !client) {
      setOrders([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await listServiceOrdersByClient(client!.id);
        if (!cancelled) setOrders(result);
      } catch (err) {
        console.error("Erro ao carregar serviços do cliente:", err);
        if (!cancelled) {
          setOrders([]);
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar as ordens de serviço."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, client]);

  if (!open || !client) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-services-title"
      >
        <div className={styles.header}>
          <div>
            <h2 id="client-services-title" className={styles.title}>
              Serviços do cliente
            </h2>
            <p className={styles.subtitle}>{clientDisplayLabel(client)}</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            &times;
          </button>
        </div>

        {loading ? (
          <p className={styles.state}>Carregando ordens de serviço…</p>
        ) : error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : orders.length === 0 ? (
          <p className={styles.state}>Nenhuma ordem de serviço vinculada a este cliente.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Data</th>
                  <th className={styles.th}>Aparelho</th>
                  <th className={styles.th}>Marca / Modelo</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className={styles.td}>{formatOrderDate(order.createdAt)}</td>
                    <td className={styles.td}>{order.aparelho?.trim() || "—"}</td>
                    <td className={styles.td}>
                      {[order.brand?.trim(), order.model?.trim()].filter(Boolean).join(" / ") || "—"}
                    </td>
                    <td className={styles.td}>
                      <StatusBadge status={order.status} size="sm" />
                    </td>
                    <td className={styles.td}>{formatPrice(order.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.footer}>
          <button type="button" className={styles.closeFooterBtn} onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
