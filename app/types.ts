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
  singedImageUrls?: { [key: string]: string };
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  prevModel?: string;
  nextModel?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
export type Category = "women" | "men" | "international";
export type Work = {
  title: string;
  youtubeId: string;
};
