/* Read letter summaries aloud using the browser speech API. */

(function () {
  const SPEECH_LANG = {
    English: "en-GB",
    Urdu: "ur-PK",
    Bengali: "bn-BD",
    Polish: "pl-PL",
    Arabic: "ar-SA",
    Somali: "so-SO",
  };

  let onEndCallback = null;

  function supported() {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  function loadVoices() {
    return new Promise(function (resolve) {
      if (!supported()) {
        resolve([]);
        return;
      }
      const existing = window.speechSynthesis.getVoices();
      if (existing.length) {
        resolve(existing);
        return;
      }
      window.speechSynthesis.onvoiceschanged = function () {
        resolve(window.speechSynthesis.getVoices());
      };
      window.setTimeout(function () {
        resolve(window.speechSynthesis.getVoices());
      }, 400);
    });
  }

  function pickVoice(voices, language) {
    const code = SPEECH_LANG[language] || "en-GB";
    const prefix = code.split("-")[0];
    return voices.find(function (v) { return v.lang === code; })
      || voices.find(function (v) { return v.lang.indexOf(prefix) === 0; })
      || voices.find(function (v) { return v.lang.indexOf("en") === 0; })
      || null;
  }

  function buildSpeakText(letter, view) {
    const v = view || letter;
    const chunks = [];
    if (v.headline) chunks.push(v.headline);
    if (v.when) chunks.push(v.when);
    if (v.summary) chunks.push(v.summary);

    const alerts = (v.risks || []).filter(function (r) { return r.level !== "safe"; });
    if (alerts.length) {
      chunks.push("Please check the following.");
      alerts.forEach(function (r) {
        chunks.push((r.title || "Alert") + ". " + (r.text || ""));
      });
    }

    if (v.checklist && v.checklist.length) {
      chunks.push("What to do next.");
      v.checklist.forEach(function (c) {
        chunks.push(c.label + (c.meta ? ", " + c.meta : ""));
      });
    }

    chunks.push("Always check your original NHS letter.");
    return chunks.join(" ");
  }

  function stop() {
    if (!supported()) return;
    window.speechSynthesis.cancel();
    onEndCallback = null;
  }

  function isSpeaking() {
    return supported() && window.speechSynthesis.speaking;
  }

  async function speakLetter(letter, view, language, onEnd) {
    if (!supported()) {
      throw new Error("Read-aloud is not supported in this browser.");
    }
    stop();
    const text = buildSpeakText(letter, view);
    const voices = await loadVoices();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LANG[language] || "en-GB";
    utterance.rate = 0.92;
    utterance.pitch = 1;
    const voice = pickVoice(voices, language);
    if (voice) utterance.voice = voice;
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

  window.MedifiSpeech = {
    supported,
    buildSpeakText,
    speakLetter,
    stop,
    isSpeaking,
  };
})();
