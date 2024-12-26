import Link from "next/link";

const Navigation = () => {
  return (
    <nav className="flex justify-center mb-16 pt-4 text-xs">
      <ul className="flex space-x-8">
        <li>
          <a href="/men" className="text-black hover:text-gray-600">
            MAN
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
  );
};

export default Navigation;
