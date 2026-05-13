"use client";

import { useEffect, useState } from "react";
import { FormItem } from "../../types/Form-itens/FormItem";
import { RECEIPT_ISSUER_DEFAULT_LOCATION } from "./receiptIssuer";
import type { ReceiptClientPayload } from "./receiptTypes";
import styles from "./ReceiptFormModal.module.css";

type ReceiptFormModalProps = {
  item: FormItem;
  onClose: () => void;
  onConfirm: (payload: ReceiptClientPayload) => Promise<void>;
};

function buildDefaults(item: FormItem): ReceiptClientPayload {
  return {
    clientName: (item.empresa?.trim() || item.name?.trim() || "").trim(),
    clientDocument: "",
    city: RECEIPT_ISSUER_DEFAULT_LOCATION.city,
    state: RECEIPT_ISSUER_DEFAULT_LOCATION.state,
    equipmentType: item.aparelho?.trim() || "",
    brand: item.brand?.trim() || "",
    model: item.model?.trim() || "",
    serialNumber: item.serialNumber?.trim() || "",
  };
}

export default function ReceiptFormModal({ item, onClose, onConfirm }: ReceiptFormModalProps) {
  const [form, setForm] = useState<ReceiptClientPayload>(() => buildDefaults(item));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(buildDefaults(item));
    setError(null);
  }, [item]);

  const price = item.price;
  const priceLabel =
    price != null
      ? price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "—";

  function update<K extends keyof ReceiptClientPayload>(key: K, value: ReceiptClientPayload[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (price == null) {
      setError("Esta O.S. não possui preço definido.");
      return;
    }

    if (!form.clientName.trim()) {
      setError("Informe o nome de quem pagou (Recebemos de).");
      return;
    }
    if (!form.clientDocument.trim()) {
      setError("Informe o CPF ou CNPJ do cliente.");
      return;
    }
    if (!form.city.trim() || !form.state.trim()) {
      setError("Informe cidade e estado para a data do recibo.");
      return;
    }
    if (!form.equipmentType.trim()) {
      setError("Informe o tipo de equipamento.");
      return;
    }

    const payload: ReceiptClientPayload = {
      clientName: form.clientName.trim(),
      clientDocument: form.clientDocument.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      equipmentType: form.equipmentType.trim(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      serialNumber: form.serialNumber.trim(),
    };

    setSubmitting(true);
    try {
      await onConfirm(payload);
    } catch {
      setError("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Gerar recibo em PDF</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            &times;
          </button>
        </div>

        <p className={styles.sub}>
          O.S.: {item.name?.trim() || "—"} — {item.aparelho?.trim() || "—"}
        </p>

        <div>
          <p className={styles.sectionLabel}>Valor na O.S. (no recibo)</p>
          <div className={styles.valorReadonly}>VALOR: {priceLabel}</div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)}>
          <p className={styles.sectionLabel}>Dados do cliente no recibo</p>
          <div className={styles.grid}>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label htmlFor="rc-name">Recebemos de</label>
              <input
                id="rc-name"
                value={form.clientName}
                onChange={(e) => update("clientName", e.target.value)}
                placeholder="Nome ou razão social"
                autoComplete="name"
                autoFocus
              />
            </div>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label htmlFor="rc-doc">CPF/CNPJ</label>
              <input
                id="rc-doc"
                value={form.clientDocument}
                onChange={(e) => update("clientDocument", e.target.value)}
                placeholder="Somente números ou formatado"
                autoComplete="off"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="rc-city">Cidade (data do recibo)</label>
              <input
                id="rc-city"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="Cidade"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="rc-state">Estado (UF ou nome)</label>
              <input
                id="rc-state"
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
                placeholder="Ex.: PE"
              />
            </div>
          </div>

          <p className={styles.sectionLabel} style={{ marginTop: 12 }}>
            Item descrito no recibo
          </p>
          <div className={styles.grid}>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label htmlFor="rc-equip">Equipamento</label>
              <input
                id="rc-equip"
                value={form.equipmentType}
                onChange={(e) => update("equipmentType", e.target.value)}
                placeholder="Tipo de equipamento"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="rc-brand">Marca</label>
              <input id="rc-brand" value={form.brand} onChange={(e) => update("brand", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label htmlFor="rc-model">Modelo</label>
              <input id="rc-model" value={form.model} onChange={(e) => update("model", e.target.value)} />
            </div>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label htmlFor="rc-serial">Nº de série</label>
              <input
                id="rc-serial"
                value={form.serialNumber}
                onChange={(e) => update("serialNumber", e.target.value)}
              />
            </div>
          </div>

          <p className={styles.sectionLabel} style={{ marginTop: 12 }}>
            Emitente (automático no PDF)
          </p>
          <div className={styles.issuerBox}>
            Os dados da empresa no rodapé do recibo são preenchidos automaticamente pelo sistema (mesmo cadastro
            usado no orçamento PHC).
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className={styles.confirmBtn} disabled={submitting || price == null}>
              {submitting ? "Gerando…" : "Confirmar e gerar PDF"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
