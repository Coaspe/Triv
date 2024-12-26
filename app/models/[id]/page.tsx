"use client";

import { model_detail_creator } from "@/utils";
import Image from "next/image";
import { useState, use } from "react";

export default function ModelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowModal(true);
  };
  const { id } = use(params); // use()로 params 언랩
  const modelData = model_detail_creator(id);

  return (
    <div className="max-w-[1200px] mx-auto px-6 pb-6 text-black rounded-lg">
      {/* 메인 섹션 */}
      <div className="flex flex-col md:flex-row gap-12 mb-16">
        {/* 메인 이미지 */}
        <div className="md:w-1/2">
          <div className="relative aspect-[3/4] overflow-hidden shadow-md">
            <Image src={modelData.images[0]} alt={modelData.name} fill style={{ objectFit: "cover" }} priority />
          </div>
        </div>

        {/* 모델 정보 */}
        <div className="md:w-1/2 ml-5">
          <h1 className="text-4xl font-bold mb-6">{modelData.name}</h1>

          <div className="space-y-2 mb-8 text-lg">
            <p>
              <span className="font-semibold">Height:</span> {modelData.height}
            </p>
            <p>
              <span className="font-semibold">Weight:</span> {modelData.weight}
            </p>
            <p>
              <span className="font-semibold">Shoe Size:</span> {modelData.size}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 border-b border-gray-600 pb-2">SHOW</h2>
            <ul className="space-y-2">
              {modelData.shows.map((show, index) => (
                <li key={index} className="text-sm text-black">
                  {show}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 border-b border-gray-600 pb-2">Modeling Info</h2>
            <ul className="space-y-2">
              {modelData.modelingInfo.map((info, index) => (
                <li key={index} className="text-sm text-black">
                  {info}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 추가 이미지 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {modelData.images.slice(1).map((image, index) => (
          <div
            key={index}
            className="cursor-pointer relative aspect-[3/4] rounded-lg overflow-hidden shadow-md hover:scale-105 transition-transform duration-300"
            onClick={() => handleImageClick(index + 1)}
          >
            <Image src={image} alt={`${modelData.name} ${index + 2}`} fill style={{ objectFit: "cover" }} />
          </div>
        ))}
      </div>
      {/* 이미지 모달 */}
      {showModal && selectedImageIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          {/* 닫기 버튼 */}
          <button className="absolute top-4 right-4 text-white text-xl p-2" onClick={() => setShowModal(false)}>
            ✕
          </button>

          {/* 이전 버튼 */}
          <button className="absolute left-4 text-white text-4xl p-4" onClick={() => setSelectedImageIndex((prev) => (prev !== null ? (prev > 1 ? prev - 1 : modelData.images.length - 1) : null))}>
            ‹
          </button>

          {/* 이미지 */}
          <div className="relative h-[80vh] w-[800px] max-w-[90vw]">
            <Image
              src={modelData.images[selectedImageIndex]}
              alt={`${modelData.name} ${selectedImageIndex + 1}`}
              fill
              style={{
                objectFit: "contain",
                objectPosition: "center center",
              }}
              priority
            />
          </div>

          {/* 다음 버튼 */}
          <button className="absolute right-4 text-white text-4xl p-4" onClick={() => setSelectedImageIndex((prev) => (prev !== null ? (prev < modelData.images.length - 1 ? prev + 1 : 0) : null))}>
            ›
          </button>

          {/* 현재 이미지 번호 표시 */}
          <div className="absolute bottom-4 text-white">
            {selectedImageIndex + 1} / {modelData.images.length}
          </div>
        </div>
      )}
    </div>
  );
}
