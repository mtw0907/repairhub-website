import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

// 한글 가독성을 위한 기본 서체. Geist는 라틴 문자만 지원해 한글은 OS 기본
// 서체로 대체 렌더링되던 문제를 해결하기 위해 Pretendard(가변 폰트)를 사용.
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "소리수리 — 음향기기·악기 수리 플랫폼",
  description: "전국 음향기기 및 악기 수리업체 검색, 비교, 예약, 견적, AI 상담 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
