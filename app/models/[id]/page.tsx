import { getModelDetail } from "../../../lib/actions";
import ModelDetailClient from "./ModelDetailClient";
import ModelDetailSkeleton from "../../../components/ModelDetailSkeleton";
import { Suspense } from "react";

export default async function ModelDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<ModelDetailSkeleton />}>
      <ModelDetailClient modelData={await getModelDetail(params.id)} />
    </Suspense>
  );
}
