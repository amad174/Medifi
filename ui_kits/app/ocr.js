/* OCR helper — reads text from images using Tesseract.js (two quality passes, sequential). */

(function () {
  const PSM = { AUTO: "3", SINGLE_BLOCK: "6", SPARSE: "11" };
  const OCR_TIMEOUT_MS = 120000;

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

  function preprocessImage(img, mode) {
    const scale = Math.max(1, Math.min(2.5, 2400 / Math.max(img.width, img.height)));
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
    const contrast = mode === "handwriting" ? 1.55 : 1.28;
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
        if (onProgress && m.status === "loading language traineddata") {
          onProgress(1);
        }
      },
    }).then(function (result) {
      const text = (result.data && result.data.text) ? result.data.text.trim() : "";
      const conf = (result.data && result.data.confidence) ? result.data.confidence : 0;
      return { text, conf, len: text.replace(/\s/g, "").length };
    });
  }

  function pickBest(results) {
    const viable = results.filter(function (r) { return r.len >= 8; });
    const pool = viable.length ? viable : results;
    pool.sort(function (a, b) {
      return (b.len + b.conf * 0.6) - (a.len + a.conf * 0.6);
    });
    return pool[0] || { text: "", conf: 0 };
  }

  function withTimeout(promise, ms, message) {
    return new Promise(function (resolve, reject) {
      const timer = window.setTimeout(function () {
        reject(new Error(message));
      }, ms);
      promise.then(
        function (v) { window.clearTimeout(timer); resolve(v); },
        function (e) { window.clearTimeout(timer); reject(e); }
      );
    });
  }

  async function readImage(fileOrBlob, onProgress, options) {
    const handwriting = options && options.handwriting;
    const Tesseract = await ensureTesseract();
    const img = await loadImage(fileOrBlob);
    const enhanced = preprocessImage(img, handwriting ? "handwriting" : "enhanced");
    const alt = handwriting
      ? preprocessImage(img, "handwriting")
      : preprocessImage(img, "enhanced");

    if (onProgress) onProgress(2);

    const pass1 = await withTimeout(
      runPass(Tesseract, enhanced, PSM.SINGLE_BLOCK, onProgress, 0.5),
      OCR_TIMEOUT_MS,
      "Reading the photo took too long. Paste the letter text instead, or try a smaller image."
    );

    if (onProgress) onProgress(50);

    const pass2 = await withTimeout(
      runPass(Tesseract, alt, handwriting ? PSM.SPARSE : PSM.AUTO, onProgress, 0.5),
      OCR_TIMEOUT_MS,
      "Reading the photo took too long. Paste the letter text instead, or try a smaller image."
    );

    if (onProgress) onProgress(100);
    const best = pickBest([pass1, pass2]);
    const merged = mergeOcrResults([pass1, pass2]);
    return merged.replace(/\s/g, "").length > best.len ? merged : best.text;
  }

  function mergeOcrResults(results) {
    const texts = results.map(function (r) { return r.text; }).filter(Boolean);
    if (texts.length < 2) return texts[0] || "";
    const lines = [];
    const seen = new Set();
    texts.forEach(function (text) {
      text.split(/\n+/).forEach(function (line) {
        const key = line.replace(/\s+/g, " ").trim().toLowerCase();
        if (key.length > 2 && !seen.has(key)) {
          seen.add(key);
          lines.push(line.trim());
        }
      });
    });
    return lines.join("\n");
  }

  window.MedifiOCR = { readImage };
})();
