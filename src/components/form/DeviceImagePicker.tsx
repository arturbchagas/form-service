"use client";

import { useMemo, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import {
  MAX_DEVICE_IMAGES,
  MAX_DEVICE_IMAGES_TOTAL_BYTES,
  MAX_IMAGE_FILE_BYTES,
  formatImageBytes,
  readImageFilesAsDataUrls,
  validateDeviceImages,
} from "@/lib/readImageDataUrls";
import styles from "./DeviceImagePicker.module.css";

interface DeviceImagePickerProps {
  images: string[];
  onChange: (next: string[]) => void;
  /** Texto curto para leitores de tela / título do botão */
  addLabel?: string;
  /** Fundo claro (ex.: modal de edição na tabela) */
  variant?: "default" | "light";
  /** Erro de tamanho total (controle externo opcional). */
  sizeError?: string | null;
}

export default function DeviceImagePicker({
  images,
  onChange,
  addLabel = "Adicionar fotos do aparelho",
  variant = "default",
  sizeError: sizeErrorProp,
}: DeviceImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickNotice, setPickNotice] = useState<string | null>(null);

  const validation = useMemo(() => validateDeviceImages(images), [images]);
  const sizeError = sizeErrorProp ?? validation.message;

  const maxPerFileLabel = formatImageBytes(MAX_IMAGE_FILE_BYTES);
  const maxTotalLabel = formatImageBytes(MAX_DEVICE_IMAGES_TOTAL_BYTES);

  async function onFilesPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    const { dataUrls, skipped, blocked } = await readImageFilesAsDataUrls(
      files,
      images.length,
      images
    );

    if (blocked) {
      setPickNotice(blocked);
    } else if (skipped.length) {
      setPickNotice(skipped.join(" "));
    } else {
      setPickNotice(null);
    }

    if (dataUrls.length) {
      onChange([...images, ...dataUrls]);
    }
    e.target.value = "";
  }

  function removeAt(index: number) {
    setPickNotice(null);
    onChange(images.filter((_, i) => i !== index));
  }

  const atLimit = images.length >= MAX_DEVICE_IMAGES;
  const totalLabel = formatImageBytes(validation.totalBytes);
  const nearLimit =
    validation.totalBytes > MAX_DEVICE_IMAGES_TOTAL_BYTES * 0.85;

  return (
    <div className={`${styles.wrap} ${variant === "light" ? styles.wrapLight : ""}`}>
      <div className={styles.toolbar}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className={styles.hiddenInput}
          onChange={onFilesPicked}
          aria-hidden
        />
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => inputRef.current?.click()}
          disabled={atLimit}
          title={
            sizeError
              ? sizeError
              : atLimit
                ? `Máximo de ${MAX_DEVICE_IMAGES} imagens`
                : addLabel
          }
          aria-label={addLabel}
        >
          <ImagePlus size={22} strokeWidth={1.75} />
        </button>
        <span
          className={`${styles.hint} ${nearLimit && !sizeError ? styles.hintWarn : ""}`}
        >
          {atLimit
            ? `Limite: ${MAX_DEVICE_IMAGES} imagens · ${totalLabel} / ${maxTotalLabel}`
            : `${images.length}/${MAX_DEVICE_IMAGES} — até ${maxPerFileLabel} por foto, ${maxTotalLabel} no total (${totalLabel} usados)`}
        </span>
      </div>

      {pickNotice && !sizeError && (
        <p className={styles.notice} role="status">
          {pickNotice}
        </p>
      )}

      {sizeError && (
        <p className={styles.error} role="alert">
          {sizeError}
        </p>
      )}

      {images.length > 0 && (
        <ul className={styles.thumbList}>
          {images.map((src, i) => (
            <li key={`${i}-${src.slice(0, 40)}`} className={styles.thumbItem}>
              {/* eslint-disable-next-line @next/next/no-img-element -- miniatura data URL */}
              <img src={src} alt="" className={styles.thumbImg} />
              <button
                type="button"
                className={styles.removeThumb}
                onClick={() => removeAt(i)}
                aria-label={`Remover imagem ${i + 1}`}
                title="Remover"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
