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

  function sawAuthReturn() {
    try {
      var search = window.location.search || "";
      var hash = window.location.hash || "";
      return /(^|[?&])(apiKey|authType|mode)=/.test(search)
        || /signInViaRedirect/i.test(search)
        || /access_token=|id_token=/.test(hash);
    } catch (_) {
      return false;
    }
  }

  // Must run before any other auth calls (Firebase redirect sign-in requirement).
  var redirectResultPromise = auth.getRedirectResult();
  var authReturnWaitMs = sawAuthReturn() ? 8000 : 400;
  var firstAuthUserPromise = new Promise(function (resolve) {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    var done = false;
    function finish(user) {
      if (done) return;
      done = true;
      unsub();
      resolve(user || null);
    }
    var unsub = auth.onAuthStateChanged(function (user) {
      if (user) finish(user);
    });
    window.setTimeout(function () { finish(auth.currentUser); }, authReturnWaitMs);
  });

  window.MedifiFirebase = {
    ready: true,
    isConfigured: isConfigured,
    app: app,
    auth: auth,
    db: db,
    redirectResultPromise: redirectResultPromise,
    firstAuthUserPromise: firstAuthUserPromise,
  };
})();
