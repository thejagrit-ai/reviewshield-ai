import admin from 'firebase-admin';

let firebaseApp: admin.app.App | null = null;

function loadServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

export function getFirestore() {
  if (firebaseApp) return admin.firestore();

  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) throw new Error('FIREBASE_SERVICE_ACCOUNT is not defined. Set the JSON service account in env.');

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });

  return admin.firestore();
}

export function getAuth() {
  if (!firebaseApp) {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) throw new Error('FIREBASE_SERVICE_ACCOUNT is not defined.');
    firebaseApp = admin.initializeApp({ credential: admin.credential.cert(serviceAccount as admin.ServiceAccount) });
  }
  return admin.auth();
}
