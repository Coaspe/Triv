import type { Metadata } from "next";
import { Nanum_Myeongjo } from "next/font/google";
import "@/globals.css";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className={`${nanumMyeongjo.className} flex flex-col min-h-screen`}>
        <div className="md:hidden">
          <Navbar />
        </div>

        <div className="hidden md:block">
          <Navigation />
        </div>

        <div className="md:pt-0 pt-16">
          <main className="flex-grow">{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
