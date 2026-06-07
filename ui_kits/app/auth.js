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

  function waitForAuthUser() {
    var f = fb();
    return new Promise(function (resolve) {
      var unsub = f.auth.onAuthStateChanged(function (user) {
        unsub();
        resolve(user);
      });
    });
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

  async function completeGoogleRedirect() {
    if (!firebaseReady()) return null;
    var f = fb();
    try {
      var result = await f.auth.getRedirectResult();
      if (!result || !result.user) return null;
      await ensureUserProfile(result.user);
      setActiveScope({ id: result.user.uid });
      await migrateGuestLettersToCloud(result.user.uid);
      var data = await loadUserData(result.user.uid);
      if (!data.profile) return null;
      hydrate(data.profile, data.letters, data.health);
      return data.profile;
    } catch (err) {
      console.error("google redirect:", err);
      throw new Error(mapFirebaseError(err));
    }
  }

  async function loginWithGoogle() {
    if (!firebaseReady()) throw new Error("Firebase is not configured. Copy firebase-config.example.js to firebase-config.js.");
    var f = fb();
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await f.auth.signInWithRedirect(provider);
  }

  async function bootstrap() {
    if (!firebaseReady()) {
      cachedUser = null;
      setActiveScope(null);
      hydrateEmailInbox(null);
      return { user: null };
    }
    try {
      var fromGoogle = await completeGoogleRedirect();
      if (fromGoogle) {
        return { user: fromGoogle };
      }
    } catch (err) {
      return { user: null, error: err.message };
    }
    var user = await waitForAuthUser();
    if (!user) {
      cachedUser = null;
      setActiveScope(null);
      return { user: null };
    }
    try {
      await ensureUserProfile(user);
      setActiveScope({ id: user.uid });
      await migrateGuestLettersToCloud(user.uid);
      var data = await loadUserData(user.uid);
      if (!data.profile) {
        await fb().auth.signOut();
        cachedUser = null;
        setActiveScope(null);
        return { user: null };
      }
      hydrate(data.profile, data.letters, data.health);
      return { user: data.profile, letters: data.letters, health: data.health };
    } catch (err) {
      console.error("bootstrap:", err);
      cachedUser = null;
      return { user: null };
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
    signup: signup,
    login: login,
    loginWithGoogle: loginWithGoogle,
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
