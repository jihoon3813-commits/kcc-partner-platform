import { NextResponse } from 'next/server';
import { convex, api } from '@/lib/convex';

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

        try {
            await convex.mutation(api.partners.createPartner, {
                uid: id,
                name,
                ceo_name: ceoName,
                contact,
                address,
                password,
                business_number: businessNumber,
                account_number: accountNumber,
                email,
                parent_id: parentPartnerId || undefined,
                status: '승인대기'
            });
            return NextResponse.json({ success: true }, { status: 200 });
        } catch (err: any) {
            return NextResponse.json({ error: err.message || '데이터베이스 저장 실패' }, { status: 500 });
        }

    } catch (error: unknown) {
        console.error('Request Error:', error);
        return NextResponse.json(
            { error: '잘못된 요청입니다.' },
            { status: 500 }
        );
    }
}
