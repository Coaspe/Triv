/** @format */

import { ModelDetail } from "@/app/types";
import Image from "next/image";
import Link from "next/link";
import { FaUserCircle, FaArrowsAlt } from "react-icons/fa";
import { useState } from "react";
import AdminAuthModal from "./AdminAuthModal";

interface ModelCardProps {
  model: ModelDetail;
  isDeleteMode?: boolean;
  isOrderingMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  profileImage?: string;
}

export default function ModelCard({ model, isDeleteMode, isOrderingMode, isSelected, onSelect, profileImage }: ModelCardProps) {
  const { id, name } = model;
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (isDeleteMode) {
      e.preventDefault();
      onSelect?.();
    }
  };

  return (
    <Link href={`/models/${id}`} className="block" onClick={handleClick}>
      <div className={`model-card max-w-[300px] w-full mx-auto group cursor-pointer relative ${isOrderingMode ? "cursor-move" : ""}`}>
        <div className="relative w-full aspect-[4/5] bg-gray-50 overflow-hidden">
          <>
            {!profileImage ? (
              <div className="relative group aspect-[3/4] bg-gray-100 flex items-center justify-center">
                <FaUserCircle className="w-20 h-20 text-gray-400" />
              </div>
            ) : (
              <Image
                src={`${profileImage}&format=webp&quality=80`}
                alt={name}
                fill
                style={{
                  objectFit: "cover",
                  objectPosition: "center center",
                }}
                className="transition-transform duration-700 ease-in-out group-hover:scale-110 relative"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
                priority
              />
            )}
            {isOrderingMode && (
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-50 transition-opacity flex items-center justify-center">
                <FaArrowsAlt className="w-6 h-6 text-white" />
              </div>
            )}
            {isDeleteMode && (
              <div className={`absolute inset-0 bg-black bg-opacity-50 transition-opacity ${isSelected ? "opacity-100" : "opacity-0"} group-hover:opacity-50`}>
                <div className="absolute top-2 right-2">
                  <div className={`w-6 h-6 border-2 rounded-full ${isSelected ? "bg-red-500 border-red-500" : "border-white"}`} />
                </div>
              </div>
            )}
          </>
          <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-10" />
        </div>
        <h3 className="text-center mt-4 text-sm transition-colors duration-700 ease-in-out text-black md:text-gray-300 group-hover:text-gray-600">{name}</h3>

        {showAuthModal && (
          <AdminAuthModal
            onAuth={() => {
              setShowAuthModal(false);
            }}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </div>
    </Link>
  );
}
