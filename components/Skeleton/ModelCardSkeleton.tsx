export default function ModelCardSkeleton() {
  return (
    <div className="w-full h-full flex flex-col items-center animate-pulse">
      {/* 이미지 스켈레톤 */}
      <div className="w-full aspect-[3/4] md:w-[250px] bg-gray-200 mb-4"></div>
      {/* 이름 스켈레톤 */}
      <div className="h-4 w-24 bg-gray-200 mb-2"></div>
      {/* 영문 이름 스켈레톤 */}
      <div className="h-3 w-20 bg-gray-200"></div>
    </div>
  );
}
