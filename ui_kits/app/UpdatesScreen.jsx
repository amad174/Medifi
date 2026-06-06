/* Medifi — Updates from the care team. ONE-WAY: the doctor/clinic pushes
 * messages; the patient can read and act, but cannot reply (locked composer). */
(function () {
  const { Button, Badge } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;
  const TONE = { safe: "safe", caution: "caution", risk: "risk", brand: "brand", neutral: "neutral" };

  function UpdateCard({ u, onCal }) {
    return (
      <div className={"mf-update" + (u.unread ? " mf-update--unread" : "")}>
        <div className="mf-update__head">
          <span className="mf-update__avatar">{u.initial}</span>
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
    return (
      <div className="mf-screen mf-updates">
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
