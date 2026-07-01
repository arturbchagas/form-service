export type ClientFormValues = {
  name: string;
  empresa: string;
  phone: string;
  cep: string;
  email: string;
  address: string;
};

export interface ClientItem {
  id: string;
  name?: string;
  empresa?: string;
  phone?: string;
  cep?: string;
  email?: string;
  address?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export function clientDisplayLabel(client: ClientItem): string {
  const empresa = client.empresa?.trim();
  const name = client.name?.trim();
  if (empresa && name) return `${empresa} — ${name}`;
  return empresa || name || "Cliente sem identificação";
}
