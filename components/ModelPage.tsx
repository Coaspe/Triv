"use client";

import { ModelDetail } from "@/app/types";
import ModelCard from "./ModelCard";
import { useState, useEffect } from "react";
import AddModelModal from "./AddModelModal";
import { getModelsInfo, verifyAdminSession } from "@/lib/client-actions";
import AdminAuthModal from "./AdminAuthModal";
import { FaPlus, FaTrash, FaArrowsAlt, FaSave, FaCog, FaTimes } from "react-icons/fa";
import { updateModels } from "@/lib/actions";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useModelStore } from "@/lib/store/modelStore";
import ModelCardSkeleton from "./ModelCardSkeleton";
import { ModelCategory } from "@/app/enums";

interface ModelPageProps {
  title: string;
  category: ModelCategory;
}

export default function ModelPage({ title, category }: ModelPageProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOrderingMode, setIsOrderingMode] = useState(false);
  const [orderedModels, setOrderedModels] = useState<ModelDetail[]>([]);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [localModels, setLocalModels] = useState<ModelDetail[]>([]);

  const { setModels, setSignedUrls, getSignedUrls, deleteSignedUrlsFromModels } = useModelStore();

  const localSignedUrls = getSignedUrls();

  const getAndSetModels = async () => {
    setIsLoading(true);
    const { models, signedUrls } = await getModelsInfo(category, getSignedUrls());
    setSignedUrls(signedUrls);
    setAllModels(models);
    setIsLoading(false);
  };

  const setAllModels = (models: ModelDetail[]) => {
    setModels(models);
    setLocalModels(models);
  };

  useEffect(() => {
    getAndSetModels();
  }, []);

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
      if (window.confirm(`선택한 ${selectedModels.size}개의 모델을 삭제하시겠습니까?`)) {
        setIsDeleting(true);
        try {
          const remainingModels: ModelDetail[] = localModels.filter((model) => !selectedModels.has(model.id));

          const { updatedModels, deletedModels } = await updateModels(category, remainingModels);
          setAllModels(updatedModels);
          deleteSignedUrlsFromModels(deletedModels);
        } catch (error) {
          console.error("Error deleting models:", error);
          alert("모델 삭제 중 오류가 발생했습니다.");
        } finally {
          setIsDeleting(false);
        }
      }
    }

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

  const handleOrderModeClick = async () => {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setOrderedModels(localModels);
    setIsOrderingMode(!isOrderingMode);
    setHasOrderChanges(false);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(orderedModels);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedModels(items);
    setHasOrderChanges(true);
  };

  const handleSaveOrder = async () => {
    if (!hasOrderChanges) {
      setIsOrderingMode(false);
      return;
    }

    try {
       const {updatedModels}= await updateModels(
        category,
        orderedModels.map((model, index, array) => ({
          ...model,
          prevModel: index === 0 ? undefined : array[index - 1].id,
          nextModel: index === array.length - 1 ? undefined : array[index + 1].id,
        }))
      )
      
      setAllModels(updatedModels)
      setIsOrderingMode(false);
      setHasOrderChanges(false);
    } catch (error) {
      console.error("Error updating model order:", error);
      alert("순서 변경 저장에 실패했습니다.");
    }
  };

  return (
    <div className="max-w-[1300px] mx-auto px-4">
      <div className="flex justify-center relative items-center mb-8">
        <h1 className="text-center text-sm font-extrabold text-gray-600 mb-12">{title.toUpperCase()}</h1>
        <div className="absolute right-0 flex items-center gap-2">
          <div className={`flex gap-2 transition-all duration-300 ${showAdminControls ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0 pointer-events-none"}`}>
            {!isDeleteMode && !isOrderingMode && (
              <div className={`transition-all duration-300 ${isDeleteMode || isOrderingMode ? "w-0 opacity-0 scale-0" : "w-auto opacity-100 scale-100"}`}>
                <button onClick={handleAddModelClick} className="p-2 bg-gray-600 text-white rounded-full hover:bg-black flex items-center justify-center" title="새 모델 추가">
                  <FaPlus className="w-4 h-4" />
                </button>
              </div>
            )}
            {!isOrderingMode && (
              <button
                onClick={handleDeleteModeClick}
                className={`p-2 text-white rounded-full flex items-center justify-center transition-colors duration-300 ${isDeleteMode ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-black"}`}
                title={isDeleteMode ? "선택한 모델 삭제" : "모델 삭제 모드"}
                disabled={isDeleting}
              >
                <FaTrash className="w-4 h-4" />
              </button>
            )}
            {!isDeleteMode && (
              <button
                onClick={isOrderingMode ? handleSaveOrder : handleOrderModeClick}
                className={`p-2 text-white rounded-full flex items-center justify-center transition-colors duration-300 ${
                  isOrderingMode ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 hover:bg-black"
                }`}
                title={isOrderingMode ? "순서 변경 완료" : "순서 변경 모드"}
              >
                {isOrderingMode ? <FaSave className={`w-4 h-4 ${hasOrderChanges ? "text-white" : "text-gray-300"}`} /> : <FaArrowsAlt className="w-4 h-4" />}
              </button>
            )}
          </div>

          <button
            onClick={() => setShowAdminControls(!showAdminControls)}
            className="p-2 bg-gray-600 text-white rounded-full hover:bg-black flex items-center justify-center z-10"
            title={showAdminControls ? "관리자 메뉴 닫기" : "관리자 메뉴 열기"}
          >
            {showAdminControls ? <FaTimes className="w-4 h-4" /> : <FaCog className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="models" direction="horizontal">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-y-12">
              {!isLoading
                ? (isOrderingMode ? orderedModels : localModels).map((model, index) => (
                    <Draggable key={model.id} draggableId={model.id} index={index} isDragDisabled={!isOrderingMode}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            zIndex: snapshot.isDragging ? 1000 : "auto",
                          }}
                        >
                          <ModelCard
                            model={model}
                            isDeleteMode={isDeleteMode}
                            isOrderingMode={isOrderingMode}
                            isSelected={selectedModels.has(model.id)}
                            onSelect={() => toggleModelSelection(model.id)}
                            profileImage={model.images && model.images[0] ? localSignedUrls?.[model.images[0]]?.url : undefined}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))
                : Array.from({ length: 8 }).map((_, index) => <ModelCardSkeleton key={index} />)}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

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
