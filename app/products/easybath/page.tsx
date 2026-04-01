import React from 'react';
import EasyBathClient from './EasyBathClient';

export default async function EasyBathProductPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const p = await searchParams;
    const partnerId = (p.p as string) || null;
    const category = (p.cat as string) || "욕실";

    return (
        <EasyBathClient
            partnerId={partnerId}
            category={category}
        />
    );
}
