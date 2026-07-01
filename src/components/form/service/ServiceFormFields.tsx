"use client";

import { useMemo } from "react";
import FormMediaUpload, { validateFormMedia } from "../FormMediaUpload";
import type { FormMediaFilesState } from "@/lib/formMedia";
import styles from "../shared/FormFields.module.css";
import mediaStyles from "../FormService.module.css";

export type ServiceFormValues = {
  aparelho: string;
  brand: string;
  model: string;
  serialNumber: string;
  defects: string;
  defectsHistory: string;
};

type ServiceFormFieldsProps = {
  values: ServiceFormValues;
  onChange: (patch: Partial<ServiceFormValues>) => void;
  media: FormMediaFilesState;
  onImageFilesChange: (files: File[]) => void;
  onExistingImagesChange: (urls: string[]) => void;
  onAudioFilesChange: (files: File[]) => void;
  onExistingAudiosChange: (urls: string[]) => void;
  idPrefix?: string;
};

export default function ServiceFormFields({
  values,
  onChange,
  media,
  onImageFilesChange,
  onExistingImagesChange,
  onAudioFilesChange,
  onExistingAudiosChange,
  idPrefix = "service",
}: ServiceFormFieldsProps) {
  const mediaValidation = useMemo(() => validateFormMedia(media), [media]);

  return (
    <div className={mediaStyles.section}>
      <h3 className={mediaStyles.sectionTitle}>Dados do aparelho</h3>
      <div className={styles.fieldsGrid}>
        <div className={styles.field}>
          <label htmlFor={`${idPrefix}-aparelho`}>
            Aparelho <span className={styles.optional}>(opcional)</span>
          </label>
          <input
            id={`${idPrefix}-aparelho`}
            className={styles.input}
            value={values.aparelho}
            onChange={(e) => onChange({ aparelho: e.target.value })}
            placeholder="Ex: Ar condicionado, Giroflex"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${idPrefix}-brand`}>Marca</label>
          <input
            id={`${idPrefix}-brand`}
            className={styles.input}
            value={values.brand}
            onChange={(e) => onChange({ brand: e.target.value })}
            placeholder="Marca do equipamento"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${idPrefix}-model`}>Modelo</label>
          <input
            id={`${idPrefix}-model`}
            className={styles.input}
            value={values.model}
            onChange={(e) => onChange({ model: e.target.value })}
            placeholder="Modelo"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${idPrefix}-serial`}>Número de série</label>
          <input
            id={`${idPrefix}-serial`}
            className={styles.input}
            value={values.serialNumber}
            onChange={(e) => onChange({ serialNumber: e.target.value })}
            placeholder="Nº de série"
          />
        </div>
        <div className={`${styles.field} ${styles.fieldFull}`}>
          <span className={mediaStyles.fieldLabelStatic}>
            Anexos <span className={styles.optional}>(opcional)</span>
          </span>
          <FormMediaUpload
            imageFiles={media.imageFiles}
            onImageFilesChange={onImageFilesChange}
            existingImages={media.existingImages}
            onExistingImagesChange={onExistingImagesChange}
            audioFiles={media.audioFiles}
            onAudioFilesChange={onAudioFilesChange}
            existingAudios={media.existingAudios}
            onExistingAudiosChange={onExistingAudiosChange}
          />
        </div>
        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label htmlFor={`${idPrefix}-defects`}>
            Defeitos reclamados <span className={styles.optional}>(opcional)</span>
          </label>
          <textarea
            id={`${idPrefix}-defects`}
            className={styles.textarea}
            value={values.defects}
            onChange={(e) => onChange({ defects: e.target.value })}
            placeholder="Descreva o(s) defeito(s) relatado(s)"
            rows={4}
          />
        </div>
        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label htmlFor={`${idPrefix}-history`}>Defeitos encontrados e observações</label>
          <textarea
            id={`${idPrefix}-history`}
            className={styles.textareaLarge}
            value={values.defectsHistory}
            onChange={(e) => onChange({ defectsHistory: e.target.value })}
            placeholder="Defeitos encontrados durante a análise e observações"
            rows={5}
          />
        </div>
      </div>

      {(mediaValidation.imageMessage || mediaValidation.audioMessage) && (
        <div className={mediaStyles.submitError} role="alert">
          {mediaValidation.imageMessage && <p>{mediaValidation.imageMessage}</p>}
          {mediaValidation.audioMessage && <p>{mediaValidation.audioMessage}</p>}
        </div>
      )}
    </div>
  );
}

export const EMPTY_SERVICE_FORM: ServiceFormValues = {
  aparelho: "",
  brand: "",
  model: "",
  serialNumber: "",
  defects: "",
  defectsHistory: "",
};

export function isServiceMediaValid(media: FormMediaFilesState): boolean {
  return validateFormMedia(media).ok;
}
