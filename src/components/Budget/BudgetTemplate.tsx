import React, { forwardRef } from "react";
import Image from "next/image";
import { FormItem } from "../../types/Form-itens/FormItem";

interface BudgetTemplateProps {
  item: FormItem;
  /** Texto opcional vindo do modal antes de gerar o PDF; se vazio, a célula fica em branco. */
  serviceDescription?: string;
  /** Observações opcionais exibidas no rodapé do documento. */
  observations?: string;
}

function brandModel(item: FormItem): string {
  const b = item.brand?.trim();
  const m = item.model?.trim();
  if (b && m) return `${b} / ${m}`;
  return b || m || "—";
}

const BudgetTemplate = forwardRef<HTMLDivElement, BudgetTemplateProps>(
  ({ item, serviceDescription = "", observations = "" }, ref) => {
  const clientTitle = item.empresa?.trim() || item.name?.trim() || "—";
  const budgetDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const priceFormatted =
    item.price != null
      ? item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "—";

  const cell: React.CSSProperties = {
    border: "1px solid #000",
    padding: "10px 8px",
    verticalAlign: "top",
    fontSize: "13px",
    boxSizing: "border-box",
  };

  const serialCell: React.CSSProperties = {
    ...cell,
    wordBreak: "break-all",
    overflowWrap: "anywhere",
    maxWidth: "1px",
    width: "12%",
  };

  const descCell: React.CSSProperties = {
    ...cell,
    wordBreak: "break-word",
    overflowWrap: "break-word",
    whiteSpace: "pre-wrap",
    maxWidth: "1px",
    width: "38%",
  };

  const descText = serviceDescription.trim();
  const observationsText = observations.trim();

  const th: React.CSSProperties = {
    ...cell,
    fontWeight: 700,
    backgroundColor: "#f0f0f0",
    textAlign: "center",
  };

  /** Ajuda o `jspdf.html` + `autoPaging: "text"` a não partir blocos no meio. */
  const avoidPageSplit: React.CSSProperties = {
    breakInside: "avoid",
    pageBreakInside: "avoid",
  };

  return (
    <div
      ref={ref}
      style={{
        width: "794px",
        backgroundColor: "#fff",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        color: "#000",
        padding: "48px 56px",
        boxSizing: "border-box",
        lineHeight: 1.55,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
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

      <div style={{ fontSize: "12px", marginBottom: "18px", lineHeight: 1.65 }}>
        <div>
          <strong>Rua:</strong> Boaventura Pereira de Alencar, nº 01 e Rua: Expedito Granja Arraes, nº 1156
        </div>
        <div>Araripina-PE &nbsp;&nbsp; <strong>Telefone:</strong> (87) 99928-2633</div>
        <div>
          <strong>E-mail:</strong> phc771@gmail.com / phc21575628@gmail.com &nbsp;&nbsp;{" "}
          <strong>CNPJ:</strong> 33593091/0001-75
        </div>
      </div>

      <div style={{ marginBottom: "16px", fontSize: "13px" }}>
        <div style={{ marginBottom: "6px" }}>
          <strong>Data:</strong> {budgetDate}
        </div>
        <div style={{ marginBottom: "6px" }}>
          <strong>CLIENTE:</strong> {clientTitle}
        </div>
        <div style={{ marginBottom: "6px" }}>
          <strong>E-MAIL:</strong> {item.email?.trim() || "—"}
        </div>
        <div>
          <strong>TELEFONE:</strong> {item.phone?.trim() || "—"}
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: "16px",
          margin: "22px 0 14px",
          letterSpacing: "0.02em",
        }}
      >
        ORÇAMENTO DE SERVIÇOS
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
          tableLayout: "fixed",
        }}
      >
        <colgroup>
          <col style={{ width: "15%" }} />
          <col style={{ width: "17%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "38%" }} />
          <col style={{ width: "18%" }} />
        </colgroup>
        <thead>
          <tr>
            <th style={{ ...th, width: "15%" }}>Equipamento</th>
            <th style={{ ...th, width: "17%" }}>Marca/Modelo</th>
            <th style={{ ...th, width: "12%" }}>Número de Série (SN)</th>
            <th style={{ ...th, width: "38%" }}>Descrição do Serviço</th>
            <th style={{ ...th, width: "18%" }}>Valor (R$)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ ...cell, wordBreak: "break-word", overflowWrap: "break-word" }}>
              {item.aparelho?.trim() || "—"}
            </td>
            <td style={{ ...cell, wordBreak: "break-word", overflowWrap: "break-word" }}>{brandModel(item)}</td>
            <td style={serialCell}>{item.serialNumber?.trim() || "—"}</td>
            <td style={descCell}>{descText ? descText : "\u00A0"}</td>
            <td style={{ ...cell, textAlign: "right", whiteSpace: "nowrap" }}>{priceFormatted}</td>
          </tr>
          <tr>
            <td colSpan={4} style={{ ...cell, fontWeight: 700, textAlign: "right" }}>
              VALOR TOTAL
            </td>
            <td style={{ ...cell, fontWeight: 700, textAlign: "right", whiteSpace: "nowrap" }}>
              {priceFormatted}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: "11px", lineHeight: 1.5, marginTop: "8px" }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: "12px",
            marginBottom: "8px",
            ...avoidPageSplit,
          }}
        >
          Termos e Condições do Orçamento
        </div>

        <p style={{ fontWeight: 700, margin: "0 0 4px", ...avoidPageSplit }}>1. Forma de Pagamento</p>
        <p style={{ margin: "0 0 8px", ...avoidPageSplit }}>
          O valor total do orçamento será dividido em duas parcelas:
        </p>
        <ul style={{ margin: "0 0 10px 18px", padding: 0 }}>
          <li style={{ marginBottom: "4px", ...avoidPageSplit }}>
            Primeira Parcela: 50% do valor total, a ser paga no ato da aprovação do orçamento.
          </li>
          <li style={{ marginBottom: "4px", ...avoidPageSplit }}>
            Segunda Parcela: Os 50% restantes, a serem pagos na entrega do equipamento após o reparo.
          </li>
        </ul>
        <p style={{ fontWeight: 700, margin: "0 0 4px", ...avoidPageSplit }}>Observação:</p>
        <ul style={{ margin: "0 0 12px 18px", padding: 0 }}>
          <li style={{ marginBottom: "4px", ...avoidPageSplit }}>
            Este orçamento não inclui custos de instalação, parametrização ou transporte do equipamento.
          </li>
          <li style={{ marginBottom: "4px", ...avoidPageSplit }}>
            A programação ou parametrização original do equipamento pode ser alterada ou apagada durante o
            procedimento de reparo.
          </li>
        </ul>

        <p style={{ fontWeight: 700, margin: "0 0 4px", ...avoidPageSplit }}>2. Garantia de Serviço</p>
        <p style={{ margin: "0 0 6px", ...avoidPageSplit }}>
          A garantia do serviço é de 90 (noventa) dias, contados a partir da data de entrega do equipamento.
        </p>
        <p style={{ fontWeight: 700, margin: "0 0 4px", ...avoidPageSplit }}>Observação:</p>
        <p style={{ margin: "0 0 6px", ...avoidPageSplit }}>
          A garantia será automaticamente anulada nas seguintes situações:
        </p>
        <ul style={{ margin: "0 0 12px 18px", padding: 0 }}>
          <li style={{ marginBottom: "4px", ...avoidPageSplit }}>
            Mau uso: Queda, derramamento de líquidos ou uso indevido do equipamento.
          </li>
          <li style={{ marginBottom: "4px", ...avoidPageSplit }}>
            Modificações não autorizadas: Alterações realizadas por pessoas não autorizadas.
          </li>
          <li style={{ marginBottom: "4px", ...avoidPageSplit }}>
            Violação de segurança: Remoção, alteração ou ilegibilidade do número de série, bem como dos lacres de
            segurança do produto.
          </li>
        </ul>

        <p style={{ margin: "0 0 10px", ...avoidPageSplit }}>
          <strong>3. DIAGNÓSTICO TÉCNICO:</strong> O valor orçado refere-se às avarias identificadas nos testes
          iniciais. Devido à interdependência dos circuitos eletrônicos, caso surjam falhas ocultas em estágios
          secundários (ex: placas de controle, processamento ou comunicação) após a restauração do sistema
          principal, um orçamento complementar será submetido à aprovação prévia.
        </p>
        <p style={{ margin: "0 0 10px", ...avoidPageSplit }}>
          <strong>4. VALIDADE E REAJUSTE:</strong> Este orçamento tem validade de 48 horas. Após este prazo, os
          valores podem sofrer reajuste imediato conforme a variação de custo dos componentes importados junto aos
          fornecedores.
        </p>
        <p style={{ margin: "0 0 10px", ...avoidPageSplit }}>
          <strong>5. PEÇAS SUBSTITUÍDAS:</strong> As peças danificadas substituídas durante o serviço estarão
          disponíveis para retirada pelo cliente por até 7 dias após a entrega do equipamento; após este prazo,
          serão destinadas ao descarte ecológico.
        </p>

        <p style={{ margin: "0 0 6px", ...avoidPageSplit }}>
          <strong>6. RETIRADA E CUSTÓDIA DE EQUIPAMENTOS:</strong> Concluído o serviço ou recusado este orçamento,
          o cliente será notificado por meio dos canais de contato fornecidos. A partir da notificação, o cliente
          dispõe do prazo improrrogável de 30 (trinta) dias corridos para efetuar o pagamento e retirar o
          equipamento.
        </p>
        <ul style={{ margin: "0 0 14px 18px", padding: 0 }}>
          <li style={{ marginBottom: "4px", ...avoidPageSplit }}>
            <strong>Taxa de Armazenamento:</strong> Findo o prazo de 30 dias, restará configurada a mora do
            credor (art. 400 do Código Civil). A partir do 31º dia, incidirá uma Taxa de Armazenamento e Custódia
            no valor diário de R$10,00 (ou mensal de R$300,00), cobrada em razão
            da ocupação de espaço físico, guarda e conservação do bem (arts. 627 e 651 do Código Civil Brasileiro).
          </li>
          <li style={{ marginBottom: "4px", ...avoidPageSplit }}>
            <strong>Abandono:</strong> O não comparecimento para a retirada do equipamento por prazo superior a 90
            (noventa) dias contados da primeira notificação autoriza a PHC Eletrônica Industrial a adotar as medidas
            judiciais cabíveis para a cobrança dos custos de reparo e das taxas de custódia acumuladas, inclusive
            mediante pedido judicial de retenção ou adjudicação do bem para quitação integral do débito.
          </li>
        </ul>

        <p
          style={{
            margin: "12px 0 0",
            borderTop: "1px solid #ccc",
            paddingTop: "12px",
            ...avoidPageSplit,
          }}
        >
          Caso tenha alguma dúvida sobre os termos ou precise de mais detalhes, estou à disposição para ajudar.
        </p>

        {observationsText ? (
          <div
            style={{
              marginTop: "14px",
              borderTop: "1px solid #ccc",
              paddingTop: "12px",
              ...avoidPageSplit,
            }}
          >
            <p style={{ fontWeight: 700, margin: "0 0 6px", fontSize: "12px" }}>Observações</p>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{observationsText}</p>
          </div>
        ) : null}
      </div>

      <div
        style={{
          marginTop: "28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "10px",
          ...avoidPageSplit,
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
        <div style={{ fontSize: "13px" }}>
          <div style={{ marginBottom: "4px" }}>
            <strong>Nome:</strong> Paulo Henrique das Chagas
          </div>
          <div>
            <strong>Chave Pix:</strong> 33.593.091/0001-75
          </div>
        </div>
      </div>
    </div>
  );
});

BudgetTemplate.displayName = "BudgetTemplate";

export default BudgetTemplate;
