"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/autoplay";

const slides = [
  {
    id: 1,
    image: "/images/carousel/model1.jpg",
    name: "SHIN NA YEONG",
    category: "MODEL",
  },
  {
    id: 2,
    image: "/images/carousel/model3.jpg",
    name: "KIM NA YEONG",
    category: "MODEL",
  },
  {
    id: 3,
    image: "/images/carousel/model2.jpg",
    name: "KIM NA YEONG",
    category: "MODEL",
  },
  // 추가 슬라이드 데이터
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      {/* 캐러셀 섹션 */}
      <div className="w-full max-w-[800px] mx-auto px-4">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{
            crossFade: true,
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="w-full"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id} className="swiper-slide-content">
              <div className="flex flex-col items-center">
                <Image
                  src={slide.image}
                  alt={slide.name}
                  width={800}
                  height={0}
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "533px",
                    objectFit: "contain",
                  }}
                  priority
                />
                <div className="text-center py-4">
                  <h2 className="text-sm text-black">{slide.name}</h2>
                  <p className="text-xs text-black">{slide.category}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 필름 섹션 */}
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
