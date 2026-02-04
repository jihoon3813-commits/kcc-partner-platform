import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Mapping Supabase columns to Korean keys (Legacy support for Frontend)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapCustomerToLegacy = (c: any) => ({
    'No.': c['No.'],
    '라벨': c['라벨'],
    '진행구분': c['진행구분'],
    '채널': c['채널'],
    '고객명': c['고객명'],
    '연락처': c['연락처'],
    '주소': c['주소'],
    'KCC 피드백': c['KCC 피드백'],
    '진행현황(상세)_최근': c['진행현황(상세)_최근'],
    '가견적 링크': c['가견적 링크'],
    '최종 견적 링크': c['최종 견적 링크'],
    '고객견적서(가)': c['고객견적서(가)'],
    '고객견적서(최종)': c['고객견적서(최종)'],
    '실측일자': c['실측일자'],
    '시공일자': c['시공일자'],
    '가견적 금액': c['가견적 금액'],
    '최종견적 금액': c['최종견적 금액'],
    '신청일시': c['신청일'] || c.server_created_at,
    'id': c.id
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapPartnerToLegacy = (p: any) => ({
    '아이디': p.uid,
    '업체명': p.name,
    '대표명': p.ceo_name,
    '연락처': p.contact,
    '주소': p.address,
    '상태': p.status,
    '사업자번호': p.business_number,
    '계좌번호': p.account_number,
    '이메일': p.email,
    '상품별혜택': p.special_benefits,
    '상위파트너ID': p.parent_id,
    '등록일': p.created_at
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapProductToLegacy = (p: any) => ({
    'id': p.code || p.id,
    'category': p.category,
    'name': p.name,
    'description': p.description,
    'specs': typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs,
    'price': p.price,
    'status': p.status,
    'image': p.image,
    'link': p.link,
    'createdAt': p.created_at
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapResourceToLegacy = (r: any) => ({
    'id': r.id,
    'type': r.type,
    'title': r.title,
    'description': r.description,
    'date': r.created_at,
    'downloadUrl': r.download_url,
    'thumbnail': r.thumbnail
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let data: any = [];

        if (action === 'read' || action === 'read_customers') {
            const { data: rows, error } = await supabase.from('customers').select('*').order('server_created_at', { ascending: false });
            if (error) throw error;
            data = rows.map(mapCustomerToLegacy);
        }
        else if (action === 'read_partners') {
            const { data: rows, error } = await supabase.from('partners').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            data = rows.map(mapPartnerToLegacy);
        }
        else if (action === 'read_products') {
            const { data: rows, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            data = rows.map(mapProductToLegacy);
        }
        else if (action === 'read_dashboard') {
            const [customersRes, partnersRes] = await Promise.all([
                supabase.from('customers').select('*').order('server_created_at', { ascending: false }),
                supabase.from('partners').select('*').order('created_at', { ascending: false })
            ]);

            if (customersRes.error) throw customersRes.error;
            if (partnersRes.error) throw partnersRes.error;

            data = {
                customers: customersRes.data?.map(mapCustomerToLegacy) || [],
                partners: partnersRes.data?.map(mapPartnerToLegacy) || [],
                logs: []
            };
        }
        else if (action === 'read_partner_config') {
            const partnerId = searchParams.get('partnerId');

            try {
                const { convex, api } = await import('@/lib/convex');
                const [products, partner] = await Promise.all([
                    convex.query(api.products.listProducts),
                    partnerId ? convex.query(api.partners.getPartnerByUid, { uid: partnerId }) : Promise.resolve(null)
                ]);

                return NextResponse.json({
                    success: true,
                    products: products.map(mapProductToLegacy),
                    partner: partner ? mapPartnerToLegacy(partner) : null
                });
            } catch (err: any) {
                console.error('Convex Partner Config Error:', err);
                throw err;
            }
        }
        else if (action === 'read_resources') {
            const { data: rows, error } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            data = rows.map(mapResourceToLegacy);
        }
        else if (action === 'read_settings') {
            return NextResponse.json({
                success: true,
                data: {
                    labels: ['체크', '접수', '완료', '보류'],
                    statuses: [
                        '접수', '부재', '예약콜', '거부',
                        '가견적요청', '가견적전달', '가견적불가', '사이즈요청',
                        '실측요청', '실측진행', '실측취소',
                        '최종견적요청', '최종견적전달', '수정견적전달', '재견적작업', '견적후취소',
                        '최종고민중', '계약진행', '결제완료', '공사완료'
                    ],
                    progressAuthors: ['오영진', '김지훈'],
                    feedbackAuthors: ['문창현']
                }
            });
        }
        else {
            return NextResponse.json({ success: false, message: 'Unknown GET action: ' + action });
        }

        return NextResponse.json({ success: true, data });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const body = await request.json();

        if (action === 'update_customer') {
            const { id, ...updates } = body;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dbUpdates: any = {};

            // Mapping Logic (To match the new Korean column names in Supabase)
            if (updates.label !== undefined) dbUpdates['라벨'] = updates.label;
            if (updates.status !== undefined) dbUpdates['진행구분'] = updates.status;
            if (updates.name !== undefined) dbUpdates['고객명'] = updates.name;
            if (updates.contact !== undefined) dbUpdates['연락처'] = updates.contact;
            if (updates.address !== undefined) dbUpdates['주소'] = updates.address;
            if (updates.pricePre !== undefined) dbUpdates['가견적 금액'] = updates.pricePre;
            if (updates.priceFinal !== undefined) dbUpdates['최종견적 금액'] = updates.priceFinal;
            if (updates.measureDate !== undefined) dbUpdates['실측일자'] = updates.measureDate;
            if (updates.constructDate !== undefined) dbUpdates['시공일자'] = updates.constructDate;
            if (updates.linkPreKcc !== undefined) dbUpdates['가견적 링크'] = updates.linkPreKcc;
            if (updates.linkFinalKcc !== undefined) dbUpdates['최종 견적 링크'] = updates.linkFinalKcc;
            if (updates.linkPreCust !== undefined) dbUpdates['고객견적서(가)'] = updates.linkPreCust;
            if (updates.linkFinalCust !== undefined) dbUpdates['고객견적서(최종)'] = updates.linkFinalCust;
            if (updates.feedback !== undefined) dbUpdates['KCC 피드백'] = updates.feedback;
            if (updates.progress !== undefined) dbUpdates['진행현황(상세)_최근'] = updates.progress;

            const { error } = await supabase.from('customers').update(dbUpdates).eq('id', id);
            if (error) throw error;
        }
        else if (action === 'delete_customer') {
            const { id } = body;
            const { error } = await supabase.from('customers').delete().eq('id', id);
            if (error) throw error;
        }
        else if (action === 'create_product') {
            const { id, name, category, price, status, description, specs, image, link } = body;
            const { error } = await supabase.from('products').insert({
                code: id || `P${Date.now()}`,
                name, category, price, status, description,
                image, link,
                specs: typeof specs === 'string' ? JSON.parse(specs) : (specs || [])
            });
            if (error) throw error;
        }
        else if (action === 'update_product') {
            const { id, name, category, price, status, description, specs, image, link } = body;
            const { error } = await supabase.from('products').update({
                name, category, price, status, description,
                image, link,
                specs: typeof specs === 'string' ? JSON.parse(specs) : (specs || [])
            }).eq('code', id);
            if (error) throw error;
        }
        else if (action === 'delete_product') {
            const { id } = body;
            const { error } = await supabase.from('products').delete().eq('code', id);
            if (error) throw error;
        }
        else if (action === 'update_partner') {
            const { id, ...updates } = body;
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

            const { error } = await supabase.from('partners').update(dbUpdates).eq('uid', id);
            if (error) throw error;
        }
        else if (action === 'create') {
            const {
                name, contact, address, channel, label, status,
                pyeong, expansion, residence, schedule, remarks
            } = body;

            // Build a progress detail string for non-core fields to maintain legacy information
            const progressDetail = [
                pyeong ? `평형: ${pyeong}` : '',
                expansion ? `확장: ${expansion}` : '',
                residence ? `거주: ${residence}` : '',
                schedule ? `희망일: ${schedule}` : '',
                remarks ? `특이사항: ${remarks}` : ''
            ].filter(Boolean).join(' / ');

            try {
                const { convex, api } = await import('@/lib/convex');
                await convex.mutation(api.customers.createCustomer, {
                    name,
                    contact,
                    address,
                    channel: channel || '직접등록',
                    label: label || '일반',
                    status: status || '접수',
                    progress_detail: progressDetail,
                    created_at: new Date().toISOString().split('T')[0]
                });
            } catch (err: any) {
                console.error('Convex Insert Error:', err);
                throw err;
            }
        }
        else if (action === 'create_resource') {
            const { type, title, description, downloadUrl, thumbnail } = body;
            const { error } = await supabase.from('resources').insert({
                type, title, description,
                download_url: downloadUrl,
                thumbnail: thumbnail
            });
            if (error) throw error;
        }
        else if (action === 'delete_resource') {
            const { id } = body;
            const { error } = await supabase.from('resources').delete().eq('id', id);
            if (error) throw error;
        }
        else if (action === 'upload_file') {
            const gasUrl = process.env.NEXT_PUBLIC_GAS_APP_URL;
            if (!gasUrl) throw new Error('GAS URL 미설정 - 파일 업로드는 여전히 GAS를 사용합니다.');

            const response = await fetch(`${gasUrl}?action=upload_file`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const result = await response.json();
            return NextResponse.json(result);
        }
        else if (action === 'init_database') {
            return NextResponse.json({
                success: true,
                message: 'Supabase에서는 SQL 스크립트를 수동으로 실행해야 합니다. 프로젝트 루트의 supabase_schema.sql 파일을 열어 내용을 복사한 뒤, Supabase SQL Editor에서 실행해주세요.'
            });
        }
        else {
            return NextResponse.json({ success: false, message: 'Unknown POST action: ' + action });
        }

        return NextResponse.json({ success: true, message: 'Operation successful' });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('API Post Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
