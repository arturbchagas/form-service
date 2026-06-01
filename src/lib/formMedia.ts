import type { Accept, FileRejection } from "react-dropzone";
import {
  MAX_DEVICE_IMAGES,
  MAX_DEVICE_IMAGES_TOTAL_BYTES,
  MAX_IMAGE_FILE_BYTES,
  formatImageBytes,
  getDataUrlByteSize,
  getDeviceImagesTotalBytes,
} from "@/lib/readImageDataUrls";

export const MAX_DEVICE_AUDIOS = 5;

/** Tamanho máximo por arquivo de áudio (15 MiB). */
export const MAX_AUDIO_FILE_BYTES = 15 * 1024 * 1024;

/** Tamanho máximo combinado dos áudios (50 MiB). */
export const MAX_DEVICE_AUDIOS_TOTAL_BYTES = 50 * 1024 * 1024;

export const MAX_AUDIO_DATA_URL_LENGTH = 20_000_000;

export const IMAGE_ACCEPT: Accept = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
};

export const AUDIO_ACCEPT: Accept = {
  "audio/mpeg": [".mp3"],
  "audio/wav": [".wav"],
  "audio/ogg": [".ogg"],
  "audio/x-wav": [".wav"],
};

export type FormMediaFilesState = {
  imageFiles: File[];
  audioFiles: File[];
  existingImages: string[];
  existingAudios: string[];
};

export type FormMediaValidation = {
  ok: boolean;
  imageMessage: string | null;
  audioMessage: string | null;
  imagesTotalBytes: number;
  audiosTotalBytes: number;
};

export function formatFileBytes(bytes: number): string {
  return formatImageBytes(bytes);
}

export function getFilesTotalBytes(files: File[]): number {
  return files.reduce((sum, f) => sum + f.size, 0);
}

export function getAudiosTotalBytes(files: File[], existingDataUrls: string[]): number {
  return (
    getFilesTotalBytes(files) +
    existingDataUrls.reduce((sum, url) => sum + getDataUrlByteSize(url), 0)
  );
}

export function validateFormMedia(state: FormMediaFilesState): FormMediaValidation {
  const imageCount = state.existingImages.length + state.imageFiles.length;
  const audioCount = state.existingAudios.length + state.audioFiles.length;

  let imageMessage: string | null = null;
  let audioMessage: string | null = null;

  if (imageCount > MAX_DEVICE_IMAGES) {
    imageMessage = `Máximo de ${MAX_DEVICE_IMAGES} imagens por ordem de serviço. Remova ${imageCount - MAX_DEVICE_IMAGES} foto(s).`;
  }

  const imagesTotalBytes =
    getDeviceImagesTotalBytes(state.existingImages) +
    getFilesTotalBytes(state.imageFiles);

  if (!imageMessage && imagesTotalBytes > MAX_DEVICE_IMAGES_TOTAL_BYTES) {
    imageMessage = `O total das imagens (${formatFileBytes(imagesTotalBytes)}) ultrapassa ${formatFileBytes(MAX_DEVICE_IMAGES_TOTAL_BYTES)}. Remova algumas fotos para enviar.`;
  }

  if (audioCount > MAX_DEVICE_AUDIOS) {
    audioMessage = `Máximo de ${MAX_DEVICE_AUDIOS} áudios por ordem de serviço. Remova ${audioCount - MAX_DEVICE_AUDIOS} arquivo(s).`;
  }

  const audiosTotalBytes = getAudiosTotalBytes(
    state.audioFiles,
    state.existingAudios
  );

  if (!audioMessage && audiosTotalBytes > MAX_DEVICE_AUDIOS_TOTAL_BYTES) {
    audioMessage = `O total dos áudios (${formatFileBytes(audiosTotalBytes)}) ultrapassa ${formatFileBytes(MAX_DEVICE_AUDIOS_TOTAL_BYTES)}. Remova alguns arquivos para enviar.`;
  }

  const oversizeImage = state.imageFiles.find((f) => f.size > MAX_IMAGE_FILE_BYTES);
  if (!imageMessage && oversizeImage) {
    imageMessage = `"${oversizeImage.name}" excede ${formatFileBytes(MAX_IMAGE_FILE_BYTES)} por imagem.`;
  }

  const oversizeAudio = state.audioFiles.find((f) => f.size > MAX_AUDIO_FILE_BYTES);
  if (!audioMessage && oversizeAudio) {
    audioMessage = `"${oversizeAudio.name}" excede ${formatFileBytes(MAX_AUDIO_FILE_BYTES)} por áudio.`;
  }

  return {
    ok: !imageMessage && !audioMessage,
    imageMessage,
    audioMessage,
    imagesTotalBytes,
    audiosTotalBytes,
  };
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Leitura inválida"));
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

/** Converte arquivos novos + existentes para persistência (API atual). */
export async function resolveMediaForSubmit(state: FormMediaFilesState): Promise<{
  deviceImages: string[];
  deviceAudios: string[];
}> {
  const [newImages, newAudios] = await Promise.all([
    Promise.all(state.imageFiles.map(readFileAsDataUrl)),
    Promise.all(state.audioFiles.map(readFileAsDataUrl)),
  ]);
  return {
    deviceImages: [...state.existingImages, ...newImages],
    deviceAudios: [...state.existingAudios, ...newAudios],
  };
}

/** Monta FormData com arquivos nativos prontos para envio multipart. */
export function buildServiceOrderFormData(
  fields: Record<string, string>,
  imageFiles: File[],
  audioFiles: File[]
): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  imageFiles.forEach((file) => formData.append("deviceImages", file));
  audioFiles.forEach((file) => formData.append("deviceAudios", file));
  return formData;
}

