/* Read letter summaries aloud — streamed neural voice with prefetch + cache. */

(function () {
  let currentAudio = null;
  let onEndCallback = null;
  const audioCache = new Map();
  let prefetchKey = "";

  function apiBase() {
    if (window.MedifiLLM) return window.MedifiLLM.apiBase();
    if (window.location.protocol === "file:") return "http://localhost:3001";
    if (window.location.protocol === "http:" || window.location.protocol === "https:") {
      return window.location.origin;
    }
    return "http://localhost:3001";
  }

  function supported() {
    return typeof Audio !== "undefined";
  }

  function cacheKey(letter, language) {
    return (letter && letter.id ? letter.id : "letter") + "::" + (language || "English");
  }

  function cleanup() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.removeAttribute("src");
      currentAudio.load();
      currentAudio = null;
    }
    onEndCallback = null;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  /** Shorter script = faster synthesis and quicker playback start. */
  function buildSpeakText(letter, view) {
    const v = view || letter;
    const parts = [];
    if (v.headline) parts.push(v.headline);
    if (v.summary) parts.push(v.summary);
    const urgent = (v.risks || []).find(function (r) { return r.level === "risk"; })
      || (v.risks || []).find(function (r) { return r.level === "caution"; });
    if (urgent) parts.push((urgent.title || "Please note") + ". " + (urgent.text || ""));
    return parts.join(" ").slice(0, 900);
  }

  function stop() {
    cleanup();
  }

  function isSpeaking() {
    return Boolean(currentAudio && !currentAudio.paused && !currentAudio.ended)
      || (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.speaking);
  }

  function clearCache() {
    audioCache.clear();
    prefetchKey = "";
  }

  async function prepare(letter, view, language) {
    const key = cacheKey(letter, language);
    if (audioCache.has(key)) return audioCache.get(key);

    const text = buildSpeakText(letter, view);
    const prep = await fetch(apiBase() + "/api/speak/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text, language: language || "English" }),
    });
    const data = await prep.json().catch(function () { return {}; });
    if (!prep.ok) throw new Error(data.error || "Could not prepare speech.");

    const playUrl = apiBase() + data.url;
    const entry = { key: key, playUrl: playUrl, ready: false };
    audioCache.set(key, entry);

    const audio = new Audio();
    audio.preload = "auto";
    audio.src = playUrl;
    entry.audio = audio;

    await new Promise(function (resolve) {
      const done = function () { entry.ready = true; resolve(); };
      audio.addEventListener("canplaythrough", done, { once: true });
      audio.addEventListener("error", done, { once: true });
      window.setTimeout(done, 8000);
    });

    return entry;
  }

  function prefetch(letter, view, language) {
    const key = cacheKey(letter, language);
    if (prefetchKey === key || audioCache.has(key)) return;
    prefetchKey = key;
    prepare(letter, view, language).catch(function () {
      if (prefetchKey === key) prefetchKey = "";
    });
  }

  function speakWithBrowser(text, language, onEnd) {
    if (!window.speechSynthesis) {
      throw new Error("Speech is not supported in this browser.");
    }
    const SPEECH_LANG = {
      English: "en-GB",
      Urdu: "ur-PK",
      Bengali: "bn-BD",
      Polish: "pl-PL",
      Arabic: "ar-SA",
      Somali: "so-SO",
    };
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LANG[language] || "en-GB";
    utterance.rate = 0.95;
    onEndCallback = onEnd || null;
    utterance.onend = function () {
      if (onEndCallback) onEndCallback();
      onEndCallback = null;
    };
    utterance.onerror = function () {
      if (onEndCallback) onEndCallback();
      onEndCallback = null;
    };
    window.speechSynthesis.speak(utterance);
  }

  async function speakLetter(letter, view, language, onEnd) {
    if (!supported()) {
      throw new Error("Read-aloud is not supported in this browser.");
    }
    stop();
    const key = cacheKey(letter, language);
    const text = buildSpeakText(letter, view);

    try {
      let entry = audioCache.get(key);
      if (!entry) {
        entry = await prepare(letter, view, language);
      }

      currentAudio = new Audio(entry.playUrl);
      currentAudio.preload = "auto";
      onEndCallback = onEnd || null;
      currentAudio.onended = function () {
        const cb = onEndCallback;
        cleanup();
        if (cb) cb();
      };
      currentAudio.onerror = function () {
        const cb = onEndCallback;
        cleanup();
        if (cb) cb();
      };

      await currentAudio.play();
      return;
    } catch (serverErr) {
      console.warn("Neural TTS failed, falling back to browser voice:", serverErr.message);
      speakWithBrowser(text, language, onEnd);
    }
  }

  window.MedifiSpeech = {
    supported,
    buildSpeakText,
    speakLetter,
    prefetch,
    clearCache,
    stop,
    isSpeaking,
  };
})();
