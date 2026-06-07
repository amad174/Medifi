/* Medifi — Updates from the care team. ONE-WAY: the doctor/clinic pushes
 * messages; the patient can read and act, but cannot reply (locked composer). */
(function () {
  const { Button, Badge } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;
  const TONE = { safe: "safe", caution: "caution", risk: "risk", brand: "brand", neutral: "neutral" };

  const UPDATE_PHOTOS = {
    u1: function () { return window.MEDIFI_ASSETS && window.MEDIFI_ASSETS.doctorFriendly; },
  };

  function UpdateCard({ u, onCal }) {
    const photo = UPDATE_PHOTOS[u.id] ? UPDATE_PHOTOS[u.id]() : null;
    return (
      <div className={"mf-update" + (u.unread ? " mf-update--unread" : "")}>
        <div className="mf-update__head">
          {photo ? (
            <img src={photo} alt="" className="mf-update__avatar mf-update__avatar--photo" />
          ) : (
            <span className="mf-update__avatar">{u.initial}</span>
          )}
          <span className="mf-update__who">
            <span className="mf-update__from">{u.from}{u.unread && <span className="mf-update__dot" aria-label="Unread"></span>}</span>
            <span className="mf-update__role">{u.role} · {u.time}</span>
          </span>
        </div>
        <Badge tone={TONE[u.tone] || "neutral"}>{u.type}</Badge>
        <p className="mf-update__body">{u.body}</p>
        {u.action && (
          <div className="mf-update__action">
            {u.action.kind === "calendar" && (
              <Button variant="secondary" size="sm" iconLeft={<Icon name="calendar" size={16} />} onClick={() => onCal(u)}>{u.action.label}</Button>
            )}
            {u.action.kind === "call" && (
              <Button as="a" href={"tel:" + u.action.tel} variant="secondary" size="sm" iconLeft={<Icon name="phone" size={16} />}>{u.action.label}</Button>
            )}
          </div>
        )}
      </div>
    );
  }

  function UpdatesScreen({ onCal }) {
    const assets = window.MEDIFI_ASSETS || {};
    return (
      <div className="mf-screen mf-updates">
        <div className="mf-updates-hero">
          {assets.brand && (
            <img
              src={assets.brand}
              alt="Medifi — always putting patients first"
              className="mf-brand-lockup mf-brand-lockup--updates"
            />
          )}
          {assets.nhsTeam && (
            <img src={assets.nhsTeam} alt="Your NHS care team" className="mf-updates-hero__img" />
          )}
          <p className="mf-updates-hero__caption">Messages from your GP, hospital, and pharmacy</p>
        </div>
        <div className="mf-updates__list">
          <div className="mf-trust">
            <Icon name="check" size={16} />
            <span>Verified messages from your NHS care team.</span>
          </div>
          {window.MEDIFI_UPDATES.map((u) => <UpdateCard key={u.id} u={u} onCal={onCal} />)}
        </div>
        <div className="mf-locked" aria-hidden="false">
          <span className="mf-locked__icon"><Icon name="lock" size={18} /></span>
          <span className="mf-locked__text">Replies are off. This is a one-way update from your care team — to respond, use the contact details in the message.</span>
        </div>
      </div>
    );
  }
  window.UpdatesScreen = UpdatesScreen;
})();
