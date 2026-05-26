/** Limite de imagens por ordem de serviço (armazenadas como data URL no banco). */
export const MAX_DEVICE_IMAGES = 10;

/** Tamanho máximo por arquivo antes de ler como data URL (10 MiB). */
export const MAX_IMAGE_FILE_BYTES = 10 * 1024 * 1024;

/** Tamanho máximo combinado de todas as imagens da ordem (30 MiB). */
export const MAX_DEVICE_IMAGES_TOTAL_BYTES = 30 * 1024 * 1024;

/** Limite de caracteres por data URL no servidor (~10 MiB em base64). */
export const MAX_DATA_URL_LENGTH = 14_000_000;

export type ReadImagesResult = {
  dataUrls: string[];
  skipped: string[];
  /** Erro que impede adicionar o lote (ex.: total ultrapassado). */
  blocked?: string;
};

export function formatImageBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Estima o tamanho em bytes de uma data URL (base64). */
export function getDataUrlByteSize(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

export function getDeviceImagesTotalBytes(images: string[]): number {
  return images.reduce((sum, url) => sum + getDataUrlByteSize(url), 0);
}

export type DeviceImagesValidation = {
  ok: boolean;
  message: string | null;
  totalBytes: number;
};

export function validateDeviceImages(images: string[]): DeviceImagesValidation {
  const totalBytes = getDeviceImagesTotalBytes(images);
  if (totalBytes > MAX_DEVICE_IMAGES_TOTAL_BYTES) {
    return {
      ok: false,
      totalBytes,
      message: `O total das imagens (${formatImageBytes(totalBytes)}) ultrapassa o limite de ${formatImageBytes(MAX_DEVICE_IMAGES_TOTAL_BYTES)}. Remova algumas fotos para enviar o formulário.`,
    };
  }
  return { ok: true, totalBytes, message: null };
}

/**
 * Lê arquivos de imagem como data URLs, respeitando limite de quantidade, tamanho por arquivo e total.
 */
export function readImageFilesAsDataUrls(
  files: FileList | null,
  existingCount: number,
  existingDataUrls: string[] = []
): Promise<ReadImagesResult> {
  if (!files?.length) return Promise.resolve({ dataUrls: [], skipped: [] });

  const remaining = Math.max(0, MAX_DEVICE_IMAGES - existingCount);
  if (remaining === 0) {
    return Promise.resolve({
      dataUrls: [],
      skipped: ["Limite de imagens atingido."],
    });
  }

  const existingTotal = getDeviceImagesTotalBytes(existingDataUrls);
  const list = Array.from(files).slice(0, remaining);
  const skipped: string[] = [];
  const maxPerFileLabel = formatImageBytes(MAX_IMAGE_FILE_BYTES);
  const maxTotalLabel = formatImageBytes(MAX_DEVICE_IMAGES_TOTAL_BYTES);

  const toRead = list.filter((f) => {
    if (!f.type.startsWith("image/")) {
      skipped.push(`"${f.name}" não é imagem.`);
      return false;
    }
    if (f.size > MAX_IMAGE_FILE_BYTES) {
      skipped.push(`"${f.name}" excede ${maxPerFileLabel} por arquivo.`);
      return false;
    }
    return true;
  });

  const batchFileBytes = toRead.reduce((sum, f) => sum + f.size, 0);
  if (existingTotal + batchFileBytes > MAX_DEVICE_IMAGES_TOTAL_BYTES) {
    return Promise.resolve({
      dataUrls: [],
      skipped,
      blocked: `Estas fotos somam cerca de ${formatImageBytes(batchFileBytes)} e, com as ${existingDataUrls.length} já adicionadas (${formatImageBytes(existingTotal)}), ultrapassam o limite total de ${maxTotalLabel}.`,
    });
  }

  return Promise.all(
    toRead.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const r = reader.result;
            if (typeof r === "string") resolve(r);
            else reject(new Error("Leitura inválida"));
          };
          reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler arquivo"));
          reader.readAsDataURL(file);
        })
    )
  ).then((dataUrls) => {
    const mergedTotal = existingTotal + getDeviceImagesTotalBytes(dataUrls);
    if (mergedTotal > MAX_DEVICE_IMAGES_TOTAL_BYTES) {
      return {
        dataUrls: [],
        skipped,
        blocked: `Após processar as imagens, o total (${formatImageBytes(mergedTotal)}) ultrapassa o limite de ${maxTotalLabel}.`,
      };
    }
    return { dataUrls, skipped };
  });
}

/** @deprecated Use MAX_IMAGE_FILE_BYTES */
export const MAX_IMAGE_BYTES = MAX_IMAGE_FILE_BYTES;
