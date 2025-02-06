/** @format */

import type { Config } from "tailwindcss";

export default {
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        slide: {
          "0%": { transform: "translateX(-100%)" },
          "85%": { transform: "translateX(-20%)" }, // 중간에서 느리게
          "100%": { transform: "translateX(100%)" }, // 오른쪽 끝은 빨리
        },
      },
      animation: {
        slide: "slide 2s ease-in-out infinite", // ease-in-out 으로 속도 변화 주기
      },
      plugins: [],
    },
  },
  plugins: [],
} satisfies Config;
