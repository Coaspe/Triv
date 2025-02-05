import Link from "next/link";

const Navigation = () => {
  return (
    <>
      {/* ... 기존 코드 ... */}
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
