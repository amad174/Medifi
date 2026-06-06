/* Medifi — Patient sign-up: basics and lifestyle questions. */
(function () {
  const { Button, Input, Eyebrow } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;
  const Patient = window.MedifiPatient;

  function ChipGroup({ options, value, onChange }) {
    return (
      <div className="mf-chips mf-chips--wrap">
        {options.map(function (o) {
          return (
            <button
              key={o.id}
              type="button"
              className={"mf-chip" + (value === o.id ? " mf-chip--on" : "")}
              onClick={() => onChange(o.id)}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }

  function QuestionField({ label, value, onChange, options }) {
    return (
      <div className="mf-signup-q">
        <p className="mf-signup-q__label">{label}</p>
        <ChipGroup options={options} value={value} onChange={onChange} />
      </div>
    );
  }

  function SelectField({ label, value, onChange, options }) {
    return (
      <div className="mf-field">
        <label className="mf-signup-q__label">{label}</label>
        <select className="mf-select" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Choose one</option>
          {options.map(function (o) {
            return <option key={o.id} value={o.id}>{o.label}</option>;
          })}
        </select>
      </div>
    );
  }

  function SignUpScreen({ onComplete, isEdit }) {
    const [form, setForm] = React.useState(function () { return Patient.load(); });
    const [error, setError] = React.useState("");

    function patch(updates) {
      setForm(function (f) { return Object.assign({}, f, updates); });
      setError("");
    }

    function validate() {
      if (!(form.name || "").trim()) return "Please enter your name.";
      if (!(form.email || "").trim()) return "Please enter your email.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Please enter a valid email address.";
      var age = parseInt(form.age, 10);
      if (!form.age || age < 1 || age > 120) return "Please enter your age (1–120).";
      if (!form.ethnicity) return "Please choose your ethnicity.";
      if (!form.activity) return "Please choose your usual activity level.";
      if (!form.smoking) return "Please answer about smoking or vaping.";
      if (!form.alcohol) return "Please answer about alcohol.";
      if (!form.diet) return "Please describe your diet.";
      if (!form.sleep) return "Please tell us how your sleep usually is.";
      if (!form.caring) return "Please answer about caring responsibilities.";
      return "";
    }

    function submit() {
      const msg = validate();
      if (msg) {
        setError(msg);
        return;
      }
      const profile = Object.assign({}, form, {
        name: form.name.trim(),
        email: form.email.trim(),
        registeredAt: form.registeredAt || new Date().toISOString(),
      });
      Patient.save(profile);
      onComplete(profile);
    }

    return (
      <div className="mf-screen mf-screen--signup">
        <div className="mf-signup-hero">
          <Eyebrow tone="accent">{isEdit ? "Your profile" : "Welcome to Medifi"}</Eyebrow>
          <h1 className="mf-signup-hero__h">{isEdit ? "Update your details" : "Create your account"}</h1>
          <p className="mf-signup-hero__sub">
            {isEdit
              ? "Change your details any time. Everything stays on this device."
              : "A few details help Medifi tailor letter summaries and health tips for you."}
          </p>
        </div>

        <div className="mf-section">
          <p className="mf-section__label">About you</p>
          <div className="mf-signup-fields">
            <Input
              id="signup-name"
              label="Full name"
              placeholder="e.g. Aisha Khan"
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
            />
            <Input
              id="signup-email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => patch({ email: e.target.value })}
            />
            <Input
              id="signup-age"
              label="Age"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 34"
              value={form.age}
              onChange={(e) => patch({ age: e.target.value })}
            />
            <SelectField
              label="Ethnicity"
              value={form.ethnicity}
              onChange={(v) => patch({ ethnicity: v })}
              options={Patient.ETHNICITIES}
            />
          </div>
        </div>

        <div className="mf-section">
          <p className="mf-section__label">A bit about your lifestyle</p>
          <p className="mf-signup-section__hint">Tap one answer for each question. You can skip sensitive questions by choosing “Prefer not to say”.</p>
          <div className="mf-signup-questions">
            <QuestionField
              label="What is your usual activity level?"
              value={form.activity}
              onChange={(v) => patch({ activity: v })}
              options={Patient.ACTIVITY}
            />
            <QuestionField
              label="Do you smoke or vape?"
              value={form.smoking}
              onChange={(v) => patch({ smoking: v })}
              options={Patient.SMOKING}
            />
            <QuestionField
              label="Do you drink alcohol?"
              value={form.alcohol}
              onChange={(v) => patch({ alcohol: v })}
              options={Patient.ALCOHOL}
            />
            <QuestionField
              label="How would you describe your diet?"
              value={form.diet}
              onChange={(v) => patch({ diet: v })}
              options={Patient.DIET}
            />
            <QuestionField
              label="How is your sleep usually?"
              value={form.sleep}
              onChange={(v) => patch({ sleep: v })}
              options={Patient.SLEEP}
            />
            <QuestionField
              label="Do you have any caring responsibilities?"
              value={form.caring}
              onChange={(v) => patch({ caring: v })}
              options={Patient.CARING}
            />
          </div>
        </div>

        {error && (
          <div className="mf-banner">
            <Icon name="alert" size={20} />
            <span>{error}</span>
          </div>
        )}

        <Button variant="primary" size="lg" fullWidth onClick={submit}>
          {isEdit ? "Save changes" : "Create my account"}
        </Button>
        <p className="mf-disclaimer">
          Medifi stores this on your device only. It is not shared without your permission. This is not medical advice.
        </p>
      </div>
    );
  }

  window.SignUpScreen = SignUpScreen;
})();
