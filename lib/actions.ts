/** @format */

"use server";

import { findModelOrder } from "@/app/utils";
import { db, storage } from "./firebase/admin";
import { ModelDetail, Work, SignedImageUrls } from "@/app/types";
import { nanoid } from "nanoid";
import { generateEncryptionKey } from "./encrypt";
import CryptoJS from "crypto-js";
import { ModelCategory } from "@/app/enums";

const EXPIRES_TIME = 1000 * 60 * 60;

export async function getModelDetail(id: string, prevSignedUrls?: SignedImageUrls) {
  try {
    const model = await db.collection("models").doc(id).get();
    const modelData = model.data() as ModelDetail;

    const images = (await storage.bucket().getFiles({ prefix: id }))[0];
    const batch = db.batch();

    const now = Date.now();
    const expires = now + EXPIRES_TIME;

    const signedUrls: SignedImageUrls = {};

    if (prevSignedUrls) {
      Object.keys(prevSignedUrls).forEach((key) => {
        if (prevSignedUrls[key].expires > now) {
          signedUrls[key] = prevSignedUrls[key];
        }
      });
    }

    if (!modelData.images) return { modelData, signedUrls };

    const imagesName = images.map((img) => img.name.split("/")[1]);
    const imagesSet = new Set(imagesName);

    for (let i = 0; i < modelData.images?.length; i++) {
      const name = modelData.images[i];
      if (modelData.images && imagesSet.has(name)) {
        const image = images[imagesName.indexOf(name)];

        if (signedUrls[name] && signedUrls[name].expires > now) {
          continue;
        }

        const snapshot = await db.collection("signedImageUrls").doc(name).get();
        if (snapshot.exists && snapshot.data()?.expires > now) {
          signedUrls[name] = { url: snapshot.data()?.url, expires: snapshot.data()?.expires };
          continue;
        }

        const result = await image.getSignedUrl({ action: "read", expires });
        if (!snapshot.exists) {
          batch.set(db.collection("signedImageUrls").doc(name), { url: result[0], expires });
        } else {
          batch.update(db.collection("signedImageUrls").doc(name), { url: result[0], expires });
        }
        signedUrls[name] = { url: result[0], expires };
      }
    }

    await batch.commit();
    return { modelData, signedUrls };
  } catch (error) {
    console.error("Error fetching model detail:", error);
    throw error;
  }
}

export async function updateModelField(model: ModelDetail, field: keyof ModelDetail, value: string | string[]) {
  const newModel = {
    ...model,
    [field]: value,
    updatedAt: new Date().toISOString(),
  };
  try {
    await db.collection("models").doc(model.id).update(newModel);
    return newModel;
  } catch (error) {
    console.error("Error updating model field:", error);
    throw error;
  }
}

/**
 * Upload images to storage
 * @param  modelId - Model ID
 * @param  files - FileList of images
 * @returns Signed urls and uploaded images' file names (modelId/timestamp-index.png format)
 */
export async function uploadImages(files: FileList, modelId: string) {
  try {
    const uploadPromises = new Set(
      Array.from(files).map(async (file, _) => {
        try {
          const imageRef = storage.bucket().file(`${modelId}/${file.name}`);
          const buffer = await file.arrayBuffer();
          await imageRef.save(Buffer.from(buffer));
          return file.name;
        } catch (error) {
          console.error("Error uploading image:", error);
          return null;
        }
      })
    );

    const uploadedImagesNames = await Promise.all(uploadPromises);

    const batch = db.batch();

    const signedUrls: SignedImageUrls = {};
    const expires = Date.now() + EXPIRES_TIME;

    const uploadedImages = await Promise.all(
      uploadedImagesNames.map(async (image) => {
        try {
          if (!image) return false;
          const result = await storage.bucket().file(`${modelId}/${image}`).getSignedUrl({
            action: "read",
            expires,
          });
          batch.set(db.collection("signedImageUrls").doc(image), { url: result[0], expires });
          signedUrls[image] = { url: result[0], expires };
          return image;
        } catch (error) {
          return false;
        }
      })
    );

    await batch.commit();
    return { signedUrls, uploadedImages };
  } catch (error) {
    console.error("Error uploading images:", error);
    return { signedUrls: {}, uploadedImages: [] };
  }
}

export async function createModel(name: string, category: ModelCategory) {
  try {
    const modelId = nanoid();
    const now = new Date().toISOString();

    // 현재 카테고리의 마지막 모델 찾기
    const lastModelQuery = await db.collection("models").where("category", "==", category).where("nextModel", "==", null).get();

    const lastModel = lastModelQuery.docs[0]?.data() as ModelDetail | undefined;
    const newModel: ModelDetail = {
      id: modelId,
      name,
      category,
      displayName: name,
      modelingInfo: [],
      images: [],
      instagram: "",
      youtube: "",
      tiktok: "",
      createdAt: now,
      updatedAt: now,
      prevModel: lastModel?.id || null,
      nextModel: null,
    };
    // 새 모델 생성
    await db.collection("models").doc(modelId).set(newModel);

    // 링크 업데이트
    if (lastModel) {
      await updateModelLinks([
        { modelId: lastModel.id, prevModel: lastModel.prevModel || null, nextModel: modelId },
        { modelId: modelId, prevModel: lastModel.id, nextModel: null },
      ]);
    }

    return newModel;
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

export async function updateModels(category: ModelCategory, updatedModels: ModelDetail[]) {
  try {
    // 1. 현재 DB의 모든 모델 가져오기
    const currentModelsSnapshot = await db.collection("models").where("category", "==", category).get();

    const currentModels = findModelOrder(currentModelsSnapshot.docs.map((doc) => doc.data() as ModelDetail));

    // 2. 배치 작업 시작
    const batch = db.batch();

    // 3. 삭제된 모델 처리
    const deletedModels = currentModels.filter((current) => !updatedModels.some((updated) => updated.id === current.id));

    // 삭제된 모델들의 문서 및 이미지 삭제
    deletedModels.forEach((model) => {
      batch.delete(db.collection("models").doc(model.id));
    });

    const now = new Date().toISOString();

    // 4. 업데이트된 모델 처리
    updatedModels.forEach((model, index) => {
      const modelRef = db.collection("models").doc(model.id);
      const prevModel = index > 0 ? updatedModels[index - 1].id : null;
      const nextModel = index < updatedModels.length - 1 ? updatedModels[index + 1].id : null;
      updatedModels[index].prevModel = prevModel;
      updatedModels[index].nextModel = nextModel;
      updatedModels[index].updatedAt = now;
      // 현재 DB의 모델과 비교하여 변경사항이 있는 경우만 업데이트
      const currentModel = currentModels.find((m) => m.id === model.id);
      if (!currentModel || currentModel.prevModel !== prevModel || currentModel.nextModel !== nextModel || JSON.stringify(currentModel) !== JSON.stringify(model)) {
        batch.update(modelRef, {
          ...model,
          prevModel,
          nextModel,
          updatedAt: now,
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

    return { updatedModels: [...updatedModels], deletedModels };
  } catch (error) {
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

export async function updateSignedUrls(signedUrls: SignedImageUrls) {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(signedUrls), generateEncryptionKey()!).toString();
  return encrypted;
}
