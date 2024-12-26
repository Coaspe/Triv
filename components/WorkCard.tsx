"use client";

import { useState } from "react";
import Image from "next/image";

interface Work {
  title: string;
  youtubeId: string;
}

interface WorkCardProps {
  work: Work;
  onClick: () => void;
}

export default function WorkCard({ work, onClick }: WorkCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const thumbnailUrl = `https://img.youtube.com/vi/${work.youtubeId}/maxresdefault.jpg`;

  return (
    <div className="relative aspect-video cursor-pointer group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={onClick}>
      <Image src={thumbnailUrl} alt={work.title} fill className="object-cover" />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300" />

      {/* Title */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-white text-center px-4 text-lg uppercase">{work.title}</h3>
      </div>
    </div>
  );
}
