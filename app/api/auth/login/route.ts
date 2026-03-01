import { NextResponse } from 'next/server';
import { convex, api } from '@/lib/convex';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, password, isAdmin } = body;

        if (!id || !password) {
            return NextResponse.json({ success: false, message: '아이디와 비밀번호를 입력해주세요.' }, { status: 400 });
        }

        if (isAdmin) {
            let admin = await convex.query(api.admins.getAdminByUidCaseInsensitive, { uid: id });

            // Self-healing: If no admin exists at all, run initial creation
            if (!admin) {
                // Just try to find one of the default admins to see if table is empty
                const anyAdmin = await convex.query(api.admins.getAdminByUidCaseInsensitive, { uid: 'admin' });

                if (!anyAdmin) {
                    await convex.mutation(api.admins.createInitialAdmin, {});
                    // Try lookup again
                    admin = await convex.query(api.admins.getAdminByUidCaseInsensitive, { uid: id });
                }
            }

            if (!admin || admin.password !== password) {
                return NextResponse.json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' }, { status: 401 });
            }

            return NextResponse.json({
                success: true,
                admin: {
                    name: admin.name || '관리자',
                    id: admin.uid,
                    role: admin.role || 'admin'
                }
            });

        } else {
            const partner = await convex.query(api.partners.getPartnerByUid, { uid: id });

            if (!partner || partner.password !== password) {
                return NextResponse.json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' }, { status: 401 });
            }

            if (partner.status !== '승인') {
                return NextResponse.json({ success: false, message: '승인 대기중인 파트너입니다. 관리자에게 문의하세요.' }, { status: 403 });
            }

            return NextResponse.json({
                success: true,
                partner: {
                    name: partner.name,
                    ceoName: partner.ceo_name,
                    contact: partner.contact,
                    id: partner.uid
                }
            });
        }

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({
            success: false,
            message: `로그인 처리 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`
        }, { status: 500 });
    }
}
