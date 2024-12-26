"use client";

interface Work {
  title: string;
  youtubeId: string;
}

interface WorkModalProps {
  work: Work;
  onClose: () => void;
}

export default function WorkModal({ work, onClose }: WorkModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-75" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-4xl mx-4">
        {/* Close Button */}
        <button className="absolute -top-10 right-0 text-white text-xl p-2" onClick={onClose}>
          ✕
        </button>

        {/* YouTube Player */}
        <div className="relative aspect-video bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${work.youtubeId}?autoplay=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
