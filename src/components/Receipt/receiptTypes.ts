/**
 * Campos do recibo preenchidos pelo usuário no modal antes de gerar o PDF.
 */
export type ReceiptClientPayload = {
  clientName: string;
  clientDocument: string;
  city: string;
  state: string;
  /** Descrição do serviço pago (ex.: manutenção, conserto, instalação). */
  serviceDescription: string;
  equipmentType: string;
  brand: string;
  model: string;
  serialNumber: string;
};
