/** @format */

import { SignedImageUrls } from "@/app/types";
import { deleteImages, updateModelField, uploadImages } from "@/lib/actions";
import { encrypt } from "@/lib/encrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData(); // app directory에서는 formData() 사용
  const newImages = formData.getAll("newImages") as File[];
  const deletedImages = JSON.parse((formData.get("deletedImages") ?? "[]") as string) as string[];

  // modelId가 null 또는 undefined인 경우 에러 처리
  const modelId = formData.get("modelId") as string;
  if (!modelId) {
    return NextResponse.json({ message: "modelId가 필요합니다." }, { status: 400 });
  }

  let signedUrls: SignedImageUrls = {};
  let uploadedImages: string[] = [];

  try {
    if (deletedImages.length > 0) await deleteImages(deletedImages, modelId);

    if (newImages.length > 0) {
      const { signedUrls: s, uploadedImages: u } = await uploadImages(newImages, modelId);
      signedUrls = s;
      uploadedImages = u;
    }

    // nextImageList가 null 또는 undefined인 경우 빈 배열로 초기화
    const nextImageListString = formData.get("nextImageList") as string | null;
    let finalImageList = nextImageListString ? (JSON.parse(nextImageListString) as string[]) : [];

    const pendingImageNamesSet = new Set(newImages.map((image) => image.name));
    finalImageList = finalImageList.filter((image) => !pendingImageNamesSet.has(image) || (pendingImageNamesSet.has(image) && uploadedImages.includes(image)));
    const newModel = await updateModelField(modelId, "images", finalImageList);

    return NextResponse.json({ signedUrls: encrypt(JSON.stringify(signedUrls)), newModel: encrypt(JSON.stringify(newModel)) }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error && "statusCode" in error && error.statusCode === 413) {
      return NextResponse.json({ message: "업로드 파일 크기가 너무 큽니다. 파일 크기를 줄이거나 다른 방식으로 업로드 해주세요." }, { status: 413 });
    } else {
      return NextResponse.json({ message: "이미지 업로드에 실패했습니다.", error: (error instanceof Error && error.message) || "Unknown error" }, { status: 500 });
    }
  }
}
