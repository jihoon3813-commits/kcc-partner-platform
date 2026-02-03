import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, password, isAdmin } = body;

        if (!id || !password) {
            return NextResponse.json({ success: false, message: '아이디와 비밀번호를 입력해주세요.' }, { status: 400 });
        }

        const gasUrl = process.env.NEXT_PUBLIC_GAS_APP_URL || 'https://script.google.com/macros/s/AKfycbzEeEI2vRPjjP79bVdUmNKIqavViAZma96Y80x2S7qi7atEgNFtd7uTulNJDRh8WsqI/exec';
        if (!gasUrl) {
            return NextResponse.json({ success: false, message: 'GAS URL is missing' }, { status: 500 });
        }

        // 구분: 본사 관리자 vs 일반 파트너
        const action = isAdmin ? 'read_admins' : 'read_partners';

        const res = await fetch(`${gasUrl}?action=${action}`, {
            method: 'GET',
            next: { revalidate: 0 }
        });

        if (!res.ok) {
            return NextResponse.json({ success: false, message: '서버 통신 오류' }, { status: 500 });
        }

        const json = await res.json();
        if (!json.success || !Array.isArray(json.data)) {
            return NextResponse.json({ success: false, message: '정보를 불러올 수 없습니다.' }, { status: 500 });
        }

        // 아이디 비밀번호 대조
        const user = json.data.find((p: Record<string, unknown>) => String(p['아이디'] || '') === id && String(p['비밀번호'] || '') === String(password));

        if (user) {
            if (isAdmin) {
                // 본사 관리자 로그인 성공
                return NextResponse.json({
                    success: true,
                    admin: {
                        name: user['이름'] || '관리자',
                        id: user['아이디']
                    }
                });
            } else {
                // 파트너: 승인 상태 확인
                if (user['상태'] !== '승인') {
                    return NextResponse.json({ success: false, message: '승인 대기중인 파트너입니다. 관리자에게 문의하세요.' }, { status: 403 });
                }

                return NextResponse.json({
                    success: true,
                    partner: {
                        name: user['업체명'],
                        ceoName: user['대표자명'],
                        contact: user['연락처'],
                        id: user['아이디']
                    }
                });
            }
        } else {
            return NextResponse.json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' }, { status: 401 });
        }

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, message: '로그인 처리 중 오류 발생' }, { status: 500 });
    }
}
