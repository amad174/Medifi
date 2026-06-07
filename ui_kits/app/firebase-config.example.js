/* Firebase web config — copy to firebase-config.js and fill in from
 * Firebase Console → Project settings → Your apps → Web app.
 * Enable Email/Password and Google under Authentication → Sign-in method.
 * For Google redirect, add your app URL (e.g. http://localhost:3001) under
 * Authentication → Settings → Authorized domains.
 * Create a Firestore database (test mode is fine for hackathons). */

window.MEDIFI_FIREBASE = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
