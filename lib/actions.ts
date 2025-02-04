"use server";

import { findModelOrder } from "@/app/utils";
import { db, storage } from "./firebase/admin";
import { ModelDetail, Work, SignedImageUrls } from "@/app/types";
import { nanoid } from "nanoid";
import { encrypt } from "./encrypt";
import { ModelCategory } from "@/app/enums";
import { EXPIRES } from "@/app/constants";

const EXPIRES_TIME = 24 * 60 * 60;

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

export async function uploadImages(files: File[], modelId: string) {
  try {
    // 1. 이미지 Storage 업로드 (병렬 처리 유지)
    const uploadPromises = files.map(async (file) => {
      // Set 대신 map으로 변경, Promise 배열 반환
      try {
        const imageRef = storage.bucket().file(`${modelId}/${file.name}`);
        const buffer = await file.arrayBuffer();
        await imageRef.save(Buffer.from(buffer));
        return file.name; // 성공 시 파일 이름 반환
      } catch (error) {
        console.error("Error uploading image:", error);
        return null; // 에러 시 null 반환
      }
    });

    const uploadedImagesNames = (await Promise.all(uploadPromises)).filter((name) => name !== null) as string[]; // null 필터링 및 타입 단언

    // 2. Signed URL 생성 및 Firestore 배치 쓰기 준비
    const batch = db.batch(); // 배치 쓰기 시작
    const signedUrls: SignedImageUrls = {};
    const expires = Date.now() + EXPIRES_TIME;
    const batchPromises: Promise<any>[] = []; // 배치 쓰기 Promise들을 저장할 배열 (Promise<void> 또는 Promise<FirebaseFirestore.WriteResult> 예상)

    uploadedImagesNames.forEach((image) => {
      // forEach로 순회
      if (!image) return; // null 값 건너뛰기 (filter 로직으로 대체 가능)
      const docRef = db.collection("signedImageUrls").doc(image); // DocumentReference 생성

      const getSignedUrlPromise = storage.bucket().file(`${modelId}/${image}`).getSignedUrl({
        // Signed URL 생성 Promise
        action: "read",
        expires,
      });

      const batchSetPromise = getSignedUrlPromise
        .then((result) => {
          // Signed URL 생성 완료 후 배치 쓰기 Promise 생성
          const signedUrl = result[0];
          batch.set(docRef, { url: signedUrl, expires }); // 배치 쓰기 작업 추가
          signedUrls[image] = { url: signedUrl, expires }; // signedUrls 객체 업데이트
          return Promise.resolve(); // void 또는 FirebaseFirestore.WriteResult 를 반환하는 Promise로 변경 (batchPromises 배열에 Promise가 필요)
        })
        .catch((error) => {
          console.error("Error getting signed URL:", error);
          return Promise.resolve(); // 에러 발생해도 Promise resolve 처리 (전체 작업 중단 방지)
        });

      batchPromises.push(batchSetPromise); // 배치 쓰기 Promise 배열에 추가
    });

    // 3. 배치 커밋 (한 번만 실행)
    await Promise.all(batchPromises); // 모든 배치 쓰기 Promise가 완료될 때까지 기다림
    await batch.commit(); // 배치 커밋 실행 (모든 set 작업 일괄 처리)

    return { signedUrls, uploadedImages: uploadedImagesNames }; // uploadedImagesNames 반환 (uploadedImages는 불필요)
  } catch (error) {
    console.error("API Route upload error:", error);
    throw error;
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

    const db_works = (await db.collection("works").get()).docs
      .map((doc) => doc.data())
      .reduce((acc, obj) => {
        acc[obj.id] = obj;
        return acc;
      }, {});

    const new_works_id = new Set(works.map((work) => work.id));

    for (const id in db_works) {
      if (!new_works_id.has(id)) {
        batch.delete(db.collection("works").doc(id));
      }
    }
    // 모든 work 업데이트
    works.forEach((work, index) => {
      const workRef = db.collection("works").doc(work.id);
      batch.update(workRef, {
        ...work,
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

export const getModelsInfo = async (category: ModelCategory, prevSignedImageUrls?: SignedImageUrls) => {
  try {
    console.log(category, prevSignedImageUrls);

    const modelsSnapshot = await db.collection("models").where("category", "==", category).get();

    const signedUrls: SignedImageUrls = {};
    const now = Date.now();

    // 이전 signed URLs 처리
    if (prevSignedImageUrls) {
      Object.entries(prevSignedImageUrls).forEach(([key, value]) => {
        if (value.expires > now) {
          signedUrls[key] = value;
        }
      });
    }

    const models = await Promise.all(
      modelsSnapshot.docs.map(async (doc) => {
        const model = doc.data() as ModelDetail;

        if (model.images && model.images?.length > 0) {
          const imageName = model.images[0];

          // 현재 signed URL이 있는지 확인
          if (signedUrls[imageName]) {
            return model;
          }

          // DB에 캐시된 signed URL 확인
          const signedUrlDoc = await db.collection("signedImageUrls").doc(imageName).get();
          if (signedUrlDoc.exists && signedUrlDoc.data()?.expires > now) {
            signedUrls[imageName] = signedUrlDoc.data() as { url: string; expires: number };
            return model;
          }

          // 새로운 signed URL 생성
          const [url] = await storage.bucket().file(`${model.id}/${imageName}`).getSignedUrl({
            action: "read",
            expires: EXPIRES,
          });

          // signed URL 저장
          await db.collection("signedImageUrls").doc(imageName).set({
            url,
            expires: EXPIRES,
          });

          signedUrls[imageName] = { url, expires: EXPIRES };
        }
        return model;
      })
    );

    return {
      models: models.filter((model): model is ModelDetail => model !== undefined),
      signedUrls: encrypt(JSON.stringify(signedUrls)),
    };
  } catch (error) {
    console.log("Error getting models info:", error);
    throw error;
  }
};

export const deleteImages = async (imageNames: string[], modelId: string) => {
  try {
    const batch = db.batch();

    await Promise.all(
      imageNames.map(async (imageName) => {
        try {
          await storage.bucket().file(`${modelId}/${imageName}`).delete();
          const signedUrlRef = db.collection("signedImageUrls").doc(imageName);
          batch.delete(signedUrlRef);
        } catch (error) {
          console.error(`Error deleting image ${imageName}:`, error);
        }
      })
    );

    await batch.commit();
  } catch (error) {
    console.error("Error in batch delete:", error);
    throw error;
  }
};
