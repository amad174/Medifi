/* Medifi — calendar helpers. Generates REAL calendar artefacts so reminders
 * actually pop up: a Google Calendar template URL, and a valid .ics file
 * (Apple Calendar, Outlook, Google import) with alarms + recurrence for
 * medicine schedules. No backend needed. */
(function () {
  function pad(n) { return String(n).padStart(2, "0"); }

  // Local "floating" time string YYYYMMDDTHHMMSS (no Z → uses device TZ).
  function fmt(d) {
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) +
      "T" + pad(d.getHours()) + pad(d.getMinutes()) + "00";
  }
  function fmtUTCstamp() {
    const d = new Date();
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) +
      "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + "Z";
  }
  function esc(s) { return String(s || "").replace(/[\\,;]/g, "\\$&").replace(/\n/g, "\\n"); }
  function uid() { return "medifi-" + Math.random().toString(36).slice(2) + "@medifi.app"; }

  // Google Calendar template URL for a single event.
  function googleUrl(ev) {
    const p = new URLSearchParams({
      action: "TEMPLATE",
      text: ev.title,
      dates: fmt(ev.start) + "/" + fmt(ev.end),
      details: ev.description || "",
      location: ev.location || "",
    });
    return "https://calendar.google.com/calendar/render?" + p.toString();
  }

  function vevent(ev) {
    const lines = [
      "BEGIN:VEVENT",
      "UID:" + uid(),
      "DTSTAMP:" + fmtUTCstamp(),
      "DTSTART:" + fmt(ev.start),
      "DTEND:" + fmt(ev.end),
      "SUMMARY:" + esc(ev.title),
    ];
    if (ev.location) lines.push("LOCATION:" + esc(ev.location));
    if (ev.description) lines.push("DESCRIPTION:" + esc(ev.description));
    if (ev.rrule) lines.push("RRULE:" + ev.rrule);
    if (ev.alarmMins != null) {
      lines.push("BEGIN:VALARM", "ACTION:DISPLAY",
        "DESCRIPTION:" + esc(ev.title),
        "TRIGGER:-PT" + ev.alarmMins + "M", "END:VALARM");
    }
    lines.push("END:VEVENT");
    return lines.join("\r\n");
  }

  function icsText(events) {
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Medifi//Letter Lens//EN",
      "CALSCALE:GREGORIAN", ...events.map(vevent), "END:VCALENDAR"].join("\r\n");
  }

  function downloadIcs(events, filename) {
    const blob = new Blob([icsText(events)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = (filename || "medifi") + ".ics";
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
  }

  // Build recurring medicine reminder events from a prescription.
  // med = { name, dose, times: ["08:00", ...], days }
  function medicineEvents(medicines, startDate) {
    const base = startDate || new Date();
    const out = [];
    medicines.forEach((m) => {
      (m.times || []).forEach((t) => {
        const [hh, mm] = t.split(":").map(Number);
        const start = new Date(base);
        start.setHours(hh, mm, 0, 0);
        const end = new Date(start.getTime() + 10 * 60000);
        out.push({
          title: "Take " + m.name + " (" + m.dose + ")",
          start, end,
          description: "Medifi medicine reminder. Follow your prescription and pharmacist's advice.",
          rrule: "FREQ=DAILY;COUNT=" + (m.days || 7),
          alarmMins: 0,
        });
      });
    });
    return out;
  }

  window.MedifiCal = { googleUrl, icsText, downloadIcs, medicineEvents, fmt };
})();
