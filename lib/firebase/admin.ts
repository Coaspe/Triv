/** @format */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

if (!getApps().length) {
  const firebaseConfig = {
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replaceAll(/\\n/g, "\n"),
    }),
    ...JSON.parse(process.env.FIREBASE_CONFIG || ""),
  };

  initializeApp(firebaseConfig);
}

export const db = getFirestore();
export const storage = getStorage();
