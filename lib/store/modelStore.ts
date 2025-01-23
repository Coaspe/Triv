/** @format */

"use client";

import { create } from "zustand";
import { ModelDetail, ModelDetails, SignedImageUrls } from "@/app/types";
import { persist } from "zustand/middleware";
import { encrypt, decrypt } from "@/lib/encrypt";

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
  getModel: (modelId: string) => ModelDetail | undefined;
  getModels: () => ModelDetails | undefined;
  deleteSignedUrlsFromModels: (models: ModelDetail[]) => void;
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
          decryptedModel = JSON.parse(decrypt(models)) as ModelDetails;
        }
        decryptedModel[model.id] = model;
        set((_) => ({
          models: encrypt(JSON.stringify(decryptedModel)),
        }));
      },
      setModels: (models: ModelDetail[]) => {
        const newModels: ModelDetails = {};
        models.forEach((model) => {
          newModels[model.id] = model;
        });

        set((_) => ({
          models: encrypt(JSON.stringify(newModels)),
        }));
      },
      deleteSignedUrlsFromModels: (models: ModelDetail[]) => {
        const signedUrls = get().signedUrls;
        if (!signedUrls) return;
        const decryptedSignedUrls = JSON.parse(decrypt(signedUrls)) as SignedImageUrls;
        if (!decryptedSignedUrls) return;

        const modelIdsSet = new Set(models.map((model) => model.id));

        Object.keys(decryptedSignedUrls).forEach((key) => {
          if (modelIdsSet.has(key.split("/")[0])) {
            delete decryptedSignedUrls[key];
          }
        });

        set((_) => ({
          signedUrls: encrypt(JSON.stringify(decryptedSignedUrls)),
        }));
      },
      setSignedUrls: (signedUrls: SignedImageUrls | undefined) => {
        const urls = get().signedUrls;

        if (!signedUrls) return;

        let decryptedSignedUrls: SignedImageUrls = {};

        if (urls) {
          decryptedSignedUrls = JSON.parse(decrypt(urls)) as SignedImageUrls;
        }

        Object.keys(signedUrls).forEach((key) => {
          if (signedUrls[key].expires > decryptedSignedUrls[key]?.expires || !decryptedSignedUrls[key]) {
            decryptedSignedUrls[key] = signedUrls[key];
          }
        });

        set((_) => ({
          signedUrls: encrypt(JSON.stringify(decryptedSignedUrls)),
        }));
      },
      getModels: () => {
        const models = get().models;
        if (!models) return undefined;
        const decryptedModels = JSON.parse(decrypt(models));
        if (!decryptedModels) return undefined;
        return decryptedModels;
      },
      getModel: (modelId: string) => {
        const models = get().models;
        if (!models) return undefined;
        const decryptedModels = JSON.parse(decrypt(models));
        if (!decryptedModels) return undefined;
        return decryptedModels[modelId];
      },
      getSignedUrls: () => {
        const signedUrls = get().signedUrls;
        if (!signedUrls) return undefined;
        const decryptedSignedUrls = JSON.parse(decrypt(signedUrls));
        if (!decryptedSignedUrls) return undefined;
        Object.keys(decryptedSignedUrls).forEach((key) => {
          if (Date.now() >= decryptedSignedUrls[key].expires) {
            delete decryptedSignedUrls[key];
          }
        });
        return decryptedSignedUrls;
      },
      getSignedUrl: (imageKey: string) => {
        const signedUrls = get().signedUrls;
        if (!signedUrls) return undefined;
        const decryptedSignedUrls = JSON.parse(decrypt(signedUrls));
        if (!decryptedSignedUrls) return undefined;

        const signedUrl = decryptedSignedUrls[imageKey];
        if (!signedUrl) return undefined;

        if (Date.now() >= signedUrl.expires) {
          return undefined;
        }

        return signedUrl.url;
      },
    }),
    { name: "modelStore" }
  )
);
