"use client";

import { useState } from "react";
import { setAdminSession } from "@/lib/client-actions";

interface AdminAuthModalProps {
  onAuth: () => void;
  onClose: () => void;
}

export default function AdminAuthModal({ onAuth, onClose }: AdminAuthModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await setAdminSession(password);
      if (response) {
        onAuth();
      } else {
        setError("잘못된 비밀번호입니다.");
      }
    } catch (error) {
      setError("인증 과정에서 오류가 발생했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-black">관리자 인증</h2>
        <form onSubmit={handleSubmit}>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2 mb-4 text-black" placeholder="비밀번호를 입력하세요" />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
              취소
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              확인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
