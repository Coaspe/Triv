export default function ModelDetailSkeleton() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 pb-6 animate-pulse">
      <div className="flex flex-col md:flex-row gap-12 mb-16">
        {/* 메인 이미지 스켈레톤 */}
        <div className="md:w-1/2">
          <div className="relative aspect-[3/4] bg-gray-200"></div>
        </div>

        {/* 모델 정보 스켈레톤 */}
        <div className="md:w-1/2 space-y-4">
          {/* 이름 스켈레톤 */}
          <div className="h-8 w-40 bg-gray-200"></div>

          {/* 기본 정보 스켈레톤 */}
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200"></div>
            <div className="h-4 w-32 bg-gray-200"></div>
            <div className="h-4 w-28 bg-gray-200"></div>
          </div>

          {/* 모델링 정보 스켈레톤 */}
          <div className="space-y-2 mt-6">
            <div className="h-4 w-full bg-gray-200"></div>
            <div className="h-4 w-3/4 bg-gray-200"></div>
            <div className="h-4 w-5/6 bg-gray-200"></div>
          </div>

          {/* SNS 링크 스켈레톤 */}
          <div className="flex gap-4 mt-6">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* 추가 이미지 그리드 스켈레톤 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[3/4] bg-gray-200"></div>
        ))}
      </div>
    </div>
  );
}
