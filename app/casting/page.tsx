"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Subtitle from "../../components/Subtitle";
import { FaFileUpload, FaTrash, FaFile } from "react-icons/fa";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/haansofthwp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function CastingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    message: "",
    agreement: true,
    portfolio: null as File | null,
    portfolioName: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError("");

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("지원하지 않는 파일 형식입니다.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError("파일 크기는 10MB를 초과할 수 없습니다.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      portfolio: file,
      portfolioName: file.name,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "portfolio" && key !== "portfolioName") {
          formDataToSend.append(key, value?.toString() || "");
        }
      });

      if (formData.portfolio) {
        formDataToSend.append("portfolio", formData.portfolio);
      }

      const response = await fetch("/api/send-email", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("전송에 실패했습니다.");
      }

      toast.success("문의가 성공적으로 전송되었습니다.");
      // 폼 초기화
      setFormData({
        name: "",
        email: "",
        phone: "",
        position: "",
        message: "",
        agreement: true,
        portfolio: null,
        portfolioName: "",
      });
    } catch (error) {
      toast.error("전송에 실패했습니다. 다시 시도해주세요.");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <Subtitle title={"CASTING"} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 문의제목 */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            문의제목
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="text-gray-700 w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition"
            required
          />
        </div>

        {/* 이메일 */}
        <div className="space-y-2 text-gray-700">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            type="email"
            id="email"
            placeholder="예) master@domain.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="text-gray-700 w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition"
            required
          />
        </div>

        {/* 휴대폰 */}
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            휴대폰
          </label>
          <input
            type="tel"
            id="phone"
            placeholder="예) 000-0000-0000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="text-gray-700 w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition"
            required
          />
        </div>

        {/* 직성자 */}
        <div className="space-y-2">
          <label htmlFor="position" className="block text-sm font-medium text-gray-700">
            작성자
          </label>
          <input
            type="text"
            id="position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="text-gray-700 w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition"
            required
          />
        </div>

        {/* 내용 */}
        <div className="space-y-2">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            내용
          </label>
          <textarea
            id="message"
            rows={6}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="text-gray-700 w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition"
            required
          />
        </div>

        {/* 개인정보 수집 및 이용 동의 */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input type="radio" name="agreement" checked={formData.agreement} onChange={(e) => setFormData({ ...formData, agreement: e.target.checked })} required />
            <span className="text-sm text-gray-600">개인정보 수집 및 이용 동의</span>
          </label>
        </div>

        {/* 포트폴리오 파일 업로드 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">포트폴리오</label>
          {fileError && <p className="text-sm text-red-500">{fileError}</p>}

          {formData.portfolio ? (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FaFile className="text-gray-500" />
                <span className="text-sm text-gray-700">{formData.portfolioName}</span>
              </div>
              <button type="button" onClick={() => setFormData((prev) => ({ ...prev, portfolio: null, portfolioName: "" }))} className="p-1 text-gray-500 hover:text-red-500 transition-colors">
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FaFileUpload className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">클릭</span>하여 파일 업로드
                </p>
                <p className="text-xs text-gray-500">PDF, PPT, PPTX, HWP, DOC, DOCX (최대 10MB)</p>
              </div>
              <input type="file" className="hidden" accept=".pdf,.ppt,.pptx,.hwp,.doc,.docx" onChange={handleFileChange} />
            </label>
          )}
        </div>

        {/* 제출 버튼 */}
        <div className="flex space-y-2 justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-2 bg-white text-black border border-black 
              hover:bg-black hover:text-white transition-colors duration-300
              ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "전송 중..." : "보내기"}
          </button>
        </div>
      </form>
    </div>
  );
}
