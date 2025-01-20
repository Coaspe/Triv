/** @format */

"use client";

import { create } from "zustand";
import { ModelDetail, ModelDetails, SignedImageUrls } from "@/app/types";
import { persist } from "zustand/middleware";
import CryptoJS from "crypto-js";
import { generateEncryptionKey } from "@/lib/encrypt";

interface ModelStore {
  // States
  models: string;
  signedUrls: string;

  // Actions
  setModel: (model: ModelDetail) => void;
  setModels: (models: ModelDetail[]) => void;
  setSignedUrls: (signedUrls: SignedImageUrls | undefined) => void;
  getSignedUrls: () => SignedImageUrls | undefined;
  getSignedUrl: (imageKey: string) => string | undefined;
  getSignedUrlsOfSpecificModel: (modelId: string) => SignedImageUrls | undefined;
  getModel: (modelId: string) => ModelDetail | undefined;
  getModels: () => ModelDetails | undefined;
  clearExpiredUrls: () => void;
}

export const useModelStore = create(
  persist<ModelStore>(
    (set, get) => ({
      models: "",
      signedUrls: "",

      setModel: (model: ModelDetail) => {
        const models = get().models;
        let decryptedModel: ModelDetails = {};
        if (models) {
          decryptedModel = JSON.parse(CryptoJS.AES.decrypt(models, generateEncryptionKey()!).toString(CryptoJS.enc.Utf8)) as ModelDetails;
        }
        decryptedModel[model.id] = model;

        const signedUrls = get().signedUrls;
        let decryptedSignedUrls: SignedImageUrls = {};
        if (signedUrls) {
          decryptedSignedUrls = JSON.parse(CryptoJS.AES.decrypt(signedUrls, generateEncryptionKey()!).toString(CryptoJS.enc.Utf8)) as SignedImageUrls;
        }
        if (model.signedImageUrls) {
          Object.keys(model.signedImageUrls).forEach((key) => {
            if (model.signedImageUrls && (!decryptedSignedUrls[key] || decryptedSignedUrls[key].expires < model.signedImageUrls[key].expires)) {
              decryptedSignedUrls[key] = model.signedImageUrls[key];
            }
          });
        }
        set((_) => ({
          models: CryptoJS.AES.encrypt(JSON.stringify(decryptedModel), generateEncryptionKey()!).toString(),
          signedUrls: CryptoJS.AES.encrypt(JSON.stringify(decryptedSignedUrls), generateEncryptionKey()!).toString(),
        }));
      },

      setModels: (models: ModelDetail[]) => {
        const newModels: ModelDetails = {};
        const signedUrls: SignedImageUrls = {};
        models.forEach((model) => {
          newModels[model.id] = model;
          if (model.signedImageUrls) {
            Object.keys(model.signedImageUrls).forEach((key) => {
              if (model.signedImageUrls && (!signedUrls[key] || signedUrls[key].expires < model.signedImageUrls[key].expires)) {
                signedUrls[key] = model.signedImageUrls[key];
              }
            });
          }
        });

        set((_) => ({
          models: CryptoJS.AES.encrypt(JSON.stringify(newModels), generateEncryptionKey()!).toString(),
          signedUrls: CryptoJS.AES.encrypt(JSON.stringify(signedUrls), generateEncryptionKey()!).toString(),
        }));
      },

      setSignedUrls: (signedUrls: SignedImageUrls | undefined) => {
        const urls = get().signedUrls;

        if (!signedUrls) return;

        let decryptedSignedUrls: SignedImageUrls = {};

        if (urls) {
          decryptedSignedUrls = JSON.parse(CryptoJS.AES.decrypt(urls, generateEncryptionKey()!).toString(CryptoJS.enc.Utf8)) as SignedImageUrls;
        }

        const newSignedUrls = Object.fromEntries(
          Object.entries(signedUrls).map(([imageKey, urlObj]) => [
            imageKey,
            {
              url: urlObj.url,
              expires: urlObj.expires,
            },
          ])
        );

        set((_) => ({
          signedUrls: CryptoJS.AES.encrypt(JSON.stringify(newSignedUrls), generateEncryptionKey()!).toString(),
        }));
      },
      getModels: () => {
        const models = get().models;
        if (!models) return undefined;
        const decryptedModels = JSON.parse(CryptoJS.AES.decrypt(models, generateEncryptionKey()!).toString(CryptoJS.enc.Utf8));
        if (!decryptedModels) return undefined;
        return decryptedModels;
      },
      getModel: (modelId: string) => {
        const models = get().models;
        if (!models) return undefined;
        const decryptedModels = JSON.parse(CryptoJS.AES.decrypt(models, generateEncryptionKey()!).toString(CryptoJS.enc.Utf8));
        if (!decryptedModels) return undefined;
        return decryptedModels[modelId];
      },
      getSignedUrls: () => {
        const signedUrls = get().signedUrls;
        if (!signedUrls) return undefined;
        const decryptedSignedUrls = JSON.parse(CryptoJS.AES.decrypt(signedUrls, generateEncryptionKey()!).toString(CryptoJS.enc.Utf8));
        if (!decryptedSignedUrls) return undefined;
        return decryptedSignedUrls;
      },
      getSignedUrlsOfSpecificModel: (modelId: string) => {
        const models = get().models;
        if (!models) return undefined;
        const decryptedModels = JSON.parse(CryptoJS.AES.decrypt(models, generateEncryptionKey()!).toString(CryptoJS.enc.Utf8));
        if (!decryptedModels || !decryptedModels[modelId] || !decryptedModels[modelId].signedImageUrls) return undefined;
        return decryptedModels[modelId].signedImageUrls;
      },
      getSignedUrl: (imageKey: string) => {
        const signedUrls = get().signedUrls;
        if (!signedUrls) return undefined;
        const decryptedSignedUrls = JSON.parse(CryptoJS.AES.decrypt(signedUrls, generateEncryptionKey()!).toString(CryptoJS.enc.Utf8));
        if (!decryptedSignedUrls) return undefined;

        const signedUrl = decryptedSignedUrls[imageKey];
        if (!signedUrl) return undefined;

        if (Date.now() >= signedUrl.expires) {
          return undefined;
        }

        return signedUrl.url;
      },

      clearExpiredUrls: () => {
        const signedUrls = get().signedUrls;
        if (!signedUrls) return;
        const decryptedSignedUrls = JSON.parse(CryptoJS.AES.decrypt(signedUrls, generateEncryptionKey()!).toString(CryptoJS.enc.Utf8)) as SignedImageUrls;
        if (!decryptedSignedUrls) return;

        const newSignedUrls = Object.fromEntries(
          Object.entries(decryptedSignedUrls).filter(
            ([_, value]) => Date.now() < (typeof value === "string" ? JSON.parse(CryptoJS.AES.decrypt(value, generateEncryptionKey()!).toString(CryptoJS.enc.Utf8)).expires : value.expires)
          )
        );

        const encryptedSignedUrls = CryptoJS.AES.encrypt(JSON.stringify(newSignedUrls), generateEncryptionKey()!).toString();
        set((_) => ({
          signedUrls: encryptedSignedUrls,
        }));
      },
    }),
    { name: "modelStore" }
  )
);
