import { ModelDetails } from "@/app/types";
import ModelCard from "./ModelCard";
import ModelCardSkeleton from "./ModelCardSkeleton";
import { Suspense } from "react";

export default function ModelPage({ title, models }: { title: string; models: ModelDetails[] }) {
  return (
    <div className="max-w-[1300px] mx-auto px-4">
      <h1 className="text-center text-sm font-extrabold text-gray-600 mb-12">{title}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-y-12">
        <Suspense
          fallback={
            <>
              {[1, 2, 3, 4].map((i) => (
                <ModelCardSkeleton key={i} />
              ))}
            </>
          }
        >
          {models.map((model: ModelDetails) => (
            <ModelCard key={model.id} {...model} />
          ))}
        </Suspense>
      </div>
    </div>
  );
}
