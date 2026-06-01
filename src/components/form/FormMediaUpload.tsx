"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus, Music2, Trash2, Upload } from "lucide-react";
import {
  AUDIO_ACCEPT,
  IMAGE_ACCEPT,
  MAX_AUDIO_FILE_BYTES,
  MAX_DEVICE_AUDIOS,
  MAX_DEVICE_AUDIOS_TOTAL_BYTES,
  acceptFilesWithinLimit,
  formatDropRejections,
  formatFileBytes,
  getAudiosTotalBytes,
  getFilesTotalBytes,
  type FormMediaFilesState,
  validateFormMedia,
} from "@/lib/formMedia";
import {
  MAX_DEVICE_IMAGES,
  MAX_DEVICE_IMAGES_TOTAL_BYTES,
  MAX_IMAGE_FILE_BYTES,
  getDataUrlByteSize,
  getDeviceImagesTotalBytes,
} from "@/lib/readImageDataUrls";
import styles from "./FormMediaUpload.module.css";

export type { FormMediaFilesState };

type FormMediaUploadProps = {
  imageFiles: File[];
  onImageFilesChange: (files: File[]) => void;
  existingImages: string[];
  onExistingImagesChange: (urls: string[]) => void;
  audioFiles: File[];
  onAudioFilesChange: (files: File[]) => void;
  existingAudios: string[];
  onExistingAudiosChange: (urls: string[]) => void;
  variant?: "default" | "light";
};

