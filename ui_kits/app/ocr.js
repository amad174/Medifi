/* OCR helper — reads printed and handwritten text from images using Tesseract.js. */

(function () {
  const PSM = { AUTO: "3", SINGLE_BLOCK: "6", SPARSE: "11" };

  function ensureTesseract() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    return Promise.reject(new Error("OCR library not loaded. Check your internet connection and reload."));
  }

  function loadImage(fileOrBlob) {
    return new Promise(function (resolve, reject) {
      const url = URL.createObjectURL(fileOrBlob);
      const img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  /** Upscale, grayscale, and boost contrast — helps printed photos and handwriting. */
  function preprocessImage(img, mode) {
    const scale = Math.max(1, Math.min(2.5, 2200 / Math.max(img.width, img.height)));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const contrast = mode === "handwriting" ? 1.55 : 1.25;
    const threshold = mode === "handwriting" ? 155 : 0;

    for (let i = 0; i < data.length; i += 4) {
      let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      gray = Math.min(255, Math.max(0, (gray - 128) * contrast + 128));
      if (threshold) gray = gray > threshold ? 255 : gray < 95 ? 0 : gray;
      data[i] = data[i + 1] = data[i + 2] = gray;
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  function runPass(Tesseract, source, psm, onProgress, weight) {
    return Tesseract.recognize(source, "eng", {
      tessedit_pageseg_mode: psm,
      logger: function (m) {
        if (onProgress && m.status === "recognizing text" && typeof m.progress === "number") {
          onProgress(Math.round(m.progress * 100 * weight));
        }
      },
    }).then(function (result) {
      const text = (result.data && result.data.text) ? result.data.text.trim() : "";
      const conf = (result.data && result.data.confidence) ? result.data.confidence : 0;
      return { text, conf, len: text.replace(/\s/g, "").length };
    });
  }

  function pickBest(results) {
    const viable = results.filter((r) => r.len >= 8);
    if (!viable.length) return results.sort((a, b) => b.len - a.len)[0] || { text: "", conf: 0 };

    viable.sort((a, b) => {
      const scoreA = a.len + a.conf * 0.5;
      const scoreB = b.len + b.conf * 0.5;
      return scoreB - scoreA;
    });
    return viable[0];
  }

  function readImage(fileOrBlob, onProgress, options) {
    const handwriting = options && options.handwriting;
    return ensureTesseract().then(async function (Tesseract) {
      const img = await loadImage(fileOrBlob);
      const enhanced = preprocessImage(img, handwriting ? "handwriting" : "print");
      const hwCanvas = preprocessImage(img, "handwriting");

      if (onProgress) onProgress(5);

      const passes = [
        runPass(Tesseract, fileOrBlob, PSM.AUTO, onProgress, 0.3),
        runPass(Tesseract, enhanced, PSM.SINGLE_BLOCK, onProgress, 0.25),
        runPass(Tesseract, hwCanvas, PSM.SPARSE, onProgress, 0.4),
      ];

      const results = await Promise.all(passes);
      if (onProgress) onProgress(100);
      return pickBest(results).text;
    });
  }

  window.MedifiOCR = { readImage };
})();
