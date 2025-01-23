import { useState } from "react";
import { createWork } from "@/lib/actions";
import Modal from "./Modal";
import { getYouTubeVideoID } from "@/lib/utils";
import { Work } from "@/app/types";

interface AddWorkModalProps {
  onClose: () => void;
  onComplete: (newWork: Work) => void;
}

export default function AddWorkModal({ onClose, onComplete }: AddWorkModalProps) {
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      if (!title.trim()) {
        setError("제목을 입력해주세요.");
        return;
      }
      const youtubeId = getYouTubeVideoID(youtubeUrl);
      if (!youtubeId) {
        setError("올바른 유튜브 URL을 입력해주세요.");
        return;
      }
      setIsSubmitting(true);
      onComplete(await createWork(title, youtubeId));
    } catch (error) {
      console.error("Failed to create work:", error);
      alert("작품 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-bold mb-4">새 작품 추가</h2>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            제목
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="작품 제목을 입력하세요"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700 mb-1">
            유튜브 URL
          </label>
          <input
            type="text"
            id="youtubeUrl"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="유튜브 영상 URL을 입력하세요"
            disabled={isSubmitting}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800" disabled={isSubmitting}>
            취소
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400" disabled={isSubmitting}>
            {isSubmitting ? "추가 중..." : "추가"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
