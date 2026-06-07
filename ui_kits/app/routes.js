/* Medifi — Transport routes to clinics and hospitals.
 * Demo venues from data.js; scanned letters use location from the parsed plan. */

(function () {
  const LOCATION_LABEL_RE = /location|address|where|hospital|clinic|department|venue|site|pharmacy|appointment/i;
  const UK_POSTCODE_RE = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i;

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function formatTime(d) {
    const h = d.getHours();
    const m = d.getMinutes();
    const ap = h >= 12 ? "pm" : "am";
    const h12 = h % 12 || 12;
    return m ? h12 + ":" + pad(m) + ap : h12 + ap;
  }

  function venueById(id) {
    return (window.MEDIFI_VENUES || {})[id] || null;
  }

  function norm(s) {
    return String(s || "").toLowerCase().replace(/['’]/g, "").trim();
  }

  function fieldLocation(letter) {
    if (!letter || !Array.isArray(letter.fields)) return "";
    for (let i = 0; i < letter.fields.length; i++) {
      const f = letter.fields[i];
      if (!f || f.missing || !f.value) continue;
      const label = String(f.label || "");
      const value = String(f.value).trim();
      if (!value || value.length < 4) continue;
      if (LOCATION_LABEL_RE.test(label)) return value;
    }
    return "";
  }

  function locationFromLetter(letter) {
    if (!letter) return "";
    const eventLoc = letter.event && letter.event.location;
    if (eventLoc && String(eventLoc).trim().length > 3) return String(eventLoc).trim();
    const fromField = fieldLocation(letter);
    if (fromField) return fromField;
    return "";
  }

  function matchKnownVenue(loc) {
    if (!loc) return null;
    const needle = norm(loc);
    const venues = window.MEDIFI_VENUES || {};
    let best = null;
    let bestLen = 0;
    Object.values(venues).forEach(function (v) {
      const name = norm(v.name);
      if (!name) return;
      if (needle.indexOf(name) !== -1 || name.indexOf(needle.split(",")[0]) !== -1) {
        if (name.length > bestLen) {
          best = v;
          bestLen = name.length;
        }
      }
    });
    return best;
  }

  function defaultRoutes() {
    return [
      {
        id: "public",
        mode: "bus",
        label: "Public transport",
        summary: "Bus, tube, or tram",
        duration: "varies",
        detail: "Use Google Maps for live times from where you are now.",
        leaveByOffsetMins: 45,
      },
      {
        id: "drive",
        mode: "car",
        label: "Driving",
        summary: "Sat nav to your appointment",
        duration: "varies",
        detail: "Allow extra time for hospital parking and finding the right building.",
        leaveByOffsetMins: 55,
      },
      {
        id: "walk",
        mode: "walk",
        label: "Walking",
        summary: "If you live nearby",
        duration: "varies",
        detail: "Only if the clinic is within a comfortable walking distance for you.",
        leaveByOffsetMins: 25,
      },
    ];
  }

  function syntheticVenue(locationText) {
    const text = String(locationText || "").trim();
    if (text.length < 4) return null;
    const parts = text.split(/[,;–—]/).map(function (s) { return s.trim(); }).filter(Boolean);
    const name = parts[0] || text;
    const address = parts.length > 1 ? parts.slice(1).join(", ") : text;
    const postcode = text.match(UK_POSTCODE_RE);
    const mapsQuery = postcode
      ? text
      : (text.indexOf("UK") === -1 && text.indexOf("United Kingdom") === -1 ? text + ", UK" : text);
    return {
      id: "letter-location",
      name: name,
      unit: parts.length > 2 ? parts[1] : "",
      address: address,
      mapsQuery: mapsQuery,
      estimated: true,
      routes: defaultRoutes(),
      arrivalNote: "Address taken from your letter. Always double-check against the original before you travel.",
    };
  }

  function venueForLetter(letter) {
    if (!letter) return null;
    if (letter.venueId) return venueById(letter.venueId);
    const loc = locationFromLetter(letter);
    if (!loc) return null;
    return matchKnownVenue(loc) || syntheticVenue(loc);
  }

  function letterHasLocation(letter) {
    return Boolean(venueForLetter(letter));
  }

  function leaveBy(event, offsetMins) {
    if (!event || offsetMins == null) return null;
    const appt = new Date(event.y, event.mo - 1, event.d, event.h, event.min);
    return formatTime(new Date(appt.getTime() - offsetMins * 60000));
  }

  function mapsSearchUrl(venue) {
    const q = venue.mapsQuery || [venue.name, venue.address].filter(Boolean).join(", ");
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
  }

  function mapsDirectionsUrl(venue) {
    const q = venue.mapsQuery || [venue.name, venue.address].filter(Boolean).join(", ");
    return "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(q);
  }

  function appleMapsUrl(venue) {
    const q = venue.mapsQuery || [venue.name, venue.address].filter(Boolean).join(", ");
    return "https://maps.apple.com/?daddr=" + encodeURIComponent(q);
  }

  function bestRoute(venue) {
    if (!venue || !venue.routes || !venue.routes.length) return null;
    return venue.routes.reduce(function (best, r) {
      if (!best) return r;
      const bestOff = best.leaveByOffsetMins || 999;
      const rOff = r.leaveByOffsetMins || 999;
      return rOff < bestOff ? r : best;
    }, null);
  }

  function routeSummary(venue) {
    const r = bestRoute(venue);
    if (!r) return "";
    return r.label + " · " + r.duration;
  }

  function hasMap(venue) {
    if (!venue) return false;
    if (venue.lat != null && venue.lng != null) return true;
    return !!(venue.mapsQuery || venue.address || venue.name);
  }

  function mapEmbedUrl(venue) {
    if (!hasMap(venue)) return null;
    const q = venue.lat != null && venue.lng != null
      ? venue.lat + "," + venue.lng
      : (venue.mapsQuery || [venue.name, venue.address].filter(Boolean).join(", "));
    return "https://maps.google.com/maps?q=" + encodeURIComponent(q) + "&hl=en&z=15&output=embed";
  }

  window.MedifiRoutes = {
    venueById: venueById,
    venueForLetter: venueForLetter,
    letterHasLocation: letterHasLocation,
    locationFromLetter: locationFromLetter,
    leaveBy: leaveBy,
    mapsSearchUrl: mapsSearchUrl,
    mapsDirectionsUrl: mapsDirectionsUrl,
    appleMapsUrl: appleMapsUrl,
    bestRoute: bestRoute,
    routeSummary: routeSummary,
    hasMap: hasMap,
    mapEmbedUrl: mapEmbedUrl,
    formatTime: formatTime,
  };
})();
