"use client";

import { Category, ModelDetail, ModelDetails, SignedImageUrls } from "@/app/types";
import { db, storage } from "./firebase/client";
import { findModelOrder } from "@/app/utils";
import { collection, query, where, getDocs, getDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";

export async function setAdminSession(password: string) {
  try {
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Authentication failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to set admin session:", error);
    throw error;
  }
}

export async function verifyAdminSession() {
  try {
    const response = await fetch("/api/auth", {
      method: "GET",
      credentials: "include",
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to verify admin session:", error);
    return false;
  }
}

export async function verifyHandler(setShowAuthModal: (show: boolean) => void, setShowModal: (show: boolean) => void) {
  const isAuthenticated = await verifyAdminSession();
  if (!isAuthenticated) {
    setShowAuthModal(true);
    return false;
  }
  setShowModal(true);
  return true;
}

export const getModelsInfo = async (category: Category, prevModels?: ModelDetails, prevSignedImageUrls?: SignedImageUrls) => {
  const modelsRef = collection(db, "models");
  const q = query(modelsRef, where("category", "==", category));
  const querySnapshot = await getDocs(q);

  const models = (
    await Promise.all(
      querySnapshot.docs.map(async (document) => {
        const model = document.data() as ModelDetail;
        const updated = prevModels?.[model.id]?.updatedAt !== model.updatedAt;

        model.signedImageUrls = {};
        if (model.images && model.images.length > 0) {
          const expires = 8640000000000000;
          if (
            !updated &&
            prevSignedImageUrls &&
            prevSignedImageUrls[model.images[0]] &&
            prevSignedImageUrls[model.images[0]].expires > expires &&
            prevSignedImageUrls[model.images[0]].expires < Date.now()
          ) {
            model.signedImageUrls[model.images[0]] = prevSignedImageUrls[model.images[0]];
            return model;
          }
          const name = model.images[0].replace(/[/.]/g, "");
          const signedImageUrlsRef = doc(db, "signedImageUrls", name);
          const snapshot = await getDoc(signedImageUrlsRef);
          if (snapshot.exists()) {
            model.signedImageUrls[model.images[0]] = { url: snapshot.data()?.url, expires: snapshot.data()?.expires };
            return model;
          }
          const imageRef = ref(storage, model.images[0]);
          const url = await getDownloadURL(imageRef);
          console.log(url, "url");
          if (!snapshot.exists()) {
            await setDoc(signedImageUrlsRef, { url, expires });
          } else {
            await updateDoc(signedImageUrlsRef, { url, expires });
          }
          model.signedImageUrls[model.images[0]] = { url, expires };

          return model;
        }
      })
    )
  ).filter((model): model is ModelDetail => model !== undefined);
  return findModelOrder(models);
};
