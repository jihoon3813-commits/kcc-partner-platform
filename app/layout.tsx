import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "목돈 부담 ZERO! KCC 홈씨씨 윈도우 구독 서비스",
  description: "최장 60개월 분납으로 부담은 낮추고 품격은 높이세요. 업계 최장 13년 품질보증이 당신의 일상을 든든하게 지켜드립니다.",
  openGraph: {
    title: "목돈 부담 ZERO! KCC 홈씨씨 윈도우 구독 서비스",
    description: "최장 60개월 분납으로 부담은 낮추고 품격은 높이세요. 업계 최장 13년 품질보증이 당신의 일상을 든든하게 지켜드립니다.",
    images: [
      {
        url: "https://cdn.imweb.me/upload/S20250904697320f4fd9ed/7718dba031946.png",
        width: 1200,
        height: 630,
        alt: "KCC 홈씨씨 윈도우 구독 서비스",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "목돈 부담 ZERO! KCC 홈씨씨 윈도우 구독 서비스",
    description: "최장 60개월 분납으로 부담은 낮추고 품격은 높이세요. 업계 최장 13년 품질보증이 당신의 일상을 든든하게 지켜드립니다.",
    images: ["https://cdn.imweb.me/upload/S20250904697320f4fd9ed/7718dba031946.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
