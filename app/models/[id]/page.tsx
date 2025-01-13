/** @format */
"use client";
import { getModelDetail } from "../../../lib/actions";
import ModelDetailClient from "./ModelDetailClient";
import ModelDetailSkeleton from "../../../components/ModelDetailSkeleton";
import { Suspense, useEffect } from "react";
import { useModelStore } from "@/lib/store/modelStore";

export default async function ModelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { getModel, getSignedUrls, setModel, setSignedUrls } = useModelStore();
  const model = await getModelDetail(id, getModel(id), getSignedUrls(id));

  useEffect(() => {
    setModel(model);
    setSignedUrls(model.signedImageUrls);
  }, [model]);

  return (
    <Suspense fallback={<ModelDetailSkeleton />}>
      <ModelDetailClient initModelData={model} />
    </Suspense>
  );
}
