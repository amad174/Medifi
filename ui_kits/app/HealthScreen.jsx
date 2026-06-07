/* Medifi — Health profile: log weight, height, ethnicity, age, activity,
 * diet plan, and receive a demo AI risk score. */
(function () {
  const { Button, Badge, Card, Input, Eyebrow, RiskFlag } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;
  const Health = window.MedifiHealth;

  const LEVEL_TONE = { safe: "safe", caution: "caution", risk: "risk" };

  function ChipGroup({ options, value, onChange }) {
    return (
      <div className="mf-chips">
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

  function SelectField({ label, hint, value, onChange, options }) {
    return (
      <div className="mf-field">
        {label && <label className="mf-field__label">{label}</label>}
        <select className="mf-select" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Choose one</option>
          {options.map(function (o) {
            return <option key={o.id} value={o.id}>{o.label}</option>;
          })}
        </select>
        {hint && <span className="mf-field__hint">{hint}</span>}
      </div>
    );
  }

  function WeightLog({ logs, onLog }) {
    const [kg, setKg] = React.useState("");
    function submit() {
      if (!kg.trim()) return;
      onLog(kg);
      setKg("");
    }
    return (
      <div className="mf-weight-log">
        <div className="mf-weight-log__row">
          <Input
            label="Log today's weight"
            hint="In kilograms (kg)"
            type="number"
            inputMode="decimal"
            placeholder="e.g. 72"
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          />
          <Button variant="secondary" onClick={submit} disabled={!kg.trim()} iconLeft={<Icon name="plus" size={18} />} aria-label="Save weight" />
        </div>
        {logs && logs.length > 0 && (
          <ul className="mf-weight-log__list">
            {logs.map(function (l) {
              return (
                <li key={l.date}>
                  <span className="mf-weight-log__date">{l.date}</span>
                  <span className="mf-weight-log__kg">{l.kg} kg</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  function ScoreHero({ result }) {
    return (
      <div className={"mf-health-score mf-health-score--" + result.level}>
        <div className="mf-health-score__ring">
          <span className="mf-health-score__num">{result.score}</span>
          <span className="mf-health-score__of">/ 100</span>
        </div>
        <div className="mf-health-score__main">
          <Eyebrow tone={result.level === "safe" ? "accent" : "brand"}>{result.levelText}</Eyebrow>
          <h2 className="mf-health-score__title">Your AI risk score</h2>
          <p className="mf-health-score__sub">
            Higher scores mean more factors to discuss with your GP — not a diagnosis.
            {result.bmi != null && (
              <> BMI: <strong>{result.bmi}</strong> ({result.bmiLabel}).</>
            )}
          </p>
        </div>
      </div>
    );
  }

  function ValidationHints({ issues }) {
    if (!issues || issues.length === 0) return null;
    return (
      <div className="mf-health-validation">
        {issues.map(function (issue, i) {
          return (
            <RiskFlag key={i} level={issue.level} title={issue.level === "risk" ? "Fix this first" : "Double-check"}>
              {issue.text}
            </RiskFlag>
          );
        })}
      </div>
    );
  }

  function HealthScreen({ onDone }) {
    const [profile, setProfile] = React.useState(Health.loadProfile);
    const [view, setView] = React.useState(profile.lastScore ? "result" : "form");
    const [computing, setComputing] = React.useState(false);
    const [result, setResult] = React.useState(profile.lastScore);
    const validation = Health.validateProfile(profile);

    function patch(updates) {
      setProfile(function (p) {
        var next = Object.assign({}, p, updates);
        Health.saveProfile(next);
        return next;
      });
    }

    function logWeight(kg) {
      setProfile(function (p) {
        var next = Health.addWeightLog(Object.assign({}, p), kg);
        Health.saveProfile(next);
        return next;
      });
    }

    function canSubmit() {
      return validation.valid && profile.ethnicity && profile.activity && profile.diet;
    }

    function submit() {
      if (!canSubmit()) return;
      setComputing(true);
      window.setTimeout(function () {
        var scored = Health.computeRiskScore(profile);
        var next = Object.assign({}, profile, { lastScore: scored });
        Health.saveProfile(next);
        setProfile(next);
        setResult(scored);
        setComputing(false);
        setView("result");
      }, 1400);
    }

    if (computing) {
      return (
        <div className="mf-processing">
          <div className="mf-processing__ring"><Icon name="sparkle" size={30} /></div>
          <p className="mf-processing__t">Checking your health profile…</p>
          <p className="mf-processing__s">Looking at weight, activity, diet, and NHS screening guidance.</p>
        </div>
      );
    }

    if (view === "result" && result) {
      var riskFactors = result.factors.filter(function (f) { return f.level !== "safe"; });
      return (
        <div className="mf-screen mf-screen--health">
          <ScoreHero result={result} />

          <div className="mf-section">
            <p className="mf-section__label">What this means</p>
            <Card variant="accent">
              <p className="mf-summary">{result.summary}</p>
            </Card>
          </div>

          <div className="mf-section">
            <p className="mf-section__label">
              Factors in your score
              {riskFactors.length > 0 && (
                <Badge tone={LEVEL_TONE[result.level]}>{riskFactors.length} flagged</Badge>
              )}
            </p>
            <div className="mf-stack">
              {result.factors.map(function (f, i) {
                return (
                  <RiskFlag key={i} level={f.level} title={f.title}>
                    {f.text}
                  </RiskFlag>
                );
              })}
            </div>
          </div>

          <div className="mf-section">
            <p className="mf-section__label">Your logged details</p>
            <Card>
              <dl className="mf-health-dl">
                <div><dt>Age</dt><dd>{profile.age}</dd></div>
                <div><dt>Ethnicity</dt><dd>{Health.labelFor(Health.ETHNICITIES, profile.ethnicity)}</dd></div>
                <div><dt>Height</dt><dd>{profile.heightCm} cm</dd></div>
                <div><dt>Weight</dt><dd>{profile.weightKg} kg</dd></div>
                <div><dt>Activity</dt><dd>{Health.labelFor(Health.ACTIVITY_LEVELS, profile.activity)}</dd></div>
                <div><dt>Diet plan</dt><dd>{Health.labelFor(Health.DIET_PLANS, profile.diet)}</dd></div>
              </dl>
            </Card>
          </div>

          <div className="mf-health-actions">
            <Button variant="secondary" fullWidth onClick={() => setView("form")}>
              Update my details
            </Button>
            <Button variant="primary" fullWidth onClick={onDone}>
              Back to account
            </Button>
          </div>

          <p className="mf-disclaimer">
            This AI risk score is a demo based on what you logged. It does not replace medical advice.
            Always speak to your GP, pharmacist, or call 111 if you are worried about your health.
          </p>
        </div>
      );
    }

    return (
      <div className="mf-screen mf-screen--health">
        <div className="mf-greet">
          <Eyebrow tone="accent">Health profile</Eyebrow>
          <h1 className="mf-greet__h">Log your health details</h1>
          <p className="mf-greet__sub">
            Add your weight, height, age, and lifestyle. Medifi will give you an AI risk score
            to help you know what to discuss with your GP.
          </p>
        </div>

        <div className="mf-section">
          <p className="mf-section__label">About you</p>
          <div className="mf-stack">
            <Input
              label="Age"
              type="number"
              inputMode="numeric"
              min={Health.LIMITS.age.min}
              max={Health.LIMITS.age.max}
              placeholder="e.g. 42"
              value={profile.age}
              onChange={(e) => patch({ age: e.target.value })}
            />
            <SelectField
              label="Ethnicity"
              hint="Used for NHS screening guidance only. You can choose prefer not to say."
              value={profile.ethnicity}
              onChange={(v) => patch({ ethnicity: v })}
              options={Health.ETHNICITIES}
            />
          </div>
        </div>

        <div className="mf-section">
          <p className="mf-section__label">Body measurements</p>
          <div className="mf-health-grid">
            <Input
              label="Height (cm)"
              type="number"
              inputMode="decimal"
              min={Health.LIMITS.heightCm.min}
              max={Health.LIMITS.heightCm.max}
              placeholder="e.g. 165"
              value={profile.heightCm}
              onChange={(e) => patch({ heightCm: e.target.value })}
            />
            <Input
              label="Weight (kg)"
              type="number"
              inputMode="decimal"
              min={Health.LIMITS.weightKg.min}
              max={Health.LIMITS.weightKg.max}
              placeholder="e.g. 72"
              value={profile.weightKg}
              onChange={(e) => patch({ weightKg: e.target.value })}
            />
          </div>
          {validation.bmiVal != null && validation.valid && (
            <p className="mf-field__hint">
              BMI preview: <strong>{validation.bmiVal}</strong> ({Health.bmiLabel(validation.bmiVal)})
            </p>
          )}
          <ValidationHints issues={validation.issues} />
          <WeightLog logs={profile.weightLogs} onLog={logWeight} />
        </div>

        <div className="mf-section">
          <p className="mf-section__label">Activity level</p>
          <ChipGroup
            options={Health.ACTIVITY_LEVELS}
            value={profile.activity}
            onChange={(v) => patch({ activity: v })}
          />
          {profile.activity && (
            <p className="mf-field__hint">
              {(Health.ACTIVITY_LEVELS.find(function (a) { return a.id === profile.activity; }) || {}).meta}
            </p>
          )}
        </div>

        <div className="mf-section">
          <p className="mf-section__label">Diet plan</p>
          <ChipGroup
            options={Health.DIET_PLANS}
            value={profile.diet}
            onChange={(v) => patch({ diet: v })}
          />
          {profile.diet && (
            <p className="mf-field__hint">
              {(Health.DIET_PLANS.find(function (d) { return d.id === profile.diet; }) || {}).meta}
            </p>
          )}
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          iconLeft={<Icon name="sparkle" size={20} />}
          disabled={!canSubmit()}
          onClick={submit}
        >
          Get my AI risk score
        </Button>

        {profile.lastScore && (
          <button type="button" className="mf-link" onClick={() => { setResult(profile.lastScore); setView("result"); }}>
            <Icon name="info" size={16} />
            View your last score ({profile.lastScore.score}/100)
          </button>
        )}

        <p className="mf-disclaimer">
          Your health details stay on this device in this demo. Medifi does not give medical advice.
        </p>
      </div>
    );
  }

  window.HealthScreen = HealthScreen;
})();
