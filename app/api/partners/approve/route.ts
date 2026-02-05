import { NextResponse } from 'next/server';
import { convex, api } from '@/lib/convex';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: '파트너 ID가 필요합니다.' }, { status: 400 });
        }

        await convex.mutation(api.partners.updatePartnerByUid, {
            uid: id,
            updates: { status: '승인' }
        });

        return NextResponse.json({ success: true, message: '승인 처리되었습니다.' });

    } catch (error: unknown) {
        console.error('Approve Error:', error);
        return NextResponse.json({ error: '서버 오류' }, { status: 500 });
    }
}

