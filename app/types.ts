/** @format */

export type ModelDetails = {
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
  signedImageUrls?: { [key: string]: string };
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  prevModel?: string;
  nextModel?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
export type Category = "women" | "men" | "international";
export interface Work {
  id: string;
  title: string;
  prevWork?: string | null;
  nextWork?: string | null;
  createdAt: string;
  updatedAt: string;
}
