import { FormItem } from "../../types/Form-itens/FormItem";

export type GenerateBudgetPdfOptions = {
  /** Descrição do serviço no PDF; vazio deixa a célula em branco. */
  serviceDescription?: string;
  /** Observações no rodapé do PDF; vazio omite a seção. */
  observations?: string;
};

/**
 * Cortes em mm ao longo da imagem (eixo vertical), sempre crescentes até a altura total.
 * Cada segmento [cuts[i], cuts[i+1]] cabe em uma página A4; o corte é deslocado para
 * uma faixa mais “clara” (entre linhas) logo acima da quebra fixa, reduzindo linhas partidas ao meio.
 */
function computeSmartCutsMm(
  canvas: HTMLCanvasElement,
  pageHeightMm: number,
  pageWidthMm: number
): number[] {
  const H = canvas.height;
  const W = canvas.width;
  if (H <= 0 || W <= 0) return [0, 0];

  const imgHeightMm = (H * pageWidthMm) / W;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [0, imgHeightMm];

  const data = ctx.getImageData(0, 0, W, H).data;

  /** Brilho médio da linha (0–255); linhas em branco entre parágrafos tendem a ser mais altas. */
  function rowBrightness(y: number): number {
    if (y < 0 || y >= H) return 0;
    let sum = 0;
    let n = 0;
    const row = y * W * 4;
    for (let x = 0; x < W; x += 4) {
      const i = row + x * 4;
      sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      n++;
    }
    return n > 0 ? sum / n : 0;
  }

  const cutsMm: number[] = [0];
  let prevMm = 0;
  /** Só desloca o corte para cima (nunca abaixo do nominal), para nunca exceder a altura da página. */
  const winMm = 9;

  while (true) {
    const remainingMm = imgHeightMm - prevMm;
    if (remainingMm <= 0.35) break;

    if (remainingMm <= pageHeightMm + 0.4) {
      cutsMm.push(imgHeightMm);
      break;
    }

    const nominalNextMm = prevMm + pageHeightMm;
    const prevPx = (prevMm / imgHeightMm) * H;
    const nominalPx = (nominalNextMm / imgHeightMm) * H;
    const pageHpx = (pageHeightMm / imgHeightMm) * H;
    const winPx = Math.min(140, Math.max(24, Math.round((winMm / imgHeightMm) * H)));

    const yHigh = Math.min(H - 1, Math.floor(nominalPx));
    const yLow = Math.max(
      Math.ceil(prevPx + pageHpx * 0.86),
      Math.floor(nominalPx - winPx)
    );

    let bestY = yHigh;
    let bestB = rowBrightness(bestY);
    if (yLow <= yHigh) {
      for (let y = yLow; y <= yHigh; y++) {
        const b = rowBrightness(y);
        if (b > bestB + 0.4 || (Math.abs(b - bestB) <= 0.4 && Math.abs(y - nominalPx) < Math.abs(bestY - nominalPx))) {
          bestB = b;
          bestY = y;
        }
      }
    }

    let cutMm = (bestY / H) * imgHeightMm;
    const minCutMm = prevMm + pageHeightMm * 0.88;
    const maxCutMm = prevMm + pageHeightMm;
    if (cutMm < minCutMm) cutMm = nominalNextMm;
    if (cutMm > maxCutMm) cutMm = maxCutMm;
    if (cutMm <= prevMm + 0.02) cutMm = Math.min(nominalNextMm, imgHeightMm);

    cutsMm.push(cutMm);
    prevMm = cutMm;
  }

  if (cutsMm[cutsMm.length - 1] < imgHeightMm - 0.35) {
    cutsMm.push(imgHeightMm);
  }

  return cutsMm;
}

function cutsMmToPx(cutsMm: number[], imgHeightMm: number, H: number): number[] {
  const px = cutsMm.map((mm) => Math.round((mm / imgHeightMm) * H));
  for (let i = 1; i < px.length; i++) {
    if (px[i] <= px[i - 1]) px[i] = Math.min(H, px[i - 1] + 1);
  }
  px[px.length - 1] = H;
  return px;
}

/**
 * Gera PDF do orçamento (layout alinhado ao modelo PHC) a partir do HTML renderizado.
 * Usa várias páginas A4 quando o conteúdo excede uma página, com cortes inteligentes na imagem
 * para preferir espaços em branco entre linhas (evita o “meio da linha” da fatia fixa).
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
        observations: options?.observations ?? "",
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

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidthMm = pageWidth;
    const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

    const cutsMm = computeSmartCutsMm(canvas, pageHeight, imgWidthMm);
    const cutsPx = cutsMmToPx(cutsMm, imgHeightMm, canvas.height);

    const W = canvas.width;
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = W;

    const sctx = sliceCanvas.getContext("2d");
    if (!sctx) return;

    for (let i = 0; i < cutsPx.length - 1; i++) {
      const y0 = cutsPx[i];
      const y1 = cutsPx[i + 1];
      const h = y1 - y0;
      if (h <= 0) continue;

      sliceCanvas.height = h;
      sctx.fillStyle = "#ffffff";
      sctx.fillRect(0, 0, W, h);
      sctx.drawImage(canvas, 0, y0, W, h, 0, 0, W, h);

      const imgData = sliceCanvas.toDataURL("image/png");
      const sliceH_mm = (h / canvas.height) * imgHeightMm;

      if (i > 0) pdf.addPage();

      let drawH = sliceH_mm;
      let drawW = imgWidthMm;
      if (drawH > pageHeight + 0.05) {
        const s = pageHeight / drawH;
        drawH = pageHeight;
        drawW = imgWidthMm * s;
      }
      const offsetX = (pageWidth - drawW) / 2;
      pdf.addImage(imgData, "PNG", offsetX, 0, drawW, drawH);
    }

    pdf.save(`orcamento-OS-${item.id}.pdf`);
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}
