"use client";

import styles from "./ConfirmDeleteModal.module.css";

type ConfirmDeleteModalProps = {
  open: boolean;
  title?: string;
  message: string;
  confirming?: boolean;
  error?: string | null;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDeleteModal({
  open,
  title = "Confirmar exclusão",
  message,
  confirming = false,
  error = null,
  confirmLabel = "Excluir",
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={confirming ? undefined : onCancel}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
      >
        <div className={styles.header}>
          <h2 id="confirm-delete-title" className={styles.title}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onCancel}
            aria-label="Fechar"
            disabled={confirming}
          >
            &times;
          </button>
        </div>

        <p className={styles.message}>{message}</p>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={confirming}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={onConfirm}
            disabled={confirming}
          >
            {confirming ? "Excluindo…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
