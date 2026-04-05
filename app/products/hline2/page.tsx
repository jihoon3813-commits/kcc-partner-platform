import { Metadata } from 'next';
import HLine2Client from './HLine2Client';

export const metadata: Metadata = {
    title: "창호 명가, KCC글라스가 만든 프리미엄 맞춤 주방",
    description: "60개월 구독과 LG 빌트인 가전 할인 혜택까지 누리세요!",
    openGraph: {
        title: "창호 명가, KCC글라스가 만든 프리미엄 맞춤 주방",
        description: "60개월 구독과 LG 빌트인 가전 할인 혜택까지 누리세요!",
        images: [
            {
                url: "https://res.cloudinary.com/dx7l09wwu/image/upload/v1775356926/KCC_%EC%A3%BC%EB%B0%A9_%EB%8C%80%ED%91%9C%EC%9D%B4%EB%AF%B8%EC%A7%80_rm4qxa.png",
                width: 1200,
                height: 630,
                alt: "프리미엄 맞춤 주방",
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "창호 명가, KCC글라스가 만든 프리미엄 맞춤 주방",
        description: "60개월 구독과 LG 빌트인 가전 할인 혜택까지 누리세요!",
        images: ["https://res.cloudinary.com/dx7l09wwu/image/upload/v1775356926/KCC_%EC%A3%BC%EB%B0%A9_%EB%8C%80%ED%91%9C%EC%9D%B4%EB%AF%B8%EC%A7%80_rm4qxa.png"],
    },
};

export default async function HLine2ProductPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const p = await searchParams;
    const partnerId = (p.p as string) || null;

    const category = (p.cat as string) || "주방";
    return (
        <HLine2Client
            partnerId={partnerId}
            category={category}
        />
    );
}