function usePreviewUrls(files: File[]): Map<File, string> {
  const urls = useMemo(() => {
    const map = new Map<File, string>();
    for (const file of files) {
      map.set(file, URL.createObjectURL(file));
    }
    return map;
  }, [files]);

  useEffect(() => {
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [urls]);

  return urls;
}

export default function FormMediaUpload({
  imageFiles,
  onImageFilesChange,
  existingImages,
  onExistingImagesChange,
  audioFiles,
  onAudioFilesChange,
  existingAudios,
  onExistingAudiosChange,
  variant = "default",
}: FormMediaUploadProps) {
  const [imageNotice, setImageNotice] = useState<string | null>(null);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);

  const validation = useMemo(
    () =>
      validateFormMedia({
        imageFiles,
        audioFiles,
        existingImages,
        existingAudios,
      }),
    [imageFiles, audioFiles, existingImages, existingAudios]
  );
  const imagePreviews = usePreviewUrls(imageFiles);

  const imageCount = existingImages.length + imageFiles.length;
  const audioCount = existingAudios.length + audioFiles.length;
  const imagesAtLimit = imageCount >= MAX_DEVICE_IMAGES;
  const audiosAtLimit = audioCount >= MAX_DEVICE_AUDIOS;

  const imagesUsedBytes =
    getDeviceImagesTotalBytes(existingImages) + getFilesTotalBytes(imageFiles);
  const audiosUsedBytes = getAudiosTotalBytes(audioFiles, existingAudios);

  const onDropImages = useCallback(
    (accepted: File[], rejections: import("react-dropzone").FileRejection[]) => {
      const rejectMsgs = formatDropRejections(rejections);
      const { accepted: toAdd, errors } = acceptFilesWithinLimit(
        accepted,
        imageFiles,
        existingImages.length,
        MAX_DEVICE_IMAGES,
        MAX_IMAGE_FILE_BYTES,
        {
          existingBytes: getDeviceImagesTotalBytes(existingImages),
          maxTotalBytes: MAX_DEVICE_IMAGES_TOTAL_BYTES,
          fileTypeLabel: "imagens",
        }
      );
      const notices = [...rejectMsgs, ...errors];
      setImageNotice(notices.length ? notices.join(" ") : null);
      if (toAdd.length) onImageFilesChange([...imageFiles, ...toAdd]);
    },
    [existingImages, imageFiles, onImageFilesChange]
  );

  const onDropAudios = useCallback(
    (accepted: File[], rejections: import("react-dropzone").FileRejection[]) => {
      const rejectMsgs = formatDropRejections(rejections);
      const { accepted: toAdd, errors } = acceptFilesWithinLimit(
        accepted,
        audioFiles,
        existingAudios.length,
        MAX_DEVICE_AUDIOS,
        MAX_AUDIO_FILE_BYTES,
        {
          existingBytes: getAudiosTotalBytes([], existingAudios),
          maxTotalBytes: MAX_DEVICE_AUDIOS_TOTAL_BYTES,
          fileTypeLabel: "áudios",
        }
      );
      const notices = [...rejectMsgs, ...errors];
      setAudioNotice(notices.length ? notices.join(" ") : null);
      if (toAdd.length) onAudioFilesChange([...audioFiles, ...toAdd]);
    },
    [audioFiles, existingAudios, onAudioFilesChange]
  );

  const imageDropzone = useDropzone({
    accept: IMAGE_ACCEPT,
    disabled: imagesAtLimit,
    maxSize: MAX_IMAGE_FILE_BYTES,
    onDrop: onDropImages,
    noClick: imagesAtLimit,
    noKeyboard: imagesAtLimit,
  });

  const audioDropzone = useDropzone({
    accept: AUDIO_ACCEPT,
    disabled: audiosAtLimit,
    maxSize: MAX_AUDIO_FILE_BYTES,
    onDrop: onDropAudios,
    noClick: audiosAtLimit,
    noKeyboard: audiosAtLimit,
  });

  const wrapClass = `${styles.wrap} ${variant === "light" ? styles.wrapLight : ""}`;

  return (
    <div className={wrapClass}>
      <section className={styles.block}>
        <h3 className={styles.blockTitle}>Fotos do aparelho</h3>
        <div
          {...imageDropzone.getRootProps({
            className: [
              styles.dropzone,
              imageDropzone.isDragActive && styles.dropzoneActive,
              imageDropzone.isDragReject && styles.dropzoneReject,
              imagesAtLimit && styles.dropzoneDisabled,
            ]
              .filter(Boolean)
              .join(" "),
          })}
        >
          <input {...imageDropzone.getInputProps()} className={styles.hiddenInput} />
          {imageDropzone.isDragActive ? (
            <Upload className={styles.dropzoneIcon} size={28} />
          ) : (
            <ImagePlus className={styles.dropzoneIcon} size={28} />
          )}
          <p className={styles.dropzoneTitle}>
            {imageDropzone.isDragActive
              ? "Solte as imagens aqui"
              : "Arraste imagens ou clique para selecionar"}
          </p>
          <p className={styles.dropzoneHint}>
            PNG, JPG ou WebP · até {formatFileBytes(MAX_IMAGE_FILE_BYTES)} por foto ·{" "}
            {imageCount}/{MAX_DEVICE_IMAGES} ({formatFileBytes(imagesUsedBytes)} /{" "}
            {formatFileBytes(MAX_DEVICE_IMAGES_TOTAL_BYTES)})
          </p>
        </div>

        {imageNotice && !validation.imageMessage && (
          <p className={styles.notice} role="status">
            {imageNotice}
          </p>
        )}
        {validation.imageMessage && (
          <p className={styles.error} role="alert">
            {validation.imageMessage}
          </p>
        )}

        {(existingImages.length > 0 || imageFiles.length > 0) && (
          <ul className={styles.thumbList}>
            {existingImages.map((src, i) => (
              <li key={`existing-img-${i}`} className={styles.thumbItem}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className={styles.thumbImg} />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() =>
                    onExistingImagesChange(existingImages.filter((_, idx) => idx !== i))
                  }
                  aria-label={`Remover imagem ${i + 1}`}
                  title="Remover"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
            {imageFiles.map((file, i) => (
              <li key={`file-img-${file.name}-${file.size}-${i}`} className={styles.thumbItem}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreviews.get(file) ?? ""}
                  alt=""
                  className={styles.thumbImg}
                />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => {
                    setImageNotice(null);
                    onImageFilesChange(imageFiles.filter((_, idx) => idx !== i));
                  }}
                  aria-label={`Remover ${file.name}`}
                  title="Remover"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.block}>
        <h3 className={styles.blockTitle}>Áudios</h3>
        <div
          {...audioDropzone.getRootProps({
            className: [
              styles.dropzone,
              audioDropzone.isDragActive && styles.dropzoneActive,
              audioDropzone.isDragReject && styles.dropzoneReject,
              audiosAtLimit && styles.dropzoneDisabled,
            ]
              .filter(Boolean)
              .join(" "),
          })}
        >
          <input {...audioDropzone.getInputProps()} className={styles.hiddenInput} />
          {audioDropzone.isDragActive ? (
            <Upload className={styles.dropzoneIcon} size={28} />
          ) : (
            <Music2 className={styles.dropzoneIcon} size={28} />
          )}
          <p className={styles.dropzoneTitle}>
            {audioDropzone.isDragActive
              ? "Solte os áudios aqui"
              : "Arraste áudios ou clique para selecionar"}
          </p>
          <p className={styles.dropzoneHint}>
            MP3, WAV ou OGG · até {formatFileBytes(MAX_AUDIO_FILE_BYTES)} por arquivo ·{" "}
            {audioCount}/{MAX_DEVICE_AUDIOS} ({formatFileBytes(audiosUsedBytes)} /{" "}
            {formatFileBytes(MAX_DEVICE_AUDIOS_TOTAL_BYTES)})
          </p>
        </div>

        {audioNotice && !validation.audioMessage && (
          <p className={styles.notice} role="status">
            {audioNotice}
          </p>
        )}
        {validation.audioMessage && (
          <p className={styles.error} role="alert">
            {validation.audioMessage}
          </p>
        )}

        {(existingAudios.length > 0 || audioFiles.length > 0) && (
          <ul className={styles.audioList}>
            {existingAudios.map((url, i) => (
              <li key={`existing-audio-${i}`} className={styles.audioItem}>
                <Music2 className={styles.audioIcon} size={18} />
                <div className={styles.audioMeta}>
                  <span className={styles.audioName}>Áudio salvo {i + 1}</span>
                  <span className={styles.audioSize}>
                    {formatFileBytes(getDataUrlByteSize(url))}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.audioRemove}
                  onClick={() =>
                    onExistingAudiosChange(existingAudios.filter((_, idx) => idx !== i))
                  }
                  aria-label={`Remover áudio ${i + 1}`}
                  title="Remover"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
            {audioFiles.map((file, i) => (
              <li key={`file-audio-${file.name}-${file.size}-${i}`} className={styles.audioItem}>
                <Music2 className={styles.audioIcon} size={18} />
                <div className={styles.audioMeta}>
                  <span className={styles.audioName}>{file.name}</span>
                  <span className={styles.audioSize}>{formatFileBytes(file.size)}</span>
                </div>
                <button
                  type="button"
                  className={styles.audioRemove}
                  onClick={() => {
                    setAudioNotice(null);
                    onAudioFilesChange(audioFiles.filter((_, idx) => idx !== i));
                  }}
                  aria-label={`Remover ${file.name}`}
                  title="Remover"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/** Validação exportada para o formulário pai bloquear submit. */
export { validateFormMedia };
