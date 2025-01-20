/** @format */

"use client";

import { Work } from "@/app/types";
import Image from "next/image";
import { FaArrowsAlt } from "react-icons/fa";

interface WorkCardProps extends Work {
  isDeleteMode?: boolean;
  isOrderingMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function WorkCard({ id, title, isDeleteMode, isOrderingMode, isSelected, onSelect }: WorkCardProps) {
  const thumbnailUrl = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

  const handleClick = (e: React.MouseEvent) => {
    if (isDeleteMode) {
      e.preventDefault();
      onSelect?.();
    }
  };

  return (
    <div onClick={handleClick} className={`relative aspect-video cursor-pointer group ${isOrderingMode ? "cursor-move" : ""}`}>
      <Image src={thumbnailUrl} alt={title} className="object-cover" />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300" />

      {/* Title */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-white text-center px-4 text-lg uppercase">{title}</h3>
      </div>

      {/* Delete Mode Overlay */}
      {isDeleteMode && (
        <div className={`absolute inset-0 bg-black bg-opacity-50 transition-opacity ${isSelected ? "opacity-100" : "opacity-0"} group-hover:opacity-50`}>
          <div className="absolute top-2 right-2">
            <div className={`w-6 h-6 border-2 rounded-full ${isSelected ? "bg-red-500 border-red-500" : "border-white"}`} />
          </div>
        </div>
      )}

      {/* Ordering Mode Overlay */}
      {isOrderingMode && (
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-50 transition-opacity flex items-center justify-center">
          <FaArrowsAlt className="w-6 h-6 text-white" />
        </div>
      )}
    </div>
  );
}
