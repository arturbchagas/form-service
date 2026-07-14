"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteClient } from "@/app/actions/clients";
import ClientFormModal from "@/components/form/client/ClientFormModal";
import { CLIENT_REGISTER_QUERY } from "@/components/form/service/ServiceOrderCreateModal";
import type { ClientItem } from "@/types/client/ClientItem";
import { clientDisplayLabel } from "@/types/client/ClientItem";
import ClientList from "./ClientList";
import ClientServices from "./ClientServices";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import styles from "./ClientsPageClient.module.css";

type ClientsPageClientProps = {
  initialClients: ClientItem[];
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

export default function ClientsPageClient({ initialClients }: ClientsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<ClientItem[]>(initialClients);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [deletingClient, setDeletingClient] = useState<ClientItem | null>(null);
  const [servicesClient, setServicesClient] = useState<ClientItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeedback = useCallback((next: Feedback) => {
    setFeedback(next);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  useEffect(() => {
    setClients(initialClients);
  }, [initialClients]);

  /** Auto-abre o modal quando a URL contém ?cadastrar=1 (fluxo do botão + na O.S.). */
  useEffect(() => {
    if (searchParams.get(CLIENT_REGISTER_QUERY) !== "1") return;
    setCreateOpen(true);
    router.replace("/clientes", { scroll: false });
  }, [searchParams, router]);

  function handleCreated(client: ClientItem) {
    setClients((prev) => [client, ...prev]);
    showFeedback({ type: "success", message: "Cliente cadastrado com sucesso." });
  }

  function handleUpdated(client: ClientItem) {
    setClients((prev) => prev.map((item) => (item.id === client.id ? client : item)));
    showFeedback({ type: "success", message: "Cliente atualizado com sucesso." });
  }

  function openDelete(client: ClientItem) {
    setDeleteError(null);
    setDeletingClient(client);
  }

  function closeDelete() {
    if (deleting) return;
    setDeletingClient(null);
    setDeleteError(null);
  }

  async function confirmDelete() {
    if (!deletingClient) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteClient(deletingClient.id);
      setClients((prev) => prev.filter((item) => item.id !== deletingClient.id));
      setDeletingClient(null);
      showFeedback({ type: "success", message: "Cliente excluído com sucesso." });
    } catch (err) {
      console.error("Erro ao excluir cliente:", err);
      setDeleteError(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir o cliente. Tente novamente."
      );
    } finally {
      setDeleting(false);
    }
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
        <button type="button" className={styles.registerBtn} onClick={() => setCreateOpen(true)}>
          Cadastrar
        </button>
      </header>

      {feedback ? (
        <p
          className={feedback.type === "success" ? styles.feedbackSuccess : styles.feedbackError}
          role="status"
        >
          {feedback.message}
        </p>
      ) : null}

      <ClientList
        clients={clients}
        busyClientId={deleting ? deletingClient?.id ?? null : null}
        onEdit={setEditingClient}
        onDelete={openDelete}
        onViewServices={setServicesClient}
      />

      <ClientFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
        notifyOtherTabs
      />

      <ClientFormModal
        open={Boolean(editingClient)}
        client={editingClient}
        onClose={() => setEditingClient(null)}
        onUpdated={handleUpdated}
      />

      <ConfirmDeleteModal
        open={Boolean(deletingClient)}
        message={
          deletingClient
            ? `Tem certeza que deseja excluir o cliente "${clientDisplayLabel(deletingClient)}"? Esta ação não pode ser desfeita.`
            : ""
        }
        confirming={deleting}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
        onCancel={closeDelete}
      />

      <ClientServices
        open={Boolean(servicesClient)}
        client={servicesClient}
        onClose={() => setServicesClient(null)}
      />
    </div>
  );
}
