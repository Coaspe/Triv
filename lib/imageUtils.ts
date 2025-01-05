import imageCompression from "browser-image-compression";

export async function compressImage(file: File) {
  const options = {
    maxSizeMB: 1, // 최대 1MB
    maxWidthOrHeight: 1920, // 최대 해상도
    useWebWorker: true, // WebWorker 사용으로 메인 스레드 블로킹 방지
    initialQuality: 0.8, // 초기 품질
  };

  try {
    const compressedFile = await imageCompression(file, options);

    // 원본이 압축 결과보다 작으면 원본 반환
    if (file.size <= compressedFile.size) {
      return file;
    }

    return compressedFile;
  } catch (error) {
    console.error("Image compression failed:", error);
    return file; // 압축 실패시 원본 반환
  }
}

export async function compressImages(files: File[]) {
  return Promise.all(files.map((file) => compressImage(file)));
}
