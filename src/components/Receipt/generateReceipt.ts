import { FormItem } from "../../types/Form-itens/FormItem";
import type { ReceiptClientPayload } from "./receiptTypes";

export async function generateReceiptPDF(
  item: FormItem,
  client: ReceiptClientPayload
): Promise<void> {
  if (item.price == null) {
    throw new Error("Preço da O.S. é obrigatório para gerar o recibo.");
  }

  const totalPrice = item.price;

  const [
    { default: jsPDF },
    { default: html2canvas },
    React,
    { createRoot },
    { default: ReceiptTemplate },
  ] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
    import("react"),
    import("react-dom/client"),
    import("./ReceiptTemplate"),
  ]);

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.zIndex = "-1";
  document.body.appendChild(container);

  const root = createRoot(container);

  const receiptDate = new Date();

  await new Promise<void>((resolve) => {
    root.render(
      React.createElement(ReceiptTemplate, {
        totalPrice,
        client,
        receiptDate,
      })
    );
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  try {
    const receiptEl = container.firstElementChild as HTMLElement;

    const canvas = await html2canvas(receiptEl, {
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

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasHeight / canvasWidth;
    const imgHeightInPdf = pdfWidth * ratio;

    if (imgHeightInPdf <= pdfHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeightInPdf);
    } else {
      const scaledWidth = pdfHeight / ratio;
      const offsetX = (pdfWidth - scaledWidth) / 2;
      pdf.addImage(imgData, "PNG", offsetX, 0, scaledWidth, pdfHeight);
    }

    pdf.save(`recibo-OS-${item.id}.pdf`);
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}
