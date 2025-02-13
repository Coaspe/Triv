/** @format */

"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/autoplay";

const slides = [
  {
    id: 1,
    image: "/images/yul/mm5.jpeg",
    name: "YURI",
    category: "MODEL",
  },
  {
    id: 2,
    image: "/images/yul/mm4.jpeg",
    name: "YURI",
    category: "MODEL",
  },
  {
    id: 3,
    image: "/images/yul/mm5.jpeg",
    name: "YURI",
    category: "MODEL",
  },
];

const services = [
  {
    icon: "visibility",
    title: "Creator Entertainment",
    description: "크리에이터 엔터테인먼트",
  },
  {
    icon: "smart_display",
    title: "MCN",
    description: "멀티 채널 네트워크",
  },
  {
    icon: "lightbulb",
    title: "Tiktok Agency",
    description: "틱톡 에이전시",
  },
  {
    icon: "campaign",
    title: "Advertise Agency",
    description: "광고 에이전시",
  },
];

export default function Home() {
  const [randomDelays, setRandomDelays] = useState([]); // 상태를 사용하여 randomDelays를 관리

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/home`);
      const data = await response.json();
      setRandomDelays(data.randomDelays); // 받아온 데이터를 상태에 저장
    };

    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-white text-black">
      {/* 캐러셀 섹션 - 모바일에서는 숨김 */}
      <div className="w-full max-w-[800px] mx-auto animate-fade-in">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="w-full">
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="h-[400px] flex flex-col md:h-[600px]">
                {/* 이미지 래퍼: 남은 공간을 모두 차지하고 내부에서 이미지 중앙 정렬 */}
                <div className="flex-1 overflow-hidden flex items-center justify-center">
                  <Image
                    className="align-middle"
                    src={slide.image}
                    alt={slide.name}
                    width={800}
                    height={0}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    priority
                  />
                </div>
                {/* 텍스트 영역: 하단에 위치 */}
                <div className="text-center py-4">
                  <h2 className="text-sm text-black">{slide.name}</h2>
                  <p className="text-xs text-black">{slide.category}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Services 섹션 */}
      <div className="w-full bg-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          {/* 1) h2 페이드 인 (약간의 딜레이로 여유롭게 나타나도록) */}
          <h2 className="font-bold text-center text-lg mb-12 md:text-3xl fade-in" style={{ animationDelay: "0.3s" }}>
            크리에이티브의 새로운 시대를 열어갑니다
          </h2>

          {/* 2) services가 무작위 순서로 페이드 인 */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
            {services.map((service, index) => {
              const randomDelay = randomDelays[index] + "s";

              return (
                <button
                  key={index}
                  className={`
                    group relative bg-white p-6 border border-gray-200 rounded-lg
                    hover:shadow-xl transition-all duration-300 ease-in-out
                    transform hover:-translate-y-2 flex flex-col items-center justify-center
                    min-h-[160px] min-w-[160px] sm:min-h-[180px] sm:min-w-[180px] md:min-h-[200px] md:min-w-[200px]
                    fade-in  /* <-- 키프레임 적용 */
                  `}
                  style={{
                    animationDelay: randomDelay,
                  }}>
                  <span
                    className="material-icons text-4xl mb-4
                      group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </span>
                  <h3 className="text-base font-semibold mb-2 md:text-lg">{service.title}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                  <div
                    className="absolute inset-0 bg-black bg-opacity-0
                      group-hover:bg-opacity-5 transition-all duration-300
                      rounded-lg pointer-events-none"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FILM 섹션 */}
      <div className="mt-10 text-center">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-gray-500 font-bold">FILM</h2>
          <div className="w-8 h-[1px] bg-gray-300 mt-2"></div>
        </div>
        <div className="w-full max-w-[1000px] mx-auto px-4">
          <div className="relative pt-[56.25%]">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/xAK2664oawk"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>

      {/* Instagram 섹션 */}
      <div className="mt-20 text-center">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-gray-500 font-bold">INSTAGRAM</h2>
          <div className="w-8 h-[1px] bg-gray-300 mt-2"></div>
        </div>
        <div className="w-full max-w-[1200px] mx-auto px-4 grid grid-cols-3 gap-4">{/* Instagram 피드 */}</div>
      </div>
    </main>
  );
}
