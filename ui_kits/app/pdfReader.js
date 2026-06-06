/* Read NHS letter PDFs — text layer first, render + OCR for scanned pages. */

(function () {
  const MAX_PAGES = 8;
  const MIN_PAGE_CHARS = 35;
  const WORKER_SRC = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  function ensurePdfJs() {
    if (!window.pdfjsLib) {
      return Promise.reject(new Error("PDF library not loaded. Check your internet connection and reload."));
    }
    if (!window._medifiPdfWorkerReady) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_SRC;
      window._medifiPdfWorkerReady = true;
    }
    return Promise.resolve(window.pdfjsLib);
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise(function (resolve) {
      canvas.toBlob(resolve, type || "image/jpeg", quality || 0.92);
    });
  }

  async function renderPageToCanvas(page, scale) {
    const viewport = page.getViewport({ scale: scale || 2 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport: viewport }).promise;
    return canvas;
  }

  async function extractPageText(page) {
    const content = await page.getTextContent();
    return content.items.map(function (item) { return item.str; }).join(" ").replace(/\s+/g, " ").trim();
  }

  async function readPdf(file, onProgress, options) {
    const pdfjs = await ensurePdfJs();
    const OCR = window.MedifiOCR;
    const handwriting = options && options.handwriting;
    const data = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: data }).promise;
    const pageCount = Math.min(pdf.numPages, MAX_PAGES);
    const parts = [];
    let previewUrl = "";

    for (let i = 1; i <= pageCount; i++) {
      if (onProgress) onProgress(Math.round(((i - 1) / pageCount) * 90));
      const page = await pdf.getPage(i);
      let text = await extractPageText(page);

      if (text.replace(/\s/g, "").length < MIN_PAGE_CHARS && OCR) {
        const canvas = await renderPageToCanvas(page, 2);
        if (!previewUrl) previewUrl = canvas.toDataURL("image/jpeg", 0.85);
        const blob = await canvasToBlob(canvas);
        const ocrText = await OCR.readImage(blob, null, { handwriting });
        if (ocrText && ocrText.replace(/\s/g, "").length > text.replace(/\s/g, "").length) {
          text = ocrText;
        }
      } else if (!previewUrl) {
        const canvas = await renderPageToCanvas(page, 1.2);
        previewUrl = canvas.toDataURL("image/jpeg", 0.85);
      }

      if (text) parts.push(text);
    }

    if (onProgress) onProgress(100);
    if (pdf.numPages > MAX_PAGES) {
      parts.push("[Note: only the first " + MAX_PAGES + " pages were read.]");
    }

    return {
      text: parts.join("\n\n"),
      pageCount: pdf.numPages,
      previewUrl: previewUrl,
    };
  }

  async function pdfFirstPageToFile(file) {
    const pdfjs = await ensurePdfJs();
    const data = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: data }).promise;
    const page = await pdf.getPage(1);
    const canvas = await renderPageToCanvas(page, 2);
    const blob = await canvasToBlob(canvas);
    return new File([blob], (file.name || "letter").replace(/\.pdf$/i, "") + "-page1.jpg", { type: "image/jpeg" });
  }

  function isPdfFile(file) {
    if (!file) return false;
    if (file.type === "application/pdf") return true;
    return /\.pdf$/i.test(file.name || "");
  }

  window.MedifiPdf = { readPdf, pdfFirstPageToFile, isPdfFile };
})();
