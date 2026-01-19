export interface FormItem {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  companyNamer?: string;
  brand: string;
  model: string;
  serialNumber?: string;
  defects: string;
  defectsHistory?: string;
  status: 'novo'| 'aprovado'| 'reprovado' | 'pago' |'pronto'|'entregue'|'cancelado';
}
