"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white z-50 text-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center px-4 h-16">
            {/* 로고 */}
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold">TRIV</h1>
            </Link>

            {/* 모바일 메뉴 버튼 */}
            <button className="p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span className="material-icons">{isMenuOpen ? "close" : "menu"}</span>
            </button>
          </div>

          {/* 모바일 메뉴 드롭다운 */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              <Link href="/men" className="block px-3 py-2 text-black hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
                MEN
              </Link>
              <Link href="/women" className="block px-3 py-2 text-black hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
                WOMEN
              </Link>
              <Link href="/international" className="block px-3 py-2 text-black hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
                INTERNATIONAL
              </Link>
              <Link href="/works" className="block px-3 py-2 text-black hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
                WORKS
              </Link>
              <Link href="/casting" className="block px-3 py-2 text-black hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
                CASTING
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
