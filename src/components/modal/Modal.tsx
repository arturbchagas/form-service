"use client";
import { Music2 } from "lucide-react";
import { FormItem } from "../../types/Form-itens/FormItem";
import StatusBadge from "../StatusBadge/StatusBadge";
import StatusSelect from "../StatusSelect/StatusSelect";
import styles from "./Modal.module.css";

interface UserModalProps {
  items: FormItem;
  closeModal: () => void;
  onChangeStatus: (status: FormItem["status"]) => void;
}

export default function Modal({ items, closeModal, onChangeStatus }: UserModalProps) {
  const priceFormatted =
    items.price != null
      ? items.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "—";

  const dateFormatted = items.createdAt
    ? new Date(items.createdAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

  return (
    <div className={styles.modal} onClick={closeModal}>
      <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.modal_header}>
          <h2 className={styles.modal_title}>{items.name?.trim() ? items.name : "Ordem de serviço"}</h2>
          <button className={styles.close} onClick={closeModal} title="Fechar">
            &times;
          </button>
        </div>

        {/* Fotos do aparelho — primeiro bloco de conteúdo, centralizado */}
        {items.deviceImages && items.deviceImages.length > 0 && (
          <div className={styles.deviceImagesBlock}>
            <div className={styles.deviceImagesInner}>
              {items.deviceImages.map((src, i) => (
                <figure key={`${i}-${src.slice(0, 48)}`} className={styles.deviceFigure}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- data URL do usuário */}
                  <img src={src} alt={`Foto do aparelho ${i + 1}`} className={styles.deviceImg} />
                </figure>
              ))}
            </div>
          </div>
        )}

        {/* Áudios do aparelho — player nativo para escutar cada faixa */}
        {items.deviceAudios && items.deviceAudios.length > 0 && (
          <div className={styles.deviceAudiosBlock}>
            <span className={styles.deviceAudiosLabel}>
              Áudios ({items.deviceAudios.length})
            </span>
            <ul className={styles.deviceAudioList}>
              {items.deviceAudios.map((src, i) => (
                <li key={`audio-${i}`} className={styles.deviceAudioItem}>
                  <div className={styles.deviceAudioHeader}>
                    <Music2 size={16} className={styles.deviceAudioIcon} />
                    <span className={styles.deviceAudioName}>Áudio {i + 1}</span>
                  </div>
                  <audio controls preload="metadata" className={styles.deviceAudioPlayer}>
                    <source src={src} />
                    Seu navegador não suporta reprodução de áudio.
                  </audio>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Status */}
        <div className={styles.status_section}>
          <div className={styles.status_header}>
            <span className={styles.status_label}>Status da O.S.</span>
            <StatusBadge status={items.status} size="lg" />
          </div>
          <StatusSelect
            value={items.status}
            onChange={onChangeStatus}
          />
        </div>

        {/* Info grid */}
        <div className={styles.modal_body}>
          {items.empresa && (
            <div className={`${styles.info_row} ${styles.info_row_full}`}>
              <span className={styles.info_label}>Empresa</span>
              <span className={styles.info_value}>{items.empresa}</span>
            </div>
          )}

          <div className={styles.info_row}>
            <span className={styles.info_label}>Telefone</span>
            <span className={styles.info_value}>{items.phone || "—"}</span>
          </div>

          <div className={styles.info_row}>
            <span className={styles.info_label}>CEP</span>
            <span className={styles.info_value}>{items.cep || "—"}</span>
          </div>

          <div className={styles.info_row}>
            <span className={styles.info_label}>E-mail</span>
            <span className={styles.info_value}>{items.email || "—"}</span>
          </div>

          <div className={styles.info_row}>
            <span className={styles.info_label}>Data de criação</span>
            <span className={styles.info_value}>{dateFormatted}</span>
          </div>

          <div className={`${styles.info_row} ${styles.info_row_full}`}>
            <span className={styles.info_label}>Endereço</span>
            <span className={styles.info_value}>{items.address || "—"}</span>
          </div>

          <div className={styles.info_row}>
            <span className={styles.info_label}>Aparelho</span>
            <span className={styles.info_value}>{items.aparelho || "—"}</span>
          </div>

          <div className={styles.info_row}>
            <span className={styles.info_label}>Marca</span>
            <span className={styles.info_value}>{items.brand || "—"}</span>
          </div>

          <div className={styles.info_row}>
            <span className={styles.info_label}>Modelo</span>
            <span className={styles.info_value}>{items.model || "—"}</span>
          </div>

          <div className={styles.info_row}>
            <span className={styles.info_label}>Número de série</span>
            <span className={styles.info_value}>{items.serialNumber || "—"}</span>
          </div>

          <div className={`${styles.info_row} ${styles.info_row_full}`}>
            <span className={styles.info_label}>Defeitos reclamados</span>
            <span className={styles.info_value}>{items.defects || "—"}</span>
          </div>

          <div className={`${styles.info_row} ${styles.info_row_full}`}>
            <span className={styles.info_label}>Defeitos encontrados e observações</span>
            <span className={styles.info_value}>{items.defectsHistory || "—"}</span>
          </div>

          <div className={`${styles.info_row} ${styles.info_row_full}`}>
            <span className={styles.info_label}>Preço</span>
            <span className={styles.info_value_price}>{priceFormatted}</span>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modal_footer}>
          <button className={styles.closeFooterBtn} onClick={closeModal}>
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
