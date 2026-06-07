/* Medifi — Health profile logging and demo AI risk scoring.
 * Not medical advice. Demo logic only — production would use validated models. */

(function () {
  var STORAGE_KEY = "medifi-health-profile";

  var LIMITS = {
    age: { min: 1, max: 120 },
    heightCm: { min: 50, max: 280 },
    weightKg: { min: 20, max: 400 },
  };

  var ETHNICITIES = [
    { id: "white", label: "White British, Irish or other White" },
    { id: "asian", label: "Asian or Asian British" },
    { id: "black", label: "Black, African, Caribbean or Black British" },
    { id: "mixed", label: "Mixed or multiple ethnic groups" },
    { id: "other", label: "Other ethnic group" },
    { id: "prefer-not", label: "Prefer not to say" },
  ];

  var ACTIVITY_LEVELS = [
    { id: "sedentary", label: "Mostly sitting", meta: "Little daily movement" },
    { id: "light", label: "Light activity", meta: "Some walking or chores" },
    { id: "moderate", label: "Moderate", meta: "Exercise 2–3 times a week" },
    { id: "active", label: "Active", meta: "Moving most days" },
  ];

  var DIET_PLANS = [
    { id: "balanced", label: "Balanced / NHS Eatwell", meta: "General healthy eating" },
    { id: "weight-loss", label: "Weight loss", meta: "Trying to lose weight" },
    { id: "low-salt", label: "Low salt", meta: "Heart or blood pressure focus" },
    { id: "diabetic", label: "Diabetic-friendly", meta: "Blood sugar aware" },
    { id: "vegetarian", label: "Vegetarian or vegan" },
    { id: "none", label: "No specific plan", meta: "Not following a plan" },
    { id: "unsure", label: "Not sure", meta: "Still figuring it out" },
  ];

  var HIGH_DIABETES_ETHNICITIES = { asian: true, black: true, mixed: true, other: true };

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function defaultProfile() {
    return {
      age: "",
      ethnicity: "",
      heightCm: "",
      weightKg: "",
      activity: "",
      diet: "",
      weightLogs: [],
      lastScore: null,
    };
  }

  function loadProfile() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultProfile();
      return Object.assign(defaultProfile(), JSON.parse(raw));
    } catch (e) {
      return defaultProfile();
    }
  }

  function saveProfile(profile) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }

  function parseMetric(value, min, max) {
    var n = parseFloat(String(value).trim());
    if (!isFinite(n)) return { value: null, ok: false, plausible: false };
    return { value: n, ok: true, plausible: n >= min && n <= max };
  }

  function bmi(weightKg, heightCm) {
    var w = parseFloat(weightKg);
    var h = parseFloat(heightCm) / 100;
    if (!isFinite(w) || !isFinite(h) || h <= 0 || w <= 0) return null;
    return Math.round((w / (h * h)) * 10) / 10;
  }

  function bmiLabel(bmiVal) {
    if (bmiVal == null) return "";
    if (bmiVal < 16) return "severely underweight range";
    if (bmiVal < 18.5) return "underweight range";
    if (bmiVal < 25) return "healthy weight range";
    if (bmiVal < 30) return "overweight range";
    if (bmiVal < 35) return "obese range (class I)";
    if (bmiVal < 40) return "obese range (class II)";
    return "obese range (class III)";
  }

  function bmiRiskFactor(bmiVal) {
    if (bmiVal >= 50) {
      return {
        points: 45,
        level: "risk",
        title: "Very high BMI",
        text: "Your BMI is " + bmiVal + ". This is well above the healthy range — please speak to your GP as soon as you can about weight support and screening.",
      };
    }
    if (bmiVal >= 40) {
      return {
        points: 38,
        level: "risk",
        title: "BMI is in class III obesity",
        text: "Your BMI is " + bmiVal + ". The NHS recommends urgent GP support for weight management and related health checks.",
      };
    }
    if (bmiVal >= 35) {
      return {
        points: 32,
        level: "risk",
        title: "BMI is in class II obesity",
        text: "Your BMI is " + bmiVal + ". Speak to your GP about weight support and any screening you may need.",
      };
    }
    if (bmiVal >= 30) {
      return {
        points: 28,
        level: "risk",
        title: "BMI is in the obese range",
        text: "Your BMI is " + bmiVal + ". The NHS recommends speaking to your GP about weight support and any screening you may need.",
      };
    }
    if (bmiVal >= 25) {
      return {
        points: 16,
        level: "caution",
        title: "BMI is in the overweight range",
        text: "Your BMI is " + bmiVal + ". Small changes to activity and diet can help — your GP or pharmacist can point you to free NHS programmes.",
      };
    }
    if (bmiVal < 16) {
      return {
        points: 22,
        level: "risk",
        title: "BMI is severely below the healthy range",
        text: "Your BMI is " + bmiVal + ". Please tell your GP — unintentional weight loss or very low weight needs a proper check.",
      };
    }
    if (bmiVal < 18.5) {
      return {
        points: 14,
        level: "caution",
        title: "BMI is below the healthy range",
        text: "Your BMI is " + bmiVal + ". If you have lost weight without trying, tell your GP.",
      };
    }
    return {
      points: 0,
      level: "safe",
      title: "BMI is in the healthy weight range",
      text: "Your BMI is " + bmiVal + ". Keep up everyday movement and balanced meals.",
    };
  }

  function ageRiskFactor(age) {
    if (!isFinite(age)) return null;
    if (age >= 80) {
      return {
        points: 18,
        level: "caution",
        title: "Age 80 or over",
        text: "Routine NHS health checks and screening are especially important at this age.",
      };
    }
    if (age >= 65) {
      return {
        points: 12,
        level: "caution",
        title: "Age 65 or over",
        text: "Routine NHS health checks and screening are especially important as you get older.",
      };
    }
    if (age >= 45) {
      return {
        points: 6,
        level: "caution",
        title: "Age 45 or over",
        text: "You may be eligible for NHS diabetes and heart health checks — ask your GP surgery.",
      };
    }
    if (age < 18) {
      return {
        points: 8,
        level: "caution",
        title: "Under 18",
        text: "This demo score is aimed at adults. If you are worried about your health, speak to a parent, carer, or GP.",
      };
    }
    return null;
  }

  function validateProfile(profile) {
    var issues = [];
    var age = parseMetric(profile.age, LIMITS.age.min, LIMITS.age.max);
    var height = parseMetric(profile.heightCm, LIMITS.heightCm.min, LIMITS.heightCm.max);
    var weight = parseMetric(profile.weightKg, LIMITS.weightKg.min, LIMITS.weightKg.max);
    var bmiVal = height.ok && weight.ok ? bmi(weight.value, height.value) : null;

    if (!age.ok) {
      issues.push({ field: "age", level: "risk", text: "Enter a valid age in years." });
    } else if (!age.plausible) {
      issues.push({ field: "age", level: "caution", text: "Age looks unusual — please double-check the number." });
    }

    if (!height.ok) {
      issues.push({ field: "heightCm", level: "risk", text: "Enter a valid height in centimetres." });
    } else if (!height.plausible) {
      issues.push({ field: "heightCm", level: "caution", text: "Height looks unusual — typical adult heights are 140–220 cm." });
    }

    if (!weight.ok) {
      issues.push({ field: "weightKg", level: "risk", text: "Enter a valid weight in kilograms." });
    } else if (!weight.plausible) {
      issues.push({ field: "weightKg", level: "caution", text: "Weight looks unusual — please double-check the number." });
    }

    if (bmiVal != null && (bmiVal < 10 || bmiVal > 80)) {
      issues.push({
        field: "measurements",
        level: "caution",
        text: "Height and weight together produce an unusual BMI (" + bmiVal + "). Check both values are correct.",
      });
    }

    var blocking = issues.some(function (i) { return i.level === "risk"; });
    return {
      age: age,
      height: height,
      weight: weight,
      bmiVal: bmiVal,
      issues: issues,
      valid: !blocking && age.ok && height.ok && weight.ok,
    };
  }

  function computeRiskScore(profile) {
    var factors = [];
    var score = 0;
    var validation = validateProfile(profile);
    var age = validation.age.ok ? Math.round(validation.age.value) : NaN;
    var bmiVal = validation.bmiVal;

    validation.issues.forEach(function (issue) {
      factors.push({
        level: issue.level,
        title: issue.level === "risk" ? "Check your entry" : "Unusual value entered",
        text: issue.text,
      });
      score += issue.level === "risk" ? 20 : 12;
    });

    if (bmiVal != null) {
      var bmiFactor = bmiRiskFactor(bmiVal);
      score += bmiFactor.points;
      factors.push(bmiFactor);
    }

    var ageFactor = ageRiskFactor(age);
    if (ageFactor) {
      score += ageFactor.points;
      factors.push(ageFactor);
    }

    if (profile.activity === "sedentary") {
      score += 18;
      factors.push({
        level: "risk",
        title: "Low activity level",
        text: "Mostly sitting raises long-term health risks. Even short daily walks can help — start with what feels manageable.",
      });
    } else if (profile.activity === "light") {
      score += 10;
      factors.push({
        level: "caution",
        title: "Light activity only",
        text: "A bit more movement each week could lower your long-term risk. NHS Active 10 is a gentle place to start.",
      });
    } else if (profile.activity === "moderate") {
      score += 4;
      factors.push({
        level: "safe",
        title: "Moderate activity",
        text: "You are moving regularly — keep it up.",
      });
    } else if (profile.activity === "active") {
      factors.push({
        level: "safe",
        title: "Active lifestyle",
        text: "Regular movement is one of the best things you can do for long-term health.",
      });
    }

    if (profile.diet === "none" || profile.diet === "unsure") {
      score += 10;
      factors.push({
        level: "caution",
        title: "No clear eating plan",
        text: "Not following a plan is common. The NHS Eatwell Guide is a simple starting point if you want one.",
      });
    } else if (profile.diet === "weight-loss") {
      score += 6;
      factors.push({
        level: "caution",
        title: "Trying to lose weight",
        text: "Worth pairing your plan with your GP or NHS weight management services so it stays safe and sustainable.",
      });
    } else if (profile.diet === "diabetic") {
      score += 4;
      factors.push({
        level: "caution",
        title: "Blood-sugar aware diet",
        text: "Keep following your plan and make sure your GP knows if this is new or self-started.",
      });
    } else {
      factors.push({
        level: "safe",
        title: "You have a diet plan",
        text: "Following a plan you chose or were given is a positive step.",
      });
    }

    if (bmiVal != null && HIGH_DIABETES_ETHNICITIES[profile.ethnicity]) {
      if (bmiVal >= 27.5) {
        score += 18;
        factors.push({
          level: "risk",
          title: "NHS diabetes screening strongly recommended",
          text: "For your ethnicity group, the NHS recommends earlier diabetes checks, especially at this BMI (" + bmiVal + "). Ask your GP for a blood test if you have not had one recently.",
        });
      } else if (bmiVal >= 23) {
        score += 14;
        factors.push({
          level: "caution",
          title: "NHS diabetes screening may apply earlier",
          text: "For your ethnicity group, the NHS often recommends diabetes checks at a lower BMI. Ask your GP if you have not had a recent blood test.",
        });
      }
    }

    if (profile.ethnicity === "prefer-not") {
      factors.push({
        level: "safe",
        title: "Ethnicity not shared",
        text: "Some NHS screening thresholds vary by background. You can add this later for more tailored prompts.",
      });
    }

    score = Math.min(100, Math.max(0, score));
    var level = score >= 50 ? "risk" : score >= 25 ? "caution" : "safe";
    var levelText = level === "risk" ? "Higher priority to discuss with your GP"
      : level === "caution" ? "Some factors worth a check-in"
      : "Fewer flagged factors right now";

    var summary = level === "risk"
      ? "Based on what you logged, several factors suggest you should book a routine chat with your GP — not because something is wrong, but because prevention and screening matter."
      : level === "caution"
      ? "You have a mix of healthy habits and areas to keep an eye on. This score highlights topics worth discussing at your next GP or pharmacy visit."
      : "From what you logged, fewer long-term risk factors stand out. Keep logging weight and habits so Medifi can spot changes early.";

    if (validation.issues.length > 0) {
      summary = "Some of the numbers you entered look unusual. " + summary;
    }

    return {
      score: score,
      level: level,
      levelText: levelText,
      bmi: bmiVal,
      bmiLabel: bmiLabel(bmiVal),
      factors: factors,
      summary: summary,
      validationIssues: validation.issues,
      computedAt: new Date().toISOString(),
    };
  }

  function addWeightLog(profile, kg) {
    var w = parseFloat(kg);
    if (!isFinite(w) || w < LIMITS.weightKg.min || w > LIMITS.weightKg.max) return profile;
    var entry = { date: todayISO(), kg: w };
    var logs = (profile.weightLogs || []).filter(function (l) { return l.date !== entry.date; });
    logs.unshift(entry);
    profile.weightLogs = logs.slice(0, 12);
    profile.weightKg = String(w);
    return profile;
  }

  function labelFor(list, id) {
    var item = list.find(function (x) { return x.id === id; });
    return item ? item.label : "";
  }

  window.MedifiHealth = {
    STORAGE_KEY: STORAGE_KEY,
    LIMITS: LIMITS,
    ETHNICITIES: ETHNICITIES,
    ACTIVITY_LEVELS: ACTIVITY_LEVELS,
    DIET_PLANS: DIET_PLANS,
    loadProfile: loadProfile,
    saveProfile: saveProfile,
    validateProfile: validateProfile,
    bmi: bmi,
    bmiLabel: bmiLabel,
    computeRiskScore: computeRiskScore,
    addWeightLog: addWeightLog,
    labelFor: labelFor,
    todayISO: todayISO,
  };
})();
