import React from 'react';
import RentalClient from './RentalClient';

export default async function RentalProductPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // searchParams를 비동기적으로 해제한 후 클라이언트 컴포넌트로 전달합니다.
    const p = await searchParams;
    const partnerId = (p.p as string) || null;
    const category = (p.cat as string) || "창호";

    return (
        <RentalClient
            partnerId={partnerId}
            category={category}
        />
    );
}
