"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/actions/clients";
import { signalClientCreated } from "@/lib/clientCreatedSignal";
import type { ClientFormValues, ClientItem } from "@/types/client/ClientItem";
import ClientFormFields, { EMPTY_CLIENT_FORM } from "./ClientFormFields";
import styles from "./ClientFormModal.module.css";

type ClientFormModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (client: ClientItem) => void;
  /** Quando true, emite sinal cross-tab para a aba da O.S. */
  notifyOtherTabs?: boolean;
};

export default function ClientFormModal({
  open,
  onClose,
  onCreated,
  notifyOtherTabs = false,
}: ClientFormModalProps) {
  const [values, setValues] = useState<ClientFormValues>(EMPTY_CLIENT_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(EMPTY_CLIENT_FORM);
    setError(null);
  }, [open]);

  if (!open) return null;

  function handleChange(patch: Partial<ClientFormValues>) {
    setValues((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const created = await createClient(values);
      if (notifyOtherTabs) {
        signalClientCreated(created.id);
      }
      onCreated?.(created);
      onClose();
    } catch (err) {
      console.error("Erro ao cadastrar cliente:", err);
      setError("Não foi possível cadastrar o cliente. Verifique os dados e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h2 className={styles.title}>Cadastrar cliente</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            &times;
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)}>
          <ClientFormFields values={values} onChange={handleChange} idPrefix="client-modal" />
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn} disabled={submitting}>
              {submitting ? "Salvando…" : "Salvar cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
