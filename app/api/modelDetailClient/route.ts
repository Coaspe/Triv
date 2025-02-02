// app/api/upload/route.ts
import { uploadImages } from "@/lib/actions";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData(); // app directory에서는 formData() 사용
  const modelId = formData.get("modelId") as string; // formData에서 modelId 추출
  const files = formData.getAll("files") as unknown as FileList; // formData에서 files 추출

  if (!modelId || !files || files.length === 0) {
    return NextResponse.json({ message: "modelId and files are required" }, { status: 400 });
  }

  try {
    const result = await uploadImages(files, modelId);
    console.log(result);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("API Route error:", error);
    if ("statusCode" in error && error.statusCode === 413) {
      return NextResponse.json({ message: "업로드 파일 크기가 너무 큽니다. 파일 크기를 줄이거나 다른 방식으로 업로드 해주세요." }, { status: 413 });
    } else {
      return NextResponse.json({ message: "이미지 업로드에 실패했습니다.", error: error.message || "Unknown error" }, { status: 500 });
    }
  }
}
