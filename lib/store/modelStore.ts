"use client";

import { create } from "zustand";
import { ModelDetails, SignedImageUrls } from "@/app/types";
import { persist } from "zustand/middleware";
import CryptoJS from "crypto-js";
import { generateEncryptionKey } from "../encrypt";

interface SignedUrl {
  url: string;
  expires: number; // Unix timestamp
}

interface ModelStore {
  models: { [key: string]: ModelDetails | string }; // modelId를 key로 사용
  signedUrls: { [key: string]: SignedUrl | string }; // imageKey를 key로 사용

  // Actions
  setModel: (model: ModelDetails) => void;
  setSignedUrl: (imageKey: string, url: string, expiresIn: number) => void;
  setSignedUrls: (signedUrls: SignedImageUrls | undefined) => void;
  getSignedUrl: (imageKey: string) => string | undefined;
  getSignedUrls: (modelId: string) => SignedImageUrls | undefined;
  getModel: (modelId: string) => ModelDetails | undefined;
  clearExpiredUrls: () => void;
}

export const useModelStore = create(
  persist<ModelStore>(
    (set, get) => ({
      models: {},
      signedUrls: {},

      setModel: (model: ModelDetails) => {
        const encryptedModel = CryptoJS.AES.encrypt(JSON.stringify(model), generateEncryptionKey()!).toString();
        set((state) => ({
          models: { ...state.models, [model.id]: encryptedModel },
        }));
      },

      setSignedUrl: (imageKey: string, url: string, expiresIn: number) => {
        const encryptedUrl = CryptoJS.AES.encrypt(url, generateEncryptionKey()!).toString();
        set((state) => ({
          signedUrls: {
            ...state.signedUrls,
            [imageKey]: {
              url: encryptedUrl,
              expires: Date.now() + expiresIn * 1000, // expiresIn은 초 단위
            },
          },
        }));
      },
      setSignedUrls: (signedUrls: SignedImageUrls | undefined) => {
        if (!signedUrls) return;
        const encryptedSignedUrls = Object.fromEntries(
          Object.entries(signedUrls).map(([imageKey, urlObj]) => [
            imageKey,
            {
              url: CryptoJS.AES.encrypt(urlObj.url, generateEncryptionKey()!).toString(),
              expires: urlObj.expires,
            },
          ])
        );
        set((state) => ({
          signedUrls: { ...state.signedUrls, ...encryptedSignedUrls },
        }));
      },
      getModels: () => {
        const models = get().models;
        const decryptedModels = Object.fromEntries(
          Object.entries(models).map(([modelId, encryptedModel]) => [
            modelId,
            typeof encryptedModel === "string" ? JSON.parse(CryptoJS.AES.decrypt(encryptedModel, generateEncryptionKey()!).toString(CryptoJS.enc.Utf8)) : encryptedModel,
          ])
        );
        return decryptedModels;
      },
      getModel: (modelId: string) => {
        const model = get().models[modelId];
        if (typeof model === "string") {
          return JSON.parse(CryptoJS.AES.decrypt(model, generateEncryptionKey()!).toString(CryptoJS.enc.Utf8));
        }
        return model;
      },
      getSignedUrls: (modelId: string) => {
        const model = get().models[modelId];
        const decryptedModel: ModelDetails = typeof model === "string" ? JSON.parse(CryptoJS.AES.decrypt(model, generateEncryptionKey()!).toString(CryptoJS.enc.Utf8)) : model;
        if (!decryptedModel || !decryptedModel.images) return undefined;

        const urls: SignedImageUrls = {};
        decryptedModel.images.forEach((image) => {
          let signedUrl = get().signedUrls[image];
          if (typeof signedUrl === "string") {
            signedUrl = JSON.parse(CryptoJS.AES.decrypt(signedUrl, generateEncryptionKey()!).toString(CryptoJS.enc.Utf8));
          }
          if (typeof signedUrl === "object" && signedUrl.url && signedUrl.expires) {
            urls[image] = { url: signedUrl.url, expires: signedUrl.expires };
          }
        });
        return urls;
      },

      getSignedUrl: (imageKey: string) => {
        const signedUrl = get().signedUrls[imageKey];
        if (!signedUrl) return undefined;
        let decryptedUrl: SignedUrl;

        if (typeof signedUrl === "string") {
          decryptedUrl = JSON.parse(CryptoJS.AES.decrypt(signedUrl, generateEncryptionKey()!).toString(CryptoJS.enc.Utf8));
        } else {
          decryptedUrl = signedUrl;
        }
        // URL이 만료되었는지 확인
        if (Date.now() >= decryptedUrl.expires) {
          return undefined;
        }

        return decryptedUrl.url;
      },

      clearExpiredUrls: () =>
        set((state) => ({
          signedUrls: Object.fromEntries(
            Object.entries(state.signedUrls).filter(
              ([_, value]) => Date.now() < (typeof value === "string" ? JSON.parse(CryptoJS.AES.decrypt(value, generateEncryptionKey()!).toString(CryptoJS.enc.Utf8)).expires : value.expires)
            )
          ),
        })),
    }),
    { name: "modelStore" }
  )
);
