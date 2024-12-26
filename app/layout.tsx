import type { Metadata } from "next";
import { Nanum_Myeongjo } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "@/globals.css";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

const nanumMyeongjo = Nanum_Myeongjo({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Triv Creator Agency",
  description: "Korean Creator Agency",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${nanumMyeongjo.className} flex flex-col min-h-screen`}>
        <div className="flex justify-center mb-4 pt-8">
          <Link href="/" className="cursor-pointer">
            <Image src="/images/unnamed.jpg" alt="Triv" width={400} height={400} priority />
          </Link>
        </div>
        <Navigation />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
