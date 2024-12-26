import { ModelDetails } from "@/types";
import ModelCard from "./ModelCard";

interface ModelProps {
  models: ModelDetails[];
  title: string;
}

const ModelPage = ({ models, title }: ModelProps) => {
  return (
    <div className="max-w-[1300px] mx-auto px-4">
      <h1 className="text-center text-sm font-extrabold text-gray-600 mb-12">{title}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12">
        {models.map((model, index) => (
          <ModelCard key={index} id={model.id} name={model.name} images={model.images} displayName={model.displayName} />
        ))}
      </div>
      {/* <div className="flex justify-center gap-1 mt-16 mb-8">
      <span className="w-1 h-1 bg-black rounded-full"></span>
      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
    </div> */}
    </div>
  );
};

export default ModelPage;
