import { PLAYFAIR_DISPLAY_SC } from "@/app/constant";
import Link from "next/link";

const Navigation = () => {
  return (
    <>
      <div className="flex justify-center mb-4 pt-8">
        <Link href="/">
          <h1 className={`${PLAYFAIR_DISPLAY_SC.className} py-6 text-black text-5xl tracking-widest select-none cursor-pointer`}>TRIV</h1>
        </Link>
      </div>
      <nav className="flex justify-center mb-16 pt-4 text-xs">
        <ul className="flex space-x-8">
          <li>
            <Link href="/men" className="text-black hover:text-gray-600">
              MEN
            </Link>
          </li>
          <li>
            <Link href="/women" className="text-black hover:text-gray-600">
              WOMEN
            </Link>
          </li>
          <li>
            <Link href="/international" className="text-black hover:text-gray-600">
              INTERNATIONAL
            </Link>
          </li>
          <li>
            <Link href="/works" className="text-black hover:text-gray-600">
              WORKS
            </Link>
          </li>
          <li>
            <Link href="/casting" className="text-black hover:text-gray-600">
              CASTING
            </Link>
          </li>
          <li>
            <Link href="/contact" className="text-black hover:text-gray-600">
              CONTACT
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Navigation;
