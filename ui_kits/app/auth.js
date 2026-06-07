/* Medifi auth — Firebase Auth + Firestore (persists across refresh). */

(function () {
  var cachedUser = null;
  var cachedEmailInbox = null;

  function fb() {
    return window.MedifiFirebase && window.MedifiFirebase.ready ? window.MedifiFirebase : null;
  }

  function firebaseReady() {
    return Boolean(fb());
  }

  function mapFirebaseError(err) {
    var code = err && err.code ? err.code : "";
    if (code === "auth/email-already-in-use") {
      return "An account with this email already exists. Try signing in.";
    }
    if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
      return "Wrong email or password.";
    }
    if (code === "auth/weak-password") {
      return "Password must be at least 6 characters.";
    }
    if (code === "auth/invalid-email") {
      return "Please enter a valid email address.";
    }
    if (code === "auth/popup-closed-by-user") {
      return "Google sign-in was cancelled.";
    }
    if (code === "auth/popup-blocked") {
      return "Your browser blocked the sign-in window. Trying a full-page redirect instead — if nothing happens, allow popups for this site.";
    }
    if (code === "auth/cancelled-popup-request") {
      return "Please wait a moment and try Google sign-in again.";
    }
    if (code === "auth/unauthorized-domain") {
      return "This site is not authorised for Google sign-in. In Firebase Console → Authentication → Settings, add “"
        + (typeof window !== "undefined" ? window.location.host : "your domain") + "” to Authorised domains.";
    }
    if (code === "auth/account-exists-with-different-credential") {
      return "An account already exists with this email using a password. Sign in with email and password instead.";
    }
    if (code === "permission-denied" || (err.message && err.message.indexOf("insufficient permissions") >= 0)) {
      return "Firebase database permissions are blocked. In Firebase Console → Firestore → Rules, paste the rules from firestore.rules in the repo (or ask whoever owns the project to do this).";
    }
    return (err && err.message) || "Something went wrong. Please try again.";
  }

  function profileFromDoc(data, uid) {
    if (!data) return null;
    return {
      id: uid,
      name: data.name || "",
      email: data.email || "",
      age: data.age || "",
      ethnicity: data.ethnicity || "",
      activity: data.activity || "",
      smoking: data.smoking || "",
      alcohol: data.alcohol || "",
      diet: data.diet || "",
      sleep: data.sleep || "",
      caring: data.caring || "",
      registeredAt: data.registeredAt || null,
    };
  }

  function profileToDoc(profile) {
    return {
      name: profile.name || "",
      email: (profile.email || "").trim().toLowerCase(),
      age: String(profile.age || ""),
      ethnicity: profile.ethnicity || "",
      activity: profile.activity || "",
      smoking: profile.smoking || "",
      alcohol: profile.alcohol || "",
      diet: profile.diet || "",
      sleep: profile.sleep || "",
      caring: profile.caring || "",
      registeredAt: profile.registeredAt || new Date().toISOString(),
    };
  }

  function setActiveScope(user) {
    if (!window.MedifiUserScope) return;
    if (user && user.id) {
      window.MedifiUserScope.setScope(user.id);
    } else {
      window.MedifiUserScope.setScope(window.MedifiUserScope.GUEST);
    }
  }

  function hydrate(user, letters, health) {
    cachedUser = user || null;
    setActiveScope(user);
    if (window.MedifiLetterStore) {
      window.MedifiLetterStore.hydrateFromServer(letters || []);
    }
    if (window.MedifiHealth) {
      if (health && window.MedifiHealth.hydrateFromServer) {
        window.MedifiHealth.hydrateFromServer(health);
      } else if (window.MedifiHealth.clearLocal) {
        window.MedifiHealth.clearLocal();
      }
    }
    if (user && window.MedifiPatient) {
      window.MedifiPatient.hydrateLocal(user);
    }
  }

  function hydrateEmailInbox(inbox) {
    cachedEmailInbox = inbox || null;
    if (inbox && window.MedifiEmailSettings) {
      window.MedifiEmailSettings.saveLocal(inbox);
      return;
    }
    if (window.MedifiEmailSettings) {
      window.MedifiEmailSettings.clearLocal();
    }
  }

  async function loadLetters(uid) {
    var f = fb();
    var letters = [];
    try {
      var lettersSnap = await f.db.collection("users").doc(uid).collection("letters")
        .orderBy("savedAt", "desc")
        .get();
      letters = lettersSnap.docs.map(function (doc) { return doc.data(); });
    } catch (err) {
      console.warn("letters orderBy:", err);
      var fallbackSnap = await f.db.collection("users").doc(uid).collection("letters").get();
      letters = fallbackSnap.docs.map(function (doc) { return doc.data(); });
      letters.sort(function (a, b) { return (b.savedAt || 0) - (a.savedAt || 0); });
    }
    return letters;
  }

  async function migrateGuestLettersToCloud(uid) {
    if (!window.MedifiUserScope || !firebaseReady()) return;
    var guestKey = window.MedifiUserScope.scopedKey(
      window.MedifiUserScope.GUEST,
      window.MedifiUserScope.SUFFIXES.letters
    );
    try {
      var raw = localStorage.getItem(guestKey);
      if (!raw) return;
      var guestLetters = JSON.parse(raw);
      if (!Array.isArray(guestLetters) || !guestLetters.length) return;
      var f = fb();
      for (var i = 0; i < guestLetters.length; i++) {
        var letter = guestLetters[i];
        if (!letter || !letter.id) continue;
        if (window.MedifiLetterStore && !window.MedifiLetterStore.shouldSave(letter)) continue;
        var entry = Object.assign({}, letter, {
          id: letter.id,
          savedAt: letter.savedAt || Date.now(),
        });
        await f.db.collection("users").doc(uid).collection("letters").doc(letter.id).set(entry, { merge: true });
      }
      localStorage.removeItem(guestKey);
    } catch (err) {
      console.warn("guest letter migrate:", err);
    }
  }

  async function loadUserData(uid) {
    var f = fb();
    var userSnap = await f.db.collection("users").doc(uid).get();
    var profile = userSnap.exists ? profileFromDoc(userSnap.data(), uid) : null;
    var health = userSnap.exists && userSnap.data().health ? userSnap.data().health : null;
    var emailInbox = userSnap.exists && userSnap.data().emailInbox ? userSnap.data().emailInbox : null;
    var letters = await loadLetters(uid);
    hydrateEmailInbox(emailInbox);
    return { profile: profile, letters: letters, health: health, emailInbox: emailInbox };
  }

  var GOOGLE_AUTH_PENDING_KEY = "medifi_google_auth_pending";
  var GOOGLE_AUTH_PENDING_TS_KEY = "medifi_google_auth_pending_ts";
  var GMAIL_CONNECT_KEY = "medifi_gmail_connect";
  var PENDING_TTL_MS = 15 * 60 * 1000;

  function isMobileAuth() {
    try {
      var ua = navigator.userAgent || "";
      if (/iPhone|iPad|iPod|Android/i.test(ua)) return true;
      if (window.matchMedia && window.matchMedia("(max-width: 768px)").matches) return true;
    } catch (_) { /* ignore */ }
    return false;
  }

  function isInAppBrowser() {
    try {
      var ua = navigator.userAgent || "";
      return /FBAN|FBAV|Instagram|Line\//i.test(ua)
        || (ua.indexOf("iPhone") >= 0 && ua.indexOf("Safari") < 0 && ua.indexOf("CriOS") < 0);
    } catch (_) {
      return false;
    }
  }

  function assertGoogleSignInEnvironment() {
    if (isInAppBrowser()) {
      throw new Error(
        "Google sign-in does not work inside this in-app browser. "
        + "Open medifi-seven.vercel.app in Safari or Chrome, then try again."
      );
    }
  }

  function clearGoogleAuthPending() {
    try {
      sessionStorage.removeItem(GOOGLE_AUTH_PENDING_KEY);
      localStorage.removeItem(GOOGLE_AUTH_PENDING_KEY);
      localStorage.removeItem(GOOGLE_AUTH_PENDING_TS_KEY);
    } catch (_) { /* ignore */ }
  }

  function isGoogleAuthPending() {
    try {
      if (sessionStorage.getItem(GOOGLE_AUTH_PENDING_KEY) === "1") return true;
      if (localStorage.getItem(GOOGLE_AUTH_PENDING_KEY) !== "1") return false;
      var ts = parseInt(localStorage.getItem(GOOGLE_AUTH_PENDING_TS_KEY) || "0", 10);
      if (!ts || Date.now() - ts > PENDING_TTL_MS) {
        clearGoogleAuthPending();
        return false;
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  function setGoogleAuthPending(on) {
    try {
      if (on) {
        sessionStorage.setItem(GOOGLE_AUTH_PENDING_KEY, "1");
        localStorage.setItem(GOOGLE_AUTH_PENDING_KEY, "1");
        localStorage.setItem(GOOGLE_AUTH_PENDING_TS_KEY, String(Date.now()));
      } else {
        clearGoogleAuthPending();
      }
    } catch (_) { /* ignore */ }
  }

  function setGmailConnectPending(on) {
    try {
      if (on) {
        sessionStorage.setItem(GMAIL_CONNECT_KEY, "1");
        localStorage.setItem(GMAIL_CONNECT_KEY, "1");
      } else {
        sessionStorage.removeItem(GMAIL_CONNECT_KEY);
        localStorage.removeItem(GMAIL_CONNECT_KEY);
      }
    } catch (_) { /* ignore */ }
  }

  function isGmailConnectPending() {
    try {
      return sessionStorage.getItem(GMAIL_CONNECT_KEY) === "1"
        || localStorage.getItem(GMAIL_CONNECT_KEY) === "1";
    } catch (_) {
      return false;
    }
  }

  function hasAuthCallbackParams() {
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

  function clearStaleOAuthPending() {
    if (hasAuthCallbackParams()) return;
    var f = fb();
    if (f && f.auth.currentUser) return;
    if (isGoogleAuthPending()) clearGoogleAuthPending();
  }

  function isExpectingOAuthReturn() {
    if (hasAuthCallbackParams()) return true;
    if (!isGoogleAuthPending()) return false;
    var f = fb();
    return Boolean(f && f.auth.currentUser);
  }

  function cleanAuthParamsFromUrl() {
    try {
      if (!hasAuthCallbackParams()) return;
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (_) { /* ignore */ }
  }

  function waitForAuthUser(maxWaitMs) {
    var timeout = typeof maxWaitMs === "number" ? maxWaitMs : 4000;
    var f = fb();
    if (f.auth.currentUser) return Promise.resolve(f.auth.currentUser);
    return new Promise(function (resolve) {
      var done = false;
      function finish(user) {
        if (done) return;
        done = true;
        unsub();
        resolve(user || null);
      }
      var unsub = f.auth.onAuthStateChanged(function (user) {
        if (user) finish(user);
      });
      window.setTimeout(function () { finish(f.auth.currentUser); }, timeout);
    });
  }

  async function waitForRedirectSession() {
    var f = fb();
    if (f.auth.currentUser) return f.auth.currentUser;
    if (f.firstAuthUserPromise) {
      var early = await f.firstAuthUserPromise;
      if (early) return early;
    }
    return waitForAuthUser(isMobileAuth() ? 6000 : 4000);
  }

  function getToken() {
    var f = fb();
    return f && f.auth.currentUser ? "firebase" : "";
  }

  function isLoggedIn() {
    return Boolean(getToken() && cachedUser);
  }

  function getUser() {
    return cachedUser;
  }

  function profileFromFirebaseUser(firebaseUser) {
    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || (firebaseUser.email || "").split("@")[0] || "",
      email: (firebaseUser.email || "").trim().toLowerCase(),
      age: "",
      ethnicity: "",
      activity: "",
      smoking: "",
      alcohol: "",
      diet: "",
      sleep: "",
      caring: "",
      registeredAt: new Date().toISOString(),
    };
  }

  async function syncUserFromFirestore(firebaseUser) {
    await ensureUserProfile(firebaseUser);
    setActiveScope({ id: firebaseUser.uid });
    await migrateGuestLettersToCloud(firebaseUser.uid);
    var data = await loadUserData(firebaseUser.uid);
    if (data.profile) {
      hydrate(data.profile, data.letters, data.health);
      return data.profile;
    }
    return profileFromFirebaseUser(firebaseUser);
  }

  async function ensureUserProfile(firebaseUser) {
    var f = fb();
    var uid = firebaseUser.uid;
    var snap = await f.db.collection("users").doc(uid).get();
    if (snap.exists) return profileFromDoc(snap.data(), uid);
    var doc = profileToDoc({
      name: firebaseUser.displayName || (firebaseUser.email || "").split("@")[0] || "",
      email: (firebaseUser.email || "").trim().toLowerCase(),
      registeredAt: new Date().toISOString(),
    });
    var provider = firebaseUser.providerData && firebaseUser.providerData[0]
      ? firebaseUser.providerData[0].providerId
      : "";
    if (provider === "google.com") doc.authProvider = "google";
    await f.db.collection("users").doc(uid).set(doc);
    return profileFromDoc(doc, uid);
  }

  var GMAIL_SCOPE = "https://mail.google.com/";

  function googleProvider(opts) {
    var provider = new firebase.auth.GoogleAuthProvider();
    var options = opts || {};
    if (options.gmail) {
      provider.addScope(GMAIL_SCOPE);
      provider.setCustomParameters({ prompt: "consent", access_type: "online" });
    } else if (isMobileAuth()) {
      provider.setCustomParameters({ prompt: "select_account", display: "touch" });
    } else {
      provider.setCustomParameters({ prompt: "select_account" });
    }
    return provider;
  }

  async function finishGoogleSignIn(firebaseUser) {
    if (!firebaseUser) throw new Error("Google sign-in did not complete.");
    var quickProfile = profileFromFirebaseUser(firebaseUser);
    setActiveScope({ id: firebaseUser.uid });
    hydrate(quickProfile, [], null);
    clearGoogleAuthPending();
    cleanAuthParamsFromUrl();
    try {
      return await syncUserFromFirestore(firebaseUser);
    } catch (err) {
      console.warn("profile sync:", err);
      return quickProfile;
    }
  }

  async function hydrateFromFirebaseSession() {
    if (!firebaseReady()) return null;
    var user = fb().auth.currentUser;
    if (!user) return null;
    if (cachedUser && cachedUser.id === user.uid) return cachedUser;
    return finishGoogleSignIn(user);
  }

  var googleRedirectPromise = null;

  async function saveGmailInboxFromCredential(firebaseUser, credential) {
    if (!credential || !credential.accessToken || !firebaseUser || !firebaseUser.email) {
      throw new Error("Gmail access was not granted. When Google asks, allow Medifi to read your email.");
    }
    var config = {
      email: firebaseUser.email.trim().toLowerCase(),
      authType: "google_oauth",
      accessToken: credential.accessToken,
      imapHost: "imap.gmail.com",
      imapPort: 993,
      subjectFilter: "NHSINFORMATION",
      connectedAt: new Date().toISOString(),
    };
    if (window.MedifiEmailSettings) {
      var test = await window.MedifiEmailSettings.testConnection(config);
      config.imapHost = test.imapHost || config.imapHost;
      config.imapPort = test.imapPort || config.imapPort;
    }
    await saveEmailInbox(config);
    return config;
  }

  async function readRedirectResult() {
    var f = fb();
    if (f.redirectResultPromise) {
      return f.redirectResultPromise;
    }
    return f.auth.getRedirectResult();
  }

  function captureGoogleRedirect() {
    if (!firebaseReady()) return Promise.resolve(null);
    if (googleRedirectPromise) return googleRedirectPromise;
    googleRedirectPromise = (async function () {
      var pending = isGoogleAuthPending();
      var result;
      try {
        result = await readRedirectResult();
      } catch (err) {
        setGoogleAuthPending(false);
        console.error("google redirect:", err);
        throw new Error(mapFirebaseError(err));
      }

      if (result && result.user) {
        setGoogleAuthPending(false);
        cleanAuthParamsFromUrl();

        var gmailPending = isGmailConnectPending();
        if (gmailPending) setGmailConnectPending(false);

        if (gmailPending) {
          var credential = firebase.auth.GoogleAuthProvider.credentialFromResult(result);
          var inbox = await saveGmailInboxFromCredential(result.user, credential);
          var profile = await finishGoogleSignIn(result.user);
          return { type: "gmail", profile: profile, inbox: inbox };
        }

        var signedIn = await finishGoogleSignIn(result.user);
        return { type: "auth", profile: signedIn };
      }

      var gmailStillPending = isGmailConnectPending();
      var expectingReturn = pending || hasAuthCallbackParams();

      if (expectingReturn && !gmailStillPending) {
        var restored = await waitForRedirectSession();
        clearGoogleAuthPending();
        cleanAuthParamsFromUrl();
        if (restored) {
          var profile = await finishGoogleSignIn(restored);
          return { type: "auth", profile: profile };
        }
      }

      return null;
    })();
    return googleRedirectPromise;
  }

  async function completeGoogleRedirect() {
    if (!firebaseReady()) return null;
    return captureGoogleRedirect();
  }

  var APP_AUTH_PATH = "/ui_kits/app/index.html";

  function isLocalDev() {
    var host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1";
  }

  function ensureAuthReturnPath() {
    var path = window.location.pathname || "";
    if (path === APP_AUTH_PATH || path.endsWith(APP_AUTH_PATH)) return false;
    window.location.replace(APP_AUTH_PATH + window.location.search + window.location.hash);
    return true;
  }

  function shouldUseRedirect() {
    return isMobileAuth();
  }

  async function connectGmailInbox() {
    if (!firebaseReady()) {
      throw new Error("Firebase is not configured. Copy firebase-config.example.js to firebase-config.js.");
    }
    var f = fb();
    var provider = googleProvider({ gmail: true });

    var result;
    if (shouldUseRedirect()) {
      if (ensureAuthReturnPath()) return null;
      setGmailConnectPending(true);
      await f.auth.signInWithRedirect(provider);
      return null;
    }

    try {
      result = await f.auth.signInWithPopup(provider);
    } catch (err) {
      var code = err && err.code ? err.code : "";
      if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
        setGmailConnectPending(true);
        await f.auth.signInWithRedirect(provider);
        return null;
      }
      throw new Error(mapFirebaseError(err));
    }

    var credential = firebase.auth.GoogleAuthProvider.credentialFromResult(result);
    var config = await saveGmailInboxFromCredential(result.user, credential);

    if (!getToken() && result.user) {
      await finishGoogleSignIn(result.user);
    }

    return config;
  }

  async function loginWithGoogle() {
    if (!firebaseReady()) {
      throw new Error("Firebase is not configured. Copy firebase-config.example.js to firebase-config.js.");
    }
    assertGoogleSignInEnvironment();
    var f = fb();
    var provider = googleProvider();

    if (shouldUseRedirect()) {
      if (ensureAuthReturnPath()) return null;
      setGoogleAuthPending(true);
      await f.auth.signInWithRedirect(provider);
      return null;
    }

    try {
      var result = await f.auth.signInWithPopup(provider);
      if (!result || !result.user) throw new Error("Google sign-in was cancelled.");
      return await finishGoogleSignIn(result.user);
    } catch (err) {
      var code = err && err.code ? err.code : "";
      if (code === "auth/popup-closed-by-user") {
        throw new Error(mapFirebaseError(err));
      }
      if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
        setGoogleAuthPending(true);
        await f.auth.signInWithRedirect(provider);
        return null;
      }
      throw new Error(mapFirebaseError(err));
    }
  }

  async function bootstrap() {
    if (!firebaseReady()) {
      cachedUser = null;
      setActiveScope(null);
      hydrateEmailInbox(null);
      return { user: null };
    }
    clearStaleOAuthPending();
    var expectingGoogleReturn = hasAuthCallbackParams() || isGoogleAuthPending();
    try {
      var redirectOutcome = await completeGoogleRedirect();
      if (redirectOutcome && redirectOutcome.profile) {
        return {
          user: redirectOutcome.profile,
          fromGoogle: true,
          gmailConnected: redirectOutcome.type === "gmail",
        };
      }
    } catch (err) {
      clearGoogleAuthPending();
      return { user: null, error: err.message };
    }
    if (fb().auth.currentUser) {
      try {
        var sessionProfile = await hydrateFromFirebaseSession();
        if (sessionProfile) {
          return {
            user: sessionProfile,
            fromGoogle: expectingGoogleReturn && fb().auth.currentUser.providerData
              && fb().auth.currentUser.providerData.some(function (p) {
                return p && p.providerId === "google.com";
              }),
          };
        }
      } catch (err) {
        console.error("session hydrate:", err);
      }
    }
    var authWait = hasAuthCallbackParams() ? (isMobileAuth() ? 8000 : 6000) : 3000;
    var user = await waitForAuthUser(authWait);
    if (!user) {
      clearGoogleAuthPending();
      cachedUser = null;
      setActiveScope(null);
      return { user: null };
    }
    try {
      var profile = await syncUserFromFirestore(user);
      return {
        user: profile,
        fromGoogle: expectingGoogleReturn && user.providerData && user.providerData.some(function (p) {
          return p && p.providerId === "google.com";
        }),
      };
    } catch (err) {
      console.error("bootstrap:", err);
      var fallback = profileFromFirebaseUser(user);
      hydrate(fallback, [], null);
      return { user: fallback, error: mapFirebaseError(err) };
    }
  }

  async function signup(profile, password) {
    if (!firebaseReady()) throw new Error("Firebase is not configured. Copy firebase-config.example.js to firebase-config.js.");
    var f = fb();
    var email = (profile.email || "").trim().toLowerCase();
    try {
      var cred = await f.auth.createUserWithEmailAndPassword(email, password);
      var doc = profileToDoc(Object.assign({}, profile, { email: email }));
      await f.db.collection("users").doc(cred.user.uid).set(doc);
      var user = profileFromDoc(doc, cred.user.uid);
      setActiveScope(user);
      await migrateGuestLettersToCloud(cred.user.uid);
      var data = await loadUserData(cred.user.uid);
      hydrate(user, data.letters, data.health);
      return user;
    } catch (err) {
      throw new Error(mapFirebaseError(err));
    }
  }

  async function login(email, password) {
    if (!firebaseReady()) throw new Error("Firebase is not configured.");
    var f = fb();
    try {
      var cred = await f.auth.signInWithEmailAndPassword(email.trim().toLowerCase(), password);
      await ensureUserProfile(cred.user);
      setActiveScope({ id: cred.user.uid });
      await migrateGuestLettersToCloud(cred.user.uid);
      var data = await loadUserData(cred.user.uid);
      if (!data.profile) throw new Error("Account profile not found. Please sign up again.");
      hydrate(data.profile, data.letters, data.health);
      return data.profile;
    } catch (err) {
      if (err.message && err.message.indexOf("profile not found") >= 0) throw err;
      throw new Error(mapFirebaseError(err));
    }
  }

  async function logout() {
    var prevScope = window.MedifiUserScope ? window.MedifiUserScope.getScope() : null;
    if (firebaseReady()) {
      try {
        await fb().auth.signOut();
      } catch (_) { /* ignore */ }
    }
    cachedUser = null;
    cachedEmailInbox = null;
    if (window.MedifiUserScope && prevScope && prevScope !== window.MedifiUserScope.GUEST) {
      window.MedifiUserScope.clearScope(prevScope);
    }
    if (window.MedifiUserScope) {
      window.MedifiUserScope.setScope(window.MedifiUserScope.GUEST);
    }
    if (window.MedifiEmailSettings) window.MedifiEmailSettings.clearLocal();
    if (window.MedifiLetterStore) window.MedifiLetterStore.hydrateFromServer([]);
    if (window.MedifiHealth && window.MedifiHealth.clearLocal) window.MedifiHealth.clearLocal();
    if (window.MedifiPatient) window.MedifiPatient.clearLocal();
  }

  function getEmailInbox() {
    if (cachedEmailInbox) return cachedEmailInbox;
    if (window.MedifiEmailSettings) return window.MedifiEmailSettings.loadLocal();
    return null;
  }

  function getEmailUserId() {
    var f = fb();
    if (f && f.auth.currentUser) return f.auth.currentUser.uid;
    var inbox = getEmailInbox();
    return inbox && inbox.email ? inbox.email : "local";
  }

  async function saveEmailInbox(config) {
    var entry = Object.assign({}, config, {
      connectedAt: config.connectedAt || new Date().toISOString(),
      subjectFilter: (config.subjectFilter || "NHSINFORMATION").trim(),
    });
    cachedEmailInbox = entry;
    if (window.MedifiEmailSettings) window.MedifiEmailSettings.saveLocal(entry);
    if (!firebaseReady() || !getToken()) return entry;
    var f = fb();
    var uid = f.auth.currentUser.uid;
    await f.db.collection("users").doc(uid).set({ emailInbox: entry }, { merge: true });
    return entry;
  }

  async function updateEmailInboxLastSync(lastSync) {
    var inbox = getEmailInbox();
    if (!inbox) return;
    return saveEmailInbox(Object.assign({}, inbox, { lastSync: lastSync }));
  }

  async function disconnectEmailInbox() {
    cachedEmailInbox = null;
    if (window.MedifiEmailSettings) window.MedifiEmailSettings.clearLocal();
    if (!firebaseReady() || !getToken()) return;
    var f = fb();
    var uid = f.auth.currentUser.uid;
    await f.db.collection("users").doc(uid).set({
      emailInbox: firebase.firestore.FieldValue.delete(),
    }, { merge: true });
  }

  async function updateProfile(profile) {
    if (!firebaseReady()) throw new Error("Firebase is not configured.");
    var f = fb();
    var uid = f.auth.currentUser && f.auth.currentUser.uid;
    if (!uid) throw new Error("Please sign in again.");
    var doc = profileToDoc(profile);
    await f.db.collection("users").doc(uid).set(doc, { merge: true });
    var user = profileFromDoc(doc, uid);
    cachedUser = user;
    if (window.MedifiPatient) window.MedifiPatient.hydrateLocal(user);
    return user;
  }

  async function saveLetter(letter) {
    if (!firebaseReady() || !getToken()) return false;
    var f = fb();
    var uid = f.auth.currentUser.uid;
    setActiveScope({ id: uid });
    var id = letter.id || f.db.collection("_").doc().id;
    var entry = Object.assign({}, letter, { id: id, savedAt: Date.now() });
    await f.db.collection("users").doc(uid).collection("letters").doc(id).set(entry);
    if (window.MedifiLetterStore) window.MedifiLetterStore.upsertLocal(entry);
    return true;
  }

  async function saveHealth(health) {
    if (!firebaseReady() || !getToken()) return false;
    var f = fb();
    var uid = f.auth.currentUser.uid;
    await f.db.collection("users").doc(uid).set({ health: health }, { merge: true });
    return true;
  }

  if (!firebaseReady()) {
    setActiveScope(null);
    if (window.MedifiEmailSettings) {
      hydrateEmailInbox(window.MedifiEmailSettings.loadLocal());
    }
  }

  window.MedifiAuth = {
    firebaseReady: firebaseReady,
    getToken: getToken,
    isLoggedIn: isLoggedIn,
    getUser: getUser,
    bootstrap: bootstrap,
    hydrateFromFirebaseSession: hydrateFromFirebaseSession,
    signup: signup,
    login: login,
    loginWithGoogle: loginWithGoogle,
    connectGmailInbox: connectGmailInbox,
    logout: logout,
    updateProfile: updateProfile,
    saveLetter: saveLetter,
    saveHealth: saveHealth,
    getEmailInbox: getEmailInbox,
    getEmailUserId: getEmailUserId,
    saveEmailInbox: saveEmailInbox,
    updateEmailInboxLastSync: updateEmailInboxLastSync,
    disconnectEmailInbox: disconnectEmailInbox,
  };
})();
