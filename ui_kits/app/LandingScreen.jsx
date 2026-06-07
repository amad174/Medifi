/* Medifi — Public landing page (shown before sign-in). */
(function () {
  const { Button, Eyebrow } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;

  const LOGO_SRC = (window.MEDIFI_ASSETS && window.MEDIFI_ASSETS.logo) || "../../assets/medifi-logo.png";

  const FEATURES = [
    {
      icon: "scan",
      title: "Scan or paste any NHS letter",
      text: "Photograph a letter, upload a PDF, or paste the text. Medifi reads it and builds a clear action plan.",
    },
    {
      icon: "sparkle",
      title: "Plain-English summaries",
      text: "Dates, places, contacts, and what to do next — written calmly, without medical jargon.",
    },
    {
      icon: "alert",
      title: "Spot what needs checking",
      text: "Colour-coded alerts flag missing details, past dates, or anything that deserves a closer look.",
    },
    {
      icon: "languages",
      title: "Translate & listen",
      text: "Read summaries in Urdu, Bengali, Polish, Arabic, Somali, and more — or listen aloud.",
    },
    {
      icon: "calendar",
      title: "Calendar & reminders",
      text: "Add appointments and medicine schedules to Google Calendar, Apple Calendar, or Outlook in one tap.",
    },
    {
      icon: "map",
      title: "Routes to your clinic",
      text: "Bus, tube, and driving options with a suggested leave-by time when your letter includes a venue.",
    },
  ];

  const AUDIENCE = [
    { title: "Patients", text: "Anyone who finds NHS letters confusing, long, or hard to act on." },
    { title: "Carers & families", text: "Share plain-English summaries with someone you trust — without losing the original letter." },
    { title: "People with busy lives", text: "Keep every letter organised in one place, synced to your account." },
  ];

  function LandingScreen({ onSignUp, onLogin, onLearnMore }) {
    const assets = window.MEDIFI_ASSETS || {};

    return (
      <div className="mf-landing">
        <section className="mf-landing-hero">
          <div className="mf-landing-hero__copy">
            <img
              src={LOGO_SRC}
              alt="Medifi"
              className="mf-landing-hero__logo"
              width="200"
              height="56"
            />
            <Eyebrow tone="accent">NHS Letter Lens</Eyebrow>
            <h1 className="mf-landing-hero__h">
              Turn confusing NHS letters into a clear plan
            </h1>
            <p className="mf-landing-hero__sub">
              Medifi helps UK patients understand hospital and GP letters — what they mean,
              what to do next, and when to act. Your original letter is always the source of truth.
            </p>
            <div className="mf-landing-hero__cta">
              <Button variant="primary" size="lg" onClick={onSignUp}>
                Create free account
              </Button>
              <Button variant="secondary" size="lg" onClick={onLogin}>
                Log in
              </Button>
            </div>
            <p className="mf-landing-hero__note">
              Free to use · Works on phone and desktop · Your data stays private
            </p>
          </div>
          {assets.nhsTeam && (
            <div className="mf-landing-hero__visual">
              <img
                src={assets.nhsTeam}
                alt="Healthcare team supporting patients"
                className="mf-landing-hero__img"
                loading="eager"
              />
            </div>
          )}
        </section>

        <section className="mf-landing-section" id="how-it-works">
          <div className="mf-landing-section__inner">
            <h2 className="mf-landing-section__h">What Medifi does</h2>
            <p className="mf-landing-section__lead">
              NHS letters often arrive as dense PDFs or posted paper. Medifi uses careful AI to
              pull out what matters — then presents it in a friendly, step-by-step plan you can
              actually follow.
            </p>
            <ol className="mf-landing-steps">
              <li>
                <span className="mf-landing-steps__n">1</span>
                <span><strong>Add your letter</strong> — photo, file, or paste.</span>
              </li>
              <li>
                <span className="mf-landing-steps__n">2</span>
                <span><strong>Get a plain-English plan</strong> — dates, risks, and a checklist.</span>
              </li>
              <li>
                <span className="mf-landing-steps__n">3</span>
                <span><strong>Act with confidence</strong> — calendar, maps, share, or ask questions.</span>
              </li>
            </ol>
          </div>
        </section>

        <section className="mf-landing-section mf-landing-section--alt">
          <div className="mf-landing-section__inner">
            <h2 className="mf-landing-section__h">Who it&apos;s for</h2>
            <div className="mf-landing-audience">
              {AUDIENCE.map(function (item) {
                return (
                  <div key={item.title} className="mf-landing-audience__card">
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mf-landing-section">
          <div className="mf-landing-section__inner">
            <h2 className="mf-landing-section__h">Everything in one place</h2>
            <div className="mf-landing-features">
              {FEATURES.map(function (f) {
                return (
                  <div key={f.title} className="mf-landing-feature">
                    <span className="mf-landing-feature__icon">
                      <Icon name={f.icon} size={22} />
                    </span>
                    <h3 className="mf-landing-feature__t">{f.title}</h3>
                    <p className="mf-landing-feature__s">{f.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mf-landing-trust">
          <div className="mf-landing-section__inner">
            <div className="mf-landing-trust__grid">
              <div className="mf-landing-trust__item">
                <Icon name="check" size={20} />
                <span><strong>Not an NHS service</strong> — an independent tool that works alongside your care team.</span>
              </div>
              <div className="mf-landing-trust__item">
                <Icon name="id" size={20} />
                <span><strong>Private by design</strong> — sign in to save letters securely; we never sell your data.</span>
              </div>
              <div className="mf-landing-trust__item">
                <Icon name="file" size={20} />
                <span><strong>Always check the original</strong> — Medifi explains; your NHS letter remains authoritative.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mf-landing-cta">
          <div className="mf-landing-cta__card">
            <h2>Ready to understand your next letter?</h2>
            <p>Create an account in under a minute — then scan your first letter.</p>
            <div className="mf-landing-hero__cta">
              <Button variant="primary" size="lg" onClick={onSignUp}>
                Sign up free
              </Button>
              <Button variant="secondary" size="lg" onClick={onLogin}>
                Log in
              </Button>
            </div>
            {onLearnMore && (
              <button type="button" className="mf-link mf-landing-cta__link" onClick={onLearnMore}>
                Questions? Read our help guide
              </button>
            )}
          </div>
        </section>
      </div>
    );
  }

  window.LandingScreen = LandingScreen;
})();
