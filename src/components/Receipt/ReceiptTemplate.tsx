import React, { forwardRef } from "react";
import Image from "next/image";
import { FormItem } from "../../types/Form-itens/FormItem";
import { numberToWords } from "../../lib/numberToWords";

interface ReceiptTemplateProps {
  item: FormItem;
}

function formatDateExtensive(date: Date | string | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
  ({ item }, ref) => {
    const clientName = item.empresa?.trim() || item.name?.trim() || "—";
    const priceFormatted = item.price != null
      ? item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "—";
    const priceExtensive = item.price != null ? numberToWords(item.price) : "—";
    const dateFormatted = formatDateExtensive(item.createdAt);

    const bold: React.CSSProperties = { fontWeight: 700 };

    return (
      <div
        ref={ref}
        style={{
          width: "794px",
          minHeight: "1123px",
          backgroundColor: "#fff",
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          color: "#000",
          padding: "60px 70px",
          boxSizing: "border-box",
          lineHeight: 1.6,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Image
            src="/logo.phc.png"
            alt="PHC Eletrônica Industrial"
            width={320}
            height={100}
            priority
            unoptimized
            crossOrigin="anonymous"
            style={{ maxWidth: "320px", maxHeight: "100px", width: "auto", height: "auto", objectFit: "contain" }}
          />
        </div>

        {/* Address block */}
        <div style={{ marginBottom: "6px" }}>
          <span style={{ fontWeight: 700 }}>Rua:</span> Boaventura Pereira de Alencar, nº 01 &nbsp;&nbsp; e Rua: Expedito Granja Arraes, nº 1156
        </div>
        <div style={{ marginBottom: "6px" }}>
          Araripina-PE &nbsp;&nbsp; Telefone: (87) 99928-2633
        </div>
        <div style={{ marginBottom: "24px" }}>
          <span style={{ fontWeight: 700 }}>E-mail</span>:{" "}
          <span style={{ fontWeight: 700 }}>phc771@gmail.com</span>{" "}
          /{" "}
          <span style={{ fontWeight: 700 }}>phc21575628@gmail.com</span>
          &nbsp;&nbsp; CNPJ: 33593091/0001-75
        </div>

        {/* Title */}
        <div
          style={{
            fontWeight: 700,
            fontSize: "16px",
            marginBottom: "14px",
          }}
        >
          Recibo de Pagamento
        </div>

        {/* Body text */}
        <p style={{ textAlign: "justify", marginBottom: "14px", lineHeight: 1.8 }}>
          Eu, declaro ter recebido do{" "}
          <span style={bold}>{clientName}</span>
          , com sede na{" "}
          <span style={bold}>{item.address || "—"}</span>
          , CEP{" "}
          <span style={bold}>{item.cep || "—"}</span>
          , telefone{" "}
          <span style={bold}>{item.phone || "—"}</span>
          , a importância de{" "}
          <span style={bold}>R$ {priceFormatted.replace("R$", "").trim()}</span>
          {" "}
          <span style={bold}>({priceExtensive})</span>{" "}
          referente ao conserto de um{" "}
          <span style={bold}>{item.aparelho ?? "—"}</span>.
        </p>

        {/* Date */}
        <p style={{ marginBottom: "40px" }}>
          Data:{" "}
          <span style={{ fontWeight: 500 }}>{dateFormatted}</span>
        </p>

        {/* QR Code + payment info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          <Image
            src="/image.png"
            alt="QR Code Pix"
            width={120}
            height={120}
            priority
            unoptimized
            crossOrigin="anonymous"
            style={{ width: "120px", height: "120px" }}
          />
          <div>
            <div style={{ marginBottom: "4px" }}>
              <span style={{ fontWeight: 700 }}>Nome:</span> Paulo Henrique das Chagas
            </div>
            <div>
              <span style={{ fontWeight: 700 }}>Chave Pix:</span> 33.593.091/0001-75
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ReceiptTemplate.displayName = "ReceiptTemplate";

export default ReceiptTemplate;
