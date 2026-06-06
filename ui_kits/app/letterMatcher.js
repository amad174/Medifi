/* Match OCR/pasted text to demo samples only when clearly similar; otherwise parse for real. */

(function () {
  const MIN_SAMPLE_SCORE = 28;

  const KEYWORDS = {
    derm: ["dermatology", "st thomas", "clinic b", "dermatology outpatient"],
    referral: ["cardiology", "waiting list", "referred you to", "14-18 weeks", "14–18 weeks"],
    badadmin: ["endoscopy", "endoscopy unit", "several hours before", "2 june 2026"],
    rx: ["prescription", "amoxicillin", "ibuprofen", "boots pharmacy", "three times a day"],
  };

  function scoreLetter(letter, text) {
    const kws = KEYWORDS[letter.id] || [];
    let score = 0;
    for (const kw of kws) {
      if (text.includes(kw)) score += kw.length * 2;
    }
    const orig = (letter.original || "").toLowerCase();
    const phrases = orig.split("\n").map((l) => l.trim()).filter((l) => l.length > 12);
    for (const phrase of phrases) {
      if (text.includes(phrase.slice(0, 20))) score += 8;
    }
    return score;
  }

  function matchSampleLetter(rawText) {
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
    return bestScore >= MIN_SAMPLE_SCORE ? best : null;
  }

  function letterFromExtractedText(rawText) {
    const trimmed = (rawText || "").trim();
    if (!trimmed) return null;

    const sample = matchSampleLetter(trimmed);
    if (sample) {
      return {
        ...sample,
        original: trimmed,
        fromUpload: true,
        matchedSample: true,
      };
    }

    return window.MedifiLetterParser.parseLetterFromText(trimmed);
  }

  window.MedifiLetterMatcher = {
    matchSampleLetter,
    letterFromExtractedText,
  };
})();
