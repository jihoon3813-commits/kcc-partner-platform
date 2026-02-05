import { NextResponse } from 'next/server';
import { convex, api } from '@/lib/convex';
import { Id } from '@/convex/_generated/dataModel';

// Mapping Supabase/Convex columns to Korean keys (Legacy support for Frontend)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapCustomerToLegacy = (c: any) => ({
    'No.': c.no,
    '라벨': c.label,
    '진행구분': c.status,
    '채널': c.channel,
    '고객명': c.name,
    '연락처': c.contact,
    '주소': c.address,
    'KCC 피드백': c.feedback,
    '진행현황(상세)_최근': c.progress_detail,
    '가견적 링크': c.link_pre_kcc,
    '최종 견적 링크': c.link_final_kcc,
    '고객견적서(가)': c.link_pre_cust,
    '고객견적서(최종)': c.link_final_cust,
    '실측일자': c.measure_date,
    '시공일자': c.construct_date,
    '가견적 금액': c.price_pre,
    '최종견적 금액': c.price_final,
    '신청일시': c.created_at || c._creationTime,
    'id': c._id // Use Convex ID
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
    '등록일': p._creationTime
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapProductToLegacy = (p: any) => ({
    'id': p.code,
    'category': p.category,
    'name': p.name,
    'description': p.description,
    'specs': typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs,
    'price': p.price,
    'status': p.status,
    'image': p.image,
    'link': p.link,
    'createdAt': p._creationTime
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapResourceToLegacy = (r: any) => ({
    'id': r._id,
    'type': r.type,
    'title': r.title,
    'description': r.description,
    'date': r._creationTime,
    'downloadUrl': r.downloadUrl,
    'thumbnail': r.thumbnail
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let data: any = [];

        if (action === 'read' || action === 'read_customers') {
            const rows = await convex.query(api.customers.listCustomers);
            data = rows.map(mapCustomerToLegacy);
        }
        else if (action === 'read_partners') {
            const rows = await convex.query(api.partners.listPartners);
            data = rows.map(mapPartnerToLegacy);
        }
        else if (action === 'read_products') {
            const rows = await convex.query(api.products.listProducts);
            data = rows.map(mapProductToLegacy);
        }
        else if (action === 'read_dashboard') {
            const [customersRes, partnersRes] = await Promise.all([
                convex.query(api.customers.listCustomers),
                convex.query(api.partners.listPartners)
            ]);

            data = {
                customers: customersRes.map(mapCustomerToLegacy),
                partners: partnersRes.map(mapPartnerToLegacy),
                logs: []
            };
        }
        else if (action === 'read_partner_config') {
            const partnerId = searchParams.get('partnerId');

            try {
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
            const rows = await convex.query(api.resources.listResources);
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

            // Map frontend keys to Convex English fields
            if (updates.label !== undefined) dbUpdates.label = updates.label;
            if (updates.status !== undefined) dbUpdates.status = updates.status;
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.contact !== undefined) dbUpdates.contact = updates.contact;
            if (updates.address !== undefined) dbUpdates.address = updates.address;
            if (updates.pricePre !== undefined) dbUpdates.price_pre = updates.pricePre;
            if (updates.priceFinal !== undefined) dbUpdates.price_final = updates.priceFinal;
            if (updates.measureDate !== undefined) dbUpdates.measure_date = updates.measureDate;
            if (updates.constructDate !== undefined) dbUpdates.construct_date = updates.constructDate;
            if (updates.linkPreKcc !== undefined) dbUpdates.link_pre_kcc = updates.linkPreKcc;
            if (updates.linkFinalKcc !== undefined) dbUpdates.link_final_kcc = updates.linkFinalKcc;
            if (updates.linkPreCust !== undefined) dbUpdates.link_pre_cust = updates.linkPreCust;
            if (updates.linkFinalCust !== undefined) dbUpdates.link_final_cust = updates.linkFinalCust;
            if (updates.feedback !== undefined) dbUpdates.feedback = updates.feedback;
            if (updates.progress !== undefined) dbUpdates.progress_detail = updates.progress;

            await convex.mutation(api.customers.updateCustomer, {
                id: id as Id<"customers">,
                updates: dbUpdates
            });
        }
        else if (action === 'delete_customer') {
            const { id } = body;
            await convex.mutation(api.customers.deleteCustomer, { id: id as Id<"customers"> });
        }
        else if (action === 'create_product') {
            const { id, name, category, price, status, description, specs, image, link } = body;
            await convex.mutation(api.products.upsertProduct, {
                code: id || `P${Date.now()}`,
                name, category, price, status, description,
                image, link,
                specs: typeof specs === 'string' ? specs : JSON.stringify(specs || [])
            });
        }
        else if (action === 'update_product') {
            const { id, name, category, price, status, description, specs, image, link } = body;
            await convex.mutation(api.products.upsertProduct, {
                code: id, // code matches
                name, category, price, status, description,
                image, link,
                specs: typeof specs === 'string' ? specs : JSON.stringify(specs || [])
            });
        }
        else if (action === 'delete_product') {
            const { id } = body;
            await convex.mutation(api.products.deleteProduct, { code: id });
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

            await convex.mutation(api.partners.updatePartnerByUid, {
                uid: id,
                updates: dbUpdates
            });
        }
        else if (action === 'create') {
            const {
                name, contact, address, channel, label, status,
                pyeong, expansion, residence, schedule, remarks
            } = body;

            const progressDetail = [
                pyeong ? `평형: ${pyeong}` : '',
                expansion ? `확장: ${expansion}` : '',
                residence ? `거주: ${residence}` : '',
                schedule ? `희망일: ${schedule}` : '',
                remarks ? `특이사항: ${remarks}` : ''
            ].filter(Boolean).join(' / ');

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
        }
        else if (action === 'create_resource') {
            const { type, title, description, downloadUrl, thumbnail } = body;
            await convex.mutation(api.resources.saveResource, {
                type, title, description,
                manualDownloadUrl: downloadUrl,
                manualThumbnailUrl: thumbnail
            });
        }
        else if (action === 'delete_resource') {
            const { id } = body;
            await convex.mutation(api.resources.deleteResource, { id: id as Id<"resources"> });
        }
        else if (action === 'upload_file') {
            // Disabled since Google is not used
            return NextResponse.json({ success: false, message: 'Google Apps Script (GAS) is disabled. File upload not available in current configuration.' });
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
