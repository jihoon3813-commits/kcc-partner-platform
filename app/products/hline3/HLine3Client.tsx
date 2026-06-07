'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    Phone, MessageSquare, ChevronDown, Check, ShieldCheck, Trophy,
    Shield, Leaf, Scissors, X, Loader2, User, PhoneCall,
    Sparkles, CreditCard, Layout, Zap, ArrowRight, Star, Anchor,
    Play, Volume2, ChevronLeft, ChevronRight, HelpCircle
} from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface HLine3ClientProps {
    partnerId?: string | null;
    category?: string;
}

const HLine3Client: React.FC<HLine3ClientProps> = ({ partnerId, category = "주방" }) => {
    const [isMounted, setIsMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    // Consultation States
    const [showConsultModal, setShowConsultModal] = useState(false);
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [isAgreed, setIsAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFloatingCta, setShowFloatingCta] = useState(false);

    // Interactive States
    const [costType, setCostType] = useState<'standard' | 'hline'>('hline');
    const [activeSpecTab, setActiveSpecTab] = useState<number>(0);
    const [activeEcoGrade, setActiveEcoGrade] = useState<string>('E0');
    const [activeCaseIdx, setActiveCaseIdx] = useState<number>(0);
    const [selectedLGProduct, setSelectedLGProduct] = useState(0);
    const [currentLGMediaIdx, setCurrentLGMediaIdx] = useState(0);
    const [isLGMediaHovered, setIsLGMediaHovered] = useState(false);

    const lgProducts = [
        { name: '냉장고', en: 'Refrigerator', img: 'https://www.lge.co.kr/kr/images/refrigerators/md10516831/gallery/large02.jpg' },
        { name: '김치냉장고', en: 'Kimchi Fridge', img: 'https://www.lge.co.kr/kr/images/kimchi-refrigerators/md10432829/gallery/large01.jpg' },
        { name: '인덕션', en: 'Induction', img: 'https://www.lge.co.kr/kr/images/electric-ranges/md10372836/gallery/large01.jpg' },
        { name: '정수기', en: 'Water Purifier', img: 'https://www.lge.co.kr/kr/images/water-purifiers/md10017839/gallery/large01.jpg' },
        { name: '광파오븐', en: 'Triple Cook Oven', img: 'https://www.lge.co.kr/kr/images/microwaves-and-ovens/md10200826/gallery/large01.jpg' },
        { name: '식기세척기', en: 'Dishwasher', img: 'https://www.lge.co.kr/kr/images/dishwashers/md10491826/gallery/large01.jpg' }
    ];

    const createCustomerMutation = useMutation(api.customers.createCustomer);
    const partner = useQuery(api.partners.getPartnerByUid, partnerId ? { uid: partnerId } : "skip");

    // Parallax & Scroll Animations (Scoped to viewport height)
    const heroOpacity = useTransform(scrollY, [0, 350], [1, 0.35]);
    const heroScale = useTransform(scrollY, [0, 350], [1, 1.03]);

    useEffect(() => {
        setIsMounted(true);
        const handleScroll = () => {
            setShowFloatingCta(window.scrollY > 450);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setCurrentLGMediaIdx(0);
    }, [selectedLGProduct]);

    const lgRefrigeratorMedia = [
        { type: 'video', url: 'https://www.lge.co.kr/kr/images/_2025_kimchi-refrigerators_Z334AAA171/2.0/01-builtin-detail-1.mp4', title: 'LG Objet Refrigerator' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/refrigerators/interior/i4.jpg', title: 'Modern Kitchen Fit' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/refrigerators/interior/I5.jpg', title: 'Seamless Integration' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/refrigerators/interior/i6.jpg', title: 'Premium Finish' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/refrigerators/interior/i1.jpg', title: 'Smart Storage' }
    ];

    const lgKimchiMedia = [
        { type: 'video', url: 'https://www.lge.co.kr/kr/images/_2025-kimchi-refrigerators-484/2.0/02-hinge-card-d.mp4', title: 'Kimchi Fridge Hinge' },
        { type: 'video', url: 'https://www.lge.co.kr/kr/images/_2025-kimchi-refrigerators-484/2.0/01-builtin-detail-1.mp4', title: 'Built-in Performance' },
        { type: 'video', url: 'https://www.lge.co.kr/kr/images/_2025-kimchi-refrigerators-484/1.0/01-open-d.mp4', title: 'Easy Open Design' }
    ];

    const lgInductionMedia = [
        { type: 'video', url: 'https://www.lge.co.kr/kr/images/electric-ranges/md10370826/24_induction_cover_01.mp4', title: 'Power Induction Performance' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/electric-ranges/md10372836/gallery/large-interior01.jpg', title: 'Premium Kitchen Look' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/usp_dcr/24_induction_detail_02_01_BEF3AMB4.gif', title: 'Smart Cooking System' }
    ];

    const lgWaterPurifierMedia = [
        { type: 'video', url: 'https://www.lge.co.kr/kr/images/water-purifiers/md09038834/usp/DualPurifier_3D_1380x620_PC.mp4', title: 'Dual Purifier 3D' },
        { type: 'video', url: 'https://www.lge.co.kr/kr/images/water-purifiers/md09140827/usp/usp_06_01_PC.mp4', title: 'Advanced Water Filtration' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/water-purifiers/md09140827/usp/usp_02_01_PC.jpg', title: 'Pristine Water Quality' }
    ];

    const lgOvenMedia = [
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/microwaves-and-ovens/md10200826/oven_design_Cover.gif', title: 'Premium Light Wave Design' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/microwaves-and-ovens/md10200826/oven_triplecook_Detail_01_1.gif', title: 'Triple Cook System' }
    ];

    const lgDishwasherMedia = [
        { type: 'video', url: 'https://www.lge.co.kr/kr/exp_content/dishwashers/img/video/video_exp_intro_PC.mp4', title: 'LG Dishwasher Experience' },
        { type: 'video', url: 'https://www.lge.co.kr/kr/images/dishwashers/common/25_dishwasher_truesteam_tvc.mp4', title: 'TrueSteam Technology' }
    ];

    const currentMediaSet = selectedLGProduct === 0 ? lgRefrigeratorMedia :
        selectedLGProduct === 1 ? lgKimchiMedia :
            selectedLGProduct === 2 ? lgInductionMedia :
                selectedLGProduct === 3 ? lgWaterPurifierMedia :
                    selectedLGProduct === 4 ? lgOvenMedia :
                        selectedLGProduct === 5 ? lgDishwasherMedia : [];

    const handleNextLGMedia = useCallback(() => {
        if (currentMediaSet.length > 0) {
            setCurrentLGMediaIdx(prev => (prev === currentMediaSet.length - 1 ? 0 : prev + 1));
        }
    }, [currentMediaSet.length]);

    useEffect(() => {
        if (!isLGMediaHovered && currentMediaSet.length > 0 && currentMediaSet[currentLGMediaIdx]?.type === 'image') {
            const timer = setTimeout(handleNextLGMedia, 2500);
            return () => clearTimeout(timer);
        }
    }, [currentLGMediaIdx, handleNextLGMedia, isLGMediaHovered, currentMediaSet]);

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
                channel: partner ? `${partner.name}(H-LINE 3.0 Mobile)` : "H-LINE 3.0 모바일 랜딩",
                label: "프리미엄",
                status: "접수",
                address: "",
                created_at: new Date().toISOString().split('T')[0]
            });
            alert('프리미엄 상담 신청이 완료되었습니다. 전문가가 곧 연락드리겠습니다.');
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

    // Specs tabs details
    const specTabs = [
        {
            num: '01 / STRUCTURE',
            title: '18T 견고한 프레임 바디',
            desc: '일반 기성 가구(15T) 대비 두께를 20% 늘린 고강도 프레임 공법을 채용하여, 무거운 대형 주방용품이나 식자재 수납 시에도 뒤틀림이나 선반 휘어짐 현상을 완벽에 가깝게 억제합니다.',
            img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272832/5.%EA%B2%AC%EA%B3%A0%ED%95%9C_%EB%BC%88%EB%8C%80_kd3gcc.png'
        },
        {
            num: '02 / ECO-FRIENDLY',
            title: 'E0 등급 친환경 안심 보드',
            desc: '요리하는 순간 발생하는 미세 오염원까지 차단합니다. 포름알데히드 방출량을 엄격히 억제한 친환경 E0 목재만을 100% 사용하여, 눈 시림이 없고 호흡기가 편안한 무독성 공간을 만듭니다.',
            img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272832/6.%EC%B9%9C%ED%99%98%EA%B2%BD_%EC%95%88_%EC%8B%AC%EC%9E%90%EC%9E%AC_ftlhah.png'
        },
        {
            num: '03 / HARDWARE',
            title: '독일 Häfele 저압 댐퍼',
            desc: '보이지 않는 하드웨어 명품을 더합니다. 수만 번 여닫아도 처음과 같이 소음과 충격을 완화해 주며 문이 부드럽게 닫히는 최상의 정숙함을 선사합니다.',
            img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272833/7._%ED%95%98%ED%8E%A0_%EA%B2%BD%EC%B2%A9_%ED%9D%B0_gmwdia.jpg'
        }
    ];

    // Case studies details
    const caseStudies = [
        {
            caseNum: 'CASE 01',
            location: '서울 개포 대청아파트 (25평형)',
            desc: '동선을 극대화한 일자 주방과 일체감 있는 냉장고장 수납 설계.',
            topSpec: 'MMA 슈가베이지 / 모던 실키그레이 도어',
            images: [
                { url: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272834/14-4.%EC%82%AC%EB%A1%801-4_imtvhr.jpg', caption: '실제 주방 매칭 및 빌트인 레이아웃' },
                { url: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272834/14-5.%EC%82%AC%EB%A1%801-5_ktgcyq.jpg', caption: '상부장 조명 몰딩 매립 공법' },
                { url: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272835/14-6.%EC%82%AC%EB%A1%801-6_wtlwz8.jpg', caption: '하부 와인 수납 아일랜드장 구성' }
            ]
        },
        {
            caseNum: 'CASE 02',
            location: '인천 청라 청라자이 (55평형)',
            desc: '무서라운딩(상하부 몰딩 노출 최소화) 공법과 Blum 리프터 적용 하이엔드 주방.',
            topSpec: '빅슬랩 슬레이트블랙 세라믹 / 마이티그레이 도어',
            images: [
                { url: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272836/15-1.%EC%82%AC%EB%A1%802-1_o20ivz.jpg', caption: '무몰딩 공법의 프리미엄 일체감' },
                { url: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272836/15-2.%EC%82%AC%EB%A1%802-2_hdwurl.jpg', caption: '대형 아일랜드 세라믹 매칭' },
                { url: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272836/15-5.%EC%82%AC%EB%A1%802-5_nry56g.jpg', caption: 'Blum 오스트리아 정품 리프트업 시스템' }
            ]
        }
    ];

    return (
        <div className="min-h-screen w-full bg-[#D5D2CC] flex justify-center items-start overflow-y-auto">
            {/* Scoped Desktop Frame Wrapper */}
            <div className="w-full max-w-[576px] bg-[#FAF9F5] min-h-screen shadow-2xl relative overflow-x-hidden border-x border-neutral-300 flex flex-col text-[#1C1C1C] antialiased">
                
                {/* Global Font styles */}
                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
                    
                    body {
                        font-family: 'Noto Sans KR', sans-serif;
                    }
                    .font-serif {
                        font-family: 'Playfair Display', serif;
                    }
                    /* Scrollbar custom for mobile content */
                    .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .hide-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}</style>

                {/* Mobile Scoped Header */}
                <nav className="sticky top-0 left-0 right-0 z-50 bg-white/95 border-b border-neutral-300 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img
                            src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1780802495/01_full_color_homecc_BI_kl2ybf.png"
                            alt="HomeCC Logo"
                            className="h-5 animate-pulse"
                        />
                        <div className="w-[1px] h-3 bg-neutral-300 mx-1" />
                        <span className="font-serif text-sm font-semibold tracking-wider text-[#8A7355]">H-LINE 3.0</span>
                    </div>
                    <button
                        onClick={handleConsultClick}
                        className="bg-[#1C1C1C] text-white px-4 py-1.5 text-[11px] font-bold tracking-tight hover:bg-[#8A7355] transition-colors rounded-none"
                    >
                        견적 문의
                    </button>
                </nav>

                {/* Section 1: Mobile Premium Hero */}
                <section className="relative w-full h-[62vh] min-h-[420px] flex flex-col justify-end bg-[#FAF9F5] px-6 pb-12">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="https://hcc.kccglass.co.kr/interior/editor/images/000042/08_(3).jpg"
                            alt="Background"
                            fill
                            className="object-cover opacity-45"
                            priority
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F5] via-[#FAF9F5]/40 to-transparent" />
                    </div>

                    <div className="relative z-10 space-y-4">
                        <span className="inline-block border-b border-[#8A7355] text-[#8A7355] text-xs font-bold tracking-[0.2em] pb-1 uppercase">
                            Premium Kitchen Portfolio
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-light tracking-tight leading-tight text-[#1C1C1C]">
                            KCC글라스가 제안하는<br />
                            실제 프리미엄 맞춤 주방<br />
                            <span className="font-serif italic font-medium text-[#8A7355] text-4xl">H-LINE 3.0</span>
                        </h1>
                        <p className="text-neutral-600 text-sm leading-relaxed max-w-sm break-keep font-light">
                            규격의 한계와 비정형 비용 거품을 없앤 공간 솔루션. 친환경 안심 프레임과 고급 사양의 명료한 대안.
                        </p>

                        <div className="flex flex-wrap gap-2 pt-2">
                            {['독립 비규격 맞춤', 'E0 친환경 안심', '독일 헤펠레 하드웨어'].map((label) => (
                                <span key={label} className="bg-white border border-neutral-200 text-neutral-700 px-3 py-1.5 text-[10px] font-semibold tracking-wider">
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 2: Interactive Cost Switcher (터치형 비교 스태커) */}
                <section className="bg-white py-16 px-6 border-t border-neutral-300">
                    <span className="font-serif text-[#8A7355] text-xs font-semibold tracking-widest uppercase block mb-2">01 / Cost Policy</span>
                    <h2 className="text-2xl font-bold tracking-tight text-[#1C1C1C] mb-4 break-keep">
                        비규격 공간 설계 시<br />추가 비용, 얼마나 오를까요?
                    </h2>
                    <p className="text-neutral-500 text-sm leading-relaxed mb-8 break-keep">
                        일반 기성 가구는 정해진 자재 규격을 벗어나는 순간 불필요한 공정과 비용이 추가되지만, 홈씨씨 H-LINE은 시스템 최적화로 최소한의 비용으로 구현합니다.
                    </p>

                    {/* Selector Switch */}
                    <div className="flex border border-neutral-200 rounded-none mb-6 overflow-hidden">
                        <button
                            onClick={() => setCostType('standard')}
                            className={`flex-1 py-3 text-xs font-bold tracking-wide transition-colors ${costType === 'standard' ? 'bg-[#FF5252] text-white font-black' : 'bg-neutral-50 text-neutral-500'}`}
                        >
                            타사 맞춤형 가구
                        </button>
                        <button
                            onClick={() => setCostType('hline')}
                            className={`flex-1 py-3 text-xs font-bold tracking-wide transition-colors ${costType === 'hline' ? 'bg-[#8A7355] text-white font-black' : 'bg-neutral-50 text-neutral-500'}`}
                        >
                            홈씨씨 H-LINE
                        </button>
                    </div>

                    {/* Animated Cost Card */}
                    <div className="bg-[#FAF9F5] border border-neutral-200 p-6 min-h-[170px] flex flex-col justify-between">
                        <AnimatePresence mode="wait">
                            {costType === 'standard' ? (
                                <motion.div
                                    key="standard"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-red-500 text-xs font-bold uppercase tracking-wider">Estimated Cost Elevation</span>
                                        <span className="text-red-500 text-lg font-black">+150% ~ 200%</span>
                                    </div>
                                    <div className="w-full bg-neutral-200 h-2">
                                        <div className="bg-[#FF5252] h-full w-[85%]" />
                                    </div>
                                    <p className="text-neutral-500 text-xs leading-relaxed break-keep">
                                        규격을 변경할 때마다 비규격 특별 수수료가 적용되며, 자재 손실 비용(Loss)이 구매 금액에 청구되어 최종 주방 견적이 극심하게 폭등합니다.
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="hline"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#8A7355] text-xs font-bold uppercase tracking-wider">Optimize Added Cost</span>
                                        <span className="text-[#8A7355] text-lg font-black">실제 원가 수준 최적화</span>
                                    </div>
                                    <div className="w-full bg-neutral-200 h-2">
                                        <div className="bg-[#8A7355] h-full w-[40%]" />
                                    </div>
                                    <p className="text-[#8A7355] text-xs leading-relaxed break-keep">
                                        KCC의 표준 비규격 절단 공정 기술(CNC 절단 공정 최적화)을 통해 낭비되는 원자재 비용을 최소화하여 기본 시공비 범위와 유사한 수준으로 맞춤 가구를 납품합니다.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* Section 3: Mobile Pain Points (Horizontal Scroll Flow) - 색상 진하게 보강 (#EFECE6) */}
                <section className="bg-[#EFECE6] py-16 border-t border-neutral-300">
                    <div className="px-6 mb-6">
                        <span className="font-serif text-[#8A7355] text-xs font-semibold tracking-widest uppercase block mb-2">02 / Obstacles</span>
                        <h2 className="text-2xl font-bold tracking-tight text-[#1C1C1C]">
                            주방 공사 전,<br />고객들이 망설이는 3가지 이유
                        </h2>
                    </div>

                    {/* Touch Swipe container */}
                    <div className="flex overflow-x-auto gap-4 px-6 snap-x snap-mandatory hide-scrollbar pb-4">
                        {[
                            {
                                num: '01',
                                title: '예상을 초과하는 비싼 견적',
                                desc: '상판 두께나 레이아웃 변경 시 옵션 명목으로 마구 부풀려지는 주방 가구 비용 부담.'
                            },
                            {
                                num: '02',
                                title: '하자 및 애프터서비스(A/S) 불안',
                                desc: '가장 싼 사제 가구(사설 싱크대)는 공사 후 도어 처짐이나 이음새 뒤틀림 발생 시 사후 처리가 막막함.'
                            },
                            {
                                num: '03',
                                title: '어정쩡하게 뜨는 기성 규격',
                                desc: '표준 도어 규격만 취급하는 브랜드 가구는 기껏 맞췄지만 천장 몰딩 부위가 뜨거나 어색한 틈이 발생함.'
                            }
                        ].map((card, i) => (
                            <div
                                key={i}
                                className="snap-center shrink-0 w-[260px] bg-white border border-neutral-200 p-6 flex flex-col justify-between min-h-[220px] shadow-sm"
                            >
                                <span className="font-serif text-3xl font-light text-[#8A7355]/50 block mb-4">{card.num}</span>
                                <div>
                                    <h4 className="text-base font-bold text-neutral-800 mb-2 break-keep">{card.title}</h4>
                                    <p className="text-neutral-500 text-xs leading-relaxed break-keep">{card.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="px-6 text-center text-[10px] text-neutral-500 font-bold tracking-wider pt-2">
                        ← 좌우로 터치 스와이프하여 확인하세요
                    </div>
                </section>

                {/* Section 4: Premium Inside Tabs (인터랙티브 명세 탭) */}
                <section className="bg-white py-16 px-6 border-t border-neutral-300">
                    <span className="font-serif text-[#8A7355] text-xs font-semibold tracking-widest uppercase block mb-2">03 / Specs Verified</span>
                    <h2 className="text-2xl font-bold tracking-tight text-[#1C1C1C] mb-6">
                        보이지 않는 곳에서 드러나는<br />하드웨어 및 마감의 차이
                    </h2>

                    {/* Specs Tabs Header */}
                    <div className="flex border-b border-neutral-200 mb-6">
                        {specTabs.map((tab, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveSpecTab(idx)}
                                className={`flex-1 pb-3 text-[11px] font-black tracking-tighter transition-all ${activeSpecTab === idx ? 'border-b-2 border-[#8A7355] text-[#8A7355]' : 'text-neutral-400'}`}
                            >
                                {idx + 1}. {tab.title.split(' ')[0]}
                            </button>
                        ))}
                    </div>

                    {/* Spec Tab Panel */}
                    <div className="space-y-6">
                        <div className="relative aspect-video w-full border border-neutral-200 bg-neutral-100 overflow-hidden">
                            <Image
                                src={specTabs[activeSpecTab].img}
                                alt={specTabs[activeSpecTab].title}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                        <div className="space-y-2">
                            <span className="font-serif text-xs text-[#8A7355] font-black">{specTabs[activeSpecTab].num}</span>
                            <h3 className="text-lg font-bold text-neutral-800">{specTabs[activeSpecTab].title}</h3>
                            <p className="text-neutral-500 text-xs leading-relaxed break-keep">{specTabs[activeSpecTab].desc}</p>
                        </div>
                    </div>
                </section>

                {/* Section 5: Eco Grade E0 Calculator (친환경 등급 선택) - 색상 진하게 보강 (#D5E0D2) */}
                <section className="bg-[#D5E0D2] py-16 px-6 border-t border-neutral-300">
                    <span className="font-serif text-[#4A5746] text-xs font-semibold tracking-widest uppercase block mb-2">04 / Indoor Safety</span>
                    <h2 className="text-2xl font-bold tracking-tight text-neutral-900 mb-4">
                        식재료를 매일 두는 주방,<br />가구의 방출 화학 가스는 안심인가요?
                    </h2>
                    <p className="text-[#4A5746] text-xs leading-relaxed mb-8 break-keep">
                        가구 본드에서 나오는 포름알데히드는 아토피와 눈 시림의 주범입니다. 홈씨씨는 친환경 최고 기준 보드만을 사용하여 유해 방출 물질을 엄격히 통제합니다.
                    </p>

                    {/* Interactive Grade Selector */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                        {['SE0', 'E0', 'E1', 'E2'].map((grade) => (
                            <button
                                key={grade}
                                onClick={() => setActiveEcoGrade(grade)}
                                className={`py-3 text-xs font-bold transition-all border ${activeEcoGrade === grade
                                    ? 'bg-[#4A5746] text-white border-[#4A5746] shadow-sm font-black'
                                    : 'bg-white text-neutral-500 border-neutral-300'
                                    }`}
                            >
                                {grade}
                                {grade === 'E0' && <span className="block text-[8px] font-black text-[#FAF9F5]">(KCC)</span>}
                            </button>
                        ))}
                    </div>

                    {/* Grade Info Sheet */}
                    <div className="bg-white border border-[#4A5746]/20 p-5 min-h-[110px] flex flex-col justify-between shadow-sm">
                        {activeEcoGrade === 'SE0' && (
                            <div>
                                <span className="text-[#4A5746] text-[10px] font-black tracking-widest block mb-1">SUPER E0 GRADE (최고 자재)</span>
                                <h4 className="text-sm font-bold text-neutral-800 mb-2">방출량: 0.3mg/L 이하</h4>
                                <p className="text-neutral-500 text-xs leading-relaxed break-keep">실제 원목 수치에 수렴하는 극소 수준으로, 영유아가 있는 가정에서도 완전히 무독성에 가까운 안전지대입니다.</p>
                            </div>
                        )}
                        {activeEcoGrade === 'E0' && (
                            <div>
                                <span className="text-[#4A5746] text-[10px] font-black tracking-widest block mb-1">E0 GRADE (KCC 홈씨씨 기본 스펙)</span>
                                <h4 className="text-sm font-bold text-[#4A5746] mb-2">방출량: 0.5mg/L 이하 (100% 적용)</h4>
                                <p className="text-neutral-500 text-xs leading-relaxed break-keep">눈이 맵지 않고 머리가 아프지 않은 주거용 가구의 표준 친환경 등급입니다. 홈씨씨는 모든 주방 가구 뼈대에 이를 의무 적용합니다.</p>
                            </div>
                        )}
                        {activeEcoGrade === 'E1' && (
                            <div>
                                <span className="text-neutral-400 text-[10px] font-black tracking-widest block mb-1">E1 GRADE (타사 가구 다수 적용)</span>
                                <h4 className="text-sm font-bold text-neutral-700 mb-2">방출량: 1.5mg/L 이하</h4>
                                <p className="text-neutral-500 text-xs leading-relaxed break-keep">실내 공기 오염 위험 기준선의 경계로, 새집증후군 및 알레르기를 유발할 우려가 있어 신중한 환기가 필요합니다.</p>
                            </div>
                        )}
                        {activeEcoGrade === 'E2' && (
                            <div>
                                <span className="text-red-500 text-[10px] font-black tracking-widest block mb-1">E2 GRADE (실내 가구 부적합)</span>
                                <h4 className="text-sm font-bold text-red-500 mb-2">방출량: 5.0mg/L 이하</h4>
                                <p className="text-neutral-500 text-xs leading-relaxed break-keep">유해 가스 방출이 심각하여 대한민국 실내용 가구 자재로는 사용이 엄격히 법적으로 차단된 등급입니다.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Section 6: Standard vs H-LINE (Perfect Fit) - 색상 진하게 보강 (#EFECE6) */}
                <section className="bg-[#EFECE6] py-16 px-6 border-t border-neutral-300">
                    <span className="font-serif text-[#8A7355] text-xs font-semibold tracking-widest uppercase block mb-2">05 / Aesthetics & Line</span>
                    <h2 className="text-2xl font-bold tracking-tight text-[#1C1C1C] mb-6">
                        기성 브랜드 주방과<br />H-LINE의 1mm 차이
                    </h2>

                    <div className="space-y-6">
                        <div className="border border-neutral-200 bg-white p-5 shadow-sm">
                            <span className="text-red-500 text-[10px] font-black tracking-widest block mb-2">타사 브랜드 표준 규격</span>
                            <div className="relative aspect-video w-full bg-neutral-200 mb-3 overflow-hidden">
                                <Image
                                    src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1775287969/13-3.%EC%A0%95%EB%A6%AC%EB%90%9C_%EC%8B%B1%ED%81%AC%EB%8C%80_rizrjp.png"
                                    alt="기성 브랜드 주방"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                            <ul className="text-xs text-neutral-500 space-y-1.5 leading-relaxed pl-1.5">
                                <li className="flex items-start gap-1">
                                    <span className="text-red-500">•</span>
                                    <span>천장 몰딩 부위가 어정쩡하게 두꺼워지거나(서라운딩 마감) 틈새 발생</span>
                                </li>
                                <li className="flex items-start gap-1">
                                    <span className="text-red-500">•</span>
                                    <span>빌트인 냉장고나 가전 옆 공간에 버려지는 빈 공간 발생</span>
                                </li>
                            </ul>
                        </div>

                        <div className="border border-[#8A7355]/40 bg-white p-5 shadow-sm">
                            <span className="text-[#8A7355] text-[10px] font-black tracking-widest block mb-2">KCC H-LINE 3.0 맞춤 가구</span>
                            <div className="relative aspect-video w-full bg-neutral-200 mb-3 overflow-hidden">
                                <Image
                                    src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272836/15-1.%EC%82%AC%EB%A1%802-1_o20ivz.jpg"
                                    alt="KCC H-LINE 맞춤형"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                            <ul className="text-xs text-neutral-600 space-y-1.5 leading-relaxed pl-1.5">
                                <li className="flex items-start gap-1">
                                    <span className="text-[#8A7355] font-black">•</span>
                                    <span>상/하부장 라인이 천장과 바닥에 밀착되는 <strong>'무몰딩 완벽 핏'</strong> 설계</span>
                                </li>
                                <li className="flex items-start gap-1">
                                    <span className="text-[#8A7355] font-black">•</span>
                                    <span>가구 도어 길이를 비규격 설계하여 가전과 단차 없는 일체형 키친 실현</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Section 7: Construction Showcase (가로 슬라이드 갤러리) */}
                <section className="bg-[#FAF9F5] py-16 border-t border-neutral-300">
                    <div className="px-6 mb-8">
                        <span className="font-serif text-[#8A7355] text-xs font-semibold tracking-widest uppercase block mb-2">06 / Portfolio Case</span>
                        <h2 className="text-2xl font-bold tracking-tight text-[#1C1C1C]">
                            전체 가구 시공 사례
                        </h2>
                    </div>

                    {/* Case Tabs Selector */}
                    <div className="flex px-6 gap-3 mb-6">
                        <button
                            onClick={() => { setActiveCaseIdx(0); }}
                            className={`flex-1 py-2 text-xs font-bold transition-all border ${activeCaseIdx === 0 ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'bg-white text-neutral-500 border-neutral-200'}`}
                        >
                            Case 01. 개포 대청
                        </button>
                        <button
                            onClick={() => { setActiveCaseIdx(1); }}
                            className={`flex-1 py-2 text-xs font-bold transition-all border ${activeCaseIdx === 1 ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'bg-white text-neutral-500 border-neutral-200'}`}
                        >
                            Case 02. 청라 자이
                        </button>
                    </div>

                    {/* Swipe Gallery Flow */}
                    <div className="px-6 mb-4">
                        <div className="bg-white border border-neutral-200 p-4 space-y-4 shadow-sm">
                            <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                                <span className="text-[11px] font-bold text-[#8A7355]">{caseStudies[activeCaseIdx].caseNum}</span>
                                <span className="text-xs font-black text-neutral-800">{caseStudies[activeCaseIdx].location}</span>
                            </div>
                            <p className="text-neutral-500 text-xs leading-relaxed break-keep">{caseStudies[activeCaseIdx].desc}</p>
                            <p className="text-neutral-400 text-[10px] font-bold">도어 사양: {caseStudies[activeCaseIdx].topSpec}</p>
                        </div>
                    </div>

                    {/* Gallery Items Horizontally Scrollable */}
                    <div className="flex overflow-x-auto gap-4 px-6 snap-x snap-mandatory hide-scrollbar">
                        {caseStudies[activeCaseIdx].images.map((img, idx) => (
                            <div
                                key={idx}
                                className="snap-center shrink-0 w-[280px] bg-white border border-neutral-200 p-3 flex flex-col gap-3 shadow-sm"
                            >
                                <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden">
                                    <Image
                                        src={img.url}
                                        alt={img.caption}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <span className="text-[11px] text-neutral-500 text-center font-bold tracking-tight">{img.caption}</span>
                            </div>
                        ))}
                    </div>

                    <div className="text-center text-[10px] text-neutral-500 font-bold tracking-wider pt-4">
                        ← 좌우로 넘겨 세부 컷을 감상하세요
                    </div>
                </section>

                {/* Section 8: LG Strategic Alliance (Premium Shelf UI) - 색상 진하게 보강 (#E5D9C8) */}
                <section className="bg-[#E5D9C8] py-16 px-6 border-t border-neutral-300">
                    <span className="font-serif text-[#8A7355] text-xs font-semibold tracking-widest uppercase block mb-2">07 / Premium Alliance</span>
                    <h2 className="text-2xl font-bold tracking-tight text-[#1C1C1C] mb-4">
                        LG전자 빌트인 가전패키지<br />가구와 완벽한 밀착 수납
                    </h2>
                    <p className="text-neutral-700 text-xs leading-relaxed mb-6 break-keep">
                        단순히 제품을 끼워 넣는 싱크대와 다릅니다. KCC H-LINE은 LG전자 공식 제휴 모델의 열 방출 가이드라인과 급배수 배관 라인 규격을 반영하여 빌트인 가전에 딱 맞춰 도어가 플랫하게 떨어집니다.
                    </p>

                    {/* Horizontal Appliance Shelf List */}
                    <div className="flex overflow-x-auto gap-3 hide-scrollbar mb-6">
                        {lgProducts.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedLGProduct(idx)}
                                className={`shrink-0 px-4 py-2.5 text-xs font-black transition-all border ${selectedLGProduct === idx
                                    ? 'bg-[#1C1C1C] border-[#1C1C1C] text-white shadow-sm'
                                    : 'bg-white border-neutral-300 text-neutral-600'
                                    }`}
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>

                    {/* Media Window Panel */}
                    <div className="bg-white border border-neutral-200 p-4 space-y-4 shadow-sm">
                        <div className="relative aspect-video w-full bg-neutral-900 overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${selectedLGProduct}-${currentLGMediaIdx}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    {currentMediaSet[currentLGMediaIdx]?.type === 'video' ? (
                                        <video
                                            src={currentMediaSet[currentLGMediaIdx].url}
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Image
                                            src={currentMediaSet[currentLGMediaIdx]?.url || lgProducts[selectedLGProduct].img}
                                            alt={currentMediaSet[currentLGMediaIdx]?.title || lgProducts[selectedLGProduct].name}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Arrow Navs */}
                            {currentMediaSet.length > 0 && (
                                <>
                                    <button
                                        onClick={() => setCurrentLGMediaIdx(prev => (prev === 0 ? currentMediaSet.length - 1 : prev - 1))}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/70 backdrop-blur-sm border border-neutral-300 flex items-center justify-center text-neutral-800"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentLGMediaIdx(prev => (prev === currentMediaSet.length - 1 ? 0 : prev + 1))}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/70 backdrop-blur-sm border border-neutral-300 flex items-center justify-center text-neutral-800"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Dot indicator */}
                        {currentMediaSet.length > 0 && (
                            <div className="flex justify-center gap-1.5">
                                {currentMediaSet.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentLGMediaIdx(i)}
                                        className={`h-1.5 transition-all duration-300 ${currentLGMediaIdx === i ? 'w-6 bg-[#8A7355]' : 'w-1.5 bg-neutral-200'}`}
                                    />
                                ))}
                            </div>
                        )}

                        <div>
                            <span className="text-[10px] font-bold text-[#8A7355] block mb-1">ALL-IN-ONE MATCHING</span>
                            <h4 className="text-sm font-bold text-neutral-800">
                                {currentMediaSet[currentLGMediaIdx]?.title || lgProducts[selectedLGProduct]?.name}
                            </h4>
                            <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
                                공식 주방가전 패키지와 연동 계약 시 특별 할인가 혜택을 제공합니다.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 9: 60-Month Subscription & Warranty - 색상 진하게 보강 (#DFE6EE) */}
                <section className="bg-[#DFE6EE] py-16 px-6 border-t border-neutral-300">
                    <span className="font-serif text-[#4A5D75] text-xs font-semibold tracking-widest uppercase block mb-2">08 / Financial Support</span>
                    <h2 className="text-2xl font-bold tracking-tight text-[#1C1C1C] mb-6">
                        부담은 월별로 가볍게,<br />보증은 대기업의 신뢰로
                    </h2>

                    <div className="space-y-6">
                        <div className="bg-white border border-neutral-200 p-6 space-y-4 shadow-sm">
                            <span className="text-[#8A7355] text-[10px] font-black tracking-widest block">60 MONTHS SUBSCRIPTION</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-[#8A7355]">59,000</span>
                                <span className="text-xs font-bold text-neutral-400">원/월 ~ (구독 오픈)</span>
                            </div>
                            <ul className="text-xs text-neutral-500 space-y-2 leading-relaxed">
                                <li className="flex items-center gap-2">
                                    <Check size={12} className="text-[#8A7355]" />
                                    <span>장기 할부 약정 시 초기 목돈 지출 방지</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check size={12} className="text-[#8A7355]" />
                                    <span>제휴 카드 할인 혜택 추가 적용 가능</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white border border-neutral-200 p-6 space-y-4 shadow-sm">
                            <span className="text-neutral-500 text-[10px] font-black tracking-widest block">WARRANTY GUARANTEE</span>
                            <h4 className="text-base font-bold text-neutral-800">1년 무상 보증 및 실측 감리제</h4>
                            <p className="text-neutral-500 text-xs leading-relaxed break-keep">
                                소상공인 개인 싱크대 업체의 미흡한 마감과 사후 하자 불안이 없습니다. KCC글라스 공식 검수 파트너사가 실측 감리부터 최종 무상 시정 조치까지 끝까지 책임집니다.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 10: Embedded Consultation Form (모바일 최적화 다이렉트 폼) */}
                <section className="bg-white py-16 px-6 border-t border-neutral-300">
                    <span className="font-serif text-[#8A7355] text-xs font-semibold tracking-widest uppercase block mb-2">09 / Direct Request</span>
                    <h2 className="text-2xl font-bold tracking-tight text-[#1C1C1C] mb-2">
                        실시간 무료 맞춤 상담
                    </h2>
                    <p className="text-neutral-500 text-xs mb-8 break-keep">
                        H-LINE 전문 설계 매니저가 주방 사이즈 도면 확인 및 대략적인 구독 산출액을 산정해 드립니다.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-[10px] font-bold text-[#8A7355] uppercase tracking-widest block mb-2">Customer Name / 성함</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="성함을 입력하세요"
                                className="w-full bg-[#FAF9F5] border border-neutral-200 rounded-none px-4 py-3 text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-[#8A7355] transition-colors text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-[#8A7355] uppercase tracking-widest block mb-2">Contact Number / 연락처</label>
                            <input
                                type="tel"
                                value={contact}
                                onChange={handleAutoHyphen}
                                placeholder="연락처를 입력하세요"
                                className="w-full bg-[#FAF9F5] border border-neutral-200 rounded-none px-4 py-3 text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-[#8A7355] transition-colors text-sm"
                                required
                            />
                        </div>

                        <div className="bg-[#FAF9F5] rounded-none p-4 border border-neutral-200">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="relative mt-1">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={isAgreed}
                                        onChange={(e) => setIsAgreed(e.target.checked)}
                                    />
                                    <div className="w-4 h-4 border border-neutral-300 rounded-none peer-checked:bg-[#8A7355] peer-checked:border-[#8A7355] transition-all" />
                                    <Check size={12} className="absolute top-0 left-0 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-[11px] text-neutral-500 group-hover:text-neutral-700 transition-colors leading-relaxed">
                                    [필수] 개인정보 수집 및 이용에 동의합니다.<br />
                                    (수집항목: 성함, 연락처 / 목적: 인테리어 상담)
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#1C1C1C] text-white font-bold py-4.5 rounded-none flex items-center justify-center gap-2 hover:bg-[#8A7355] transition-colors disabled:opacity-50 text-sm"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    상담 접수 진행 중...
                                </>
                            ) : (
                                <>
                                    무료 맞춤 견적 신청
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </section>

                {/* Footer info (Deep charcoal-olive contrast) - 구분을 확실히 해줌 */}
                <footer className="py-12 px-6 bg-[#2E302D] text-[#FAF9F5]/70 border-t border-neutral-400">
                    <img
                        src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1780802495/01_full_color_homecc_BI_kl2ybf.png"
                        alt="Logo"
                        className="h-5 mb-4 grayscale invert brightness-200"
                    />
                    <div className="text-[10px] leading-relaxed text-[#FAF9F5]/50 space-y-1.5 break-keep">
                        <p className="font-bold text-[#FAF9F5]/70">판매사 정보</p>
                        <p>
                            주식회사 티유디지털(KCC글라스 판매점) <span className="text-neutral-600">|</span> 대표 : 김정열 <span className="text-neutral-600">|</span> 주소 : 서울시 금천구 가산디지털1로 83, 802호 <span className="text-neutral-600">|</span> 사업자등록번호 : 220-87-15092
                        </p>
                        <p>
                            고객센터 : 1588-0883 <span className="text-neutral-600">|</span> 개인정보 관리자 : 김은경 (kek3171@nate.com)
                        </p>
                        <p className="text-[#FAF9F5]/40 mt-2">
                            본 페이지는 홈씨씨 인테리어 H-LINE 홍보 및 온라인 상담 신청을 위한 랜딩페이지입니다.
                        </p>
                        <p className="text-[#FAF9F5]/40">© 2026 KCC GLASS HomeCC. All Rights Reserved.</p>
                    </div>
                </footer>

                {/* Floating CTA (Optimized for one-hand tap at bottom) */}
                <AnimatePresence>
                    {showFloatingCta && (
                        <motion.div
                            initial={{ y: 80, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 80, opacity: 0 }}
                            className="fixed bottom-0 inset-x-0 mx-auto z-40 w-full max-w-[576px] px-6 pb-6 pt-2 bg-gradient-to-t from-[#FAF9F5] via-[#FAF9F5]/90 to-transparent"
                        >
                            <div className="bg-white border border-neutral-300 rounded-none p-2.5 flex gap-3 shadow-md">
                                <button
                                    onClick={handleConsultClick}
                                    className="flex-1 bg-[#1C1C1C] text-white font-bold py-3.5 rounded-none flex items-center justify-center gap-2 text-xs hover:bg-[#8A7355] transition-colors"
                                >
                                    <MessageSquare size={16} />
                                    실시간 견적 상담
                                </button>
                                <button
                                    onClick={handleCallClick}
                                    className="w-12 bg-white border border-neutral-300 rounded-none flex items-center justify-center hover:bg-neutral-50 transition-colors"
                                >
                                    <PhoneCall size={18} className="text-[#8A7355]" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Modal for Inquiry (Fallback Trigger) */}
                <AnimatePresence>
                    {showConsultModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-neutral-900/60 backdrop-blur-xs"
                        >
                            <div
                                className="absolute inset-0"
                                onClick={() => !isSubmitting && setShowConsultModal(false)}
                            />
                            <motion.div
                                initial={{ scale: 0.98, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.98, opacity: 0 }}
                                className="relative z-10 w-full max-w-sm bg-white border border-neutral-300 rounded-none p-6 shadow-xl"
                            >
                                <button
                                    onClick={() => setShowConsultModal(false)}
                                    className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 transition-colors"
                                >
                                    <X size={18} />
                                </button>

                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-neutral-800 mb-1">프리미엄 맞춤 상담</h3>
                                    <p className="text-neutral-400 text-[10px] italic">H-LINE 설계 매니저가 직접 연락드립니다.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-[9px] font-bold text-[#8A7355] uppercase tracking-wider block mb-1">Customer Name</label>
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
                                        <label className="text-[9px] font-bold text-[#8A7355] uppercase tracking-wider block mb-1">Contact Number</label>
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
                                        className="w-full bg-[#1C1C1C] text-white font-bold py-3.5 rounded-none flex items-center justify-center gap-2 hover:bg-[#8A7355] transition-colors disabled:opacity-50 text-xs"
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

export default HLine3Client;
