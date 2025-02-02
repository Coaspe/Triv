"use client";

import { ModelDetail, SignedImageUrls } from "@/app/types";
import { db, storage } from "./firebase/client";
import { findModelOrder } from "@/app/utils";
import { collection, query, writeBatch, where, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getDownloadURL, ref, deleteObject, uploadBytes, UploadMetadata } from "firebase/storage";
import { ModelCategory } from "@/app/enums";
import { MAX_EXPIRES } from "@/app/constants";

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

export const getModelsInfo = async (category: ModelCategory, prevSignedImageUrls?: SignedImageUrls) => {
  const modelsRef = collection(db, "models");
  const q = query(modelsRef, where("category", "==", category));
  const querySnapshot = await getDocs(q);
  const signedUrls: SignedImageUrls = {};
  const now = Date.now();

  const models = (
    await Promise.all(
      querySnapshot.docs.map(async (document) => {
        const model = document.data() as ModelDetail;

        if (prevSignedImageUrls) {
          Object.keys(prevSignedImageUrls).forEach((key) => {
            if (prevSignedImageUrls[key].expires > now) {
              signedUrls[key] = prevSignedImageUrls[key];
            }
          });
        }

        if (model.images && model.images.length > 0) {
          // Current signed image url exists
          if (signedUrls[model.images[0]]) {
            return model;
          }

          // Cached signed image url exists in db
          const name = model.images[0];
          const signedImageUrlsRef = doc(db, "signedImageUrls", name);
          const snapshot = await getDoc(signedImageUrlsRef);
          if (snapshot.exists() && snapshot.data()?.expires > Date.now()) {
            signedUrls[model.images[0]] = { url: snapshot.data()?.url, expires: snapshot.data()?.expires };
            return model;
          }

          // Generate new signed image url
          const imageRef = ref(storage, `${model.id}/${model.images[0]}`);
          const url = await getDownloadURL(imageRef);
          if (!snapshot.exists()) {
            await setDoc(signedImageUrlsRef, { url, expires: MAX_EXPIRES });
          } else {
            await updateDoc(signedImageUrlsRef, { url, expires: MAX_EXPIRES });
          }
          signedUrls[model.images[0]] = { url, expires: MAX_EXPIRES };
        }
        return model;
      })
    )
  ).filter((model): model is ModelDetail => model !== undefined);
  return { models: findModelOrder(models), signedUrls };
};

export const deleteImages = async (imageNames: string[], modelId: string) => {
  try {
    const deletePromises = imageNames.map(async (imageName) => {
      try {
        const imageRef = ref(storage, `${modelId}/${imageName}`);
        await deleteObject(imageRef);
        const signedImageUrlsRef = doc(db, "signedImageUrls", imageName);
        if (signedImageUrlsRef) {
          await deleteDoc(signedImageUrlsRef);
        }
      } catch (_) {}
    });
    await Promise.all(deletePromises);
  } catch (_) {}
};
/**
 * Client-side function to upload images to storage
 * @param  modelId - Model ID
 * @param  files - FileList of images
 * @returns Signed urls and uploaded images' file names (modelId/timestamp-index.png format)
 */
export async function uploadImagesClientSide(files: FileList, modelId: string) {
  try {
    const uploadPromises = new Set(
      Array.from(files).map(async (file, _) => {
        try {
          const imageRef = ref(storage, `${modelId}/${file.name}`); // Storage Reference client SDK
          const buffer = await file.arrayBuffer();
          const metadata: UploadMetadata = {
            // UploadMetadata 객체 생성
            contentType: file.type, // File 객체에서 MIME 타입 추출하여 설정
          };
          await uploadBytes(imageRef, new Uint8Array(buffer), metadata); // uploadBytes client SDK, using Uint8Array and metadata
          return file.name;
        } catch (error) {
          console.error("Error uploading image:", error);
          return null;
        }
      })
    );

    const uploadedImagesNames = await Promise.all(uploadPromises);

    const batch = writeBatch(db); // Firestore Batch client SDK

    const signedUrls: SignedImageUrls = {};

    const uploadedImages = await Promise.all(
      uploadedImagesNames.map(async (image) => {
        try {
          if (!image) return false;
          const imageRef = ref(storage, `${modelId}/${image}`); // Storage Reference client SDK
          const downloadURL = await getDownloadURL(imageRef); // Get Download URL client SDK

          batch.set(doc(collection(db, "signedImageUrls"), image), { url: downloadURL, expires: MAX_EXPIRES }); // Firestore batch client SDK
          signedUrls[image] = { url: downloadURL, expires: MAX_EXPIRES }; // Use downloadURL as signed URL for client-side (for simplicity)
          return image;
        } catch (error) {
          console.log(error);
          return false;
        }
      })
    );

    await batch.commit(); // Firestore batch commit client SDK
    return { signedUrls, uploadedImages };
  } catch (error) {
    console.error("Client-side upload error:", error);
    return { signedUrls: {}, uploadedImages: [] };
  }
}
