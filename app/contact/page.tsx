"use client";

import { FaInstagram } from "react-icons/fa";
import ContactMap from "../../components/ContactMap";

export default function ContactPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      {/* 메인 헤더: CONTACT */}
      <h1 className="text-center text-sm font-extrabold text-gray-600 mb-12">CONTACT</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 회사 정보 섹션 */}
        <div className="space-y-6 text-center md:text-left">
          {/* 필요하다면 “Triv” 소제목을 유지하되 작게 조정 */}
          {/* <h2 className="text-lg md:text-xl font-bold text-black mb-2">Triv</h2> */}

          <div className="space-y-4">
            <div>
              <h3 className="font-extrabold text-black mb-1">ADDRESS.</h3>
              <p className="text-sm text-black">서울특별시 강남구 도산대로 210 6층</p>
              <p className="text-sm text-black">6th Floor, 210 Dosan-daero, Gangnam-gu, Seoul</p>
            </div>

            <div>
              <h3 className="font-extrabold text-black mb-1">OWNER.</h3>
              <p className="text-sm text-black">김라휘</p>
            </div>

            <div>
              <h3 className="font-extrabold text-black mb-1">E-MAIL.</h3>
              <p className="text-sm text-black">eyuri12@naver.com</p>
            </div>

            {/* 인스타그램 아이콘 */}
            <div className="pt-4">
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="inline-block text-black hover:opacity-70 transition-opacity">
                <FaInstagram size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* 구글 맵 섹션 (지도가 정상 로드되지 않아도 레이아웃만 확인) */}
        <ContactMap />
      </div>
    </div>
  );
}
