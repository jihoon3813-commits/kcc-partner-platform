
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// 환경 변수 검증
if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
    console.error('Google Sheets 환경 변수가 설정되지 않았습니다.');
}

// 줄바꿈 문자 처리 (Vercel 등의 환경 변수에서 \\n 처리)
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
];

const jwt = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: SCOPES,
});

export const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID as string, jwt);

export async function loadSheet() {
    await doc.loadInfo();
    return doc;
}

export async function addPartner(data: {
    name: string;
    contact: string;
    parentPartnerId?: string; // 상위 파트너 ID (없을 수 있음)
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    appliedAt: string;
}) {
    await loadSheet();
    const sheet = doc.sheetsByTitle['Partners']; // 'Partners' 시트 사용
    if (!sheet) {
        // 시트가 없으면 생성 (헤더 포함)
        const newSheet = await doc.addSheet({ title: 'Partners' });
        await newSheet.setHeaderRow(['id', 'name', 'contact', 'parentPartnerId', 'status', 'appliedAt']);
        return await newSheet.addRow({
            id: crypto.randomUUID(),
            ...data
        });
    }

    return await sheet.addRow({
        id: crypto.randomUUID(),
        ...data
    });
}
