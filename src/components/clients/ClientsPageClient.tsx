"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ClientFormModal from "@/components/form/client/ClientFormModal";
import { CLIENT_REGISTER_QUERY } from "@/components/form/service/ServiceOrderCreateModal";
import type { ClientItem } from "@/types/client/ClientItem";
import { clientDisplayLabel } from "@/types/client/ClientItem";
import styles from "./ClientsPageClient.module.css";

type ClientsPageClientProps = {
  initialClients: ClientItem[];
};

export default function ClientsPageClient({ initialClients }: ClientsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<ClientItem[]>(initialClients);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  useEffect(() => {
    setClients(initialClients);
  }, [initialClients]);

  /** Auto-abre o modal quando a URL contém ?cadastrar=1 (fluxo do botão + na O.S.). */
  useEffect(() => {
    if (searchParams.get(CLIENT_REGISTER_QUERY) !== "1") return;
    setModalOpen(true);
    router.replace("/clientes", { scroll: false });
  }, [searchParams, router]);

  function handleCreated(client: ClientItem) {
    setClients((prev) => [client, ...prev]);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Clientes</h1>
          <p className={styles.subtitle}>
            Cadastre clientes antes de abrir ordens de serviço.
          </p>
        </div>
        <button type="button" className={styles.registerBtn} onClick={openModal}>
          Cadastrar
        </button>
      </header>

      <div className={styles.tableWrapper}>
        {clients.length === 0 ? (
          <p className={styles.empty}>Nenhum cliente cadastrado.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Cliente</th>
                <th className={styles.th}>Telefone</th>
                <th className={styles.th}>E-mail</th>
                <th className={styles.th}>CEP</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className={styles.td}>{clientDisplayLabel(client)}</td>
                  <td className={styles.td}>{client.phone?.trim() || "—"}</td>
                  <td className={styles.td}>{client.email?.trim() || "—"}</td>
                  <td className={styles.td}>{client.cep?.trim() || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ClientFormModal
        open={modalOpen}
        onClose={closeModal}
        onCreated={handleCreated}
        notifyOtherTabs
      />
    </div>
  );
}
