/** @format */

"use client";

import { Work } from "@/app/types";
import { useState } from "react";
import { FaPlus, FaTrash, FaArrowsAlt, FaSave, FaCog, FaTimes } from "react-icons/fa";
import { verifyAdminSession, verifyHandler } from "@/lib/client-actions";
import AdminAuthModal from "./AdminAuthModal";
import WorkCard from "./WorkCard";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import AddWorkModal from "./AddWorkModal";
import { updateWorks } from "@/lib/actions";
import WorkModal from "./WorkModal";
import toast from "react-hot-toast";
import WorkCardSkeleton from "./Skeleton/WorkCardSkeleton";
import EmptyState from "./EmptyState";
import WorkPageSkeleton from "./Skeleton/WorkCardSkeleton";

interface WorkPageProps {
  title: string;
  works: Work[];
}

export default function WorkPage({ title, works: initialWorks }: WorkPageProps) {
  const [works, setWorks] = useState<Work[]>(initialWorks);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedWorks, setSelectedWorks] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOrderingMode, setIsOrderingMode] = useState(false);
  const [orderedWorks, setOrderedWorks] = useState<Work[]>(initialWorks);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [selectedWork, setSelectedWork] = useState<string | null>(null);

  const handleAddWorkClick = async () => {
    await verifyHandler(setShowAuthModal, setShowAddModal);
  };
  const handleOrderingModeClick = async () => {
    const verified = await verifyAdminSession();
    if (!verified) {
      setShowAuthModal(true);
      return;
    }
    setOrderedWorks(works);
    setIsOrderingMode(true);
  };

  const handleDeleteModeClick = async () => {
    const isAuthenticated = await verifyAdminSession();

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (isDeleteMode && selectedWorks.size > 0) {
      if (window.confirm(`선택한 ${selectedWorks.size}개의 작품을 삭제하시겠습니까?`)) {
        setIsDeleting(true);
        try {
          const remainingWorks = works
            .filter((work) => !selectedWorks.has(work.id))
            .map((work, index, array) => ({
              ...work,
              prevWork: index === 0 ? null : array[index - 1].id,
              nextWork: index === array.length - 1 ? null : array[index + 1].id,
            }));

          await updateWorks(remainingWorks);
          setWorks(remainingWorks);
        } catch {
          toast.error("작품 삭제 중 오류가 발생했습니다.");
        } finally {
          setIsDeleting(false);
        }
      }
    }
    setIsDeleteMode(!isDeleteMode);
    setSelectedWorks(new Set());
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(orderedWorks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedWorks(items);
    setHasOrderChanges(true);
  };

  const handleSaveOrder = async () => {
    try {
      const updatedWorks = orderedWorks.map((work, index, array) => ({
        ...work,
        prevWork: index === 0 ? null : array[index - 1].id,
        nextWork: index === array.length - 1 ? null : array[index + 1].id,
      }));

      await updateWorks(updatedWorks);
      setWorks(updatedWorks);
      setIsOrderingMode(false);
      setHasOrderChanges(false);
    } catch {
      toast.error("순서 변경 저장에 실패했습니다.");
    }
  };

  const toggleWorkSelection = (workId: string) => {
    const newSelection = new Set(selectedWorks);
    if (newSelection.has(workId)) {
      newSelection.delete(workId);
    } else {
      newSelection.add(workId);
    }
    setSelectedWorks(newSelection);
  };

  const resetAllModes = () => {
    setIsDeleteMode(false);
    setIsOrderingMode(false);
    setSelectedWorks(new Set());
    setOrderedWorks(works);
    setHasOrderChanges(false);
  };

  const handleAdminControlsToggle = () => {
    if (showAdminControls) {
      resetAllModes();
    }
    setShowAdminControls(!showAdminControls);
  };

  const handleAddWorkComplete = (newWork: Work) => {
    setWorks((prev) => [...prev, newWork]);
    setShowAddModal(false);
  };

  return (
    <div className="max-w-[1300px] mx-auto px-4">
      <div className="flex justify-center relative items-center mb-8">
        <h1 className="text-center text-sm font-extrabold text-gray-600 mb-12">{title}</h1>
        <div className="absolute hidden right-0 items-center gap-2 md:flex">
          <div className={`flex gap-2 transition-all duration-300 ${showAdminControls ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0 pointer-events-none"}`}>
            {!isDeleteMode && !isOrderingMode && (
              <div className={`transition-all duration-300 ${isDeleteMode || isOrderingMode ? "w-0 opacity-0 scale-0" : "w-auto opacity-100 scale-100"}`}>
                <button onClick={handleAddWorkClick} className="p-2 bg-gray-600 text-white rounded-full hover:bg-black flex items-center justify-center" title="새 작품 추가">
                  <FaPlus className="w-4 h-4" />
                </button>
              </div>
            )}
            {!isOrderingMode && (
              <button
                onClick={handleDeleteModeClick}
                className={`p-2 text-white rounded-full flex items-center justify-center transition-colors duration-300 ${isDeleteMode ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-black"}`}
                title={isDeleteMode ? "선택한 작품 삭제" : "작품 삭제 모드"}
                disabled={isDeleting}
              >
                <FaTrash className="w-4 h-4" />
              </button>
            )}
            {!isDeleteMode && (
              <button
                onClick={isOrderingMode ? handleSaveOrder : handleOrderingModeClick}
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
            onClick={handleAdminControlsToggle}
            className="p-2 bg-gray-600 text-white rounded-full hover:bg-black flex items-center justify-center z-10"
            title={showAdminControls ? "관리자 메뉴 닫기" : "관리자 메뉴 열기"}
          >
            {showAdminControls ? <FaTimes className="w-4 h-4" /> : <FaCog className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="works" direction="horizontal">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {(isOrderingMode ? orderedWorks : works).map((work, index) => (
                <Draggable key={work.id} draggableId={work.id} index={index} isDragDisabled={!isOrderingMode}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        zIndex: snapshot.isDragging ? 1000 : "auto",
                      }}
                      onClick={() => {
                        if (!isDeleteMode && !isOrderingMode) {
                          setSelectedWork(work.id);
                        }
                      }}
                    >
                      {work ? (
                        <WorkCard {...work} isDeleteMode={isDeleteMode} isOrderingMode={isOrderingMode} isSelected={selectedWorks.has(work.id)} onSelect={() => toggleWorkSelection(work.id)} />
                      ) : (
                        <WorkCardSkeleton key={index} />
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {works.length == 0 && <EmptyState />}
      {showAddModal && <AddWorkModal onClose={() => setShowAddModal(false)} onComplete={handleAddWorkComplete} />}
      {showAuthModal && (
        <AdminAuthModal
          onAuth={() => {
            setShowAuthModal(false);
            setShowAddModal(true);
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}
      {selectedWork && <WorkModal work={works.find((w) => w.id === selectedWork)!} onClose={() => setSelectedWork(null)} />}
    </div>
  );
}
