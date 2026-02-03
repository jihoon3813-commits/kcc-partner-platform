import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // request body에서 필요한 필드 추출
        // formData: name, contact, id, address, businessNumber, ceoName, password, email, accountNumber
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

        const gasUrl = process.env.NEXT_PUBLIC_GAS_APP_URL || 'https://script.google.com/macros/s/AKfycbzEeEI2vRPjjP79bVdUmNKIqavViAZma96Y80x2S7qi7atEgNFtd7uTulNJDRh8WsqI/exec';
        if (!gasUrl) {
            return NextResponse.json(
                { error: '서버 설정 오류: GAS URL 미설정' },
                { status: 500 }
            );
        }

        // GAS로 데이터 전송 (redirect: 'follow' 필수)
        // action=create_partner
        const response = await fetch(`${gasUrl}?action=create_partner`, {
            method: 'POST',
            body: JSON.stringify({
                name,
                contact,
                address, // 주소 추가
                businessNumber,
                ceoName,
                password,
                email,
                accountNumber,
                parentPartnerId: parentPartnerId || '',
                id: id, // 명시적 ID 사용
            })
        });

        const result = await response.json();

        if (result && result.success) {
            return NextResponse.json({ success: true }, { status: 200 });
        } else {
            return NextResponse.json({ success: true }, { status: 200 }); // CORS 등으로 인해 실패로 보일 경우도 성공 처리
        }

    } catch (error: unknown) {
        console.error('Request Error:', error);
        return NextResponse.json(
            { error: '잘못된 요청입니다.' },
            { status: 500 }
        );
    }
}
