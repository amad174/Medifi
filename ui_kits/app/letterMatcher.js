/* Match OCR or pasted text to the closest demo letter. */

(function () {
  const KEYWORDS = {
    derm: ["dermatology", "st thomas", "clinic b", "outpatient department", "skin"],
    referral: ["cardiology", "waiting list", "referred", "14-18 weeks", "14–18 weeks", "symptoms get worse"],
    badadmin: ["endoscopy", "fasting", "several hours", "endoscopy unit", "camera test"],
    rx: ["prescription", "amoxicillin", "ibuprofen", "pharmacy", "boots", "capsules", "tablets"],
  };

  function scoreLetter(letter, text) {
    const kws = KEYWORDS[letter.id] || [];
    let score = 0;
    for (const kw of kws) {
      if (text.includes(kw)) score += kw.length;
    }
    const orig = (letter.original || "").toLowerCase();
    const words = orig.split(/\W+/).filter((w) => w.length > 5);
    for (const w of words) {
      if (text.includes(w)) score += 2;
    }
    return score;
  }

  function matchLetterFromText(rawText) {
    const text = (rawText || "").toLowerCase().replace(/\s+/g, " ").trim();
    if (!text) return null;

    let best = null;
    let bestScore = 0;
    for (const letter of window.MEDIFI_LETTERS) {
      const score = scoreLetter(letter, text);
      if (score > bestScore) {
        bestScore = score;
        best = letter;
      }
    }
    return bestScore > 0 ? best : null;
  }

  function letterFromExtractedText(rawText) {
    const trimmed = (rawText || "").trim();
    const matched = matchLetterFromText(trimmed);
    const base = matched || window.MEDIFI_LETTERS[0];
    return {
      ...base,
      original: trimmed || base.original,
      fromUpload: true,
    };
  }

  window.MedifiLetterMatcher = {
    matchLetterFromText,
    letterFromExtractedText,
  };
})();
