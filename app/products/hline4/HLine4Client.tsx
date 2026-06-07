'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Phone, MessageSquare, ChevronDown, Check, ShieldCheck, Trophy,
    Shield, Leaf, Scissors, X, Loader2, User, PhoneCall,
    Sparkles, CreditCard, Layout, Zap, ArrowRight, Star, Anchor,
    Play, Volume2, ChevronLeft, ChevronRight, Image as ImageIcon
} from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface HLine4ClientProps {
    partnerId?: string | null;
    category?: string;
}

// Reusable Image Placeholder for Blank Spaces (Theme-Adaptive with Premium Brown accents)
const ImagePlaceholder: React.FC<{ label: string; heightClass?: string; theme?: 'light' | 'dark' }> = ({ label, heightClass = "aspect-video", theme = "light" }) => (
    <div className={`w-full ${heightClass} ${
        theme === 'dark' 
            ? 'bg-[#2E211A] border-neutral-900 text-neutral-450' 
            : 'bg-neutral-50 border-neutral-250 text-neutral-500'
    } border border-dashed flex flex-col items-center justify-center p-4 text-center select-none`}>
        <ImageIcon className={`w-7 h-7 mb-2 opacity-50 ${theme === 'dark' ? 'text-[#C5A880]' : 'text-[#8A7355]'}`} />
        <span className={`text-xs font-black ${theme === 'dark' ? 'text-[#FAF9F5]' : 'text-neutral-800'}`}>{label}</span>
        <span className="text-[10px] opacity-50 mt-0.5">(이미지 영역)</span>
    </div>
);

interface CountertopItem {
    name: string;
    label: string;
    color: string;
    image?: string;
    desc: string;
}

