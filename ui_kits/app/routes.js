/* Medifi — Transport routes to clinics and hospitals.
 * Demo data only. In production, routes would come from TfL / NHS APIs. */

(function () {
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

  function venueForLetter(letter) {
    if (!letter) return null;
    if (letter.venueId) return venueById(letter.venueId);
    const loc = letter.event && letter.event.location;
    if (!loc) return null;
    const venues = window.MEDIFI_VENUES || {};
    return Object.values(venues).find(function (v) {
      return loc.indexOf(v.name) !== -1;
    }) || null;
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
    return !!(venue.mapsQuery || venue.address);
  }

  function mapEmbedUrl(venue) {
    if (!hasMap(venue)) return null;
    const q = venue.lat != null && venue.lng != null
      ? venue.lat + "," + venue.lng
      : encodeURIComponent(venue.mapsQuery || [venue.name, venue.address].filter(Boolean).join(", "));
    return "https://www.google.com/maps?q=" + q + "&hl=en&z=15&output=embed";
  }

  window.MedifiRoutes = {
    venueById: venueById,
    venueForLetter: venueForLetter,
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
