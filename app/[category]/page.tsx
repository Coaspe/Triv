/** @format */

import { Category } from "@/app/types";
import ModelDetailSkeleton from "@/components/ModelDetailSkeleton";
import ModelPage from "@/components/ModelPage";
import { getModelsInfo } from "@/lib/actions";
import { notFound } from "next/navigation";
import { Suspense } from "react";

// 유효한 카테고리 목록
const validCategories = ["women", "men", "international"];

// 페이지 타이틀 매핑
const categoryTitles: Record<Category, string> = {
  women: "WOMEN",
  men: "MEN",
  international: "INTERNATIONAL",
};

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const category = (await params).category as Category;

  if (!validCategories.includes(category)) {
    notFound();
  }

  const models = await getModelsInfo(category);

  return (
    <Suspense fallback={<ModelDetailSkeleton />}>
      <ModelPage title={categoryTitles[category]} models={models} category={category} />
    </Suspense>
  );
}

// 정적 경로 생성
export function generateStaticParams() {
  return validCategories.map((category) => ({
    category,
  }));
}
