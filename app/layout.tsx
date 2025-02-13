/** @format */

import type { Metadata } from "next";
import { Nanum_Myeongjo } from "next/font/google";
import "@/globals.css";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Toaster } from "react-hot-toast";

const nanumMyeongjo = Nanum_Myeongjo({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Triv",
  description: "Creator Agency",
  icons: {
    icon: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon-16x16.png", // 또는 배열 형태로 설정 가능
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className={`${nanumMyeongjo.className} flex flex-col min-h-screen`}>
        <Toaster toastOptions={{ style: { fontSize: "12px" } }} />
        <Navigation />
        <div className="flex-1">
          <main>{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
