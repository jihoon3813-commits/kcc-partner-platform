import { NextResponse } from 'next/server';

const getGasUrl = () => process.env.NEXT_PUBLIC_GAS_APP_URL;

export async function GET(request: Request) {
    try {
        const gasUrl = getGasUrl();
        if (!gasUrl) {
            return NextResponse.json({ error: 'GAS URL undefined' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);

        // 모든 쿼리 파라미터를 전달하도록 수정
        const response = await fetch(`${gasUrl}?${searchParams.toString()}`, {
            method: 'GET',
            next: { revalidate: 0 }
        });

        if (!response.ok) {
            throw new Error(`GAS fetch failed: ${response.status}`);
        }

        const json = await response.json();
        return NextResponse.json(json);

    } catch (error: unknown) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const gasUrl = getGasUrl();
        if (!gasUrl) {
            return NextResponse.json({ error: 'GAS URL undefined' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        if (!action) {
            return NextResponse.json({ error: 'Action parameter is required for POST' }, { status: 400 });
        }

        const body = await request.json();

        const response = await fetch(`${gasUrl}?action=${action}`, {
            method: 'POST',
            body: JSON.stringify(body),
            next: { revalidate: 0 }
        });

        if (!response.ok) {
            throw new Error(`GAS fetch failed: ${response.status}`);
        }

        const json = await response.json();
        return NextResponse.json(json);

    } catch (error: unknown) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to post data' }, { status: 500 });
    }
}
