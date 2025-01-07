/** @format */

"use server";

import { findModelOrder } from "@/app/utils";
import { db, storage } from "./firebase/admin";
import { ModelDetails, Category } from "@/app/types";
import { nanoid } from "nanoid";

export async function getModelDetail(id: string) {
  try {
    const model = await db.collection("models").doc(id).get();
    const modelData = model.data() as ModelDetails;

    // Use listAll to get all images
    const images = (await storage.bucket().getFiles({ prefix: id }))[0];

    if (!modelData.signedImageUrls) {
      modelData.signedImageUrls = {};
    }

    // start with index 1 for images
    for (let i = 0; i < images.length; i++) {
      if (images[i] && modelData.images) {
        const image = images[i];
        const result = await image.getSignedUrl({ action: "read", expires: Date.now() + 1000 * 60 * 60 });
        modelData.signedImageUrls[image.name] = result[0];
      }
    }
    return modelData;
  } catch (error) {
    console.error("Error fetching model detail:", error);
    throw error;
  }
}

export async function updateModelOrder(category: Category, orderIds: string[]) {
  try {
    const batch = db.batch();

    orderIds.forEach((id, index) => {
      const ref = db.collection("models").doc(id);
      batch.update(ref, { order: index });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error updating model order:", error);
    throw error;
  }
}

export async function deleteModel(modelId: string) {
  try {
    // 현재 모델 정보 가져오기
    const modelDoc = await db.collection("models").doc(modelId).get();
    const modelData = modelDoc.data() as ModelDetails;

    const changes = [];

    // 이전 모델과 다음 모델을 서로 연결
    if (modelData.prevModel && modelData.nextModel) {
      changes.push(
        { modelId: modelData.prevModel, prevModel: modelData.prevModel, nextModel: modelData.nextModel },
        { modelId: modelData.nextModel, prevModel: modelData.prevModel, nextModel: modelData.nextModel }
      );
    } else if (modelData.prevModel) {
      // 마지막 모델을 삭제하는 경우
      changes.push({
        modelId: modelData.prevModel,
        prevModel: modelData.prevModel,
        nextModel: null,
      });
    } else if (modelData.nextModel) {
      // 첫 번째 모델을 삭제하는 경우
      changes.push({
        modelId: modelData.nextModel,
        prevModel: null,
        nextModel: modelData.nextModel,
      });
    }

    if (changes.length > 0) {
      await updateModelLinks(changes);
    }

    // Firestore에서 모델 삭제
    await db.collection("models").doc(modelId).delete();

    // Storage에서 이미지 삭제
    const files = await storage.bucket().getFiles({
      prefix: modelId,
    });

    await Promise.all(files[0].map((file) => file.delete()));
  } catch (error) {
    console.error("Error deleting model:", error);
    throw error;
  }
}

export const get_model_info = async (category: Category) => {
  const modelsSnapshot = await db.collection("models").where("category", "==", category).get();

  const models = await Promise.all(
    modelsSnapshot.docs.map(async (doc) => {
      const model = doc.data() as ModelDetails;

      model.signedImageUrls = {};
      if (model.images && model.images.length > 0) {
        const result = await storage
          .bucket()
          .file(model.images[0])
          .getSignedUrl({
            action: "read",
            expires: Date.now() + 1000 * 60 * 60, // 1시간
          });
        model.signedImageUrls[model.images[0]] = result[0];
      }
      return model;
    })
  );
  return findModelOrder(models);
};

export async function updateModelField(modelId: string, field: keyof ModelDetails, value: string | string[]) {
  try {
    await db
      .collection("models")
      .doc(modelId)
      .update({
        [field]: value,
      });
  } catch (error) {
    console.error("Error updating model field:", error);
    throw error;
  }
}

export async function updateModelImages(modelId: string, images: string[]) {
  try {
    await db.collection("models").doc(modelId).update({
      images,
    });
  } catch (error) {
    console.error("Error updating model images:", error);
    throw error;
  }
}

export async function uploadImages(modelId: string, files: FileList) {
  try {
    const uploadPromises = Array.from(files).map(async (file, index) => {
      const fileName = `${modelId}/${Date.now()}-${index + 1}.png`;
      const imageRef = storage.bucket().file(fileName);
      const buffer = await file.arrayBuffer();
      await imageRef.save(Buffer.from(buffer));
      return fileName;
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  }
}

export async function createModel(name: string, category: Category) {
  try {
    const modelId = nanoid();
    const now = new Date().toISOString();

    // 현재 카테고리의 마지막 모델 찾기
    const lastModelQuery = await db.collection("models").where("category", "==", category).where("nextModel", "==", null).get();

    const lastModel = lastModelQuery.docs[0]?.data() as ModelDetails | undefined;

    // 새 모델 생성
    await db
      .collection("models")
      .doc(modelId)
      .set({
        id: modelId,
        name,
        category,
        displayName: name,
        images: [],
        experience: [],
        instagram: "",
        youtube: "",
        tiktok: "",
        createdAt: now,
        updatedAt: now,
        prevModel: lastModel?.id || null,
        nextModel: null,
      });

    // 링크 업데이트
    if (lastModel) {
      await updateModelLinks([
        { modelId: lastModel.id, prevModel: lastModel.prevModel, nextModel: modelId },
        { modelId: modelId, prevModel: lastModel.id, nextModel: null },
      ]);
    }

    return modelId;
  } catch (error) {
    console.error("Error creating model:", error);
    throw error;
  }
}

export async function verifyAdminSessionServer() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth`, {
    method: "GET",
    credentials: "include",
  });
  return response.ok;
}

export async function getModel(id: string) {
  try {
    const doc = await db.collection("models").doc(id).get();
    if (!doc.exists) return null;

    const data = doc.data();
    return {
      ...data!,
      createdAt: data!.createdAt?.toDate?.()?.toISOString() || data!.createdAt,
      updatedAt: data!.updatedAt?.toDate?.()?.toISOString() || data!.updatedAt,
    };
  } catch (error) {
    console.error("Error getting model:", error);
    throw error;
  }
}

async function updateModelLinks(
  changes: Array<{
    modelId: string;
    prevModel: string | null;
    nextModel: string | null;
  }>
) {
  const batch = db.batch();

  // 모든 변경사항을 배치에 추가
  changes.forEach(({ modelId, prevModel, nextModel }) => {
    const modelRef = db.collection("models").doc(modelId);
    batch.update(modelRef, {
      prevModel: prevModel,
      nextModel: nextModel,
    });
  });

  // 한 번의 배치 작업으로 모든 변경사항 적용
  await batch.commit();
}

// 여러 모델 삭제 시 사용할 함수
export async function deleteMultipleModels(modelIds: string[]) {
  try {
    // 모든 모델의 정보를 가져옴
    const modelsData = await Promise.all(
      modelIds.map(async (id) => {
        const doc = await db.collection("models").doc(id).get();
        return doc.data() as ModelDetails;
      })
    );

    // 각 모델에 대해 삭제 작업 수행
    await Promise.all(
      modelIds.map(async (id) => {
        await deleteModel(id);
      })
    );

    // 남은 모델들의 순서 재정렬이 필요한 경우 추가 로직
  } catch (error) {
    console.error("Error deleting multiple models:", error);
    throw error;
  }
}
