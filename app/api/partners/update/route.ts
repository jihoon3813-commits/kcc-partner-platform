import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: '파트너 ID가 필요합니다.' }, { status: 400 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.ceoName) dbUpdates.ceo_name = updates.ceoName;
        if (updates.contact) dbUpdates.contact = updates.contact;
        if (updates.address) dbUpdates.address = updates.address;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.businessNumber) dbUpdates.business_number = updates.businessNumber;
        if (updates.accountNumber) dbUpdates.account_number = updates.accountNumber;
        if (updates.email) dbUpdates.email = updates.email;
        if (updates.password) dbUpdates.password = updates.password;
        if (updates.specialBenefits) dbUpdates.special_benefits = updates.specialBenefits;

        const { error } = await supabase
            .from('partners')
            .update(dbUpdates)
            .eq('uid', id);

        if (error) {
            console.error('Update Error:', error);
            return NextResponse.json({ error: '데이터베이스 업데이트 실패' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: '수정되었습니다.' });

    } catch (error: unknown) {
        console.error('Update Error:', error);
        return NextResponse.json({ error: '서버 오류' }, { status: 500 });
    }
}
