import { create } from "zustand";
import { ModelDetails, SignedImageUrls } from "@/app/types";

interface SignedUrl {
  url: string;
  expires: number; // Unix timestamp
}

interface ModelStore {
  models: { [key: string]: ModelDetails }; // modelId를 key로 사용
  signedUrls: { [key: string]: SignedUrl }; // imageKey를 key로 사용

  // Actions
  setModel: (model: ModelDetails) => void;
  setSignedUrl: (imageKey: string, url: string, expiresIn: number) => void;
  setSignedUrls: (signedUrls: SignedImageUrls | undefined) => void;
  getSignedUrl: (imageKey: string) => string | undefined;
  getSignedUrls: (modelId: string) => SignedImageUrls | undefined;
  getModel: (modelId: string) => ModelDetails | undefined;
  clearExpiredUrls: () => void;
}

// 어차피 signedUrls가 models에 포함되어 있어서 굳이 따로 저장할 필요가 없음
export const useModelStore = create<ModelStore>((set, get) => ({
  models: {},
  signedUrls: {},

  setModel: (model: ModelDetails) =>
    set((state) => ({
      models: { ...state.models, [model.id]: model },
    })),

  setSignedUrl: (imageKey: string, url: string, expiresIn: number) =>
    set((state) => ({
      signedUrls: {
        ...state.signedUrls,
        [imageKey]: {
          url,
          expires: Date.now() + expiresIn * 1000, // expiresIn은 초 단위
        },
      },
    })),
  setSignedUrls: (signedUrls: SignedImageUrls | undefined) =>
    set((state) => ({
      signedUrls: { ...state.signedUrls, ...signedUrls },
    })),
  getModel: (modelId: string) => get().models[modelId] || undefined,
  getSignedUrls: (modelId: string) => {
    const model = get().models[modelId];
    if (!model || !model.images) return undefined;
    const urls: SignedImageUrls = {};
    model.images.forEach((image) => {
      const signedUrl = get().signedUrls[image];
      if (signedUrl) {
        urls[image] = { url: signedUrl.url, expires: signedUrl.expires };
      }
    });
    return urls;
  },

  getSignedUrl: (imageKey: string) => {
    const signedUrl = get().signedUrls[imageKey];
    if (!signedUrl) return undefined;

    // URL이 만료되었는지 확인
    if (Date.now() >= signedUrl.expires) {
      return undefined;
    }

    return signedUrl.url;
  },

  clearExpiredUrls: () =>
    set((state) => ({
      signedUrls: Object.fromEntries(Object.entries(state.signedUrls).filter(([_, value]) => Date.now() < value.expires)),
    })),
}));
