/** @format */

import ModelPage from "@/components/ModelPage";
import { notFound } from "next/navigation";
import { ModelCategory } from "@/app/enums";

// 유효한 카테고리 목록 use ModelCategory enum

const validCategories = Object.values(ModelCategory);

// 페이지 타이틀 매핑
const categoryTitles: Record<ModelCategory, string> = Object.values(ModelCategory).reduce((acc, category) => {
  acc[category] = category; // Key와 Value를 동일하게 설정
  return acc;
}, {} as Record<ModelCategory, string>);

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const category = (await params).category as ModelCategory;

  if (!validCategories.includes(category)) {
    notFound();
  }

  return <ModelPage title={categoryTitles[category]} category={category} />;
}

// 정적 경로 생성
export function generateStaticParams() {
  return validCategories.map((category) => ({
    category,
  }));
}
