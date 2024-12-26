"use client";

import { useState } from "react";
import WorkCard from "../../components/WorkCard";
import WorkModal from "../../components/WorkModal";

const works = [
  {
    youtubeId: "Qkj9BU7lE6M",
    title: "RESURRECTION 2018 s/s seoul fashionweek (ARLING)",
  },
  {
    youtubeId: "QcPQxOOWGFc",
    title: "CENTREAL FITNESS",
  },
  {
    youtubeId: "eaCuwIbntX8",
    title: "PARTsPARTs",
  },
  // ... 더 많은 작품 데이터
];

export default function WorksPage() {
  const [selectedWork, setSelectedWork] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-center text-sm font-extrabold text-black mb-12">WORKS</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {works.map((work) => (
          <WorkCard key={work.youtubeId} work={work} onClick={() => setSelectedWork(work.youtubeId)} />
        ))}
      </div>

      {selectedWork && <WorkModal work={works.find((w) => w.youtubeId === selectedWork)!} onClose={() => setSelectedWork(null)} />}
    </div>
  );
}
