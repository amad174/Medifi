/* Firebase app bootstrap (Auth + Firestore). */

(function () {
  function isConfigured() {
    var c = window.MEDIFI_FIREBASE;
    return Boolean(c && c.apiKey && c.apiKey !== "YOUR_API_KEY" && c.projectId);
  }

  if (!isConfigured() || typeof firebase === "undefined") {
    window.MedifiFirebase = { ready: false, isConfigured: isConfigured };
    return;
  }

  var app = firebase.apps.length ? firebase.app() : firebase.initializeApp(window.MEDIFI_FIREBASE);
  var auth = firebase.auth();
  var db = firebase.firestore();

  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

  // Must run before any other auth calls (Firebase redirect sign-in requirement).
  var redirectResultPromise = auth.getRedirectResult();

  window.MedifiFirebase = {
    ready: true,
    isConfigured: isConfigured,
    app: app,
    auth: auth,
    db: db,
    redirectResultPromise: redirectResultPromise,
  };
})();
