"use client";

import { useState } from "react";
import Link from "next/link";
import { PLAYFAIR_DISPLAY_SC } from "@/app/constant";

const NavbarLink = ({ href, text, onClick }: { href: string; text: string; onClick: () => void }) => {
  return (
    <Link href={href} className="block text-sm px-3 py-2 text-black hover:bg-gray-50" onClick={onClick}>
      {text}
    </Link>
  );
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white z-50 text-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center px-4 h-16">
            {/* 로고 */}
            <Link href="/" className="flex-shrink-0">
              <h1 className={`${PLAYFAIR_DISPLAY_SC.className} text-2xl tracking-wider`}>TRIV</h1>
            </Link>

            {/* 모바일 메뉴 버튼 */}
            <button className="p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span className="material-icons">{isMenuOpen ? "close" : "menu"}</span>
            </button>
          </div>

          {/* 모바일 메뉴 드롭다운 */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              <NavbarLink href="/men" text="MEN" onClick={() => setIsMenuOpen(false)} />
              <NavbarLink href="/women" text="WOMEN" onClick={() => setIsMenuOpen(false)} />
              <NavbarLink href="/international" text="INTERNATIONAL" onClick={() => setIsMenuOpen(false)} />
              <NavbarLink href="/works" text="WORKS" onClick={() => setIsMenuOpen(false)} />
              <NavbarLink href="/casting" text="CASTING" onClick={() => setIsMenuOpen(false)} />
              <NavbarLink href="/contact" text="CONTACT" onClick={() => setIsMenuOpen(false)} />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
