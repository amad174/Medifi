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

  function SignUpScreen({ onComplete, isEdit, initialMode, onCancel }) {
    const [mode, setMode] = React.useState(isEdit ? "edit" : (initialMode || "signup"));

    React.useEffect(function () {
      if (!isEdit && initialMode) setMode(initialMode);
    }, [initialMode, isEdit]);
    const [form, setForm] = React.useState(function () { return Patient.load(); });
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);
    const Auth = window.MedifiAuth;

    function patch(updates) {
      setForm(function (f) { return Object.assign({}, f, updates); });
      setError("");
    }

    function validate() {
      if (!(form.email || "").trim()) return "Please enter your email.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Please enter a valid email address.";
      if (mode === "login") {
        if (!password) return "Please enter your password.";
        return "";
      }
      if (!(form.name || "").trim()) return "Please enter your name.";
      var age = parseInt(form.age, 10);
      if (!form.age || age < 1 || age > 120) return "Please enter your age (1–120).";
      if (!form.ethnicity) return "Please choose your ethnicity.";
      if (!form.activity) return "Please choose your usual activity level.";
      if (!form.smoking) return "Please answer about smoking or vaping.";
      if (!form.alcohol) return "Please answer about alcohol.";
      if (!form.diet) return "Please describe your diet.";
      if (!form.sleep) return "Please tell us how your sleep usually is.";
      if (!form.caring) return "Please answer about caring responsibilities.";
      if (mode === "signup") {
        if (!password) return "Please enter a password.";
        if (password.length < 6) return "Password must be at least 6 characters.";
        if (password !== confirmPassword) return "Passwords do not match.";
      }
      return "";
    }

    async function signInWithGoogle() {
      if (!Auth || !Auth.firebaseReady()) {
        setError("Firebase is not configured. Copy firebase-config.example.js to firebase-config.js.");
        return;
      }
      setSubmitting(true);
      setError("");
      try {
        var user = await Auth.loginWithGoogle();
        if (user) {
          onComplete(user, { google: true });
          return;
        }
      } catch (err) {
        setError(err.message || "Could not sign in with Google.");
      } finally {
        setSubmitting(false);
      }
    }

    async function submit() {
      const msg = validate();
      if (msg) {
        setError(msg);
        return;
      }
      const profile = Object.assign({}, form, {
        name: (form.name || "").trim(),
        email: form.email.trim().toLowerCase(),
        registeredAt: form.registeredAt || new Date().toISOString(),
      });
      setSubmitting(true);
      setError("");
      try {
        if (mode === "login" && Auth && Auth.firebaseReady()) {
          const user = await Auth.login(profile.email, password);
          onComplete(user);
          return;
        }
        if (isEdit && Auth && Auth.firebaseReady() && Auth.getToken()) {
          const user = await Auth.updateProfile(profile);
          Patient.save(profile);
          onComplete(user);
          return;
        }
        if (Auth && Auth.firebaseReady()) {
          const user = await Auth.signup(profile, password);
          onComplete(user);
          return;
        }
        Patient.save(profile);
        onComplete(profile);
      } catch (err) {
        setError(err.message || "Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }

    return (
      <div className="mf-screen mf-screen--signup">
        <div className="mf-signup-hero">
          <Eyebrow tone="accent">{isEdit ? "Your profile" : mode === "login" ? "Welcome back" : "Welcome to Medifi"}</Eyebrow>
          <h1 className="mf-signup-hero__h">
            {isEdit ? "Update your details" : mode === "login" ? "Sign in" : "Create your account"}
          </h1>
          <p className="mf-signup-hero__sub">
            {isEdit
              ? "Change your details any time. Your account stays signed in on this device."
              : mode === "login"
                ? "Enter your email and password to pick up where you left off."
                : "A few details help Medifi tailor letter summaries and health tips for you."}
          </p>
        </div>

        {!isEdit && (
          <div className="mf-google-auth">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              disabled={submitting}
              onClick={signInWithGoogle}
            >
              Sign in with Google
            </Button>
            <p className="mf-google-auth__or">or use your email</p>
          </div>
        )}

        {!isEdit && (
          <div className="mf-signup-toggle">
            <button
              type="button"
              className={"mf-chip" + (mode === "signup" ? " mf-chip--on" : "")}
              aria-pressed={mode === "signup"}
              onClick={() => { setMode("signup"); setError(""); }}
            >
              New account
            </button>
            <button
              type="button"
              className={"mf-chip" + (mode === "login" ? " mf-chip--on" : "")}
              aria-pressed={mode === "login"}
              onClick={() => { setMode("login"); setError(""); }}
            >
              Sign in
            </button>
          </div>
        )}

        <div className="mf-section">
          <p className="mf-section__label">{mode === "login" ? "Your account" : "About you"}</p>
          <div className="mf-signup-fields">
            {mode !== "login" && (
              <Input
                id="signup-name"
                label="Full name"
                placeholder="e.g. Aisha Khan"
                value={form.name}
                onChange={(e) => patch({ name: e.target.value })}
              />
            )}
            <Input
              id="signup-email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => patch({ email: e.target.value })}
            />
            {mode !== "login" && (
              <React.Fragment>
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
              </React.Fragment>
            )}
          </div>
        </div>

        {mode === "signup" && (
          <div className="mf-section">
            <p className="mf-section__label">Create a password</p>
            <p className="mf-signup-section__hint">You’ll use this to sign in and keep your letters saved after you refresh the page.</p>
            <div className="mf-signup-fields">
              <Input
                id="signup-password"
                label="Enter a password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                id="signup-password-confirm"
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your password again"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        )}

        {mode === "login" && (
          <div className="mf-section">
            <p className="mf-section__label">Your password</p>
            <div className="mf-signup-fields">
              <Input
                id="signup-password"
                label="Enter your password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        )}

        {mode !== "login" && (
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
        )}

        {error && (
          <div className="mf-banner">
            <Icon name="alert" size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="mf-signup-actions">
          <Button variant="primary" size="lg" fullWidth onClick={submit} disabled={submitting}>
            {submitting ? "Please wait…" : isEdit ? "Save changes" : mode === "login" ? "Sign in" : "Create my account"}
          </Button>
          {onCancel && !isEdit && (
            <Button variant="secondary" size="lg" fullWidth onClick={onCancel}>
              Back to home
            </Button>
          )}
        </div>
        <p className="mf-disclaimer">
          {Auth && Auth.firebaseReady && Auth.firebaseReady()
            ? "When you sign in, your account and letters are saved securely. This is not medical advice."
            : "Your profile is saved on this device. Configure Firebase to sync across devices. This is not medical advice."}
        </p>
      </div>
    );
  }

  window.SignUpScreen = SignUpScreen;
})();
