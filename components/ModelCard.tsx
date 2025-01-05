/** @format */

import { ModelDetails } from "@/app/types";
import Image from "next/image";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";

const ModelCard = ({ name, images, signedImageUrls, displayName, id }: ModelDetails) => {
  return (
    <Link href={`/models/${id}`} className="block">
      <div className="model-card max-w-[300px] w-full mx-auto group cursor-pointer">
        <div className="relative w-full aspect-[4/5] bg-gray-50 overflow-hidden">
          {images && images.length === 0 ? (
            <div className="relative group aspect-[3/4] bg-gray-100 flex items-center justify-center">
              <FaUserCircle className="w-20 h-20 text-gray-400" />
            </div>
          ) : (
            <Image
              src={images && signedImageUrls ? signedImageUrls[images[0]] : ""}
              alt={name}
              fill
              style={{
                objectFit: "cover",
                objectPosition: "center center",
              }}
              className="transition-transform duration-700 ease-in-out group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
            />
          )}
          <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-10" />
        </div>
        <h3 className="text-center mt-4 text-sm transition-colors duration-700 ease-in-out text-black md:text-gray-300 group-hover:text-gray-600">{displayName}</h3>
      </div>
    </Link>
  );
};

export default ModelCard;
