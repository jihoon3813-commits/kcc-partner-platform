import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Mapping Supabase columns to Korean keys (Legacy support for Frontend)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapCustomerToLegacy = (c: any) => ({
    'No.': c.no,
    '라벨': c.label || '일반',
    '진행구분': c.status || '접수',
    '신청일시': c.created_at,
    '유입채널': c.channel,
    '고객명': c.name,
    '연락처': c.contact,
    '주소': c.address,
    'KCC 피드백': c.feedback,
    '진행현황(상세)_최근': c.progress_detail,
    '실측일자': c.measure_date,
    '시공일자': c.construct_date,
    '가견적 금액': c.price_pre,
    '최종견적 금액': c.price_final,
    // ID needed for updates
    'id': c.id
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapPartnerToLegacy = (p: any) => ({
    '아이디': p.uid,
    '업체명': p.name,
    '대표자명': p.ceo_name,
    '연락처': p.contact,
    '주소': p.address,
    '상태': p.status,
    '사업자번호': p.business_number,
    '계좌번호': p.account_number,
    '이메일': p.email,
    '상품별혜택': p.special_benefits,
    '상위파트너ID': p.parent_id,
    '신청일': p.created_at
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapProductToLegacy = (p: any) => ({
    'id': p.code || p.id,
    'category': p.category,
    'name': p.name,
    'description': p.description,
    'specs': p.specs,
    'price': p.price,
    'status': p.status,
    'image': p.image,
    'link': p.link,
    'createdAt': p.created_at
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let data: any = [];

        if (action === 'read' || action === 'read_customers') {
            const { data: rows, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
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
            const [customers, partners] = await Promise.all([
                supabase.from('customers').select('*').order('created_at', { ascending: false }),
                supabase.from('partners').select('*').order('created_at', { ascending: false })
            ]);

            data = {
                customers: customers.data?.map(mapCustomerToLegacy) || [],
                partners: partners.data?.map(mapPartnerToLegacy) || [],
                logs: []
            };
        }
        else if (action === 'read_partner_config') {
            const partnerId = searchParams.get('partnerId');
            const [products, partner] = await Promise.all([
                supabase.from('products').select('*'),
                supabase.from('partners').select('uid,name,ceo_name,contact,address,business_number,account_number,email,status,parent_id,created_at').eq('uid', partnerId).single()
            ]);

            return NextResponse.json({
                success: true,
                products: products.data?.map(mapProductToLegacy) || [],
                partner: partner.data ? mapPartnerToLegacy(partner.data) : null
            });
        }
        else {
            // Fallback for unknown actions or 'read_settings' (which might be static now)
            if (action === 'read_settings') {
                return NextResponse.json({
                    success: true,
                    data: {
                        labels: ['체크', '접수', '완료', '보류'],
                        statuses: ['접수', '부재', '예약콜', '거부', '사이즈요청', '가견적요청', '계약완료', '시공완료'],
                        progressAuthors: ['오영진', '김지훈'],
                        feedbackAuthors: ['문창현']
                    }
                });
            }
            return NextResponse.json({ success: false, message: 'Unknown action: ' + action });
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
            const { no, ...updates } = body;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dbUpdates: any = {};

            // Mapping Logic
            if (updates.label !== undefined) dbUpdates.label = updates.label;
            if (updates.status !== undefined) dbUpdates.status = updates.status;
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.contact !== undefined) dbUpdates.contact = updates.contact;
            if (updates.address !== undefined) dbUpdates.address = updates.address;
            if (updates.pricePre !== undefined) dbUpdates.price_pre = updates.pricePre;
            if (updates.priceFinal !== undefined) dbUpdates.price_final = updates.priceFinal;
            if (updates.measureDate !== undefined) dbUpdates.measure_date = updates.measureDate;
            if (updates.constructDate !== undefined) dbUpdates.construct_date = updates.constructDate;
            if (updates.feedback !== undefined) dbUpdates.feedback = updates.feedback;
            if (updates.progress !== undefined) dbUpdates.progress_detail = updates.progress;

            const { error } = await supabase.from('customers').update(dbUpdates).eq('no', no);
            if (error) throw error;
        }
        else if (action === 'delete_customer') {
            const { no } = body;
            const { error } = await supabase.from('customers').delete().eq('no', no);
            if (error) throw error;
        }
        else if (action === 'create_product') {
            const { name, category, price, status, description, specs } = body;
            const { error } = await supabase.from('products').insert({
                name, category, price, status, description,
                specs: specs || [],
                code: body.id || `P${Date.now()}`
            });
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

        // ... (Other actions implementation as needed) ...

        return NextResponse.json({ success: true, message: 'Operation successful' });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('API Post Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
