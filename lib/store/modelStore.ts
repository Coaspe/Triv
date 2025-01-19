"use client";

import { create } from "zustand";
import { ModelDetails, SignedImageUrls } from "@/app/types";
import { persist } from "zustand/middleware";
import CryptoJS from "crypto-js";
import { generateEncryptionKey } from "../encrypt";

interface ModelStore {
  // States
  models: string;
  signedUrls: string;

  // Actions
  setModel: (model: ModelDetails) => void;
  setModels: (models: ModelDetails[]) => void;
  setSignedUrl: (imageKey: string, url: string, expiresIn: number) => void;
  setSignedUrls: (signedUrls: SignedImageUrls | undefined) => void;
  getSignedUrl: (imageKey: string) => string | undefined;
  getSignedUrls: (modelId: string) => SignedImageUrls | undefined;
  getModel: (modelId: string) => ModelDetails | undefined;
  getModels: () => { [key: string]: ModelDetails } | undefined;
  clearExpiredUrls: () => void;
}

export const useModelStore = create(
  persist<ModelStore>(
    (set, get) => ({
      models: "",
      signedUrls: "",

      setModel: (model: ModelDetails) => {
        const models = get().models;
        let decryptedModel: { [key: string]: ModelDetails } = {};
        if (models) {
          decryptedModel = JSON.parse(CryptoJS.AES.decrypt(models, generateEncryptionKey()!).toString(CryptoJS.enc.Utf8)) as { [key: string]: ModelDetails };
        }
        decryptedModel[model.id] = model;
        set((_) => ({
          models: CryptoJS.AES.encrypt(JSON.stringify(decryptedModel), generateEncryptionKey()!).toString(),
        }));
      },

      setModels: (models: ModelDetails[]) => {
        const prevModelsString = get().models;
        const prevSignedUrlsString = get().signedUrls;
        const prevModels = prevModelsString ? JSON.parse(CryptoJS.AES.decrypt(prevModelsString, generateEncryptionKey()!).toString(CryptoJS.enc.Utf8)) : {};
        const prevSignedUrls = prevSignedUrlsString ? JSON.parse(CryptoJS.AES.decrypt(prevSignedUrlsString, generateEncryptionKey()!).toString(CryptoJS.enc.Utf8)) : {};

        for (const model of models) {
          if (!prevModels[model.id]) {
            prevModels[model.id] = model;
            prevSignedUrls[model.id] = model.signedImageUrls;
            continue;
          }
          if (!prevModels[model.id].signedImageUrls) {
            prevModels[model.id].signedImageUrls = {};
          }
          if (model.images && model.images.length > 0 && model.signedImageUrls && model.signedImageUrls[model.images[0]]) {
            prevModels[model.id].signedImageUrls[model.images[0]] = model.signedImageUrls[model.images[0]];
          }
          if (model.updatedAt && prevModels[model.id].updatedAt && model.updatedAt > prevModels[model.id].updatedAt) {
            // signedImageUrls 빼고 다 업데이트
            prevModels[model.id] = { ...model, signedImageUrls: prevModels[model.id].signedImageUrls };
          }
          prevSignedUrls[model.id] = prevModels[model.id].signedImageUrls;
        }

        set((_) => ({
          models: CryptoJS.AES.encrypt(JSON.stringify(prevModels), generateEncryptionKey()!).toString(),
          signedUrls: CryptoJS.AES.encrypt(JSON.stringify(prevSignedUrls), generateEncryptionKey()!).toString(),
        }));
      },

      setSignedUrl: (imageKey: string, url: string, expiresIn: number) => {
        const signedUrls = get().signedUrls;
        let decryptedSignedUrls: SignedImageUrls = {};
        if (signedUrls) {
          decryptedSignedUrls = JSON.parse(CryptoJS.AES.decrypt(signedUrls, generateEncryptionKey()!).toString(CryptoJS.enc.Utf8)) as SignedImageUrls;
        }
        decryptedSignedUrls[imageKey] = {
          url,
          expires: Date.now() + expiresIn * 1000, // expiresIn은 초 단위
        };

        set((_) => ({
          signedUrls: CryptoJS.AES.encrypt(JSON.stringify(decryptedSignedUrls), generateEncryptionKey()!).toString(),
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
      getSignedUrls: (modelId: string) => {
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