export function formatDropRejections(rejections: FileRejection[]): string[] {
  return rejections.flatMap((r) =>
    r.errors.map((e) => {
      if (e.code === "file-too-large") {
        return `"${r.file.name}" é grande demais.`;
      }
      if (e.code === "file-invalid-type") {
        return `"${r.file.name}" não é um tipo permitido.`;
      }
      if (e.code === "too-many-files") {
        return "Quantidade de arquivos excede o limite.";
      }
      return `"${r.file.name}": ${e.message}`;
    })
  );
}

export type AcceptDropResult = {
  accepted: File[];
  errors: string[];
};

/** Aplica limite de quantidade ao aceitar um lote no dropzone. */
export function acceptFilesWithinLimit(
  incoming: File[],
  currentFiles: File[],
  existingCount: number,
  maxCount: number,
  maxPerFile: number,
  options?: {
    existingBytes?: number;
    maxTotalBytes?: number;
    fileTypeLabel?: string;
  }
): AcceptDropResult {
  const errors: string[] = [];
  const remaining = Math.max(0, maxCount - existingCount - currentFiles.length);

  if (remaining === 0) {
    return {
      accepted: [],
      errors: [`Limite de ${maxCount} ${options?.fileTypeLabel ?? "arquivos"} atingido.`],
    };
  }

  const accepted: File[] = [];
  let addedBytes =
    getFilesTotalBytes(currentFiles) + (options?.existingBytes ?? 0);

  for (const file of incoming) {
    if (accepted.length >= remaining) {
      errors.push(
        `Só é possível adicionar mais ${remaining} ${options?.fileTypeLabel ?? "arquivo(s)"}. Os demais foram ignorados.`
      );
      break;
    }
    if (file.size > maxPerFile) {
      errors.push(
        `"${file.name}" excede ${formatFileBytes(maxPerFile)} por arquivo.`
      );
      continue;
    }
    if (
      options?.maxTotalBytes != null &&
      addedBytes + file.size > options.maxTotalBytes
    ) {
      errors.push(
        `Adicionar "${file.name}" ultrapassaria o total de ${formatFileBytes(options.maxTotalBytes)}.`
      );
      continue;
    }
    accepted.push(file);
    addedBytes += file.size;
  }

  return { accepted, errors };
}
