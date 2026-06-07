/* Firebase web config — copy to firebase-config.js and fill in from
 * Firebase Console → Project settings → Your apps → Web app.
 * Enable Email/Password and Google under Authentication → Sign-in method.
 * For Google sign-in, enable Google under Authentication → Sign-in method.
 * Add your app host (e.g. localhost) under Authentication → Settings → Authorised domains.
 * Desktop uses a popup; phones use a full-page redirect back to this app.
 * For “Connect with Google” inbox: in Google Cloud Console (same project as Firebase),
 * enable Gmail API and add scope https://mail.google.com/ to the OAuth consent screen.
 * Create a Firestore database (test mode is fine for hackathons). */

window.MEDIFI_FIREBASE = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
