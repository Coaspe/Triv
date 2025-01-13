/** @format */

"use server";

import { findModelOrder } from "@/app/utils";
import { db, storage } from "./firebase/admin";
import { ModelDetails, Category, Work, SignedImageUrls } from "@/app/types";
import { nanoid } from "nanoid";

export async function getModelDetail(id: string, prevModel?: ModelDetails, prevSignedImageUrls?: SignedImageUrls) {
  try {
    const model = await db.collection("models").doc(id).get();
    const modelData = model.data() as ModelDetails;

    if (prevModel) {
      const updated = prevModel.updatedAt === modelData.updatedAt;
      if (!updated) {
        modelData.signedImageUrls = prevSignedImageUrls;
        return modelData;
      }
    }
    const images = (await storage.bucket().getFiles({ prefix: id }))[0];

    if (!modelData.signedImageUrls) {
      modelData.signedImageUrls = {};
    }

    if (prevSignedImageUrls) {
      Object.keys(prevSignedImageUrls).forEach((key) => {
        if (modelData.signedImageUrls) {
          modelData.signedImageUrls[key] = prevSignedImageUrls[key];
        }
      });
    }

    // start with index 1 for images
    for (let i = 0; i < images.length; i++) {
      const now = Date.now();
      const expires = now + 1000 * 60 * 60;
      if (images[i] && modelData.images) {
        const image = images[i];
        if (modelData.signedImageUrls[image.name] && modelData.signedImageUrls[image.name].expires > now) continue;
        const result = await image.getSignedUrl({ action: "read", expires });
        modelData.signedImageUrls[image.name] = { url: result[0], expires };
      }
    }
    return modelData;
  } catch (error) {
    console.error("Error fetching model detail:", error);
    throw error;
  }
}

export const getModelsInfo = async (category: Category, prevModels?: ModelDetails[], prevSignedImageUrls?: SignedImageUrls) => {
  const modelsSnapshot = await db.collection("models").where("category", "==", category).get();

  const models = (
    await Promise.all(
      modelsSnapshot.docs.map(async (doc) => {
        const model = doc.data() as ModelDetails;
        const updated = prevModels?.find((m) => m.id === model.id)?.updatedAt !== model.updatedAt;
        model.signedImageUrls = {};
        if (model.images && model.images.length > 0) {
          const expires = Date.now() + 1000 * 60 * 60;
          if (!updated && prevSignedImageUrls && prevSignedImageUrls[model.images[0]] && prevSignedImageUrls[model.images[0]].expires > expires) {
            model.signedImageUrls[model.images[0]] = prevSignedImageUrls[model.images[0]];
          } else {
            const result = await storage.bucket().file(model.images[0]).getSignedUrl({
              action: "read",
              expires, // 1시간
            });
            model.signedImageUrls[model.images[0]] = { url: result[0], expires };
          }
          return model;
        }
      })
    )
  ).filter((model): model is ModelDetails => model !== undefined);
  return findModelOrder(models);
};

export async function updateModelField(modelId: string, field: keyof ModelDetails, value: string | string[]) {
  try {
    await db
      .collection("models")
      .doc(modelId)
      .update({
        [field]: value,
        updatedAt: new Date().toISOString(),
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
      updatedAt: new Date().toISOString(),
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
        modelingInfo: [],
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
        { modelId: lastModel.id, prevModel: lastModel.prevModel || null, nextModel: modelId },
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
      prevModel,
      nextModel,
      updatedAt: new Date().toISOString(),
    });
  });

  // 한 번의 배치 작업으로 모든 변경사항 적용
  await batch.commit();
}

