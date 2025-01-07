/** @format */

import { Category } from "@/app/types";
import ModelPage from "@/components/ModelPage";
import { get_model_info } from "@/lib/actions";
import { notFound } from "next/navigation";

// 유효한 카테고리 목록
const validCategories = ["women", "men", "international"];

// 페이지 타이틀 매핑
const categoryTitles: Record<Category, string> = {
  women: "WOMEN",
  men: "MEN",
  international: "INTERNATIONAL",
};

export default async function CategoryPage({ params }: { params: { category: string } }) {
  // 유효하지 않은 카테고리인 경우 404
  if (!validCategories.includes(params.category)) {
    notFound();
  }

  const category = params.category as Category;
  const models = await get_model_info(category);
  console.log(models);

  return <ModelPage title={categoryTitles[category]} models={models} category={category} />;
}

// 정적 경로 생성
export function generateStaticParams() {
  return validCategories.map((category) => ({
    category,
  }));
}
