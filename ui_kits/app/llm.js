/* Medifi LLM client — calls the local API proxy (server/index.js). */

(function () {
  const STORAGE_KEY = "medifi_api_base";

  function apiBase() {
    if (window.MEDIFI_CONFIG && window.MEDIFI_CONFIG.apiBase) {
      return window.MEDIFI_CONFIG.apiBase.replace(/\/$/, "");
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return stored.replace(/\/$/, "");
    } catch (_) { /* ignore */ }
    if (window.location.port === "3001" || window.location.hostname === "localhost") {
      return window.location.origin;
    }
    return "http://localhost:3001";
  }

  function setApiBase(url) {
    try {
      localStorage.setItem(STORAGE_KEY, url.replace(/\/$/, ""));
    } catch (_) { /* ignore */ }
  }

  async function health() {
    const res = await fetch(apiBase() + "/api/health");
    if (!res.ok) throw new Error("API server not reachable. Run: cd server && npm install && npm start");
    return res.json();
  }

  async function isAvailable() {
    try {
      const h = await health();
      return Boolean(h.llm);
    } catch {
      return false;
    }
  }

  function fetchWithTimeout(url, options, ms) {
    const ctrl = new AbortController();
    const timer = window.setTimeout(function () { ctrl.abort(); }, ms);
    return fetch(url, { ...options, signal: ctrl.signal }).finally(function () {
      window.clearTimeout(timer);
    });
  }

  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () {
        const result = reader.result || "";
        const base64 = String(result).replace(/^data:[^;]+;base64,/, "");
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function prepareImageFile(file) {
    if (file.size <= 3.5 * 1024 * 1024) {
      return { base64: await fileToBase64(file), mediaType: file.type || "image/jpeg" };
    }
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise(function (resolve, reject) {
        const el = new Image();
        el.onload = function () { resolve(el); };
        el.onerror = reject;
        el.src = url;
      });
      const maxEdge = 2400;
      const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      const blob = await new Promise(function (resolve) {
        canvas.toBlob(resolve, "image/jpeg", 0.92);
      });
      return { base64: await fileToBase64(blob), mediaType: "image/jpeg" };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function parseLetterImage(file, onProgress) {
    if (onProgress) onProgress(15);
    const payload = await prepareImageFile(file);
    if (onProgress) onProgress(35);
    let res;
    try {
      res = await fetchWithTimeout(apiBase() + "/api/parse-letter-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: payload.base64, mediaType: payload.mediaType }),
      }, 95000);
    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error("Claude took too long reading the photo. Try again or paste the text.");
      }
      throw err;
    }
    if (onProgress) onProgress(90);
    const data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.error || "Could not read letter photo with AI");
    if (onProgress) onProgress(100);
    return data.plan;
  }

  async function parseLetter(text) {
    let res;
    try {
      res = await fetchWithTimeout(apiBase() + "/api/parse-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      }, 95000);
    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error("AI took too long (90 seconds). Try shorter text, or wait a minute and retry.");
      }
      throw err;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not parse letter with AI");
    return data.plan;
  }

  async function translateLetter(letter, language) {
    const res = await fetchWithTimeout(apiBase() + "/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        content: {
          headline: letter.headline,
          when: letter.when,
          summary: letter.summary,
          risks: letter.risks,
          checklist: letter.checklist,
          fields: letter.fields,
        },
      }),
    }, 60000);
    const data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.error || "Could not translate this letter");
    return data.translation;
  }

  async function askQuestion(letterText, summary, question) {
    const res = await fetchWithTimeout(apiBase() + "/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ letterText, summary, question }),
    }, 90000);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not get an answer");
    return data.answer;
  }

  async function chatAssistant(payload) {
    const res = await fetchWithTimeout(apiBase() + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }, 90000);
    const data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.error || "Could not get a reply");
    return data.answer;
  }

  window.MedifiLLM = {
    apiBase,
    setApiBase,
    health,
    isAvailable,
    parseLetter,
    parseLetterImage,
    translateLetter,
    askQuestion,
    chatAssistant,
  };
})();
