import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            name, contact, id, address, businessNumber, ceoName,
            password, email, accountNumber, parentPartnerId
        } = body;

        // 필수값 검사
        if (!name || !contact || !id || !ceoName || !address || !password) {
            return NextResponse.json(
                { error: '업체명, 대표자명, 연락처, 주소, 아이디, 비밀번호는 필수입니다.' },
                { status: 400 }
            );
        }

        // ID 중복 검사
        const { data: existingUser, error: checkError } = await supabase
            .from('partners')
            .select('uid')
            .eq('uid', id)
            .maybeSingle();

        if (checkError) {
            console.error('ID Check Error:', checkError);
            return NextResponse.json({ error: '중복 검사 중 오류가 발생했습니다.' }, { status: 500 });
        }

        if (existingUser) {
            return NextResponse.json({ error: '이미 사용 중인 아이디입니다.' }, { status: 409 });
        }

        // 파트너 등록
        const { error: insertError } = await supabase
            .from('partners')
            .insert({
                uid: id,
                name,
                ceo_name: ceoName,
                contact,
                address,
                password, // * 실제 운영 시 해시 처리 권장
                business_number: businessNumber,
                account_number: accountNumber,
                email,
                parent_id: parentPartnerId || null,
                status: '승인대기'
            });

        if (insertError) {
            console.error('Database Insert Error:', insertError);
            return NextResponse.json({ error: '데이터베이스 저장 실패' }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error: unknown) {
        console.error('Request Error:', error);
        return NextResponse.json(
            { error: '잘못된 요청입니다.' },
            { status: 500 }
        );
    }
}
