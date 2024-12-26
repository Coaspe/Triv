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
            <a href="/men" className="text-black hover:text-gray-600">
              MEN
            </a>
          </li>
          <li>
            <a href="/women" className="text-black hover:text-gray-600">
              WOMEN
            </a>
          </li>
          <li>
            <a href="/international" className="text-black hover:text-gray-600">
              INTERNATIONAL
            </a>
          </li>
          <li>
            <a href="/works" className="text-black hover:text-gray-600">
              WORKS
            </a>
          </li>
          <li>
            <a href="/casting" className="text-black hover:text-gray-600">
              CASTING
            </a>
          </li>
          <li>
            <a href="/contact" className="text-black hover:text-gray-600">
              CONTACT
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Navigation;
