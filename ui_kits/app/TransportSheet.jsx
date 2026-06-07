/* Medifi — Transport routes sheet. Opens from a letter plan when the patient
 * needs to get to a clinic, hospital, or pharmacy. */
(function () {
  const Icon = window.Icon;
  const Routes = window.MedifiRoutes;

  const MODE_ICON = { bus: "bus", tube: "train", tram: "train", car: "car", walk: "walk" };

  function TransportSheet({ letter, onClose }) {
    const venue = Routes.venueForLetter(letter);
    if (!venue) return null;

    const event = letter.event;
    const best = Routes.bestRoute(venue);
    if (window.MedifiSheetA11y) window.MedifiSheetA11y.useEscape(onClose);

    return (
      <div className="mf-sheet-scrim" onClick={onClose} role="presentation">
        <div className="mf-sheet mf-sheet--routes" role="dialog" aria-modal="true" aria-labelledby="route-sheet-title" onClick={(e) => e.stopPropagation()}>
          <div className="mf-sheet__grip" aria-hidden="true"></div>
          <h3 className="mf-sheet__title" id="route-sheet-title">Getting there</h3>
          <p className="mf-sheet__sub">Routes to help you plan your journey. Always check against your original letter.</p>

          {Routes.hasMap(venue) && <window.MapPreview venue={venue} />}

          <div className="mf-route-venue">
            <span className="mf-route-venue__icon"><Icon name="pin" size={20} /></span>
            <div className="mf-route-venue__main">
              <span className="mf-route-venue__name">{venue.name}</span>
              {venue.unit && <span className="mf-route-venue__unit">{venue.unit}</span>}
              <span className="mf-route-venue__addr">{venue.address}</span>
            </div>
          </div>

          {venue.estimated && (
            <div className="mf-route-note mf-route-note--caution">
              <Icon name="alert" size={16} />
              <span>Your letter didn't include a full address. We've matched the hospital name — confirm the unit when you call.</span>
            </div>
          )}

          {event && best && (
            <div className="mf-route-leave">
              <Icon name="clock" size={18} />
              <span>
                Leave by <strong>{Routes.leaveBy(event, best.leaveByOffsetMins)}</strong>
                {" "}to arrive 15 minutes before your appointment
              </span>
            </div>
          )}

          {(venue.routes && venue.routes.length > 0) && (
          <p className="mf-section__label mf-route-section-label">Suggested routes</p>
          )}
          <div className="mf-route-list">
            {(venue.routes || []).map((r) => (
              <a
                key={r.id}
                className={"mf-route mf-route--link" + (best && best.id === r.id ? " mf-route--best" : "")}
                href={Routes.mapsDirectionsUrl(venue)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="mf-route__icon"><Icon name={MODE_ICON[r.mode] || "pin"} size={20} /></span>
                <div className="mf-route__main">
                  <span className="mf-route__head">
                    <span className="mf-route__label">{r.label}</span>
                    <span className="mf-route__dur">{r.duration}</span>
                  </span>
                  <span className="mf-route__summary">{r.summary}</span>
                  <span className="mf-route__detail">{r.detail}</span>
                  {event && (
                    <span className="mf-route__leave">Leave by {Routes.leaveBy(event, r.leaveByOffsetMins)}</span>
                  )}
                  <span className="mf-route__open">Open in Google Maps</span>
                </div>
              </a>
            ))}
          </div>

          {(!venue.routes || !venue.routes.length) && (
            <p className="mf-route-arrival">Open Google Maps below for directions from your location.</p>
          )}

          {venue.arrivalNote && (
            <p className="mf-route-arrival">{venue.arrivalNote}</p>
          )}

          <p className="mf-section__label mf-route-section-label">Open in maps</p>
          <div className="mf-route-maps">
            <a className="mf-sheet__opt" href={Routes.mapsDirectionsUrl(venue)} target="_blank" rel="noopener">
              <Icon name="map" size={22} />
              <span><span className="t">Google Maps directions</span><span className="s">Turn-by-turn from your location</span></span>
              <Icon name="arrowRight" size={18} />
            </a>
            <a className="mf-sheet__opt" href={Routes.appleMapsUrl(venue)} target="_blank" rel="noopener">
              <Icon name="map" size={22} />
              <span><span className="t">Apple Maps</span><span className="s">Opens on iPhone and Mac</span></span>
              <Icon name="arrowRight" size={18} />
            </a>
          </div>

          <button type="button" className="mf-sheet__cancel" onClick={onClose}>Done</button>
        </div>
      </div>
    );
  }

  window.TransportSheet = TransportSheet;
})();
