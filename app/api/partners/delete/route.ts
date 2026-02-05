import { NextResponse } from 'next/server';
import { convex, api } from '@/lib/convex';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: '파트너 ID가 필요합니다.' }, { status: 400 });
        }

        await convex.mutation(api.partners.deletePartnerByUid, { uid: id });

        return NextResponse.json({ success: true, message: '삭제되었습니다.' });

    } catch (error: unknown) {
        console.error('Delete Error:', error);
        return NextResponse.json({ error: '서버 오류' }, { status: 500 });
    }
}

