import React from 'react';
import HLineClient from './HLineClient';

export default async function HLineProductPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const p = await searchParams;
    const partnerId = (p.p as string) || null;

    const category = (p.cat as string) || "주방";
    return (
        <HLineClient
            partnerId={partnerId}
            category={category}
        />
    );
}
