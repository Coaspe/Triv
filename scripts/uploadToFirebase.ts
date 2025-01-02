/** @format */

import { db, storage } from "../lib/firebase/admin";
import * as constants from "../app/constants";
import * as fs from "fs";
import * as path from "path";

export async function uploadModelData() {
  try {
    // constants에서 모든 ModelDetails 객체 추출
    const models = Object.values(constants).filter((model) => "id" in model);

    for (const model of models) {
      console.log(`Processing model: ${model.id}`);

      // Firestore에 모델 데이터 업로드
      await db.collection("models").doc(model.id).set(model);
      console.log(`Uploaded model data for ${model.id} to Firestore`);

      // Storage에 이미지 업로드
      const modelFolderPath = path.join(process.cwd(), "public/images", model.id.toLowerCase());

      if (fs.existsSync(modelFolderPath)) {
        for (const imagePath of model.images || []) {
          const localImagePath = path.join(process.cwd(), "public/images", imagePath);

          if (fs.existsSync(localImagePath)) {
            const storageDestination = `${model.id}/${path.basename(imagePath)}`;

            await storage.bucket().upload(localImagePath, {
              destination: storageDestination,
              metadata: {
                contentType: "image/jpeg", // 또는 'image/png' 등 적절한 타입
              },
            });

            console.log(`Uploaded ${imagePath} to Storage as ${storageDestination}`);
          } else {
            console.warn(`Image not found: ${localImagePath}`);
          }
        }
      } else {
        console.warn(`Model folder not found: ${modelFolderPath}`);
      }
    }

    console.log("Upload completed successfully!");
  } catch (error) {
    console.error("Error during upload:", error);
  }
}
