/** @format */

import { ModelCategory } from "@/app/enums";

export type ModelDetail = {
  id: string;
  name: string;
  displayName: string;
  height?: string;
  weight?: string;
  size?: string;
  shows?: string[];
  category?: ModelCategory;
  modelingInfo?: string[];
  images?: string[];
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  prevModel?: string | null;
  nextModel?: string | null;
  createdAt?: string;
  updatedAt?: string;
};
export type ModelDetails = { [key: string]: ModelDetail };
export interface Work {
  id: string;
  youtubeId: string;
  title: string;
  prevWork?: string | null;
  nextWork?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SignedImageUrl = { url: string; expires: number };
export type SignedImageUrls = { [key: string]: SignedImageUrl };
