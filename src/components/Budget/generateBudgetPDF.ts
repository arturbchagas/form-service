import { FormItem } from "../../types/Form-itens/FormItem";

export type GenerateBudgetPdfOptions = {
  /** Descrição do serviço no PDF; vazio deixa a célula em branco. */
  serviceDescription?: string;
};

/**
 * Gera PDF do orçamento (layout alinhado ao modelo PHC) a partir do HTML renderizado.
 * Usa várias páginas A4 quando o conteúdo excede uma página.
 */
export async function generateBudgetPDF(
  item: FormItem,
  options?: GenerateBudgetPdfOptions
): Promise<void> {
  const [
    { default: jsPDF },
    { default: html2canvas },
    React,
    { createRoot },
    { default: BudgetTemplate },
  ] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
    import("react"),
    import("react-dom/client"),
    import("./BudgetTemplate"),
  ]);

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.zIndex = "-1";
  document.body.appendChild(container);

  const root = createRoot(container);

  await new Promise<void>((resolve) => {
    root.render(
      React.createElement(BudgetTemplate, {
        item,
        serviceDescription: options?.serviceDescription ?? "",
      })
    );
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  try {
    const el = container.firstElementChild as HTMLElement;

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`orcamento-OS-${item.id}.pdf`);
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}
