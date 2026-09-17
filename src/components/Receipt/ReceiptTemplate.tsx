import React, { forwardRef } from "react";
import Image from "next/image";
import { numberToWords } from "../../lib/numberToWords";
import { RECEIPT_ISSUER, RECEIPT_ISSUER_DEFAULT_LOCATION } from "./receiptIssuer";
import type { ReceiptClientPayload } from "./receiptTypes";

export interface ReceiptTemplateProps {
  totalPrice: number;
  client: ReceiptClientPayload;
  /** Data da linha local (momento da confirmação no modal). */
  receiptDate: Date;
}

function formatDateLongPtBr(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleDateString("pt-BR", { month: "long" });
  const year = date.getFullYear();
  return `${day} de ${month} de ${year}`;
}

function capitalizeFirstSentence(s: string): string {
  if (!s || s === "—") return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatMarcaModelo(brand: string, model: string): string {
  const b = brand.trim();
  const m = model.trim();
  if (b && m) return `${b} / ${m}`;
  return b || m || "—";
}

const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
  ({ totalPrice, client, receiptDate }, ref) => {
    const priceFormatted = totalPrice.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    const priceExtensive = capitalizeFirstSentence(numberToWords(totalPrice));

    const dateLine = `${client.city} - ${client.state}, ${formatDateLongPtBr(receiptDate)}.`;
    const serviceText = client.serviceDescription.trim() || "—";

    const listItem: React.CSSProperties = {
      margin: "0 0 8px 0",
      paddingLeft: "4px",
      lineHeight: 1.55,
    };

    return (
      <div
        ref={ref}
        style={{
          width: "794px",
          backgroundColor: "#fff",
          fontFamily: "Arial, sans-serif",
          fontSize: "15px",
          color: "#000",
          padding: "56px 72px 64px",
          boxSizing: "border-box",
          lineHeight: 1.55,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <Image
            src="/logo.phc.png"
            alt="PHC Eletrônica Industrial"
            width={300}
            height={94}
            priority
            unoptimized
            crossOrigin="anonymous"
            style={{ maxWidth: "300px", height: "auto", objectFit: "contain" }}
          />
        </div>

        <div style={{ textAlign: "center", marginBottom: "8px", fontWeight: 700, fontSize: "17px" }}>
          Valor: {priceFormatted}
        </div>
        <div style={{ textAlign: "center", marginBottom: "32px", fontSize: "15px" }}>({priceExtensive})</div>

        <p style={{ margin: "0 0 20px", textAlign: "justify" }}>
          Recebi(emos) de {client.clientName}, inscrito(a) no CPF/CNPJ sob o nº {client.clientDocument}, a
          importância de {priceFormatted}, referente ao pagamento pelos serviços de {serviceText} realizados no
          seguinte equipamento:
        </p>

        <ul
          style={{
            margin: "0 0 28px 0",
            padding: "0 0 0 22px",
            listStyle: "none",
          }}
        >
          <li style={listItem}>
            <strong>Equipamento:</strong> {client.equipmentType || "—"}
          </li>
          <li style={listItem}>
            <strong>Marca/Modelo:</strong> {formatMarcaModelo(client.brand, client.model)}
          </li>
          <li style={{ ...listItem, marginBottom: 0 }}>
            <strong>Número de Série:</strong> {client.serialNumber || "—"}
          </li>
        </ul>

        <p style={{ margin: "0 0 36px", textAlign: "justify" }}>
          Pelo presente, damos plena e geral quitação pelo serviço acima descrito.
        </p>

        <p style={{ margin: "0 0 48px" }}>{dateLine}</p>

        <div
          style={{
            borderTop: "1px solid #000",
            width: "min(100%, 320px)",
            paddingTop: "10px",
            marginBottom: "6px",
          }}
        />
        <div style={{ fontWeight: 700, marginBottom: "6px" }}>{RECEIPT_ISSUER.name}</div>
        <div style={{ marginBottom: "4px" }}>
        <strong>Endereço:</strong> {RECEIPT_ISSUER_DEFAULT_LOCATION.city} - {RECEIPT_ISSUER_DEFAULT_LOCATION.state}, Brasil
        </div>
        <div>
          <strong>CNPJ/CPF:</strong> {RECEIPT_ISSUER.document}
        </div>
        <div>
          <strong>Contato:</strong> {RECEIPT_ISSUER.phone}
        </div>
      </div>
    );
  }
);

ReceiptTemplate.displayName = "ReceiptTemplate";

export default ReceiptTemplate;
