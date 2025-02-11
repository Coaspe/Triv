/** @format */
function WorkCardSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center gap-1 aspect-video bg-gray-200 animate-pulse overflow-hidden relative">
      {/* 작은 박스 (왼쪽 → 오른쪽 애니메이션) */}
      <div className="w-1/2 h-[5px] md:w-[200px] md:h-[10px] bg-gray-300 rounded-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 animate-slide" />
      </div>
    </div>
  );
}

export default function WorkPageSkeleton() {
  return (
    <div className="max-w-[1300px] mx-auto px-4">
      <div className="justify-center relative items-center mb-8 md:flex">
        <h1 className="text-center text-sm font-extrabold text-gray-600 mb-12">WORK</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {Array.from(Array(8).keys()).map((index) => (
          <WorkCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
