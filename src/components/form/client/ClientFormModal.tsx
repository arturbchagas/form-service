"use client";

import { useEffect, useState } from "react";
import { createClient, updateClient } from "@/app/actions/clients";
import { signalClientCreated } from "@/lib/clientCreatedSignal";
import type { ClientFormValues, ClientItem } from "@/types/client/ClientItem";
import { clientToFormValues } from "@/types/client/ClientItem";
import ClientFormFields, { EMPTY_CLIENT_FORM } from "./ClientFormFields";
import styles from "./ClientFormModal.module.css";

type ClientFormModalProps = {
  open: boolean;
  onClose: () => void;
  /** Quando informado, o modal opera em modo edição. */
  client?: ClientItem | null;
  onCreated?: (client: ClientItem) => void;
  onUpdated?: (client: ClientItem) => void;
  /** Quando true, emite sinal cross-tab para a aba da O.S. (somente no create). */
  notifyOtherTabs?: boolean;
};

export default function ClientFormModal({
  open,
  onClose,
  client = null,
  onCreated,
  onUpdated,
  notifyOtherTabs = false,
}: ClientFormModalProps) {
  const isEdit = Boolean(client);
  const [values, setValues] = useState<ClientFormValues>(EMPTY_CLIENT_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(client ? clientToFormValues(client) : EMPTY_CLIENT_FORM);
    setError(null);
  }, [open, client]);

  if (!open) return null;

  function handleChange(patch: Partial<ClientFormValues>) {
    setValues((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (client) {
        const updated = await updateClient(client.id, values);
        onUpdated?.(updated);
      } else {
        const created = await createClient(values);
        if (notifyOtherTabs) {
          signalClientCreated(created.id);
        }
        onCreated?.(created);
      }
      onClose();
    } catch (err) {
      console.error(isEdit ? "Erro ao atualizar cliente:" : "Erro ao cadastrar cliente:", err);
      const message =
        err instanceof Error && !err.message.startsWith("{")
          ? err.message
          : isEdit
            ? "Não foi possível atualizar o cliente. Verifique os dados e tente novamente."
            : "Não foi possível cadastrar o cliente. Verifique os dados e tente novamente.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h2 className={styles.title}>{isEdit ? "Editar cliente" : "Cadastrar cliente"}</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            &times;
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)}>
          <ClientFormFields
            values={values}
            onChange={handleChange}
            idPrefix={isEdit ? "client-edit" : "client-modal"}
          />
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn} disabled={submitting}>
              {submitting ? "Salvando…" : isEdit ? "Salvar alterações" : "Salvar cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
