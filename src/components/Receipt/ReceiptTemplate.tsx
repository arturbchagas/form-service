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

function formatDateCityLine(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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

    const dateLine = `${client.city} - ${client.state}, ${formatDateCityLine(receiptDate)}.`;

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
          VALOR: {priceFormatted}
        </div>
        <div style={{ textAlign: "center", marginBottom: "32px", fontSize: "15px" }}>({priceExtensive})</div>

        <p style={{ margin: "0 0 10px" }}>
          <strong>Recebemos de:</strong> {client.clientName}
        </p>
        <p style={{ margin: "0 0 28px" }}>
          <strong>CPF/CNPJ:</strong> {client.clientDocument}
        </p>

        <p style={{ margin: "0 0 16px" }}>Referente ao PAGAMENTO PARCIAL (SINAL DE 50% DO VALOR TOTAL) para início do serviço no item abaixo descrito:</p>

        <ul
          style={{
            margin: "0 0 28px 0",
            padding: "0 0 0 22px",
            listStyle: "none",
          }}
        >
          <li style={listItem}>
            <span style={{ marginRight: "8px", fontWeight: 700 }}>*</span>
            <strong>EQUIPAMENTO:</strong> {client.equipmentType}
          </li>
          <li style={listItem}>
            <span style={{ marginRight: "8px", fontWeight: 700 }}>*</span>
            <strong>MARCA/MODELO:</strong> {formatMarcaModelo(client.brand, client.model)}
          </li>
          <li style={{ ...listItem, marginBottom: 0 }}>
            <span style={{ marginRight: "8px", fontWeight: 700 }}>*</span>
            <strong>Nº DE SÉRIE:</strong> {client.serialNumber || "—"}
          </li>
        </ul>

        <p style={{ margin: "0 0 36px", textAlign: "justify" }}>
          Damos, por meio deste, quitação exclusivamente do valor acima mencionado, restando o saldo de R$ (valor_restante) a ser pago na entrega do serviço.
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
