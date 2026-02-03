import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: '파트너 ID가 필요합니다.' }, { status: 400 });
        }

        const gasUrl = process.env.NEXT_PUBLIC_GAS_APP_URL || 'https://script.google.com/macros/s/AKfycbzEeEI2vRPjjP79bVdUmNKIqavViAZma96Y80x2S7qi7atEgNFtd7uTulNJDRh8WsqI/exec';
        if (!gasUrl) {
            return NextResponse.json({ error: 'GAS URL 미설정' }, { status: 500 });
        }

        // GAS로 승인 요청 전송
        const response = await fetch(`${gasUrl}?action=approve_partner`, {
            method: 'POST',
            body: JSON.stringify({ id })
        });

        const result = await response.json();
        return NextResponse.json(result);

    } catch (error: unknown) {
        console.error('Approve Error:', error);
        return NextResponse.json({ error: '서버 오류' }, { status: 500 });
    }
}
