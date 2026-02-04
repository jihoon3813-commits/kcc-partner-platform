import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: '파트너 ID가 필요합니다.' }, { status: 400 });
        }

        const { error } = await supabase
            .from('partners')
            .update({ status: '승인' })
            .eq('uid', id);

        if (error) {
            console.error('Approve Error:', error);
            return NextResponse.json({ error: '데이터베이스 업데이트 실패' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: '승인 처리되었습니다.' });

    } catch (error: unknown) {
        console.error('Approve Error:', error);
        return NextResponse.json({ error: '서버 오류' }, { status: 500 });
    }
}
