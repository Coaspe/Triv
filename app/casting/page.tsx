"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Subtitle from "../../components/Subtitle";

export default function CastingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    contactMethod: "email", // email or phone
    position: "",
    message: "",
    agreement: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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
        contactMethod: "email",
        position: "",
        message: "",
        agreement: true,
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
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition"
            required
          />
        </div>

        {/* 이메일 */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            type="email"
            id="email"
            placeholder="예) master@domain.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition"
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
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition"
            required
          />
        </div>

        {/* 답변수신방식 */}
        {/* <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">답변수신방식</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="contactMethod"
                value="email"
                checked={formData.contactMethod === "email"}
                onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">이메일</span>
            </label>
          </div>
        </div> */}

        {/* 직성자 */}
        <div className="space-y-2">
          <label htmlFor="position" className="block text-sm font-medium text-gray-700">
            직성자
          </label>
          <input
            type="text"
            id="position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition"
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
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition"
            required
          />
        </div>

        {/* 개인정��� 수집 및 이용 동의 */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input type="radio" name="agreement" checked={formData.agreement} onChange={(e) => setFormData({ ...formData, agreement: e.target.checked })} required />
            <span className="text-sm text-gray-600">개인정보 수집 및 이용 동의</span>
          </label>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-center">
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
