-- Supabase Database Schema for KCC Partner System

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    no TEXT PRIMARY KEY, -- Changed to TEXT to support legacy IDs like '3-1'
    id UUID DEFAULT gen_random_uuid(),
    label TEXT DEFAULT '일반',
    status TEXT DEFAULT '접수',
    channel TEXT,
    name TEXT,
    contact TEXT,
    address TEXT,
    feedback TEXT,
    progress_detail TEXT,
    measure_date DATE,
    construct_date DATE,
    price_pre NUMERIC,
    price_final NUMERIC,
    link_pre_kcc TEXT,
    link_final_kcc TEXT,
    link_pre_cust TEXT,
    link_final_cust TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Partners Table
CREATE TABLE IF NOT EXISTS partners (
    uid TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    ceo_name TEXT,
    contact TEXT,
    address TEXT,
    status TEXT DEFAULT '승인대기',
    business_number TEXT,
    account_number TEXT,
    email TEXT,
    password TEXT NOT NULL,
    parent_id TEXT,
    special_benefits TEXT, -- Can be JSON string or JSONB
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    uid TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default Admin Account (admin / admin1234)
INSERT INTO admins (uid, password, name)
VALUES ('admin', 'admin1234', '최고관리자')
ON CONFLICT (uid) DO NOTHING;

-- 4. Products Table
CREATE TABLE IF NOT EXISTS products (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    price TEXT,
    status TEXT DEFAULT '판매중',
    description TEXT,
    image TEXT,
    link TEXT,
    specs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Resources Table
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT DEFAULT 'image',
    title TEXT,
    description TEXT,
    download_url TEXT,
    thumbnail TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Disable RLS (Row Level Security) for easier migration
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE resources DISABLE ROW LEVEL SECURITY;

-- 7. Data Migration (Existing Data from GAS)
-- Partners Migration
INSERT INTO partners (uid, name, ceo_name, contact, address, status, business_number, email, password, special_benefits, created_at)
VALUES 
('test1', '테스트1', '김길동', '010-2222-3333', '충북 음성군 금왕읍 리노산단길 21 (삼봉리)', '승인', '322-55-55555', 'lifenjoy0108@gmail.com', '1234', '{"P_001":"견적금액의 10% 캐시백"}', '2026-02-01'),
('test2', '테스트2', '이대표', '010-2222-2333', '', '승인', '', '', '1234', '{"P001":"sdfsdfdsfs"}', '2026-02-02'),
('lifenjoy', '라이프앤조이', '이지훈', '010-2222-3333', '경기 하남시 미사대로 510 (덕풍동, 한강미사 아이에스비즈) 33 admin', '승인', '388-22-22222', '', '1234', '{"P_001":"시공 완료 시 현금 100만원 증정"}', '2026-02-03')
ON CONFLICT (uid) DO UPDATE SET 
    name = EXCLUDED.name, ceo_name = EXCLUDED.ceo_name, contact = EXCLUDED.contact, address = EXCLUDED.address,
    status = EXCLUDED.status, business_number = EXCLUDED.business_number, email = EXCLUDED.email, 
    password = EXCLUDED.password, special_benefits = EXCLUDED.special_benefits;

-- Customers Migration
INSERT INTO customers (no, label, status, channel, name, contact, address, progress_detail, feedback, link_pre_kcc, link_pre_cust, price_pre, price_final, created_at)
VALUES
(4, '보류', '예약콜', '테스트1', '조수영2(거실분합포함)', '010-7572-3296', '경기도 시흥시 정왕본동', '[01-30] 해외에서 돌아와서 검토', '[01-30] - 견적 2개로 제공      : 거실분리 분합분틀 포함/미포함   - 주소지 2개 있음 / 시화청솔아파트 기준견적   - 한화프레스티빌라 정보없음 / 필요시 사이즈요청   - 전면발코니 2개로 분할시공(인방걸림)   - 좌,우 돌출보강 포함 / 창고장 도어 있을시 철거 또는 공간통바 이슈', 'https://iorderapp.innosysit.com/share/homecc/page?compnm=7LyA7J207JSo7JSo6riA65287Iqk&id=KCC-EX-20260130070ffb3e8a954d59874c4f632612d170', 'https://kcc-estimate.netlify.app/', 20000000, 15000000, '2026-01-28'),
-- (3-1 is a string, which might conflict with BIGINT 'no', but let's try to map it to 31 or similar if needed, or change 'no' type)
-- Actually, the schema has 'no' as BIGSERIAL (INT). If they have '3-1', I should probably change 'no' to TEXT or skip it.
-- Let's change 'no' to TEXT to support legacy IDs like '3-1'.
(3, '완료', '최종견적요청', 'NS_Y', '조수영', '010-7572-3296', '경기도 시흥시 정왕본동', '[01-28] 예원로6번길 58, 한화프레스티지 빌라 106호', '[01-30] - 견적 2개로 제공      : 거실분리 분합분틀 포함/미포함   - 주소지 2개 있음 / 시화청솔아파트 기준견적   - 한화프레스티빌라 정보없음 / 필요시 사이즈요청   - 전면발코니 2개로 분할시공(인방걸림)   - 좌,우 돌출보강 포함 / 창고장 도어 있을시 철거 또는 공간통바 이슈', 'https://iorderapp.innosysit.com/share/homecc/page?compnm=7LyA7J207JSo7JSo6riA65287Iqk&id=KCC-EX-2026013056e55d452f414c78b9d7885580a6bc57', 'https://kcc-estimate.netlify.app/', 0, 0, '2026-01-28'),
(2, '체크', '결제완료', 'NS_D', '이도연', '010-8370-6580', '경북/포항시', '[01-30] 800만원대에 하고자하심', '[01-30] - 800만원대 요청하셨는데, 부대비용에서 차이가 있을수 있음   - 실제 불필요부위(꼭 필요한 공사는 들어가야함) 체크 필요함', 'https://iorderapp.innosysit.com/share/homecc/page?compnm=7LyA7J207JSo7JSo6riA65287Iqk&id=KCC-EX-202601301966741c719f4f909a6efe74bbf13ff6', 'https://kcc-estimate.netlify.app/', 12000000, 15000000, '2026-01-30'),
(1, '체크', '가견적전달', 'NS_Y', '김정훈', '010-5198-0732', '경상남도 창원시 마산회원구 내서읍', '[01-30] 베란다 바닦 공사도 같이 가능한지 확인하고 예상견적 같이 요청', '[01-30] - 발코니 타일견적은 제외 상태     : 하부타일만 적용  - 현장 여건에 따라 다름     : 전면했을때 약 100만       주방발코니 약 50만  예상가격입니다~  하부타일 가격은 빠집니다.', 'https://iorderapp.innosysit.com/share/homecc/page?compnm=7LyA7J207JSo7JSo6riA65287Iqk&id=KCC-EX-20260130f67941ad84994bdaa5374c2687742e72', 'https://kcc-estimate.netlify.app/', 0, 0, '2026-01-30'),
(5, '일반', '접수', '테스트1 (ONEV)', '테스트', '010-2222-3333', '경상북도 고령군', '', '', '', '', 0, 0, '2026-02-03'),
(6, '일반', '접수', '테스트1 (ONEV)', '테스트2', '020-3333-3233', '서울 영등포구 여의나루로4길 21 (여의도동, 코스콤 본사) 34we [07330]', '', '', '', '', 0, 0, '2026-02-03');
