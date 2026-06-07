import { Metadata } from 'next';
import HLine3Client from './HLine3Client';

export const metadata: Metadata = {
    title: "홈씨씨 인테리어 H-LINE 3.0 | 프리미엄 맞춤 주방",
    description: "공간과 동선의 한계를 지운 미니멀 프리미엄 맞춤 주방. 60개월 구독 및 LG 빌트인 패키지 혜택.",
    openGraph: {
        title: "홈씨씨 인테리어 H-LINE 3.0 | 프리미엄 맞춤 주방",
        description: "공간과 동선의 한계를 지운 미니멀 프리미엄 맞춤 주방. 60개월 구독 및 LG 빌트인 패키지 혜택.",
        images: [
            {
                url: "https://res.cloudinary.com/dx7l09wwu/image/upload/v1775356926/KCC_%EC%A3%BC%EB%B0%A9_%EB%8C%80%ED%91%9C%EC%9D%B4%EB%AF%B8%EC%A7%80_rm4qxa.png",
                width: 1200,
                height: 630,
                alt: "H-LINE 3.0 프리미엄 맞춤 주방",
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "홈씨씨 인테리어 H-LINE 3.0 | 프리미엄 맞춤 주방",
        description: "공간과 동선의 한계를 지운 미니멀 프리미엄 맞춤 주방. 60개월 구독 및 LG 빌트인 패키지 혜택.",
        images: ["https://res.cloudinary.com/dx7l09wwu/image/upload/v1775356926/KCC_%EC%A3%BC%EB%B0%A9_%EB%8C%80%ED%91%9C%EC%9D%B4%EB%AF%B8%EC%A7%80_rm4qxa.png"],
    },
};

export default async function HLine3ProductPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const p = await searchParams;
    const partnerId = (p.p as string) || null;

    const category = (p.cat as string) || "주방";
    return (
        <HLine3Client
            partnerId={partnerId}
            category={category}
        />
    );
}