const COUNTERTOP_OPTIONS: Record<'marble' | 'stone' | 'ceramic', CountertopItem[]> = {
    marble: [
        { name: '어반화이트', label: 'Urban White', color: '#F3F2EE', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780753317/%EC%9D%B8%EC%A1%B0_%EC%96%B4%EB%B0%98%ED%99%94%EC%9D%B4%ED%8A%B8_ct2y7d.jpg', desc: '자연스럽고 부드러운 화이트 톤으로 넓고 아늑한 개방감을 제공합니다.' },
        { name: '리얼화이트', label: 'Real White', color: '#FFFFFF', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780753319/%EC%9D%B8%EC%A1%B0_%EB%A6%AC%EC%96%BC%ED%99%94%EC%9D%B4%ED%8A%B8_dn8atd.jpg', desc: '순수하고 깨끗한 화이트 컬러로 미니멀하고 모던한 주방을 완성합니다.' },
        { name: '콘크리트', label: 'Concrete', color: '#B2B1AC', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780753317/%EC%9D%B8%EC%A1%B0_%EC%BD%98%ED%81%AC%EB%A6%AC%ED%8A%B8_aadtut.jpg', desc: '세련된 라이트 그레이 톤으로 감각적이고 내추럴한 인더스트리얼 분위기를 연출합니다.' },
        { name: '알파카', label: 'Alpaca', color: '#E6E5E0', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780753317/%EC%9D%B8%EC%A1%B0_%EC%95%8C%ED%8C%8C%EC%B9%B4_xhty7n.jpg', desc: '촘촘하고 고운 미세 칩 입자가 가미되어 단조롭지 않은 입체감을 연출합니다.' },
        { name: '다크스카이', label: 'Dark Sky', color: '#3E4043', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780753318/%EC%9D%B8%EC%A1%B0_%EB%8B%A4%ED%81%AC%EC%8A%A4%EC%B9%B4%EC%9D%B4_mpctd8.jpg', desc: '어두운 차콜 바탕에 밝은 칩들이 대비를 이루어 무게감 있고 화려한 포인트가 됩니다.' },
        { name: '쿠키베이지', label: 'Cookie Beige', color: '#EAE3D2', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780753319/%EC%9D%B8%EC%A1%B0_%EC%BF%A0%ED%82%A4%EB%B2%A0%EC%9D%B4%EC%A7%80_abpmsz.jpg', desc: '따뜻한 모래 감성의 샌드 베이지 컬러로 온화하고 편안한 감성을 선사합니다.' }
    ],
    stone: [
        { name: '칼라카타 웨이브', label: 'Calacatta Wave', color: '#F5F3ED', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780754244/%EC%8A%A4%ED%86%A4_%EC%B9%BC%EB%9D%BC%EC%B9%B4%ED%83%80_%EC%9B%A8%EC%9D%B4%EB%B8%8C_addbdt.jpg', desc: '화이트 마블 베이스에 흐르는 듯한 그레이 베인이 돋보이는 럭셔리 스톤 패턴.' },
        { name: '칼라카타 레인', label: 'Calacatta Rain', color: '#FAF9F6', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780754243/%EC%8A%A4%ED%86%A4_%EC%B9%BC%EB%9D%BC%EC%B9%B4%ED%83%80_%EB%A0%88%EC%9D%B8_kxnfhw.jpg', desc: '은은하고 가느다란 결 무늬가 우아하게 분포되어 부드럽고 차분한 분위기를 자아냅니다.' },
        { name: '팔라틴', label: 'Palatin', color: '#DDD9CE', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780754245/%EC%8A%A4%ED%86%A4_%ED%8C%94%EB%9D%BC%ED%8B%B4_i2s2bn.jpg', desc: '은은한 웜 그레이 베이스에 천연석 특유의 결을 고급스럽게 형상화한 하이엔드 자재.' },
        { name: '오텔로', label: 'Otello', color: '#E5E2D9', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780754242/%EC%8A%A4%ED%86%A4_%EC%98%A4%ED%85%94%EB%A1%9C_fglj6w.jpg', desc: '클래식하면서도 개성 있는 마블 무늬가 은은하게 시선을 끄는 엔지니어드 스톤.' },
        { name: '플루토', label: 'Pluto', color: '#8D8D88', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780754244/%EC%8A%A4%ED%86%A4_%ED%94%8C%EB%A3%A8%ED%86%A0_mzqtfu.jpg', desc: '깊이 있는 미디엄 차콜 그레이로 시크하고 현대적인 프리미엄 오라를 연출합니다.' },
        { name: '머큐리', label: 'Mercury', color: '#C3C6C7', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780754243/%EC%8A%A4%ED%86%A4_%EB%A8%B8%ED%81%90%EB%A6%AC_y4lasg.jpg', desc: '자연스럽고 질감과 미려한 칩 패턴이 균일하게 적용되어 마감이 조화롭습니다.' }
    ],
    ceramic: [
        { name: '스톤 화이트', label: 'Stone White', color: '#EFECE5', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780754602/%EC%84%B8%EB%9D%BC%EB%AF%B9_%EC%8A%A4%ED%86%A4%ED%99%94%EC%9D%B4%ED%8A%B8_hrcjwt.jpg', desc: '매트하고 단단한 석재 질감을 살린 내추럴 미스티 화이트 스톤.' },
        { name: '스타투아리오 리얼', label: 'Statuario Real', color: '#FFFFFF', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780754605/%EC%84%B8%EB%9D%BC%EB%AF%B9_%EC%8A%A4%ED%83%80%ED%88%AC%EC%95%84%EB%A6%AC%EC%98%A4_%EB%A6%AC%EC%96%BC_o4qbgn.jpg', desc: '천연 스타투아리오 대리석의 굵고 생동감 있는 무늬를 그대로 재현한 최고급 세라믹.' },
        { name: '콘크리트 애쉬', label: 'Concrete Ash', color: '#9C9A95', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780754601/%EC%84%B8%EB%9D%BC%EB%AF%B9_%EC%BD%98%ED%81%AC%EB%A6%AC%ED%8A%B8_%EC%95%A0%EC%89%AC_nt7jst.jpg', desc: '내추럴한 그레이 콘크리트 무드를 담아 시크하고 감각적인 디자인의 상판 사양.' },
        { name: '트래버틴 미니멀 화이트', label: 'Travertine Minimal White', color: '#EADEC9', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780754602/%EC%84%B8%EB%9D%BC%EB%AF%B9_%ED%8A%B8%EB%9E%98%EB%B2%84%ED%8B%B4_%EB%AF%B8%EB%8B%88%EB%A9%80_%ED%99%94%EC%9D%B4%ED%8A%B8_pontmt.jpg', desc: '천연 트래버틴 대리석의 질감을 모던하고 간결한 감성으로 재해석한 베이지 톤.' },
        { name: '슬레이트 그레이', label: 'Slate Grey', color: '#555658', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780754603/%EC%84%B8%EB%9D%BC%EB%AF%B9_%EC%8A%AC%EB%A0%88%EC%9D%B4%ED%8A%B8_%EA%B7%B8%EB%A0%88%EC%9D%B4_at4do9.jpg', desc: '자연석 슬레이트의 거칠고 시크한 풍미를 고급스럽고 매끈하게 가공한 다크 그레이.' },
        { name: '콘크리트 화이트', label: 'Concrete White', color: '#E8E7E2', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780754604/%EC%84%B8%EB%9D%BC%EB%AF%B9_%EC%BD%98%ED%81%AC%EB%A6%AC%ED%8A%B8_%ED%99%94%EC%9D%B4%ED%8A%B8_pmv8g3.jpg', desc: '거친 듯 부드러운 빈티지 콘크리트의 화이트 버전으로 공간에 예술적인 무드를 부여합니다.' }
    ]
};

const REPRESENTATIVE_IMAGES: Record<'marble' | 'stone' | 'ceramic', { src: string; alt: string; label: string }> = {
    marble: {
        src: '/images/hline/urban_white_kitchen.png',
        alt: '어반 화이트 실제 주방 연출 이미지',
        label: '어반화이트 연출 예시'
    },
    stone: {
        src: '/images/hline/calacatta_rain_kitchen.png',
        alt: '칼라카타 레인 실제 주방 연출 이미지',
        label: '칼라카타 레인 연출 예시'
    },
    ceramic: {
        src: '/images/hline/stone_white_kitchen.png',
        alt: '스톤 화이트 실제 주방 연출 이미지',
        label: '스톤 화이트 연출 예시'
    }
};

const SINKBOWL_OPTIONS = [
    { name: 'Calmforte 860(엠보)', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780755464/%EC%8B%B1%ED%81%AC%EB%B3%BC_Clamforte860_%EC%97%A0%EB%B3%B4_klksr4.jpg' },
    { name: '싱크볼 840(엠보)', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780755462/%EC%8B%B1%ED%81%AC%EB%B3%BC_840_%EC%97%A0%EB%B3%B4_xagk5u.jpg' },
    { name: '싱크볼 950(L/R)', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780755465/%EC%8B%B1%ED%81%AC%EB%B3%BC_950_L_R_ticbjm.jpg' },
    { name: '싱크볼 850', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780755461/%EC%8B%B1%ED%81%AC%EB%B3%BC_850_ypqfw8.jpg' },
    { name: '싱크볼 880', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780755459/%EC%8B%B1%ED%81%AC%EB%B3%BC_880_vp40ty.jpg' },
    { name: '싱크볼 860', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780755463/%EC%8B%B1%ED%81%AC%EB%B3%BC_860_votpyd.jpg' },
    { name: '싱크볼 740', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780755460/%EC%8B%B1%ED%81%AC%EB%B3%BC_740_xgz0xj.jpg' },
    { name: '싱크볼 630', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780755459/%EC%8B%B1%ED%81%AC%EB%B3%BC_630_cyafou.jpg' }
];

const FAUCET_OPTIONS = [
    { name: 'K2119', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757258/01_K2119_cx4jok.jpg' },
    { name: '라디체 A19(실버)', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757255/02_%EB%9D%BC%EB%94%94%EC%B2%B4A19_%EC%8B%A4%EB%B2%84_i32kds.jpg' },
    { name: '라디체 A19(건메탈)', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757260/03_%EB%9D%BC%EB%94%94%EC%B2%B4A19_%EA%B1%B4%EB%A9%94%ED%83%88_gwihli.jpg' },
    { name: '라디체 A19(브러쉬드 니켈)', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757259/04_%EB%9D%BC%EB%94%94%EC%B2%B4A19_%EB%B8%8C%EB%9F%AC%EC%89%AC%EB%93%9C%EB%8B%88%EC%BC%88_x2qsya.jpg' },
    { name: '라디체 A49(실버)', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757264/05_%EB%9D%BC%EB%94%94%EC%B2%B4A49_%EC%8B%A4%EB%B2%84_unfl4q.jpg' },
    { name: '라디체 A49(브러쉬드 니켈)', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757261/06_%EB%9D%BC%EB%94%94%EC%B2%B4A49_%EB%B8%8C%EB%9F%AC%EC%89%AC%EB%93%9C%EB%8B%88%EC%BC%88_kjkun3.jpg' },
    { name: 'K2115', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757262/07_K2115_g562js.jpg' },
    { name: 'K8015', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757263/08_K8015_sgvbv6.jpg' },
    { name: 'K7215', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757265/09_K7215_l7eoym.jpg' },
    { name: 'K5415', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757253/10_K5415_mr22zw.jpg' },
    { name: 'K5115', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757249/11_K5115_dhdr3r.jpg' },
    { name: 'K3215', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757248/12_K3215_ele7fg.jpg' },
    { name: 'K6215', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757251/13_K6215_zukrzw.jpg' },
    { name: 'K3015', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757249/14_K3015_uufb3b.jpg' },
    { name: 'K1015', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757250/15_K1015_gpgyhk.jpg' },
    { name: 'K1815', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757252/16.K1815_ko6hai.jpg' }
];

const HOOD_OPTIONS = [
    { name: '허리케인 90', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757824/%ED%9B%84%EB%93%9C_%ED%97%88%EB%A6%AC%EC%BC%80%EC%9D%B890_rkipjt.jpg' },
    { name: '데코테라 90', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757822/%ED%9B%84%EB%93%9C_%EB%8D%B0%EC%BD%94%ED%85%8C%EB%9D%BC90_m9fvcr.jpg' },
    { name: '레인지', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757822/%ED%9B%84%EB%93%9C_%EB%A0%88%EC%9D%B8%EC%A7%80_h2ok4h.jpg' },
    { name: '하이드 60', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757821/%ED%9B%84%EB%93%9C_%ED%95%98%EC%9D%B4%EB%93%9C60_ycnzd7.jpg' },
    { name: '슬림루나 60', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757826/%ED%9B%84%EB%93%9C_%EC%8A%AC%EB%A6%BC%EB%A3%A8%EB%82%9860_qdtzkv.jpg' },
    { name: '스마일 60', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757827/%ED%9B%84%EB%93%9C_%EC%8A%A4%EB%A7%88%EC%9D%BC60_eza9wf.jpg' },
    { name: '침니 60', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757823/%ED%9B%84%EB%93%9C__%EC%B9%A8%EB%8B%8860_pn0jaf.jpg' },
    { name: '몽블랑 화이트 90', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757825/%ED%9B%84%EB%93%9C_%EB%AA%BD%EB%B8%94%EB%9E%91%ED%99%94%EC%9D%B4%ED%8A%B890_zui4vy.jpg' }
];

const COOKTOP_OPTIONS = [
    { name: '인덕션 3구', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757953/%EC%BF%A1%ED%83%91_%EC%9D%B8%EB%8D%95%EC%85%983%EA%B5%AC_rlradt.jpg' },
    { name: '하이브리드 3구(2IH+1H)', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757960/%EC%BF%A1%ED%83%91_%ED%95%98%EC%9D%B4%EB%B8%8C%EB%A6%AC%EB%93%9C3%EA%B5%AC_2IH_1H_wsuqlr.jpg' },
    { name: '하이브리드 3구(2H+1IH)', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757959/%EC%BF%A1%ED%83%91_%ED%95%98%EC%9D%B4%EB%B8%8C%EB%A6%AC%EB%93%9C3%EA%B5%AC_2H_1IH_o8mbt0.jpg' },
    { name: '하이브리드 3구(1H+2IH)', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757958/%EC%BF%A1%ED%83%91_%ED%95%98%EC%9D%B4%EB%B8%8C%EB%A6%AC%EB%93%9C3%EA%B5%AC_1H_2IH_nmyi1q.jpg' },
    { name: '하이라이트 3구', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757955/%EC%BF%A1%ED%83%91_%ED%95%98%EC%9D%B4%EB%9D%BC%EC%9D%B4%ED%8A%B83%EA%B5%AC_hwtyu3.jpg' },
    { name: '가스쿡탑 3구(실버)', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757954/%EC%BF%A1%ED%83%91_%EA%B0%80%EC%8A%A4%EC%BF%A1%ED%83%913%EA%B5%AC_%EC%8B%A4%EB%B2%84_btiwiy.jpg' },
    { name: '가스쿡탑 3구(블랙)', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780757952/%EC%BF%A1%ED%83%91_%EA%B0%80%EC%8A%A4%EC%BF%A1%ED%83%913%EA%B5%AC_%EB%B8%94%EB%9E%99_paoe5z.jpg' },
    { name: '가스쿡탑 2구(실버)', image: 'https://res.cloudinary.com/dfkntvpmv/image/upload/v1780758180/%EC%BF%A1%ED%83%91_%EA%B0%80%EC%8A%A4%EC%BF%A1%ED%83%912%EA%B5%AC_g0zqge.jpg' }
];

const HLine4Client: React.FC<HLine4ClientProps> = ({ partnerId, category = "주방" }) => {
    const [isMounted, setIsMounted] = useState(false);

    // Consultation States
    const [showConsultModal, setShowConsultModal] = useState(false);
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [layoutType, setLayoutType] = useState('ㅡ자형 (일자형)');
    const [isAgreed, setIsAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFloatingCta, setShowFloatingCta] = useState(false);

    // Interactive Swatches & Tabs
    const [activeStyle, setActiveStyle] = useState<'modern' | 'natural' | 'retro'>('modern');
    const [selectedRepColor, setSelectedRepColor] = useState('M300 스완 화이트');
    const [countertopMaterial, setCountertopMaterial] = useState<'marble' | 'stone' | 'ceramic'>('marble');
    const [selectedCountertop, setSelectedCountertop] = useState('어반화이트');
    const [activeHardwareTab, setActiveHardwareTab] = useState<'sink' | 'faucet' | 'hood' | 'cooktop'>('sink');

    const createCustomerMutation = useMutation(api.customers.createCustomer);
    const partner = useQuery(api.partners.getPartnerByUid, partnerId ? { uid: partnerId } : "skip");

    useEffect(() => {
        setIsMounted(true);
        const handleScroll = () => {
            setShowFloatingCta(window.scrollY > 450);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isMounted) return null;

    const handleConsultClick = () => setShowConsultModal(true);
    const handleCallClick = () => window.location.href = 'tel:15880883';

    const handleAutoHyphen = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        let formatted = raw;
        if (raw.length > 3 && raw.length <= 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
        else if (raw.length > 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
        setContact(formatted);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return alert('이름을 입력해주세요.');
        if (!contact.trim() || contact.length < 10) return alert('올바른 연락처를 입력해주세요.');
        if (!isAgreed) return alert('개인정보 수집 및 이용에 동의해주세요.');

        setIsSubmitting(true);
        try {
            await createCustomerMutation({
                category: category,
                name,
                contact,
                channel: partner ? `${partner.name}(H-LINE 4.0 Mobile)` : "H-LINE 4.0 모바일 카탈로그",
                label: "프리미엄",
                status: "접수",
                address: `[주방 레이아웃: ${layoutType}]`,
                created_at: new Date().toISOString().split('T')[0]
            });
            alert('카탈로그 맞춤 실측 신청이 완료되었습니다. 전문가가 빠른 시일 내에 연락드리겠습니다.');
            setShowConsultModal(false);
            setName('');
            setContact('');
            setIsAgreed(false);
        } catch (err) {
            console.error("Submit error:", err);
            alert('상담 신청 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0F0704] flex justify-center items-start overflow-y-auto">
            {/* Scoped Desktop Frame Wrapper */}
            <div className="w-full max-w-[576px] bg-white min-h-screen shadow-2xl relative overflow-x-hidden border-x border-[#2E211A] flex flex-col text-[#1C1C1C] antialiased">
                
                {/* Global CSS & Font definitions */}
                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
                    
                    body {
                        font-family: 'Noto Sans KR', sans-serif;
                    }
                    .font-serif {
                        font-family: 'Playfair Display', serif;
                    }
                    .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .hide-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}</style>

                {/* Navigation Header - Light Theme */}
                <nav className="sticky top-0 left-0 right-0 z-50 bg-white/95 border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img
                            src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1780802495/01_full_color_homecc_BI_kl2ybf.png"
                            alt="HomeCC Logo"
                            className="h-5"
                        />
                        <div className="w-[1px] h-3 bg-neutral-300 mx-1" />
                        <span className="font-serif text-sm font-black tracking-wider text-[#8A7355]">H-LINE 4.0</span>
                    </div>
                    <button
                        onClick={handleConsultClick}
                        className="bg-[#2A1E17] text-[#FAF9F5] px-4 py-1.5 text-xs font-black tracking-tight hover:bg-[#8A7355] transition-colors rounded-none"
                    >
                        실측 문의
                    </button>
                </nav>

                {/* Section 1: Hero Visual - Premium Dark Brown Gradient */}
                <section className="bg-gradient-to-br from-[#1A0E0A] via-[#321C11] to-[#140A06] pt-12 text-white">
                    <div className="space-y-4 px-6 mb-8">
                        <span className="inline-block border-b-2 border-[#C5A880] text-[#C5A880] text-xs font-black tracking-[0.25em] pb-1 uppercase">
                            HomeCC Kitchen H-LINE
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">
                            대한민국 창호 명가<br />
                            KCC글라스가 제안하는<br />
                            <span className="font-serif italic font-black text-[#C5A880] text-4xl">프리미엄 맞춤 가구</span>
                        </h1>
                        <p className="text-neutral-300 text-xs font-semibold leading-relaxed max-w-sm break-keep">
                            당신의 라이프스타일에 맞춘 품격 있는 주방. 홈씨씨 인테리어의 전 공정 본사 책임 관리를 통해 완벽한 핏의 주방을 선물합니다.
                        </p>
                    </div>

                    <img 
                        src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1775396662/%EC%97%B0%EC%B6%9C_2_a29bia.jpg" 
                        alt="주방 인테리어 메인 비주얼"
                        className="w-full aspect-[4/3] sm:aspect-video object-cover"
                    />
                </section>

                {/* Section 2: Showroom Info - Light Theme */}
                <section className="bg-white pb-16 pt-8 border-t border-neutral-200">
                    <div className="px-6 mb-6">
                        <span className="font-serif text-[#8A7355] text-xs font-black tracking-widest uppercase block mb-2">01 / Showrooms</span>
                        <h2 className="text-2xl font-black tracking-tight text-[#1C1C1C]">
                            전국 홈씨씨 인테리어<br />대형 전시장 안내
                        </h2>
                        <p className="text-neutral-600 text-xs font-semibold mt-3 leading-relaxed break-keep">
                            직접 눈으로 확인하고 만져볼 수 있는 대형 쇼룸에서 맞춤 가구의 하이엔드 퀄리티를 체험해 보세요. 가상 설계를 통해 우리 집 구조에 최적화된 결과물을 미리 볼 수 있습니다.
                        </p>
                    </div>

                    {/* Showroom Images Horizontally Scrollable */}
                    <div className="flex overflow-x-auto gap-4 px-6 snap-x snap-mandatory hide-scrollbar pb-2">
                        <div className="snap-center shrink-0 w-[260px] space-y-3">
                            <img 
                                src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1780797924/1f987eb1-7b0f-4913-8b45-a60eb1b6a822.png" 
                                alt="홈씨씨 인테리어 인천점" 
                                className="w-full aspect-video object-cover"
                            />
                            <div className="text-center">
                                <span className="text-xs font-black text-neutral-800">홈씨씨 인테리어 인천점</span>
                                <p className="text-[10px] font-semibold text-neutral-500 mt-0.5">대규모 주방 쇼룸 및 자재 갤러리 운영</p>
                            </div>
                        </div>
                        <div className="snap-center shrink-0 w-[260px] space-y-3">
                            <img 
                                src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1780797925/2cbe47f2-37af-4083-b383-0660e3d2ee21.png" 
                                alt="홈씨씨 인테리어 수원점" 
                                className="w-full aspect-video object-cover"
                            />
                            <div className="text-center">
                                <span className="text-xs font-black text-neutral-800">홈씨씨 인테리어 수원점</span>
                                <p className="text-[10px] font-semibold text-neutral-500 mt-0.5">비규격 무몰딩 실물 비교 코너 운영</p>
                            </div>
                        </div>
                        <div className="snap-center shrink-0 w-[260px] space-y-3">
                            <img 
                                src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1780810711/cd901939-bbb9-4bd0-a407-db3c60826228.png" 
                                alt="홈씨씨 인테리어 분당 전시관" 
                                className="w-full aspect-video object-cover"
                            />
                            <div className="text-center">
                                <span className="text-xs font-black text-neutral-800">홈씨씨 인테리어 분당 전시관</span>
                                <p className="text-[10px] font-semibold text-neutral-500 mt-0.5">빌트인 가전 결합 프리미엄 패키지 코너</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Expert Consulting - Premium Brown Gradient */}
                <section className="bg-gradient-to-br from-[#24130A] via-[#3B2316] to-[#1C0D06] py-16 border-t border-neutral-900 text-white">
                    <div className="px-6 mb-8">
                        <span className="font-serif text-[#C5A880] text-xs font-black tracking-widest uppercase block mb-2">02 / Expert Supervision</span>
                        <h2 className="text-2xl font-black tracking-tight text-white">
                            본사 책임 설계 및 시공
                        </h2>
                        <p className="text-neutral-300 text-xs font-semibold mt-3 leading-relaxed break-keep">
                            소형 개인 설비 업체의 시공 불안을 극복하고, 본사 직영 감리 시스템을 통해 엄격하게 실측과 공기를 준수합니다.
                        </p>
                    </div>

                    <div className="px-6 space-y-6">
                        {[
                            { 
                                num: '01', 
                                title: '전문가 맞춤 실측 서비스', 
                                desc: '도면 분석 후 공간 구조를 정밀 레이저 장비로 체크하여 무단차 레이아웃을 수립합니다.', 
                                image: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1780799194/Gemini_Generated_Image_ttpw8cttpw8cttpw_ryjz2g.jpg"
                            },
                            { 
                                num: '02', 
                                title: '본사 표준 시공 감리', 
                                desc: '체계화된 교육을 수료한 시공 마스터가 직접 조립 및 직각 레벨링 수평을 완벽하게 맞춥니다.', 
                                image: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1780799194/Gemini_Generated_Image_n1enovn1enovn1en_qagzcw.jpg"
                            },
                            { 
                                num: '03', 
                                title: '무상 A/S 및 사후보증제', 
                                desc: '1년 동안 발생하는 가구 변형이나 이음새 하자에 대해 확실한 본사 서비스를 제공합니다.', 
                                image: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1780799194/ChatGPT_Image_2026%EB%85%84_6%EC%9B%94_7%EC%9D%BC_%EC%98%A4%EC%A0%84_11_26_19_awolx7.png"
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-gradient-to-br from-[#2D1B13]/90 to-[#1F120C]/90 border border-[#4A3225]/60 p-5 space-y-4 shadow-sm text-white">
                                <div className="flex items-center gap-3">
                                    <span className="font-serif text-[#C5A880] text-xl font-black">{item.num}</span>
                                    <h3 className="text-sm font-black text-[#C5A880]">{item.title}</h3>
                                </div>
                                <p className="text-neutral-400 text-xs font-medium leading-relaxed break-keep">{item.desc}</p>
                                <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="w-full aspect-[21/9] object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 4: Brand Value - Light Theme */}
                <section className="bg-[#FAF9F5] py-16 px-6 border-t border-neutral-200">
                    <span className="font-serif text-[#8A7355] text-xs font-black tracking-widest uppercase block mb-2">03 / Quality Specifications</span>
                    <h2 className="text-2xl font-black tracking-tight text-[#1C1C1C] mb-4">
                        왜 홈씨씨 인테리어<br />주방가구여야 할까요?
                    </h2>
                    <p className="text-neutral-600 text-xs font-semibold leading-relaxed mb-8 break-keep">
                        눈부신 겉면보다 중요한 것은 보이지 않는 뼈대입니다. 매일 무거운 그릇이 수납되고, 음식이 닿는 공간이기에 보드 스펙부터 안전하게 구성했습니다.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white border border-neutral-200 p-5 space-y-2">
                            <span className="text-[#8A7355] text-[10px] font-black tracking-widest block">18T THICKNESS</span>
                            <h3 className="text-xs font-black text-neutral-800">18T 고강도 바디</h3>
                            <p className="text-neutral-500 text-[10px] font-semibold leading-relaxed break-keep">일반적인 15T 대비 20% 늘어난 두께로 상판 하중을 처짐 없이 분산합니다.</p>
                        </div>
                        <div className="bg-white border border-neutral-200 p-5 space-y-2">
                            <span className="text-[#8A7355] text-[10px] font-black tracking-widest block">E0 AN-SIM GRADE</span>
                            <h3 className="text-xs font-black text-neutral-800">100% E0 안심 보드</h3>
                            <p className="text-neutral-500 text-[10px] font-semibold leading-relaxed break-keep">유해 발출 가스를 제어하여 새집증후군과 호흡기 자극을 막아줍니다.</p>
                        </div>
                        <div className="bg-white border border-neutral-200 p-5 space-y-2">
                            <span className="text-[#8A7355] text-[10px] font-black tracking-widest block">GERMANY HINGE</span>
                            <h3 className="text-xs font-black text-neutral-800">독일 헤펠레 경첩</h3>
                            <p className="text-neutral-500 text-[10px] font-semibold leading-relaxed break-keep">소음과 여닫는 충격을 부드럽게 감쇄하는 유럽 정품 하드웨어 장착.</p>
                        </div>
                        <div className="bg-white border border-neutral-200 p-5 space-y-2">
                            <span className="text-[#8A7355] text-[10px] font-black tracking-widest block">ITALIAN SHELF PIN</span>
                            <h3 className="text-xs font-black text-neutral-800">이태리 다보 고정핀</h3>
                            <p className="text-neutral-500 text-[10px] font-semibold leading-relaxed break-keep">선반 이탈과 유격을 밀착 홀딩하여 그릇의 흔들림을 원천 방지.</p>
                        </div>
                    </div>

                    <img 
                        src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1780801089/ChatGPT_Image_2026%EB%85%84_6%EC%9B%94_7%EC%9D%BC_%EC%98%A4%EC%A0%84_11_58_00_sesjzu.png" 
                        alt="품질 테스트 및 내부 하드웨어 설계 이미지" 
                        className="w-full aspect-video object-cover"
                    />
                </section>

                {/* Section 5: Mood & Styles (Modern / Natural / Retro) - Premium Brown Gradient */}
                <section className="bg-gradient-to-br from-[#1F1009] via-[#362115] to-[#170C05] py-16 px-6 border-t border-neutral-900 text-white">
                    <span className="font-serif text-[#C5A880] text-xs font-black tracking-widest uppercase block mb-2">04 / Moods & Styles</span>
                    <h2 className="text-2xl font-black tracking-tight text-white mb-6">
                        다양한 무드 / 3가지 스타일
                    </h2>

                    {/* Series Tabs */}
                    <div className="flex border-b border-[#4A372C] mb-8">
                        {[
                            { key: 'modern', label: '모던 (Modern)' },
                            { key: 'natural', label: '네츄럴 (Natural)' },
                            { key: 'retro', label: '레트로 (Retro)' }
                        ].map((style) => (
                            <button
                                key={style.key}
                                onClick={() => {
                                    setActiveStyle(style.key as 'modern' | 'natural' | 'retro');
                                    if (style.key === 'modern') setSelectedRepColor('M300 스완 화이트');
                                    if (style.key === 'natural') setSelectedRepColor('N500 밀키 오크');
                                    if (style.key === 'retro') setSelectedRepColor('R300 카키 그레이');
                                }}
                                className={`flex-1 pb-3 text-xs font-black tracking-widest transition-all ${activeStyle === style.key ? 'border-b-2 border-[#C5A880] text-[#C5A880]' : 'text-neutral-500'}`}
                            >
                                {style.label}
                            </button>
                        ))}
                    </div>

                    {/* Line-up Content Display */}
                    <div className="space-y-6">
                        <AnimatePresence mode="wait">
                            {activeStyle === 'modern' && (
                                <motion.div
                                    key="modern"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <img 
                                        src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1780726890/ac06b5d4-03d0-43eb-982f-76cc9688325a.png" 
                                        alt="Modern 스타일 대표 주방 이미지" 
                                        className="w-full aspect-[4/3] object-cover"
                                    />
                                    
                                    <div className="space-y-3">
                                        <div className="flex flex-col">
                                            <span className="text-[#C5A880] text-xs font-black tracking-wider">23 Color</span>
                                            <h3 className="text-xl font-black text-[#C5A880] mt-1">Modern / 모던</h3>
                                        </div>
                                        <p className="text-neutral-300 text-xs font-semibold leading-relaxed break-keep">
                                            무채색 베이스의 차분하고 도시적인 스타일
                                        </p>
                                        
                                        <div className="pt-2">
                                            <span className="inline-block bg-[#1D140F] px-2.5 py-0.5 text-[10px] font-black text-[#C5A880] border border-neutral-900">
                                                대표컬러
                                            </span>
                                            <div className="grid grid-cols-2 gap-2 mt-3">
                                                {[
                                                    { name: 'M300 스완 화이트', bg: '#FAF9F6', text: '#1C1C1C' },
                                                    { name: 'M300 웜 화이트', bg: '#F3ECE0', text: '#1C1C1C' },
                                                    { name: 'M300 미스티 그레이', bg: '#E1D9C9', text: '#1C1C1C' },
                                                    { name: 'M300 마이티 그레이', bg: '#3E3D3A', text: '#FFFFFF' }
                                                ].map((color) => (
                                                    <button
                                                        key={color.name}
                                                        type="button"
                                                        onClick={() => setSelectedRepColor(color.name)}
                                                        className={`py-3 px-3 text-[11px] font-black transition-all flex items-center justify-between border select-none rounded-none ${selectedRepColor === color.name ? 'border-[#C5A880] ring-1 ring-[#C5A880]' : 'border-[#4A372C]'}`}
                                                        style={{ backgroundColor: color.bg, color: color.text }}
                                                    >
                                                        <span>{color.name}</span>
                                                        {selectedRepColor === color.name && <Check size={12} />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeStyle === 'natural' && (
                                <motion.div
                                    key="natural"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <img 
                                        src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1780726901/07e40ab1-6a5e-465a-a52f-a12b151cc4f5.png" 
                                        alt="Natural 스타일 대표 주방 이미지" 
                                        className="w-full aspect-[4/3] object-cover"
                                    />
                                    
                                    <div className="space-y-3">
                                        <div className="flex flex-col">
                                            <span className="text-[#C5A880] text-xs font-black tracking-wider">7 Color</span>
                                            <h3 className="text-xl font-black text-[#C5A880] mt-1">Natural / 네츄럴</h3>
                                        </div>
                                        <p className="text-neutral-300 text-xs font-semibold leading-relaxed break-keep">
                                            우드톤의 따뜻하고 자연 친화적인 감성을 담은 편안한 스타일
                                        </p>
                                        
                                        <div className="pt-2">
                                            <span className="inline-block bg-[#1D140F] px-2.5 py-0.5 text-[10px] font-black text-[#C5A880] border border-neutral-900">
                                                대표컬러
                                            </span>
                                            <div className="grid grid-cols-2 gap-2 mt-3">
                                                {[
                                                    { name: 'N500 밀키 오크', bg: '#E2D2B5', text: '#1C1C1C' },
                                                    { name: 'N500 텐더 오크', bg: '#D3B68A', text: '#1C1C1C' },
                                                    { name: 'N500 리치 오크', bg: '#C29F72', text: '#1C1C1C' },
                                                    { name: 'N500 브라이트 월넛', bg: '#977453', text: '#FFFFFF' }
                                                ].map((color) => (
                                                    <button
                                                        key={color.name}
                                                        type="button"
                                                        onClick={() => setSelectedRepColor(color.name)}
                                                        className={`py-3 px-3 text-[11px] font-black transition-all flex items-center justify-between border select-none rounded-none ${selectedRepColor === color.name ? 'border-[#C5A880] ring-1 ring-[#C5A880]' : 'border-[#4A372C]'}`}
                                                        style={{ backgroundColor: color.bg, color: color.text }}
                                                    >
                                                        <span>{color.name}</span>
                                                        {selectedRepColor === color.name && <Check size={12} />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeStyle === 'retro' && (
                                <motion.div
                                    key="retro"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <img 
                                        src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1780726913/0c050fd9-00f1-496c-87ab-7964714a59b6.png" 
                                        alt="Retro 스타일 대표 주방 이미지" 
                                        className="w-full aspect-[4/3] object-cover"
                                    />
                                    
                                    <div className="space-y-3">
                                        <div className="flex flex-col">
                                            <span className="text-[#C5A880] text-xs font-black tracking-wider">5 Color</span>
                                            <h3 className="text-xl font-black text-[#C5A880] mt-1">Retro / 레트로</h3>
                                        </div>
                                        <p className="text-neutral-300 text-xs font-semibold leading-relaxed break-keep">
                                            깊이감 있는 우드 소재와 포인트 컬러를 더해 개성 있는 스타일
                                        </p>
                                        
                                        <div className="pt-2">
                                            <span className="inline-block bg-[#1D140F] px-2.5 py-0.5 text-[10px] font-black text-[#C5A880] border border-neutral-900">
                                                대표컬러
                                            </span>
                                            <div className="grid grid-cols-2 gap-2 mt-3">
                                                {[
                                                    { name: 'R300 카키 그레이', bg: '#8E8B75', text: '#FFFFFF' },
                                                    { name: 'R300 스모키 스카이 블루', bg: '#C6CCD2', text: '#1C1C1C' },
                                                    { name: 'R300 딥 블루', bg: '#2E3A46', text: '#FFFFFF' },
                                                    { name: 'R500 체스트넛 오크', bg: '#5F4C3B', text: '#FFFFFF' }
                                                ].map((color) => (
                                                    <button
                                                        key={color.name}
                                                        type="button"
                                                        onClick={() => setSelectedRepColor(color.name)}
                                                        className={`py-3 px-3 text-[11px] font-black transition-all flex items-center justify-between border select-none rounded-none ${selectedRepColor === color.name ? 'border-[#C5A880] ring-1 ring-[#C5A880]' : 'border-[#4A372C]'}`}
                                                        style={{ backgroundColor: color.bg, color: color.text }}
                                                    >
                                                        <span>{color.name}</span>
                                                        {selectedRepColor === color.name && <Check size={12} />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* Section 6: Recommended Countertops - Light Theme */}
                <section className="bg-white py-16 px-6 border-t border-neutral-200">
                    <span className="font-serif text-[#8A7355] text-xs font-black tracking-widest uppercase block mb-2">05 / Countertops</span>
                    <h2 className="text-2xl font-black tracking-tight text-[#1C1C1C] mb-4">
                        추천 상판 사양
                    </h2>
                    <p className="text-neutral-600 text-xs font-semibold leading-relaxed mb-6 break-keep">
                        주방의 완성도와 분위기를 좌우하는 상판 마감재입니다. 홈씨씨가 엄선한 고품격 인조 대리석, 엔지니어드 스톤, 세라믹 라인업을 비교해 보세요.
                    </p>

                    {/* Countertop Material Category Tabs */}
                    <div className="flex gap-2 mb-6">
                        {[
                            { key: 'marble', label: '인조 대리석' },
                            { key: 'stone', label: '엔지니어드 스톤' },
                            { key: 'ceramic', label: '세라믹' }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => {
                                    setCountertopMaterial(tab.key as 'marble' | 'stone' | 'ceramic');
                                    const firstItem = COUNTERTOP_OPTIONS[tab.key as 'marble' | 'stone' | 'ceramic'][0].name;
                                    setSelectedCountertop(firstItem);
                                }}
                                className={`flex-1 py-2.5 text-xs font-black transition-all border ${
                                    countertopMaterial === tab.key
                                        ? 'bg-[#1C1C1C] border-[#1C1C1C] text-white shadow-md'
                                        : 'bg-white border-neutral-300 text-neutral-500'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Countertop Swatches Grid */}
                    <div className="bg-[#FAF9F5] border border-neutral-200 p-5 space-y-4 mb-6 shadow-sm">
                        <span className="text-[10px] font-black text-[#8A7355] block">SELECT COUNTERTOP STYLE</span>
                        
                        <div className="grid grid-cols-3 gap-3">
                            {COUNTERTOP_OPTIONS[countertopMaterial].map((item) => (
                                <button
                                    key={item.name}
                                    type="button"
                                    onClick={() => setSelectedCountertop(item.name)}
                                    className={`relative flex flex-col items-center justify-center p-2 border-2 transition-all select-none rounded-none bg-white ${
                                        selectedCountertop === item.name 
                                            ? 'border-[#8A7355] scale-105 shadow-md z-10' 
                                            : 'border-neutral-200 hover:border-neutral-300'
                                    }`}
                                >
                                    {/* Simulated swatch color box or real swatch image */}
                                    <div 
                                        className="w-full aspect-square border border-neutral-250 shadow-inner mb-2 overflow-hidden bg-neutral-100"
                                    >
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full" style={{ backgroundColor: item.color }} />
                                        )}
                                    </div>
                                    <span className="text-[10px] font-black text-neutral-800 text-center break-all leading-tight">
                                        {item.name}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Selected Countertop Detail Display */}
                        {(() => {
                            const selectedData = COUNTERTOP_OPTIONS[countertopMaterial].find(x => x.name === selectedCountertop) 
                                || COUNTERTOP_OPTIONS[countertopMaterial][0];
                            return (
                                <div className="border-t border-neutral-200 pt-4 mt-2 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="text-[9px] text-neutral-400 font-bold block">{selectedData.label}</span>
                                            <span className="text-xs font-black text-neutral-850">{selectedData.name}</span>
                                        </div>
                                        <span className="bg-[#FAF9F5] border border-neutral-250 px-2 py-0.5 text-[9px] font-black text-[#8A7355] uppercase tracking-wider">
                                            {countertopMaterial === 'marble' ? '인조 대리석' : countertopMaterial === 'stone' ? '엔지니어드 스톤' : '세라믹'}
                                        </span>
                                    </div>
                                    <p className="text-neutral-500 text-[10px] font-semibold leading-relaxed break-keep">
                                        {selectedData.desc}
                                    </p>
                                </div>
                            );
                        })()}
                    </div>

                    {(() => {
                        const repInfo = REPRESENTATIVE_IMAGES[countertopMaterial];
                        return (
                            <div className="w-full aspect-[16/10] border border-neutral-200 relative overflow-hidden bg-neutral-100 shadow-sm mt-6">
                                <img 
                                    src={repInfo.src} 
                                    alt={repInfo.alt}
                                    className="w-full h-full object-cover"
                                />
                                {/* Render "BEST 대표 연출" badge */}
                                <div className="absolute top-3 left-3 bg-[#C5A880] text-black font-black text-[10px] tracking-wider px-2.5 py-1 flex items-center gap-1 shadow-md">
                                    <Star size={10} fill="currentColor" />
                                    <span>BEST / 대표 연출</span>
                                </div>
                                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 text-[9px] font-black text-[#C5A880] tracking-wider uppercase">
                                    {repInfo.label}
                                </div>
                            </div>
                        );
                    })()}
                </section>

                {/* Section 7: Hardware & Accessories - Premium Brown Gradient */}
                <section className="bg-gradient-to-br from-[#1B0D07] via-[#321D12] to-[#150A05] py-16 border-t border-neutral-900 text-white">
                    <div className="px-6 mb-8">
                        <span className="font-serif text-[#C5A880] text-xs font-black tracking-widest uppercase block mb-2">06 / Hardware options</span>
                        <h2 className="text-2xl font-black tracking-tight text-white">
                            싱크볼부터 쿡탑까지,<br />품격 있는 액세서리 구성
                        </h2>
                    </div>

                    {/* Hardware Category Tabs */}
                    <div className="flex px-6 overflow-x-auto gap-2 hide-scrollbar mb-6">
                        {[
                            { id: 'sink', label: '싱크볼' },
                            { id: 'faucet', label: '주방 수전' },
                            { id: 'hood', label: '후드' },
                            { id: 'cooktop', label: '인덕션/쿡탑' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveHardwareTab(tab.id as 'sink' | 'faucet' | 'hood' | 'cooktop')}
                                className={`shrink-0 px-4 py-2 text-xs font-black transition-all border ${activeHardwareTab === tab.id
                                    ? 'bg-[#C5A880] border-[#C5A880] text-black shadow-md'
                                    : 'bg-[#2E211A] border-neutral-800 text-neutral-400'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Hardware Content Cards Display */}
                    <div className="px-6">
                        <AnimatePresence mode="wait">
                            {activeHardwareTab === 'sink' && (
                                <motion.div
                                    key="sink"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-gradient-to-br from-[#2D1C14] to-[#1E110A] border border-[#4C2E20]/50 p-4 shadow-sm mb-2">
                                        <span className="text-[#C5A880] text-[10px] font-black tracking-widest block uppercase">PREMIUM SINK BOWL LINE-UP</span>
                                        <h3 className="text-base font-black text-white mt-1 leading-snug">
                                            매일 쓰는 주방의 위생과 편의를 극대화하는 고기능성 프리미엄 싱크볼
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3.5">
                                        {SINKBOWL_OPTIONS.map((item, idx) => (
                                            <div 
                                                key={idx} 
                                                className="bg-gradient-to-br from-[#2D1C14] to-[#1E110A] border border-[#4C2E20]/50 p-2.5 flex flex-col space-y-2 shadow-sm rounded-none"
                                            >
                                                <div className="w-full aspect-[4/3] border border-[#4C2E20]/50 overflow-hidden bg-white flex items-center justify-center">
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.name} 
                                                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" 
                                                    />
                                                </div>
                                                <div className="text-center pt-1">
                                                    <span className="text-[11px] font-black text-white block truncate leading-tight">
                                                        {item.name}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeHardwareTab === 'faucet' && (
                                <motion.div
                                    key="faucet"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-gradient-to-br from-[#2D1C14] to-[#1E110A] border border-[#4C2E20]/50 p-4 shadow-sm mb-2">
                                        <span className="text-[#C5A880] text-[10px] font-black tracking-widest block uppercase">PREMIUM FAUCET LINE-UP</span>
                                        <h3 className="text-base font-black text-white mt-1 leading-snug">
                                            아름다운 곡선과 편리한 기능성으로 완성하는 고품격 주방 수전
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3.5">
                                        {FAUCET_OPTIONS.map((item, idx) => (
                                            <div 
                                                key={idx} 
                                                className="bg-gradient-to-br from-[#2D1C14] to-[#1E110A] border border-[#4C2E20]/50 p-2.5 flex flex-col space-y-2 shadow-sm rounded-none"
                                            >
                                                <div className="w-full aspect-[4/3] border border-[#4C2E20]/50 overflow-hidden bg-white flex items-center justify-center">
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.name} 
                                                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" 
                                                    />
                                                </div>
                                                <div className="text-center pt-1">
                                                    <span className="text-[11px] font-black text-white block truncate leading-tight">
                                                        {item.name}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeHardwareTab === 'hood' && (
                                <motion.div
                                    key="hood"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-gradient-to-br from-[#2D1C14] to-[#1E110A] border border-[#4C2E20]/50 p-4 shadow-sm mb-2">
                                        <span className="text-[#C5A880] text-[10px] font-black tracking-widest block uppercase">PREMIUM KITCHEN HOOD LINE-UP</span>
                                        <h3 className="text-base font-black text-white mt-1 leading-snug">
                                            쾌적하고 청결한 주방 공기를 유지하는 고기능성 후드
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3.5">
                                        {HOOD_OPTIONS.map((item, idx) => (
                                            <div 
                                                key={idx} 
                                                className="bg-gradient-to-br from-[#2D1C14] to-[#1E110A] border border-[#4C2E20]/50 p-2.5 flex flex-col space-y-2 shadow-sm rounded-none"
                                            >
                                                <div className="w-full aspect-[4/3] border border-[#4C2E20]/50 overflow-hidden bg-white flex items-center justify-center">
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.name} 
                                                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" 
                                                    />
                                                </div>
                                                <div className="text-center pt-1">
                                                    <span className="text-[11px] font-black text-white block truncate leading-tight">
                                                        {item.name}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeHardwareTab === 'cooktop' && (
                                <motion.div
                                    key="cooktop"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-gradient-to-br from-[#2D1C14] to-[#1E110A] border border-[#4C2E20]/50 p-4 shadow-sm mb-2">
                                        <span className="text-[#C5A880] text-[10px] font-black tracking-widest block uppercase">PREMIUM COOKTOP LINE-UP</span>
                                        <h3 className="text-base font-black text-white mt-1 leading-snug">
                                            안전하고 강력한 열원으로 완성하는 편리하고 스마트한 쿠킹 라이프
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3.5">
                                        {COOKTOP_OPTIONS.map((item, idx) => (
                                            <div 
                                                key={idx} 
                                                className="bg-gradient-to-br from-[#2D1C14] to-[#1E110A] border border-[#4C2E20]/50 p-2.5 flex flex-col space-y-2 shadow-sm rounded-none"
                                            >
                                                <div className="w-full aspect-[4/3] border border-[#4C2E20]/50 overflow-hidden bg-white flex items-center justify-center">
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.name} 
                                                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" 
                                                    />
                                                </div>
                                                <div className="text-center pt-1">
                                                    <span className="text-[11px] font-black text-white block truncate leading-tight">
                                                        {item.name}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* Section 8: LG Strategic Alliance - Light Theme */}
                <section className="bg-[#E5D9C8] py-16 px-6 border-t border-neutral-200">
                    <span className="font-serif text-[#8A7355] text-xs font-black tracking-widest uppercase block mb-2">07 / Premium Alliance</span>
                    <h2 className="text-2xl font-black tracking-tight text-[#1C1C1C] mb-4">
                        LG 빌트인 가전 동시 구독 패키지
                    </h2>
                    <p className="text-neutral-850 text-xs font-semibold leading-relaxed mb-6 break-keep">
                        주방 가구 도어가 정밀하게 맞아떨어질 때 빌트인 가전의 가치도 살아납니다. 홈씨씨는 LG전자 오브제 키친핏 가이드 사양과 결속 깊이를 연동하여 흔들림 없는 완벽한 라인 일치감을 이뤄냅니다.
                    </p>

                    <div className="bg-white border border-neutral-200 p-5 space-y-4 shadow-sm">
                        <span className="text-[#8A7355] text-[10px] font-black tracking-widest block">LG x HomeCC Special Event</span>
                        <h4 className="text-sm font-black text-neutral-850 leading-snug">주방 가구 리모델링 시 LG가전 특별 혜택 및 통합 구독 월 결제 지원</h4>
                        <img 
                            src="/lg_builtin_kitchen.png" 
                            alt="주방 가전 결합 시공 예시 렌더링 이미지" 
                            className="w-full aspect-video object-cover"
                        />
                    </div>
                </section>

                {/* Section 9: 60-Month Program & Warranty - Premium Brown Gradient */}
                <section className="bg-gradient-to-br from-[#221109] via-[#382013] to-[#1C0D06] py-16 px-6 border-t border-neutral-900 text-white">
                    <span className="font-serif text-[#C5A880] text-xs font-black tracking-widest uppercase block mb-2">08 / Financial Support</span>
                    <h2 className="text-2xl font-black tracking-tight text-white mb-6">
                        장기 부담 없는 약정 프로그램과<br />본사 직영 사후 보증
                    </h2>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-[#26150E] to-[#180C07] border border-[#3A2218]/50 p-6 space-y-3 shadow-sm">
                            <span className="text-[#C5A880] text-[10px] font-black tracking-widest block">60 MONTHS FLEX SUBSCRIPTION</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-[#C5A880]">59,000</span>
                                <span className="text-xs font-black text-neutral-500">원/월 ~ (최대 60개월 약정)</span>
                            </div>
                            <p className="text-neutral-400 text-xs font-semibold leading-relaxed break-keep">
                                초기 대형 인테리어 공사 비용을 한 번에 내는 부담 없이, 제휴 약정 결제를 통해 월 커피 가격 수준으로 프리미엄 맞춤 주방의 주인이 되실 수 있습니다.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-[#26150E] to-[#180C07] border border-[#3A2218]/50 p-6 space-y-3 shadow-sm">
                            <span className="text-neutral-400 text-[10px] font-black tracking-widest block">1-YEAR ASSURED GUARANTEE</span>
                            <h4 className="text-sm font-black text-white">1년 무상 안심 수리 서비스</h4>
                            <p className="text-neutral-400 text-xs font-semibold leading-relaxed break-keep">
                                도어 경첩 레벨 풀림, 도어 처짐, 배관 냄새 및 누수 점검 등 시공 후 발생하는 잔 하자에 대해 KCC 공식 파트너 마스터가 성실하고 성의 있는 무상 복구를 보증해 드립니다.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 10: Embedded Consultation Form - Light Theme */}
                <section className="bg-white py-16 px-6 border-t border-neutral-200">
                    <span className="font-serif text-[#8A7355] text-xs font-black tracking-widest uppercase block mb-2">09 / Free Measurement</span>
                    <h2 className="text-2xl font-black tracking-tight text-[#1C1C1C] mb-2">
                        무료 실측 및 견적 문의
                    </h2>
                    <p className="text-neutral-600 text-xs font-semibold mb-8 break-keep">
                        정확한 견적의 시작은 정밀 실측입니다. 성함과 연락처를 남겨주시면 본사 파트너 실측 전문가가 예약 일정을 정하고 방문 드리겠습니다.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-[#8A7355] uppercase tracking-wider block mb-2">Customer Name / 성함</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="성함을 입력하세요"
                                className="w-full bg-[#FAF9F5] border-b border-neutral-300 rounded-none px-4 py-3.5 text-neutral-850 placeholder:text-neutral-400 focus:outline-none focus:border-[#8A7355] transition-all text-sm font-medium"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-[#8A7355] uppercase tracking-wider block mb-2">Contact Number / 연락처</label>
                            <input
                                type="tel"
                                value={contact}
                                onChange={handleAutoHyphen}
                                placeholder="연락처를 입력하세요"
                                className="w-full bg-[#FAF9F5] border-b border-neutral-300 rounded-none px-4 py-3.5 text-neutral-850 placeholder:text-neutral-400 focus:outline-none focus:border-[#8A7355] transition-all text-sm font-medium"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-[#8A7355] uppercase tracking-wider block mb-2">Kitchen Layout / 희망 주방 형태</label>
                            <div className="relative">
                                <select
                                    value={layoutType}
                                    onChange={(e) => setLayoutType(e.target.value)}
                                    className="w-full bg-[#FAF9F5] border-b border-neutral-300 rounded-none px-4 py-3.5 text-neutral-850 focus:outline-none focus:border-[#8A7355] text-sm cursor-pointer appearance-none pr-10 transition-all font-medium"
                                >
                                    <option value="ㅡ자형 (일자형)">ㅡ자형 (기본 일자형)</option>
                                    <option value="ㄱ자형 (코너 기역자형)">ㄱ자형 (실속 코너형)</option>
                                    <option value="ㄷ자형 (디귿자 대형)">ㄷ자형 (대형 다이닝형)</option>
                                    <option value="아일랜드 독립형">아일랜드형 (대형 대면 주방)</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-450 pointer-events-none w-4 h-4" />
                            </div>
                        </div>

                        <div className="bg-[#FAF9F5] rounded-none p-4 border border-neutral-150">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="relative mt-0.5 shrink-0">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={isAgreed}
                                        onChange={(e) => setIsAgreed(e.target.checked)}
                                    />
                                    <div className="w-4 h-4 border border-neutral-350 rounded-none peer-checked:bg-[#8A7355] peer-checked:border-[#8A7355] transition-all flex items-center justify-center bg-white">
                                        <Check size={10} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <span className="text-[11px] text-neutral-600 font-semibold group-hover:text-neutral-800 transition-colors leading-relaxed select-none">
                                    [필수] 개인정보 수집 및 이용에 동의합니다.<br />
                                    <span className="text-[10px] text-neutral-400 font-normal">(수집항목: 성함, 연락처 / 목적: 주방 무료 실측 예약 상담)</span>
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#2A1E17] text-white font-black py-[20px] rounded-none flex items-center justify-center gap-3 hover:bg-[#8A7355] active:scale-[0.98] transition-all disabled:opacity-50 text-base shadow-lg tracking-wider"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    신청 접수 진행 중...
                                </>
                            ) : (
                                <>
                                    무료 실측 일정 신청
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </section>

                {/* Footer block - Dark Theme Gradient */}
                <footer className="py-12 px-6 bg-gradient-to-br from-[#160E0A] to-[#0E0604] text-neutral-450 border-t border-[#2E211A]">
                    <img
                        src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1780802495/01_full_color_homecc_BI_kl2ybf.png"
                        alt="Logo"
                        className="h-5 mb-4 grayscale invert brightness-200"
                    />
                    <div className="text-[10px] leading-relaxed text-neutral-500 space-y-1.5 break-keep">
                        <p className="font-bold text-neutral-400">판매사 정보</p>
                        <p>
                            주식회사 티유디지털(KCC글라스 판매점) <span className="text-neutral-700">|</span> 대표 : 김정열 <span className="text-neutral-700">|</span> 주소 : 서울시 금천구 가산디지털1로 83, 802호 <span className="text-neutral-700">|</span> 사업자등록번호 : 220-87-15092
                        </p>
                        <p>
                            고객센터 : 1588-0883 <span className="text-neutral-700">|</span> 개인정보 관리자 : 김은경 (kek3171@nate.com)
                        </p>
                        <p className="text-neutral-600 mt-2">
                            본 페이지는 홈씨씨 인테리어 H-LINE 홍보 및 온라인 상담 신청을 위한 랜딩페이지입니다.
                        </p>
                        <p className="text-neutral-600">© 2026 KCC GLASS HomeCC. All Rights Reserved.</p>
                    </div>
                </footer>

                {/* Floating CTA */}
                <AnimatePresence>
                    {showFloatingCta && (
                        <motion.div
                            initial={{ y: 80, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 80, opacity: 0 }}
                            className="fixed bottom-0 inset-x-0 mx-auto z-40 w-full max-w-[576px] px-6 pb-6 pt-2 bg-gradient-to-t from-white via-white/90 to-transparent"
                        >
                            <div className="bg-white border border-neutral-250 rounded-none p-2.5 flex gap-3 shadow-md">
                                <button
                                    onClick={handleConsultClick}
                                    className="flex-1 bg-[#2A1E17] text-white font-black py-3.5 rounded-none flex items-center justify-center gap-2 text-xs hover:bg-[#8A7355] transition-colors"
                                >
                                    <MessageSquare size={16} />
                                    실시간 견적 상담
                                </button>
                                <button
                                    onClick={handleCallClick}
                                    className="w-12 bg-white border border-neutral-250 rounded-none flex items-center justify-center hover:bg-neutral-50 transition-colors"
                                >
                                    <PhoneCall size={18} className="text-[#8A7355]" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mobile Fallback Modal Trigger - Light Theme */}
                <AnimatePresence>
                    {showConsultModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-xs"
                        >
                            <div
                                className="absolute inset-0"
                                onClick={() => !isSubmitting && setShowConsultModal(false)}
                            />
                            <motion.div
                                initial={{ scale: 0.98, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.98, opacity: 0 }}
                                className="relative z-10 w-full max-w-sm bg-white border border-neutral-250 rounded-none p-6 shadow-xl text-[#1C1C1C]"
                            >
                                <button
                                    onClick={() => setShowConsultModal(false)}
                                    className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
                                >
                                    <X size={18} />
                                </button>

                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-black text-[#8A7355] mb-1">프리미엄 맞춤 상담</h3>
                                    <p className="text-neutral-450 text-[10px] italic">H-LINE 설계 매니저가 직접 연락드립니다.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-[9px] font-black text-[#8A7355] uppercase tracking-wider block mb-1">Customer Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="성함을 입력하세요"
                                            className="w-full bg-[#FAF9F5] border border-neutral-200 rounded-none px-4 py-2.5 text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-[#8A7355] text-xs"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-[#8A7355] uppercase tracking-wider block mb-1">Contact Number</label>
                                        <input
                                            type="tel"
                                            value={contact}
                                            onChange={handleAutoHyphen}
                                            placeholder="연락처를 입력하세요"
                                            className="w-full bg-[#FAF9F5] border border-neutral-200 rounded-none px-4 py-2.5 text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-[#8A7355] text-xs"
                                            required
                                        />
                                    </div>

                                    <div className="bg-[#FAF9F5] rounded-none p-3 border border-neutral-200">
                                        <label className="flex items-start gap-2 cursor-pointer group">
                                            <div className="relative mt-0.5">
                                                <input
                                                    type="checkbox"
                                                    className="peer sr-only"
                                                    checked={isAgreed}
                                                    onChange={(e) => setIsAgreed(e.target.checked)}
                                                />
                                                <div className="w-3.5 h-3.5 border border-neutral-300 rounded-none peer-checked:bg-[#8A7355] peer-checked:border-[#8A7355] transition-all" />
                                                <Check size={10} className="absolute top-0 left-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                            </div>
                                            <span className="text-[9px] text-neutral-500 group-hover:text-neutral-700 leading-normal">
                                                개인정보 수집 및 이용에 동의합니다.
                                            </span>
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-[#1C1C1C] text-white font-black py-3.5 rounded-none flex items-center justify-center gap-2 hover:bg-[#8A7355] transition-colors disabled:opacity-50 text-xs"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin" size={14} />
                                                상담 신청 중...
                                            </>
                                        ) : (
                                            <>
                                                상담 신청 완료
                                                <ArrowRight size={14} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default HLine4Client;
