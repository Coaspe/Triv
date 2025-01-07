/** @format */

"use client";
import { Category, ModelDetails } from "@/app/types";
import ModelCard from "./ModelCard";
import ModelCardSkeleton from "./ModelCardSkeleton";
import { Suspense, useState } from "react";
import AddModelModal from "./AddModelModal";
import { verifyAdminSession } from "@/lib/client-actions";
import AdminAuthModal from "./AdminAuthModal";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { deleteModel } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface ModelPageProps {
  title: string;
  models: ModelDetails[];
  category: Category;
}

export default function ModelPage({ title, models, category }: ModelPageProps) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddModelClick = async () => {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setShowAddModal(true);
  };

  const handleDeleteModeClick = async () => {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (isDeleteMode && selectedModels.size > 0) {
      // 삭제 확인 모달
      if (window.confirm(`선택한 ${selectedModels.size}개의 모델을 삭제하시겠습니까?`)) {
        setIsDeleting(true);
        try {
          // 선택된 모든 모델 삭제
          await Promise.all([...selectedModels].map((id) => deleteModel(id)));
          router.refresh();
        } catch (error) {
          console.error("Error deleting models:", error);
          alert("모델 삭제 중 오류가 발생했습니다.");
        } finally {
          setIsDeleting(false);
        }
      }
    }

    // 삭제 모드 토글 및 선택 초기화
    setIsDeleteMode(!isDeleteMode);
    setSelectedModels(new Set());
  };

  const toggleModelSelection = (modelId: string) => {
    const newSelection = new Set(selectedModels);
    if (newSelection.has(modelId)) {
      newSelection.delete(modelId);
    } else {
      newSelection.add(modelId);
    }
    setSelectedModels(newSelection);
  };

  return (
    <div className="max-w-[1300px] mx-auto px-4">
      <div className="flex justify-center relative items-center mb-8">
        <h1 className="text-center text-sm font-extrabold text-gray-600 mb-12">{title}</h1>
        <div className="absolute right-0 flex gap-2">
          <div className={`transition-all duration-300 ${isDeleteMode ? "opacity-0 scale-0" : "opacity-100 scale-100"}`}>
            <button onClick={handleAddModelClick} className="p-2 bg-gray-600 text-white rounded-full hover:bg-black flex items-center justify-center" title="새 모델 추가">
              <FaPlus className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleDeleteModeClick}
            className={`p-2 text-white rounded-full flex items-center justify-center transition-colors duration-300 ${isDeleteMode ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-black"}`}
            title={isDeleteMode ? "선택한 모델 삭제" : "모델 삭제 모드"}
            disabled={isDeleting}>
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-y-12">
        <Suspense
          fallback={
            <>
              {[1, 2, 3, 4].map((i) => (
                <ModelCardSkeleton key={i} />
              ))}
            </>
          }>
          {models.map((model: ModelDetails) => (
            <ModelCard key={model.id} {...model} isDeleteMode={isDeleteMode} isSelected={selectedModels.has(model.id)} onSelect={() => toggleModelSelection(model.id)} />
          ))}
        </Suspense>
      </div>
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
