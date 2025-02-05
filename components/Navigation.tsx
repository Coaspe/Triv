import Link from "next/link";
import Image from "next/image";

const Navigation = () => {
  return (
    <>
      <div className="flex justify-center mb-4 pt-8">
        <Link href="/" className="cursor-pointer">
          <Image src="/images/unnamed.jpg" alt="Triv" width={400} height={400} priority />
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
      {/* ... 기존 코드 ... */}
    </>
  );
};

export default Navigation;
