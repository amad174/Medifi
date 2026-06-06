/* Medifi auth — Firebase Auth + Firestore (persists across refresh). */

(function () {
  var cachedUser = null;

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

  function hydrate(user, letters, health) {
    cachedUser = user || null;
    if (letters && window.MedifiLetterStore) {
      window.MedifiLetterStore.hydrateFromServer(letters);
    }
    if (health && window.MedifiHealth && window.MedifiHealth.hydrateFromServer) {
      window.MedifiHealth.hydrateFromServer(health);
    }
    if (user && window.MedifiPatient) {
      window.MedifiPatient.hydrateLocal(user);
    }
  }

  async function loadUserData(uid) {
    var f = fb();
    var userSnap = await f.db.collection("users").doc(uid).get();
    var profile = userSnap.exists ? profileFromDoc(userSnap.data(), uid) : null;
    var health = userSnap.exists && userSnap.data().health ? userSnap.data().health : null;
    var lettersSnap = await f.db.collection("users").doc(uid).collection("letters")
      .orderBy("savedAt", "desc")
      .get();
    var letters = lettersSnap.docs.map(function (doc) { return doc.data(); });
    return { profile: profile, letters: letters, health: health };
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

  async function bootstrap() {
    if (!firebaseReady()) {
      cachedUser = null;
      return { user: null };
    }
    var user = await waitForAuthUser();
    if (!user) {
      cachedUser = null;
      return { user: null };
    }
    try {
      var data = await loadUserData(user.uid);
      if (!data.profile) {
        await fb().auth.signOut();
        cachedUser = null;
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
      hydrate(user, [], null);
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
    if (firebaseReady()) {
      try {
        await fb().auth.signOut();
      } catch (_) { /* ignore */ }
    }
    cachedUser = null;
    if (window.MedifiLetterStore) window.MedifiLetterStore.hydrateFromServer([]);
    if (window.MedifiPatient) window.MedifiPatient.clearLocal();
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

  window.MedifiAuth = {
    firebaseReady: firebaseReady,
    getToken: getToken,
    isLoggedIn: isLoggedIn,
    getUser: getUser,
    bootstrap: bootstrap,
    signup: signup,
    login: login,
    logout: logout,
    updateProfile: updateProfile,
    saveLetter: saveLetter,
    saveHealth: saveHealth,
  };
})();
