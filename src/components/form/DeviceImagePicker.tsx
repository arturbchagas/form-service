"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import {
  MAX_DEVICE_IMAGES,
  readImageFilesAsDataUrls,
} from "@/lib/readImageDataUrls";
import styles from "./DeviceImagePicker.module.css";

interface DeviceImagePickerProps {
  images: string[];
  onChange: (next: string[]) => void;
  /** Texto curto para leitores de tela / título do botão */
  addLabel?: string;
  /** Fundo claro (ex.: modal de edição na tabela) */
  variant?: "default" | "light";
}

export default function DeviceImagePicker({
  images,
  onChange,
  addLabel = "Adicionar fotos do aparelho",
  variant = "default",
}: DeviceImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFilesPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    const { dataUrls, skipped } = await readImageFilesAsDataUrls(files, images.length);
    if (skipped.length) {
      window.alert(skipped.join("\n"));
    }
    if (dataUrls.length) {
      onChange([...images, ...dataUrls]);
    }
    e.target.value = "";
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  const atLimit = images.length >= MAX_DEVICE_IMAGES;

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
          title={atLimit ? `Máximo de ${MAX_DEVICE_IMAGES} imagens` : addLabel}
          aria-label={addLabel}
        >
          <ImagePlus size={22} strokeWidth={1.75} />
        </button>
        <span className={styles.hint}>
          {atLimit
            ? `Limite: ${MAX_DEVICE_IMAGES} imagens`
            : `${images.length}/${MAX_DEVICE_IMAGES} — JPG, PNG, WebP até 4 MB`}
        </span>
      </div>
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
