import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

if (!getApps().length) {
  const firebaseConfig = {
    credential: cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || "")),
    ...JSON.parse(process.env.FIREBASE_CONFIG || ""),
  };

  initializeApp(firebaseConfig);
}

export const db = getFirestore();
export const storage = getStorage();
