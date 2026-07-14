"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { listClients } from "@/app/actions/clients";
import { readClientCreatedSignal } from "@/lib/clientCreatedSignal";
import { resolveMediaForSubmit } from "@/lib/formMedia";
import type { ClientItem } from "@/types/client/ClientItem";
import { clientDisplayLabel } from "@/types/client/ClientItem";
import type { CreateServiceOrderInput } from "@/types/service/ServiceOrderInput";
import { OrderStatus } from "@prisma/client";
import ServiceFormFields, {
  EMPTY_SERVICE_FORM,
  isServiceMediaValid,
  type ServiceFormValues,
} from "./ServiceFormFields";
import styles from "./ServiceOrderCreateModal.module.css";

/** Query param usado na página /clientes para abrir o modal automaticamente. */
export const CLIENT_REGISTER_QUERY = "cadastrar";

export function buildClientRegisterUrl(): string {
  return `/clientes?${CLIENT_REGISTER_QUERY}=1`;
}

type ServiceOrderCreateModalProps = {
  initialClients: ClientItem[];
  onAddItem: (item: CreateServiceOrderInput) => void | Promise<void>;
};

export default function ServiceOrderCreateModal({
  initialClients,
  onAddItem,
}: ServiceOrderCreateModalProps) {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<ClientItem[]>(initialClients);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [serviceValues, setServiceValues] = useState<ServiceFormValues>(EMPTY_SERVICE_FORM);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingAudios, setExistingAudios] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [clientError, setClientError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshingClients, setRefreshingClients] = useState(false);

  const mediaState = useMemo(
    () => ({
      imageFiles,
      audioFiles,
      existingImages,
      existingAudios,
    }),
    [imageFiles, audioFiles, existingImages, existingAudios]
  );

  const resetForm = useCallback(() => {
    setSelectedClientId("");
    setServiceValues(EMPTY_SERVICE_FORM);
    setImageFiles([]);
    setAudioFiles([]);
    setExistingImages([]);
    setExistingAudios([]);
    setSubmitError(null);
    setClientError(false);
  }, []);

  const refreshClients = useCallback(async (preferredClientId?: string | null) => {
    setRefreshingClients(true);
    try {
      const next = await listClients();
      setClients(next);
      if (preferredClientId && next.some((c) => c.id === preferredClientId)) {
        setSelectedClientId(preferredClientId);
      }
    } catch (err) {
      console.error("Erro ao atualizar lista de clientes:", err);
    } finally {
      setRefreshingClients(false);
    }
  }, []);

  useEffect(() => {
    setClients(initialClients);
  }, [initialClients]);

  useEffect(() => {
    if (!open) return;

    const onStorage = (e: StorageEvent) => {
      if (e.key !== "form-service:client-created") return;
      const clientId = readClientCreatedSignal();
      void refreshClients(clientId);
    };

    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const clientId = readClientCreatedSignal();
      void refreshClients(clientId);
    };

    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [open, refreshClients]);

  function handleOpen() {
    resetForm();
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    resetForm();
  }

  function handleNewClientTab() {
    window.open(buildClientRegisterUrl(), "_blank", "noopener,noreferrer");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!selectedClientId) {
      setClientError(true);
      setSubmitError("Selecione um cliente para abrir a ordem de serviço.");
      return;
    }

    if (!isServiceMediaValid(mediaState)) return;

    setSubmitting(true);
    try {
      const { deviceImages, deviceAudios } = await resolveMediaForSubmit(mediaState);

      const payload: CreateServiceOrderInput = {
        clientId: selectedClientId,
        ...serviceValues,
        deviceImages,
        deviceAudios,
        status: OrderStatus.novo,
      };

      await onAddItem(payload);
      handleClose();
    } catch (err) {
      console.error("Erro ao criar ordem de serviço:", err);
      setSubmitError("Não foi possível criar a ordem de serviço. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button type="button" className={styles.trigger} onClick={handleOpen}>
        Nova ordem de serviço
      </button>

      {open && (
        <div className={styles.overlay} onClick={handleClose}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-order-modal-title"
          >
            <div className={styles.header}>
              <h2 id="service-order-modal-title" className={styles.title}>
                Nova ordem de serviço
              </h2>
              <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="Fechar">
                &times;
              </button>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)}>
              <section className={styles.clientSection} aria-labelledby="client-select-label">
                <div className={styles.clientSectionHeader}>
                  <h3 id="client-select-label" className={styles.clientSectionTitle}>
                    Cliente
                  </h3>
                  <button
                    type="button"
                    className={styles.newClientBtn}
                    onClick={handleNewClientTab}
                    title="Cadastrar novo cliente em nova aba"
                    aria-label="Cadastrar novo cliente em nova aba"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <p className={styles.clientHint}>
                  Selecione um cliente cadastrado. Use o botão + para abrir o cadastro em outra aba sem perder este formulário.
                </p>

                {clients.length === 0 ? (
                  <p className={styles.emptyClients}>
                    Nenhum cliente cadastrado. Clique no + para cadastrar o primeiro cliente.
                  </p>
                ) : (
                  <select
                    className={`${styles.select} ${clientError ? styles.selectInvalid : ""}`}
                    value={selectedClientId}
                    onChange={(e) => {
                      setSelectedClientId(e.target.value);
                      setClientError(false);
                      setSubmitError(null);
                    }}
                    disabled={refreshingClients}
                    required
                  >
                    <option value="">
                      {refreshingClients ? "Atualizando clientes…" : "Selecione um cliente"}
                    </option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {clientDisplayLabel(client)}
                      </option>
                    ))}
                  </select>
                )}
              </section>

              <ServiceFormFields
                values={serviceValues}
                onChange={(patch) => setServiceValues((prev) => ({ ...prev, ...patch }))}
                media={mediaState}
                onImageFilesChange={setImageFiles}
                onExistingImagesChange={setExistingImages}
                onAudioFilesChange={setAudioFiles}
                onExistingAudiosChange={setExistingAudios}
              />

              {submitError ? <p className={styles.submitError} role="alert">{submitError}</p> : null}

              <div className={styles.actions}>
                <button type="button" className={styles.cancelBtn} onClick={handleClose} disabled={submitting}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting || clients.length === 0 || !isServiceMediaValid(mediaState)}
                >
                  {submitting ? "Enviando…" : "Abrir ordem de serviço"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
