import { FormItem } from "../../types/Form-itens/FormItem";

export async function generateReceiptPDF(item: FormItem): Promise<void> {
  const [
    { default: jsPDF },
    { default: html2canvas },
    React,
    { createRoot },
    QRCode,
    { default: ReceiptTemplate },
  ] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
    import("react"),
    import("react-dom/client"),
    import("qrcode"),
    import("./ReceiptTemplate"),
  ]);

  // Generate QR code data URL for Pix key
  const qrCodeDataUrl = await QRCode.toDataURL("33.593.091/0001-75", {
    width: 120,
    margin: 1,
  });

  // Create a hidden container
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.zIndex = "-1";
  document.body.appendChild(container);

  // Render the receipt component
  const root = createRoot(container);

  await new Promise<void>((resolve) => {
    root.render(
      React.createElement(ReceiptTemplate, {
        item,
        qrCodeDataUrl,
      })
    );
    // Wait for next paint
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
      // Scale to fit the page height
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
