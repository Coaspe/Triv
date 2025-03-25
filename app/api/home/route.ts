/** @format */

import { NextResponse } from "next/server";
const randomDelays = [0.1, 0.3, 0.5, 0.7]; // 또는 SSR 시점에 생성

function shuffleArray(array: number[]) {
  // 배열의 뒤에서부터 앞으로 순회합니다.
  for (let i = array.length - 1; i > 0; i--) {
    // 0부터 i까지의 임의의 인덱스 j를 선택합니다.
    const j = Math.floor(Math.random() * (i + 1));

    // array[i]와 array[j]를 서로 교환합니다. (구조 분해 할당을 사용)
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function GET() {
  // 배열 복사본을 만들어서 섞음
  const copiedDelays = [...randomDelays];
  const shuffledDelays = shuffleArray(copiedDelays);

  // 응답 생성
  const response = NextResponse.json({ randomDelays: shuffledDelays });

  // CORS 설정: 특정 출처 허용 (필요에 따라 "*" 또는 다른 출처를 지정)
  response.headers.set("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_BASE_URL || "https://trivfamily.com");
  return response;
}
