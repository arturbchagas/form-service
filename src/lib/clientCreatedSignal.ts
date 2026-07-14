/** Sinal cross-tab: nova aba de clientes avisa a aba da O.S. após cadastro. */
const STORAGE_KEY = "form-service:client-created";

export function signalClientCreated(clientId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ clientId, at: Date.now() })
  );
}

export function readClientCreatedSignal(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { clientId?: string };
    localStorage.removeItem(STORAGE_KEY);
    return parsed.clientId ?? null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}
