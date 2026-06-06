/* OCR helper — reads text from an image file or blob using Tesseract.js. */

(function () {
  function ensureTesseract() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    return Promise.reject(new Error("OCR library not loaded. Check your internet connection and reload."));
  }

  function readImage(fileOrBlob, onProgress) {
    return ensureTesseract().then(function (Tesseract) {
      return Tesseract.recognize(fileOrBlob, "eng", {
        logger: function (m) {
          if (onProgress && m.status === "recognizing text" && typeof m.progress === "number") {
            onProgress(Math.round(m.progress * 100));
          }
        },
      }).then(function (result) {
        return (result.data && result.data.text) ? result.data.text.trim() : "";
      });
    });
  }

  window.MedifiOCR = { readImage };
})();
