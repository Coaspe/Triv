"use client";
import { Category, ModelDetails } from "@/app/types";
import ModelCard from "./ModelCard";
import ModelCardSkeleton from "./ModelCardSkeleton";
import { Suspense, useState } from "react";
import AddModelModal from "./AddModelModal";
import { verifyAdminSession } from "@/lib/client-actions";
import AdminAuthModal from "./AdminAuthModal";
import { FaPlus } from "react-icons/fa6";

interface ModelPageProps {
  title: string;
  models: ModelDetails[];
  category: Category;
}

export default function ModelPage({ title, models, category }: ModelPageProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAddModelClick = async () => {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setShowAddModal(true);
  };
  return (
    <div className="max-w-[1300px] mx-auto px-4">
      <div className="flex justify-center relative items-center mb-8">
        <h1 className="text-center text-sm font-extrabold text-gray-600 mb-12">{title}</h1>
        <button onClick={handleAddModelClick} className="absolute right-0 p-2 bg-gray-600 text-white rounded-full hover:bg-black flex items-center justify-center" title="새 모델 추가">
          <FaPlus className="w-4 h-4" />
        </button>
      </div>
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
      {/* 새 모델 추가 모달 */}
      {showAddModal && <AddModelModal category={category} onClose={() => setShowAddModal(false)} />}
      {showAuthModal && (
        <AdminAuthModal
          onAuth={() => {
            setShowAuthModal(false);
            setShowAddModal(true);
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}
