import React from 'react';
import HLine2Client from './HLine2Client';

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
