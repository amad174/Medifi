/* Medifi — Map preview for clinic / hospital / pharmacy locations. */
(function () {
  const Icon = window.Icon;
  const Routes = window.MedifiRoutes;

  function MapPreview({ venue }) {
    const embed = Routes.mapEmbedUrl(venue);
    if (!embed) return null;

    return (
      <div className="mf-map-preview">
        <iframe
          className="mf-map-preview__frame"
          title={"Map of " + venue.name}
          src={embed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a
          className="mf-map-preview__link"
          href={Routes.mapsDirectionsUrl(venue)}
          target="_blank"
          rel="noopener"
        >
          <Icon name="map" size={16} />
          <span>Open in Google Maps</span>
          <Icon name="arrowRight" size={16} />
        </a>
      </div>
    );
  }

  window.MapPreview = MapPreview;
})();
