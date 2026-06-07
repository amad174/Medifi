/* Helpers for letter fields — phone numbers, badges, etc. */

(function () {
  function phoneFromLetter(letter) {
    if (!letter) return null;
    var fields = letter.fields || [];
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (f.missing || !f.value) continue;
      if (/phone|tel|call|contact|appointments?/i.test(f.label) && /\d{3,}/.test(f.value)) {
        return String(f.value).trim();
      }
    }
    var risks = letter.risks || [];
    for (var j = 0; j < risks.length; j++) {
      var m = (risks[j].text || "").match(/(?:call|ring|phone)\s+([\d\s\-+()]{10,})/i);
      if (m) return m[1].trim();
    }
    var orig = letter.original || "";
    var m2 = orig.match(/(?:\+44\s?|0)\d[\d\s\-]{8,}\d/);
    return m2 ? m2[0].trim() : null;
  }

  function telHref(phone) {
    return "tel:" + String(phone || "").replace(/[^\d+]/g, "");
  }

  function levelTone(level) {
    return { safe: "safe", caution: "caution", risk: "risk" }[level] || "neutral";
  }

  function levelText(level) {
    return { safe: "Looks fine", caution: "Check this", risk: "Needs attention" }[level] || "Letter";
  }

  function hasCalendarContent(item) {
    return Boolean(
      item && (item.event || (item.medicines && item.medicines.length))
    );
  }

  window.MedifiLetterUtils = {
    phoneFromLetter: phoneFromLetter,
    telHref: telHref,
    levelTone: levelTone,
    levelText: levelText,
    hasCalendarContent: hasCalendarContent,
  };
})();
