/* Patient sign-up profile — stored on this device (localStorage). */

(function () {
  var STORAGE_KEY = "medifi-patient-profile";

  var ETHNICITIES = [
    { id: "white", label: "White British, Irish or other White" },
    { id: "asian", label: "Asian or Asian British" },
    { id: "black", label: "Black, African, Caribbean or Black British" },
    { id: "mixed", label: "Mixed or multiple ethnic groups" },
    { id: "other", label: "Other ethnic group" },
    { id: "prefer-not", label: "Prefer not to say" },
  ];

  var ACTIVITY = [
    { id: "low", label: "Low" },
    { id: "moderate", label: "Moderate" },
    { id: "active", label: "Active" },
    { id: "very-active", label: "Very active" },
  ];

  var SMOKING = [
    { id: "no", label: "No" },
    { id: "sometimes", label: "Sometimes" },
    { id: "regularly", label: "Regularly" },
    { id: "prefer-not", label: "Prefer not to say" },
  ];

  var ALCOHOL = [
    { id: "no", label: "No" },
    { id: "occasionally", label: "Occasionally" },
    { id: "regularly", label: "Regularly" },
    { id: "prefer-not", label: "Prefer not to say" },
  ];

  var DIET = [
    { id: "balanced", label: "Balanced" },
    { id: "irregular", label: "Irregular" },
    { id: "vegetarian", label: "Vegetarian" },
    { id: "vegan", label: "Vegan" },
    { id: "halal", label: "Halal" },
    { id: "low-appetite", label: "Low appetite" },
    { id: "other", label: "Other" },
  ];

  var SLEEP = [
    { id: "good", label: "Good" },
    { id: "okay", label: "Okay" },
    { id: "poor", label: "Poor" },
    { id: "varies", label: "Varies a lot" },
  ];

  var CARING = [
    { id: "children", label: "Children" },
    { id: "elderly", label: "Elderly family" },
    { id: "disabled", label: "Disabled person" },
    { id: "none", label: "None" },
    { id: "prefer-not", label: "Prefer not to say" },
  ];

  function defaultProfile() {
    return {
      name: "",
      email: "",
      age: "",
      ethnicity: "",
      activity: "",
      smoking: "",
      alcohol: "",
      diet: "",
      sleep: "",
      caring: "",
      registeredAt: null,
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultProfile();
      return Object.assign(defaultProfile(), JSON.parse(raw));
    } catch (e) {
      return defaultProfile();
    }
  }

  function syncToHealth(patient) {
    if (!window.MedifiHealth || !patient) return;
    var activityMap = {
      low: "sedentary",
      moderate: "moderate",
      active: "active",
      "very-active": "active",
    };
    var dietMap = {
      balanced: "balanced",
      irregular: "none",
      vegetarian: "vegetarian",
      vegan: "vegetarian",
      halal: "balanced",
      "low-appetite": "none",
      other: "unsure",
    };
    var h = window.MedifiHealth.loadProfile();
    h.age = patient.age || h.age;
    h.ethnicity = patient.ethnicity || h.ethnicity;
    if (patient.activity) h.activity = activityMap[patient.activity] || h.activity;
    if (patient.diet) h.diet = dietMap[patient.diet] || h.diet;
    window.MedifiHealth.saveProfile(h);
  }

  function save(profile) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    syncToHealth(profile);
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function isRegistered() {
    var p = load();
    return Boolean(p.registeredAt && p.name && p.email);
  }

  function firstName(name) {
    return (name || "").trim().split(/\s+/)[0] || "there";
  }

  function initial(name) {
    return ((name || "").trim()[0] || "M").toUpperCase();
  }

  function labelFor(options, id) {
    var o = options.find(function (x) { return x.id === id; });
    return o ? o.label : "";
  }

  window.MedifiPatient = {
    STORAGE_KEY: STORAGE_KEY,
    ETHNICITIES: ETHNICITIES,
    ACTIVITY: ACTIVITY,
    SMOKING: SMOKING,
    ALCOHOL: ALCOHOL,
    DIET: DIET,
    SLEEP: SLEEP,
    CARING: CARING,
    load: load,
    save: save,
    clear: clear,
    syncToHealth: syncToHealth,
    isRegistered: isRegistered,
    firstName: firstName,
    initial: initial,
    labelFor: labelFor,
    defaultProfile: defaultProfile,
  };
})();
