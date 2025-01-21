/** @format */

export type ModelDetail = {
  id: string;
  name: string;
  displayName: string;
  height?: string;
  weight?: string;
  size?: string;
  shows?: string[];
  category?: Category;
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
export type Category = "women" | "men" | "international";
export interface Work {
  id: string;
  title: string;
  prevWork?: string | null;
  nextWork?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SignedImageUrl = { url: string; expires: number };
export type SignedImageUrls = { [key: string]: SignedImageUrl };
