/**
 * Dados do emitente do recibo — alinhados ao orçamento PHC (BudgetTemplate).
 * Única fonte para o rodapé automático do PDF.
 */
export const RECEIPT_ISSUER = {
  name: "PHC Eletrônica Industrial",
  document: "33.593.091/0001-75",
  phone: "(87) 99928-2633",
  
} as const;

/** Local padrão da linha “Cidade - UF, data” (mesmo município do orçamento). */
export const RECEIPT_ISSUER_DEFAULT_LOCATION = {
  city: "Araripina",
  state: "PE",
} as const;
