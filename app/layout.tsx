import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KCC홈씨씨 창호렌탈 | 한 번에 내지 말고 나누어 가볍게! KCC 본사 직영 시공으로 완성하는 스마트 렌탈",
  description: "목돈 걱정 없이 이자 부담 없는 스마트 장기 분납 렌탈로 KCC 홈씨씨 창호를 시공해 보세요. 본사 직영 시공과 13년 본사 보증 시스템까지 완벽히 제공합니다.",
  openGraph: {
    title: "KCC홈씨씨 창호렌탈 | 한 번에 내지 말고 나누어 가볍게! KCC 본사 직영 시공으로 완성하는 스마트 렌탈",
    description: "목돈 걱정 없이 이자 부담 없는 스마트 장기 분납 렌탈로 KCC 홈씨씨 창호를 시공해 보세요. 본사 직영 시공과 13년 본사 보증 시스템까지 완벽히 제공합니다.",
    images: [
      {
        url: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1784098064/ChatGPT_Image_2026%EB%85%84_7%EC%9B%94_15%EC%9D%BC_%EC%98%A4%ED%9B%84_03_47_32_ygyuyt.png",
        width: 1200,
        height: 630,
        alt: "KCC 홈씨씨 윈도우 렌탈 서비스",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KCC홈씨씨 창호렌탈 | 한 번에 내지 말고 나누어 가볍게! KCC 본사 직영 시공으로 완성하는 스마트 렌탈",
    description: "목돈 걱정 없이 이자 부담 없는 스마트 장기 분납 렌탈로 KCC 홈씨씨 창호를 시공해 보세요. 본사 직영 시공과 13년 본사 보증 시스템까지 완벽히 제공합니다.",
    images: ["https://res.cloudinary.com/dfkntvpmv/image/upload/v1784098064/ChatGPT_Image_2026%EB%85%84_7%EC%9B%94_15%EC%9D%BC_%EC%98%A4%ED%9B%84_03_47_32_ygyuyt.png"],
  },
  icons: {
    icon: "https://cdn.imweb.me/upload/S20250904697320f4fd9ed/7a0d833f1ef3b.png",
  },
};

import ConvexClientProvider from "./ConvexClientProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
