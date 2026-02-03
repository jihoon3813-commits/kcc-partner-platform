import React from 'react';
import ONEVClient from './ONEVClient';

export default async function ONEVProductPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // searchParams를 바로 꺼내서 Client Component로 전달 (서버 대기 없음)
    const p = await searchParams;
    const partnerId = (p.p as string) || null;

    return (
        <ONEVClient
            partnerId={partnerId}
            initialPartnerData={null}
        />
    );
}
