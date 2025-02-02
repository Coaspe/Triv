"use client";

import { FaInstagram } from "react-icons/fa";
import ContactMap from "../../components/ContactMap";

export default function ContactPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4">
      <h1 className="text-center text-sm font-extrabold text-black mb-12">CONTACT</h1>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* 회사 정보 */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-black mb-6">Triv</h2>

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

            {/* <div>
              <h3 className="font-extrabold text-black mb-1">TEL.</h3>
              <p className="text-sm text-black">070-0000-0000</p>
            </div> */}

            <div>
              <h3 className="font-extrabold text-black mb-1">E-MAIL.</h3>
              <p className="text-sm text-black">eyuri12@naver.com</p>
            </div>

            <div className="pt-4">
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="inline-block text-black hover:opacity-70 transition-opacity">
                <FaInstagram size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* 구글 맵 */}
        <ContactMap />
      </div>
    </div>
  );
}
