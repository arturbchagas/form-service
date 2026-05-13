/** Limite de imagens por ordem de serviço (armazenadas como data URL no banco). */
export const MAX_DEVICE_IMAGES = 10;

/** Tamanho máximo por arquivo antes de ler como data URL (4 MiB). */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export type ReadImagesResult = { dataUrls: string[]; skipped: string[] };

/**
 * Lê arquivos de imagem como data URLs, respeitando limite de quantidade e tamanho.
 * `existingCount` evita ultrapassar MAX_DEVICE_IMAGES no total.
 */
export function readImageFilesAsDataUrls(
  files: FileList | null,
  existingCount: number
): Promise<ReadImagesResult> {
  if (!files?.length) return Promise.resolve({ dataUrls: [], skipped: [] });

  const remaining = Math.max(0, MAX_DEVICE_IMAGES - existingCount);
  if (remaining === 0) {
    return Promise.resolve({
      dataUrls: [],
      skipped: ["Limite de imagens atingido."],
    });
  }

  const list = Array.from(files).slice(0, remaining);
  const skipped: string[] = [];
  const toRead = list.filter((f) => {
    if (!f.type.startsWith("image/")) {
      skipped.push(`"${f.name}" não é imagem.`);
      return false;
    }
    if (f.size > MAX_IMAGE_BYTES) {
      skipped.push(`"${f.name}" excede 4 MB.`);
      return false;
    }
    return true;
  });

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
  ).then((dataUrls) => ({ dataUrls, skipped }));
}
