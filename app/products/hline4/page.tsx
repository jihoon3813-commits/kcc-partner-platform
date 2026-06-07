import { Metadata } from 'next';
import HLine4Client from './HLine4Client';

export const metadata: Metadata = {
    title: "홈씨씨 인테리어 H-LINE 4.0 | 맞춤 주방 카탈로그",
    description: "홈씨씨 인테리어 대형 전시장 스펙 및 18T 친환경 E0 맞춤형 주방 가구 룩북. LG 가전 구독 패키지 혜택.",
    openGraph: {
        title: "홈씨씨 인테리어 H-LINE 4.0 | 맞춤 주방 카탈로그",
        description: "홈씨씨 인테리어 대형 전시장 스펙 및 18T 친환경 E0 맞춤형 주방 가구 룩북. LG 가전 구독 패키지 혜택.",
        images: [
            {
                url: "https://res.cloudinary.com/dx7l09wwu/image/upload/v1775356926/KCC_%EC%A3%BC%EB%B0%A9_%EB%8C%80%ED%91%9C%EC%9D%B4%EB%AF%B8%EC%A7%80_rm4qxa.png",
                width: 1200,
                height: 630,
                alt: "H-LINE 4.0 맞춤 주방 카탈로그",
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "홈씨씨 인테리어 H-LINE 4.0 | 맞춤 주방 카탈로그",
        description: "홈씨씨 인테리어 대형 전시장 스펙 및 18T 친환경 E0 맞춤형 주방 가구 룩북. LG 가전 구독 패키지 혜택.",
        images: ["https://res.cloudinary.com/dx7l09wwu/image/upload/v1775356926/KCC_%EC%A3%BC%EB%B0%A9_%EB%8C%80%ED%91%9C%EC%9D%B4%EB%AF%B8%EC%A7%80_rm4qxa.png"],
    },
};

export default async function HLine4ProductPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const p = await searchParams;
    const partnerId = (p.p as string) || null;

    const category = (p.cat as string) || "주방";
    return (
        <HLine4Client
            partnerId={partnerId}
            category={category}
        />
    );
}
