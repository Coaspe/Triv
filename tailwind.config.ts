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
        "bounce-twice": {
          "0%, 100%": {
            transform: "translateY(0%)",
            "animation-timing-function": "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(-25%)",
            "animation-timing-function": "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
      },
      animation: {
        slide: "slide 2s ease-in-out infinite", // ease-in-out 으로 속도 변화 주기
        "bounce-twice": "bounce-twice 1s ease-in-out 2",
      },
      plugins: [],
    },
  },
  plugins: [],
} satisfies Config;
