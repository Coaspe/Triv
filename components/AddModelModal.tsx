"use client";

import { useState } from "react";
import { Category } from "@/app/types";
import { createModel } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { FaXmark } from "react-icons/fa6";
import { useModelStore } from "@/lib/store/modelStore";

interface AddModelModalProps {
  category: Category;
  onClose: () => void;
}

export default function AddModelModal({ category, onClose }: AddModelModalProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setModel } = useModelStore();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsLoading(true);
      const model = await createModel(name, category);
      setModel(model);
      router.push(`/models/${model.id}`);
    } catch (error) {
      console.error("Failed to create model:", error);
      alert("크리에이터 생성에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div
        className="bg-white w-full sm:w-[400px] sm:rounded-2xl rounded-t-2xl p-6 
        animate-in slide-in-from-bottom duration-300"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-black">크리에이터 추가</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <FaXmark className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 text-lg  text-black
                border-0 border-b-2 border-gray-200 
                focus:border-b-2 focus:border-gray-800 focus:ring-0 
                transition-colors
                placeholder:text-gray-400
                outline-none"
              placeholder="크리에이터의 이름을 입력하세요"
              required
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl 
                hover:bg-gray-200 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl 
                hover:bg-gray-800 transition-colors disabled:opacity-50
                font-medium flex items-center justify-center gap-2"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  생성 중...
                </>
              ) : (
                "확인"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
