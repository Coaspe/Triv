// app/api/upload/route.ts
import { deleteImages, uploadImages } from "@/lib/actions";
import { encrypt } from "@/lib/encrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData(); // app directory에서는 formData() 사용
  const newImages = formData.getAll("newImages") as File[];
  const deletedImages = JSON.parse((formData.get("deletedImages") ?? "[]") as string) as string[];
  const modelId = formData.get("modelId") as string;

  try {
    await deleteImages(deletedImages, modelId);
    const { signedUrls, uploadedImages } = await uploadImages(newImages, modelId);
    return NextResponse.json({ signedUrls: encrypt(JSON.stringify(signedUrls)), uploadedImages }, { status: 200 });
  } catch (error: any) {
    console.error("API Route error:", error);
    if ("statusCode" in error && error.statusCode === 413) {
      return NextResponse.json({ message: "업로드 파일 크기가 너무 큽니다. 파일 크기를 줄이거나 다른 방식으로 업로드 해주세요." }, { status: 413 });
    } else {
      return NextResponse.json({ message: "이미지 업로드에 실패했습니다.", error: error.message || "Unknown error" }, { status: 500 });
    }
  }
}
export async function DELETE(req: Request) {}