export async function updateModels(category: Category, updatedModels: ModelDetails[]) {
  try {
    // 1. 현재 DB의 모든 모델 가져오기
    const currentModelsSnapshot = await db.collection("models").where("category", "==", category).get();

    const currentModels = findModelOrder(currentModelsSnapshot.docs.map((doc) => doc.data() as ModelDetails));

    // 2. 배치 작업 시작
    const batch = db.batch();

    // 3. 삭제된 모델 처리
    const deletedModels = currentModels.filter((current) => !updatedModels.some((updated) => updated.id === current.id));

    // 삭제된 모델들의 문서 및 이미지 삭제
    deletedModels.forEach((model) => {
      batch.delete(db.collection("models").doc(model.id));
    });

    // 4. 업데이트된 모델 처리
    updatedModels.forEach((model, index) => {
      const modelRef = db.collection("models").doc(model.id);
      const prevModel = index > 0 ? updatedModels[index - 1].id : null;
      const nextModel = index < updatedModels.length - 1 ? updatedModels[index + 1].id : null;

      // 현재 DB의 모델과 비교하여 변경사항이 있는 경우만 업데이트
      const currentModel = currentModels.find((m) => m.id === model.id);
      if (!currentModel || currentModel.prevModel !== prevModel || currentModel.nextModel !== nextModel || JSON.stringify(currentModel) !== JSON.stringify(model)) {
        batch.update(modelRef, {
          ...model,
          prevModel,
          nextModel,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    // 5. 배치 작업 실행
    await batch.commit();

    // 6. 삭제된 모델들의 이미지 삭제 (배치 작업 이후 수행)
    await Promise.all(
      deletedModels.map(async (model) => {
        const files = await storage.bucket().getFiles({
          prefix: model.id,
        });
        return Promise.all(files[0].map((file) => file.delete()));
      })
    );

    return true;
  } catch (error) {
    console.error("Error updating models:", error);
    throw error;
  }
}

export async function createWork(title: string, id: string) {
  try {
    if (!id) {
      throw new Error("Invalid YouTube URL");
    }
    const now = new Date().toISOString();

    // 현재 마지막 work 찾기
    const lastWorkQuery = await db.collection("works").where("nextWork", "==", null).get();

    const lastWork = lastWorkQuery.docs[0]?.data() as Work | undefined;
    const work: Work = {
      id,
      title,
      prevWork: lastWork?.id || null,
      nextWork: null,
      createdAt: now,
      updatedAt: now,
    };
    // 새 work 생성
    await db.collection("works").doc(id).set(work);

    // 이전 work의 nextWork 업데이트
    if (lastWork) {
      await db.collection("works").doc(lastWork.id).update({
        nextWork: id,
      });
    }

    return work;
  } catch (error) {
    console.error("Error creating work:", error);
    throw error;
  }
}

export async function updateWorks(works: Work[]) {
  try {
    const batch = db.batch();

    // 모든 work 업데이트
    works.forEach((work, index) => {
      const workRef = db.collection("works").doc(work.id);
      batch.update(workRef, {
        ...work,
        prevWork: index === 0 ? null : works[index - 1].id,
        nextWork: index === works.length - 1 ? null : works[index + 1].id,
        updatedAt: new Date().toISOString(),
      });
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error updating works:", error);
    throw error;
  }
}

export async function deleteWork(workId: string) {
  try {
    const workDoc = await db.collection("works").doc(workId).get();
    const work = workDoc.data() as Work;

    const batch = db.batch();

    // 이전 work와 다음 work를 연결
    if (work.prevWork && work.nextWork) {
      batch.update(db.collection("works").doc(work.prevWork), {
        nextWork: work.nextWork,
      });
      batch.update(db.collection("works").doc(work.nextWork), {
        prevWork: work.prevWork,
      });
    } else if (work.prevWork) {
      batch.update(db.collection("works").doc(work.prevWork), {
        nextWork: null,
      });
    } else if (work.nextWork) {
      batch.update(db.collection("works").doc(work.nextWork), {
        prevWork: null,
      });
    }

    // work 삭제
    batch.delete(db.collection("works").doc(workId));

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error deleting work:", error);
    throw error;
  }
}
