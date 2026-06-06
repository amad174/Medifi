/* Build a Medifi action plan directly from extracted letter text (no sample fallback). */

(function () {
  const MONTHS = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
    jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
  };

  function extractPhones(text) {
    const matches = text.match(/\b(?:0\d{2,4}[\s.-]?\d{3,4}[\s.-]?\d{3,4}|\+44[\s.-]?\d{2,4}[\s.-]?\d{3,4}[\s.-]?\d{3,4})\b/g);
    return matches ? [...new Set(matches.map((p) => p.replace(/\s+/g, " ").trim()))] : [];
  }

  function extractNhs(text) {
    const m = text.match(/\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/);
    return m ? m[0].replace(/\s+/g, " ") : null;
  }

  function extractTimes(text) {
    return text.match(/\b\d{1,2}:\d{2}\s*(?:am|pm)?\b/gi) || [];
  }

  function parseUkDate(str) {
    const s = str.toLowerCase().trim();
    let m = s.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\s+(\d{4})/i);
    if (m) {
      const mo = MONTHS[m[2].toLowerCase()];
      if (mo) return { d: +m[1], mo, y: +m[3] };
    }
    m = s.match(/([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i);
    if (m) {
      const mo = MONTHS[m[1].toLowerCase()];
      if (mo) return { d: +m[2], mo, y: +m[3] };
    }
    m = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (m) {
      let d = +m[1]; let mo = +m[2]; let y = +m[3];
      if (y < 100) y += 2000;
      if (d <= 12 && mo > 12) { const t = d; d = mo; mo = t; }
      return { d, mo, y };
    }
    return null;
  }

  function extractDates(text) {
    const found = [];
    const patterns = [
      /\b\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4}\b/gi,
      /\b[A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b/gi,
      /\bDate:\s*([^\n]+)/gi,
      /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,
    ];
    for (const re of patterns) {
      let m;
      const copy = new RegExp(re.source, re.flags);
      while ((m = copy.exec(text)) !== null) {
        const raw = m[1] || m[0];
        const parsed = parseUkDate(raw.replace(/^date:\s*/i, ""));
        if (parsed) found.push({ raw: raw.trim(), parsed });
      }
    }
    return found;
  }

  function formatWhen(parsed, times) {
    if (!parsed) return times[0] || "Date not found";
    const names = ["", "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const day = parsed.d;
    const month = names[parsed.mo] || "";
    const time = times[0] ? ", " + times[0] : "";
    return day + " " + month + " " + parsed.y + time;
  }

  function isPast(parsed) {
    if (!parsed) return false;
    const dt = new Date(parsed.y, parsed.mo - 1, parsed.d, 23, 59);
    return dt < new Date();
  }

  function detectTopic(lower) {
    if (/prescription|capsule|tablet|pharmacy|mg\b|dose|medicine/.test(lower)) return "prescription";
    if (/referr|waiting list|referred/.test(lower)) return "referral";
    if (/endoscop|fasting|procedure/.test(lower)) return "procedure";
    if (/appointment|attend|clinic|outpatient|invited|hospital/.test(lower)) return "appointment";
    return "letter";
  }

  function buildSummary(topic, dates, times, phones, lower) {
    const when = dates[0] ? formatWhen(dates[0].parsed, times) : null;
    if (topic === "appointment" && when) {
      return "You have an appointment on " + when + ". "
        + (phones[0] ? "If you cannot go, call " + phones[0] + "." : "Check the letter for a contact number if you need to change it.");
    }
    if (topic === "referral") {
      return "This looks like a referral letter. A specialist team should contact you with a date. "
        + (phones[0] ? "You can call " + phones[0] + " if you have questions." : "There is no phone number in the text we read — ask your GP surgery if you need to chase this.");
    }
    if (topic === "prescription") {
      return "This looks like a prescription or medicine instructions. Check the dose and how often to take each medicine. "
        + (phones[0] ? "Your pharmacy or GP is on " + phones[0] + "." : "Speak to your pharmacist if anything is unclear.");
    }
    if (topic === "procedure") {
      return "This letter is about a hospital procedure. Read any preparation instructions carefully (such as fasting). "
        + (when ? "The date mentioned is " + when + "." : "");
    }
    const snippet = lower.split(/\s+/).slice(0, 40).join(" ");
    return "Medifi read the following from your letter. Check it matches your photo, then use the checklist below. "
      + (snippet.length > 20 ? "It mentions: \"" + snippet.slice(0, 120) + (snippet.length > 120 ? "…" : "") + "\"." : "");
  }

  function buildHeadline(topic, lower) {
    if (topic === "appointment") {
      if (/dermatolog|skin/.test(lower)) return "Skin (dermatology) appointment";
      if (/cardio|heart/.test(lower)) return "Heart (cardiology) appointment";
      return "Hospital appointment";
    }
    if (topic === "referral") return "Referral to a specialist";
    if (topic === "prescription") return "Your prescription";
    if (topic === "procedure") return "Hospital procedure";
    return "Your NHS letter";
  }

  function buildRisks(dates, phones, lower, topic) {
    const risks = [];
    if (dates[0] && isPast(dates[0].parsed)) {
      risks.push({
        level: "risk",
        title: "This date may have already passed",
        text: "The letter mentions " + dates[0].raw + ", which is before today. Call the hospital or your GP to check before you miss care.",
      });
    }
    if (!phones.length && (topic === "appointment" || topic === "referral")) {
      risks.push({
        level: "caution",
        title: "No phone number found",
        text: "We could not find a contact number in the text we read. Look at your original letter or ask your GP surgery for the right number.",
      });
    }
    if (/fast|several hours|do not eat/.test(lower) && !/\d+\s*hours?/.test(lower)) {
      risks.push({
        level: "caution",
        title: "Fasting time may be unclear",
        text: "The letter mentions fasting or not eating, but not exactly how long. Call to confirm before the day of your appointment.",
      });
    }
    if (!risks.length) {
      risks.push({
        level: "safe",
        title: "Text read from your image",
        text: "Always check the details below against your original letter — especially dates, times, and phone numbers.",
      });
    }
    return risks;
  }

  function worstLevel(risks) {
    if (risks.some((r) => r.level === "risk")) return "risk";
    if (risks.some((r) => r.level === "caution")) return "caution";
    return "safe";
  }

  function parseLetterFromText(rawText) {
    const text = (rawText || "").trim();
    const lower = text.toLowerCase();
    const phones = extractPhones(text);
    const nhs = extractNhs(text);
    const dates = extractDates(text);
    const times = extractTimes(text);
    const topic = detectTopic(lower);
    const risks = buildRisks(dates, phones, lower, topic);
    const headline = buildHeadline(topic, lower);
    const when = dates[0] ? formatWhen(dates[0].parsed, times) : (times[0] || "Check your letter for the date");

    const fields = [];
    if (dates[0]) fields.push({ label: "Date", value: dates[0].raw });
    if (times[0]) fields.push({ label: "Time", value: times[0] });
    if (nhs) fields.push({ label: "NHS number", value: nhs });
    if (phones[0]) fields.push({ label: "Phone", value: phones[0] });
    else fields.push({ label: "Phone", missing: true });
    if (!fields.length) fields.push({ label: "Extracted text", value: text.slice(0, 80) + (text.length > 80 ? "…" : "") });

    const checklist = [];
    if (dates[0]) checklist.push({ id: "cal", label: "Add to your calendar", meta: when, icon: "calendar" });
    if (phones[0]) checklist.push({ id: "call", label: "Save the contact number", meta: phones[0], icon: "phone" });
    checklist.push({ id: "check", label: "Check this matches your original letter", icon: "file" });
    if (topic === "prescription") checklist.push({ id: "pharm", label: "Collect or confirm your medicines", icon: "list" });

    const letter = {
      id: "scanned-" + Date.now(),
      chip: "Scanned letter",
      sender: "From your photo",
      received: "Scanned just now",
      worstLevel: worstLevel(risks),
      original: text,
      fromUpload: true,
      headline,
      when,
      summary: buildSummary(topic, dates, times, phones, lower),
      fields,
      checklist,
      risks,
    };

    if (dates[0] && dates[0].parsed) {
      const p = dates[0].parsed;
      const t = times[0] ? times[0].match(/(\d{1,2}):(\d{2})/) : null;
      letter.event = {
        title: headline,
        y: p.y,
        mo: p.mo,
        d: p.d,
        h: t ? +t[1] : 9,
        min: t ? +t[2] : 0,
        durMins: 30,
        location: "",
      };
    }

    return letter;
  }

  window.MedifiLetterParser = { parseLetterFromText };
})();
