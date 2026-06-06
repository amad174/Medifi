/* Share a Medifi letter summary with a carer (native share, copy, WhatsApp, email). */

(function () {
  function buildShareText(letter, view, language) {
    const v = view || letter;
    const risks = (v.risks || []).filter(function (r) { return r.level !== "safe"; });
    const lines = [
      "Medifi — NHS letter summary",
      language && language !== "English" ? "(" + language + " — check the original English letter too)" : "",
      "",
      v.headline || "",
      v.when ? "When: " + v.when : "",
      "",
      v.summary || "",
    ];

    if (risks.length) {
      lines.push("", "Please check:");
      risks.forEach(function (r) {
        lines.push("• " + r.title + ": " + r.text);
      });
    }

    if (v.checklist && v.checklist.length) {
      lines.push("", "Next steps:");
      v.checklist.forEach(function (c) {
        lines.push("• " + c.label + (c.meta ? " (" + c.meta + ")" : ""));
      });
    }

    if (letter.fields && letter.fields.length) {
      lines.push("", "Key details:");
      letter.fields.forEach(function (f) {
        if (f.missing) lines.push("• " + f.label + ": (missing — check original)");
        else if (f.value) lines.push("• " + f.label + ": " + f.value);
      });
    }

    lines.push("", "Shared from Medifi. Always check against the original NHS letter.");
    return lines.filter(function (line) { return line !== undefined; }).join("\n");
  }

  function whatsAppUrl(text) {
    return "https://wa.me/?text=" + encodeURIComponent(text);
  }

  function mailtoUrl(letter, text) {
    const subject = "Medifi: " + (letter.headline || "NHS letter summary");
    return "mailto:?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
  }

  async function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }

  async function nativeShare(letter, text) {
    if (!navigator.share) return { ok: false, unsupported: true };
    try {
      await navigator.share({
        title: "Medifi: " + (letter.headline || "Letter summary"),
        text: text,
      });
      return { ok: true, message: "Shared with your carer." };
    } catch (err) {
      if (err.name === "AbortError") return { ok: false, cancelled: true };
      return { ok: false, unsupported: true };
    }
  }

  async function sharePlan(letter, view, language) {
    const text = buildShareText(letter, view, language);
    const native = await nativeShare(letter, text);
    if (native.ok) return native;
    if (native.cancelled) return { ok: false, cancelled: true };
    return { ok: false, showSheet: true, text: text };
  }

  window.MedifiShare = {
    buildShareText,
    sharePlan,
    copyText,
    whatsAppUrl,
    mailtoUrl,
    nativeShare,
  };
})();
