'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    Phone, MessageSquare, ChevronDown, Check, ShieldCheck, Trophy,
    Shield, Leaf, Scissors, X, Loader2, User, PhoneCall,
    Sparkles, CreditCard, Layout, Zap, ArrowRight, Star, Anchor,
    Play, Volume2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface HLine2ClientProps {
    partnerId?: string | null;
    category?: string;
}

const HLine2Client: React.FC<HLine2ClientProps> = ({ partnerId, category = "주방" }) => {
    const [isMounted, setIsMounted] = useState(false);
    const { scrollY } = useScroll();

    // Consultation States
    const [showConsultModal, setShowConsultModal] = useState(false);
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [isAgreed, setIsAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFloatingCta, setShowFloatingCta] = useState(false);
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

    // Parallax & Scroll Animations
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 400], [1, 1.1]);

    useEffect(() => {
        setIsMounted(true);
        const handleScroll = () => {
            setShowFloatingCta(window.scrollY > 500);
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
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/refrigerators/interior/i1.jpg', title: 'Smart Storage' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/refrigerators/interior/i2.jpg', title: 'Built-in Excellence' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/refrigerators/interior/I3.jpg', title: 'Luxury Life Style' }
    ];

    const lgKimchiMedia = [
        { type: 'video', url: 'https://www.lge.co.kr/kr/images/_2025-kimchi-refrigerators-484/2.0/02-hinge-card-d.mp4', title: 'Kimchi Fridge Hinge' },
        { type: 'video', url: 'https://www.lge.co.kr/kr/images/_2025-kimchi-refrigerators-484/2.0/01-builtin-detail-1.mp4', title: 'Built-in Performance' },
        { type: 'video', url: 'https://www.lge.co.kr/kr/images/_2025-kimchi-refrigerators-484/1.0/01-open-d.mp4', title: 'Easy Open Design' },
        { type: 'video', url: 'https://www.lge.co.kr/kr/images/_2025-kimchi-refrigerators-484/2.0/08-coldcaresys-detail-1.mp4', title: 'Cold Care System' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/refrigerators/interior/i4.jpg', title: 'Kitchen Interior' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/refrigerators/interior/I5.jpg', title: 'Kitchen Interior' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/refrigerators/interior/i6.jpg', title: 'Kitchen Interior' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/refrigerators/interior/i1.jpg', title: 'Kitchen Interior' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/refrigerators/interior/i2.jpg', title: 'Kitchen Interior' }
    ];

    const lgInductionMedia = [
        { type: 'video', url: 'https://www.lge.co.kr/kr/images/electric-ranges/md10370826/24_induction_cover_01.mp4', title: 'Power Induction Performance' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/electric-ranges/md10372836/gallery/large-interior01.jpg', title: 'Premium Kitchen Look' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/usp_dcr/24_induction_detail_02_01_BEF3AMB4.gif', title: 'Smart Cooking System' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/usp_dcr/24_induction_detail_04_01_BEF3AMB4.gif', title: 'Precision Touch Control' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/usp_dcr/24_induction_detail_05_01_BEF3AMB4.jpg', title: 'Safe & Clean Design' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/usp_dcr/24_induction_12_cover_pc_BEF3AMB4.jpg', title: 'Luxury Induction Showcase' }
    ];

    const lgWaterPurifierMedia = [
        { type: 'video', url: 'https://www.lge.co.kr/kr/images/water-purifiers/md09038834/usp/DualPurifier_3D_1380x620_PC.mp4', title: 'Dual Purifier 3D Performance' },
        { type: 'video', url: 'https://www.lge.co.kr/kr/images/water-purifiers/md09140827/usp/usp_06_01_PC.mp4', title: 'Advanced Water Filtration' },
        { type: 'video', url: 'https://www.lge.co.kr/kr/images/water-purifiers/md09140827/usp/usp_06_02_PC.mp4', title: 'Hygienic Sterilization Care' },
        { type: 'video', url: 'https://www.lge.co.kr/kr/images/water-purifiers/md09140827/usp/usp_07_01_PC.mp4', title: 'Smart Water Dispenser' },
        { type: 'video', url: 'https://www.lge.co.kr/kr/images/water-purifiers/md09140827/usp/usp_07_02_PC.mp4', title: 'Convenient Multi-use' },
        { type: 'video', url: 'https://www.lge.co.kr/kr/images/water-purifiers/md09140827/usp/Dual_180_motion_objet_black.mp4', title: '180° Rotating Motion' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/water-purifiers/md09140827/usp/usp_02_01_PC.jpg', title: 'Pristine Water Quality' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/water-purifiers/md09140827/usp/usp_02_02_PC.jpg', title: 'Pristine Water Quality' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/water-purifiers/md09140827/usp/usp_02_03_PC.jpg', title: 'Pristine Water Quality' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/water-purifiers/md09140827/usp/usp_02_04_PC.jpg', title: 'Pristine Water Quality' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/water-purifiers/md09140827/usp/USP_PC_03.jpg', title: 'Modern Kitchen Integration' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/water-purifiers/md10017839/usp_04.jpg', title: 'LG Objet Collection Design' }
    ];

    const lgOvenMedia = [
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/microwaves-and-ovens/md10200826/oven_design_Cover.gif', title: 'Premium Light Wave Design' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/microwaves-and-ovens/md10200826/oven_triplecook_Detail_01_1.gif', title: 'Triple Cook System' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/microwaves-and-ovens/md10200826/oven_triplecook_Detail_01_2.gif', title: 'Triple Cook System' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/microwaves-and-ovens/md10200826/oven_triplecook_Detail_01_3.gif', title: 'Triple Cook System' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/microwaves-and-ovens/md10200826/oven_triplecook_Detail_01_4.gif', title: 'Triple Cook System' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/microwaves-and-ovens/md10200826/oven_airfry_Detail_01.gif', title: 'Air Fry Technology' }
    ];

    const lgDishwasherMedia = [
        { type: 'video', url: 'https://www.lge.co.kr/kr/exp_content/dishwashers/img/video/video_exp_intro_PC.mp4', title: 'LG Dishwasher Experience' },
        { type: 'video', url: 'https://www.lge.co.kr/kr/images/dishwashers/common/25_dishwasher_truesteam_tvc.mp4', title: 'TrueSteam Technology' },
        { type: 'video', url: 'https://www.lge.co.kr/kr/usp_dcr/dishwasher_tornado_01_1.mp4', title: 'Tornado Wash Power' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/dishwashers/md10246830/usp/dishwasher_design_Cover.gif', title: 'Sleek Aesthetic Design' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/usp_dcr/dishwasher_dry_01_1.jpg', title: 'High Performance Drying' },
        { type: 'video', url: 'https://www.lge.co.kr/kr/usp_dcr/dishwasher_dry_01_2.mp4', title: 'Condensation Care' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/usp_dcr/dishwasher_Largecapacity_01.jpg', title: 'Large Capacity Interior' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/usp_dcr/dishwasher_smartshelf_01_1.gif', title: 'Smart Shelf System' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/usp_dcr/dishwasher_smartshelf_01_2.gif', title: 'Smart Shelf System' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/usp_dcr/dishwasher_smartshelf_01_3.gif', title: 'Smart Shelf System' },
        { type: 'video', url: 'https://www.lge.co.kr/kr/usp_dcr/dishwasher_smartshelf_02.mp4', title: 'Adjustable Loading' },
        { type: 'image', url: 'https://www.lge.co.kr/kr/images/dishwashers/md09731826/usp/dishwasher_high_e_Cover_DUE6BGE.jpg', title: 'Premium Objet Collection' }
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
            const timer = setTimeout(handleNextLGMedia, 2000);
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
                channel: partner ? `${partner.name}(H-LINE 2.0)` : "H-LINE 2.0 랜딩페이지",
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

    return (
        <div className="hline2-container relative bg-[#0D0D0D] text-white antialiased min-h-screen overflow-x-hidden">
            {/* Dark Theme Overrides & Fonts */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&family=Montserrat:wght@400;600;700;800;900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
                
                :root {
                    --accent-gold: #C9A97A;
                    --accent-gold-bright: #E2C99A;
                    --deep-black: #0D0D0D;
                    --card-bg: #1A1A1A;
                    --font-kr: 'Noto Sans KR', sans-serif;
                    --font-en: 'Montserrat', sans-serif;
                    --font-serif: 'Playfair Display', serif;
                }

                body {
                    background-color: var(--deep-black);
                    color: white;
                }

                .font-serif { font-family: var(--font-serif); }
                .text-gradient-gold {
                    background: linear-gradient(135deg, #E2C99A 0%, #C9A97A 50%, #B8944A 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .glow-gold {
                    box-shadow: 0 0 20px rgba(201, 169, 122, 0.2);
                }
                
                /* Custom Scrollbar for premium feel */
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: #0D0D0D; }
                ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: var(--accent-gold); }

                /* Hide scrollbar utility */
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-[1000] bg-black/40 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img
                            src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1780802495/01_full_color_homecc_BI_kl2ybf.png"
                            alt="HomeCC Logo"
                            className="h-8"
                        />
                        <div className="w-px h-6 bg-white/20 hidden sm:block mx-1" />
                        <span className="font-serif text-xl font-bold tracking-[0.2em] text-gradient-gold hidden sm:block leading-none">H-LINE <span className="text-[11px] font-medium opacity-50 tracking-normal">2.0</span></span>
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={handleConsultClick}
                            className="hidden md:flex items-center gap-2 text-xs font-bold tracking-widest text-[#E2C99A] hover:opacity-70 transition-opacity"
                        >
                            CONSULTING <ArrowRight size={14} />
                        </button>
                        <button
                            onClick={handleConsultClick}
                            className="bg-[#C9A97A] text-black px-6 py-2.5 rounded-full text-xs font-black tracking-tight hover:scale-105 transition-transform"
                        >
                            견적 문의
                        </button>
                    </div>
                </div>
            </nav>

            {/* Floating Quick CTA */}
            <AnimatePresence>
                {showFloatingCta && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 inset-x-0 mx-auto z-[1000] w-[calc(100%-40px)] sm:max-w-2xl"
                    >
                        <div className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 sm:p-4 flex gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                            <button
                                onClick={handleConsultClick}
                                className="flex-1 bg-gradient-to-r from-[#C9A97A] to-[#B8944A] text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-xl"
                            >
                                <MessageSquare size={18} />
                                무료 상담 신청
                            </button>
                            <button
                                onClick={handleCallClick}
                                className="w-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-colors"
                            >
                                <PhoneCall size={20} className="text-[#C9A97A]" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Section 1: Hero */}
            <section className="relative min-h-[550px] h-screen sm:h-[85vh] flex flex-col items-center justify-center overflow-hidden pt-24 sm:pt-0">
                <motion.div
                    className="absolute inset-0 z-0"
                    style={{ opacity: heroOpacity, scale: heroScale }}
                >
                    <Image
                        src="https://hcc.kccglass.co.kr/interior/editor/images/000042/08_(3).jpg"
                        alt="Background"
                        fill
                        className="object-cover opacity-60"
                        priority
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-black/60" />
                </motion.div>

                <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-white text-sm sm:text-lg mb-4 block font-black tracking-[0.2em] sm:tracking-[0.45em] uppercase">창호 名家, <br className="block sm:hidden" /> KCC 글라스가 만든</span>
                        <h1 className="text-[2.5rem] sm:text-7xl md:text-8xl font-black leading-[1.1] tracking-tighter mb-10 break-keep px-2">
                            <span className="text-gradient-gold">
                                프리미엄 <br className="block sm:hidden" /> 맞춤 주방
                            </span>
                        </h1>
                        <p className="text-white/60 text-sm sm:text-xl md:text-2xl font-light leading-relaxed max-w-3xl mx-auto mb-10 break-keep px-4">
                            맞춤은 비싸다는 편견을 넘어, 하이엔드 퀄리티와 합리적 가치를 동시에.<br className="hidden sm:block" />
                            KCC글라스 홈씨씨 H-LINE이 제안하는 주방의 새로운 기준.
                        </p>

                        {/* Special Promotion Labels with Neon & Wave Effect */}
                        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-10 sm:mb-16 max-w-4xl mx-auto">
                            {['60개월 구독 오픈', 'LG빌트인 가전할인', '출시기념 할인행사'].map((txt, i) => (
                                <motion.span
                                    key={i}
                                    animate={{
                                        y: [0, -8, 0],
                                        boxShadow: [
                                            "0 0 10px rgba(201,169,122,0.2)",
                                            "0 0 25px rgba(201,169,122,0.5)",
                                            "0 0 10px rgba(201,169,122,0.2)"
                                        ]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.4
                                    }}
                                    className="bg-[#C9A97A]/20 border border-[#C9A97A]/50 text-white px-8 sm:px-10 py-3.5 rounded-full text-sm sm:text-base font-black tracking-widest backdrop-blur-xl ring-1 ring-white/10"
                                >
                                    {txt}
                                </motion.span>
                            ))}
                        </div>

                        <div className="flex flex-col items-center justify-center gap-6 sm:gap-10">
                            <button
                                onClick={handleConsultClick}
                                className="w-[80%] sm:w-auto bg-[#C9A97A] text-black px-12 py-5 rounded-full font-black text-lg hover:scale-105 hover:glow-gold transition-all duration-300"
                            >
                                맞춤 상담 시작하기
                            </button>
                            <div className="flex items-center justify-center gap-4 sm:gap-12 w-full max-w-lg">
                                <div className="text-center flex-1">
                                    <div className="text-xl sm:text-2xl font-black text-[#E2C99A]">18T</div>
                                    <div className="text-[9px] text-white/40 tracking-wider font-bold">FULL CABINET</div>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="text-center flex-1">
                                    <div className="text-xl sm:text-2xl font-black text-[#E2C99A]">E0</div>
                                    <div className="text-[9px] text-white/40 tracking-wider font-bold">ECO MATERIAL</div>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="text-center flex-1">
                                    <div className="text-xl sm:text-2xl font-black text-[#E2C99A]">HÄFELE</div>
                                    <div className="text-[9px] text-white/40 tracking-wider font-bold">GERMAN TECH</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                    className="absolute inset-x-0 bottom-6 sm:bottom-10 mx-auto w-fit flex flex-col items-center gap-1 opacity-30 cursor-default z-30"
                >
                    <span className="text-[9px] font-bold tracking-[0.3em] uppercase">Explore</span>
                    <ChevronDown size={18} />
                </motion.div>
            </section>

            {/* Section 2: Custom Cost Advantage */}
            <section className="relative pt-12 sm:pt-20 pb-32 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-20 items-stretch">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-col justify-center"
                        >
                            <span className="font-serif text-[#C9A97A] text-xl mb-4 block underline underline-offset-8 decoration-1">Rational Luxury</span>
                            <h2 className="text-3xl sm:text-5xl font-black leading-tight mb-8 break-keep">
                                맞춤 제작의 비용 장벽,<br />
                                <span className="text-gradient-gold">H-LINE이 무너뜨렸습니다.</span>
                            </h2>
                            <p className="text-white/50 text-lg leading-relaxed mb-10 break-keep">
                                일반적인 맞춤 가구는 규격을 벗어나는 순간 비용이 1.5배에서 2배까지 폭등합니다.<br />
                                KCC는 효율적인 공정 시스템을 통해 추가 비용 걱정 없는 합리적인 맞춤형 주방을 완성합니다.
                            </p>

                            <div className="space-y-6">
                                <div className="bg-white/5 rounded-3xl p-8 border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-white/40 font-bold uppercase text-xs tracking-widest">Market Standard</span>
                                        <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-[10px] font-bold">COST UP</span>
                                    </div>
                                    <div className="flex items-center gap-4 mb-2 opacity-50">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        <span className="text-xl font-bold leading-snug">타사 맞춤 가구 <br className="block sm:hidden" /> (150% ~ 200%)</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: '85%' }}
                                            className="h-full bg-red-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-[#C9A97A]/20 to-transparent rounded-3xl p-8 border border-[#C9A97A]/30 glow-gold relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                        <Zap size={100} />
                                    </div>
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-[#C9A97A] font-bold uppercase text-xs tracking-widest">KCC H-LINE Advantage</span>
                                        <span className="bg-[#C9A97A] text-black px-4 py-1 rounded-full text-[10px] font-black">MINIMUM ADDED COST</span>
                                    </div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-[#C9A97A]" />
                                        <span className="text-2xl font-black text-gradient-gold leading-tight">홈씨씨 H-LINE <br className="block sm:hidden" /> (합리적 수준)</span>
                                    </div>
                                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: '50%' }}
                                            className="h-full bg-gradient-to-r from-[#E2C99A] to-[#C9A97A]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative aspect-[3/4] sm:aspect-square md:aspect-auto h-full min-h-[400px] md:min-h-[600px] bg-[#0A0A0A] rounded-[40px] border border-white/10 overflow-hidden group shadow-2xl"
                        >
                            <Image
                                src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272830/1.%EB%B9%84%EC%A0%95%ED%98%95_%EA%B3%B5%EA%B0%84%EB%8F%84_%EC%B6%94%EA%B0%80_%EB%B9%84%EC%9A%A9_%EC%B5%9C%EC%86%8C%ED%99%94_nvy0sd.jpg"
                                alt="비정형 공간도 추가 비용 최소화"
                                fill
                                className="object-cover object-center scale-[1.2] sm:scale-100 transition-transform duration-1000"
                                unoptimized
                            />

                            <div className="absolute bottom-0 left-0 right-0 p-8 z-0">
                                <div className="text-[120px] font-black text-white/5 absolute -bottom-10 right-0 select-none tracking-tighter">VALUE</div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Section 3: Pain Points */}
            <section className="bg-[#161616] py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="font-serif text-[#C9A97A] text-xl mb-4 block tracking-widest uppercase">The Problem</span>
                            <h2 className="text-3xl sm:text-5xl font-black mb-8 break-keep">
                                주방을 바꾸고 싶어도<br />
                                <span className="text-gradient-gold">망설이게 되는 이유</span>
                            </h2>
                            <p className="text-white/40 text-lg max-w-3xl mx-auto break-keep">
                                맞춤형 주방을 원하지만 현실적인 고민들이 발목을 잡습니다.<br />
                                홈씨씨 H-LINE은 이 세 가지 문제를 한 번에 해결합니다.
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272832/2.%EB%A7%9E%EC%B6%A4%ED%98%95_%EC%A3%BC%EB%B0%A9%EC%9D%80_%EB%84%88%EB%AC%B4_%EB%B9%84%EC%8B%B8%EB%8B%A4_ow4uki.png',
                                title: '맞춤형 주방은 너무 비싸다',
                                desc: '원하는 디자인과 사양으로 설계하면 예산을 훌쩍 넘어버리는 현실'
                            },
                            {
                                img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272832/3.%EC%A0%80%EB%A0%B4%ED%95%9C_%EC%82%AC%EC%A0%9C_%EC%A3%BC%EB%B0%A9%EC%9D%80_%EB%82%B4%EA%B5%AC%EC%84%B1%EC%9D%B4_%EB%B6%88%EC%95%88_ars6iu.png',
                                title: '저렴한 사제 주방은 내구성이 불안하다',
                                desc: '가격은 합리적이지만 소재 품질, 시공 후 하자, A/S 걱정이 가시지 않음'
                            },
                            {
                                img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272832/4.%EA%B8%B0%EC%84%B1_%EA%B7%9C%EA%B2%A9%EC%9D%B4%EB%9D%BC_%EC%9A%B0%EB%A6%AC_%EC%A7%91%EC%97%90_%EB%94%B1_%EC%95%88_%EB%A7%9E%EB%8A%94%EB%8B%A4_i2cqkj.png',
                                title: '기성 규격이라 우리 집에 딱 안 맞는다',
                                desc: '브랜드 주방은 정해진 규격만 있어 공간이 애매하게 남거나 몰딩이 어색함'
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-[#0D0D0D] border border-white/5 rounded-[40px] overflow-hidden hover:bg-[#1A1A1A] transition-all group"
                            >
                                <div className="w-full aspect-[4/3] relative overflow-hidden">
                                    <Image
                                        src={item.img}
                                        alt={item.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        unoptimized
                                    />
                                </div>
                                <div className="p-10">
                                    <h3 className="text-xl font-black mb-4 group-hover:text-[#C9A97A] transition-colors">{item.title}</h3>
                                    <p className="text-white/30 text-sm leading-relaxed break-keep">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="mt-20 bg-gradient-to-br from-[#3D2B1F] to-[#1A1A1A] rounded-[40px] p-12 text-center relative overflow-hidden shadow-2xl border border-white/5"
                    >
                        <div className="absolute top-[-20px] left-10 text-[140px] font-serif text-[#C9A97A]/5 leading-none select-none">"</div>
                        <p className="relative z-10 text-white/80 text-xl sm:text-2xl font-bold leading-relaxed mb-4 break-keep">
                            KCC글라스 홈씨씨가<br />
                            <strong className="text-gradient-gold font-black underline underline-offset-8 decoration-1">그 타협점을 완벽하게 깼습니다.</strong>
                        </p>
                        <span className="relative z-10 font-serif italic text-lg text-[#C9A97A] tracking-[0.3em] uppercase">H-LINE Solution</span>
                    </motion.div>
                </div>
            </section>

            {/* Section 4: Premium Inside */}
            <section className="bg-[#1F1F1F] py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="font-serif text-[#C9A97A] text-xl mb-4 block tracking-widest uppercase">Premium Inside</span>
                            <h2 className="text-3xl sm:text-5xl font-black mb-8 break-keep">
                                보이지 않는 프리미엄의<br />
                                <span className="text-gradient-gold">뼈대를 해부하다</span>
                            </h2>
                            <p className="text-white/40 text-lg max-w-3xl mx-auto break-keep text-shadow-sm">
                                겉으로 드러나지 않는 내부 스펙이 바로<br />
                                H-LINE 프리미엄의 핵심입니다.
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                        {[
                            {
                                num: '01 / STRUCTURE',
                                title: '견고한 뼈대',
                                img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272832/5.%EA%B2%AC%EA%B3%A0%ED%95%9C_%EB%BC%88%EB%8C%80_kd3gcc.png',
                                desc: '변형 없는 18T와 고밀도 MDF. 무거운 냄비를 올려도 흔들림 없는 수납 공간을 완성합니다.',
                                tags: ['18T 전면 적용', '고밀도 MDF', '일반대비 20% 두꺼움'],
                                icon: <Layout className="text-[#C9A97A]" size={24} />
                            },
                            {
                                num: '02 / ECO MATERIAL',
                                title: '친환경 안심 자재',
                                img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272832/6.%EC%B9%9C%ED%99%98%EA%B2%BD_%EC%95%88_%EC%8B%AC%EC%9E%90%EC%9E%AC_ftlhah.png',
                                desc: '안심하고 숨 쉴 수 있는 E0 등급. 포름알데히드 방출량을 엄격히 제어해 가족의 건강을 지킵니다.',
                                tags: ['E0 등급 인증', '포름알데히드 제어', '가족 안심'],
                                icon: <Leaf className="text-[#C9A97A]" size={24} />
                            }
                        ].map((card, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="bg-[#0D0D0D] rounded-[48px] overflow-hidden border border-white/5 shadow-2xl group flex flex-col"
                            >
                                <div className="w-full aspect-video relative overflow-hidden">
                                    <Image
                                        src={card.img}
                                        alt={card.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent" />
                                </div>
                                <div className="p-10 md:p-14 -mt-10 relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                            {card.icon}
                                        </div>
                                        <span className="font-serif text-[#C9A97A]/40 text-sm tracking-widest">{card.num}</span>
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-black mb-6 text-white group-hover:text-gradient-gold transition-colors duration-300">{card.title}</h3>
                                    <p className="text-white/40 text-base leading-relaxed mb-10 break-keep">{card.desc}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {card.tags.map(tag => (
                                            <span key={tag} className="bg-white/5 text-white/50 text-[10px] font-bold px-4 py-2 rounded-full border border-white/5 tracking-wider uppercase group-hover:border-[#C9A97A]/30 transition-colors">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-gradient-to-r from-transparent via-[#C9A97A]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 5: Structural Strength (15T vs 18T) */}
            <section className="bg-white py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="font-serif text-[#C9A97A] text-xl mb-4 block tracking-widest uppercase">Structural Strength</span>
                            <h2 className="text-3xl sm:text-5xl font-black mb-8 break-keep text-[#1E1E1E]">
                                18T의 절대 규칙:<br />
                                무거운 냄비를 올려도<br />
                                <span className="text-[#C9A97A]">흔들림 없는 안심 수납</span>
                            </h2>
                            <p className="text-[#666666] text-lg max-w-3xl mx-auto break-keep">
                                일반 브랜드 주방(15T) 대비 20% 더 두껍고 견고합니다.
                            </p>
                        </motion.div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-stretch justify-between gap-10 md:gap-16 lg:gap-24 mb-24">
                        <div className="flex-1 w-full max-w-xl">
                            <div className="bg-[#F8F8F8] rounded-[40px] p-10 md:p-16 flex flex-col items-center justify-center gap-12 shadow-sm border border-black/5 h-full">
                                <div className="flex items-end justify-center gap-6 sm:gap-20 h-56 w-full px-2 sm:px-4 border-b border-[#EEEEEE] pb-8 sm:pb-10">
                                    <div className="flex flex-col items-center gap-4 sm:gap-5 group flex-1 max-w-[110px]">
                                        <div className="relative flex items-end h-32 w-full bg-[#F0F0F0] rounded-t-2xl overflow-hidden shadow-inner">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                whileInView={{ height: '83%' }}
                                                viewport={{ once: true, amount: 0.5 }}
                                                transition={{ duration: 0.8, ease: "easeOut" }}
                                                className="w-full bg-[#D1D1D1] rounded-t-xl"
                                            />
                                        </div>
                                        <div className="text-center">
                                            <span className="text-xl sm:text-2xl font-black text-[#999999] mb-1 sm:mb-2 block leading-none">15T</span>
                                            <span className="text-[9px] sm:text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest leading-[1.3] block">타사 일반<br className="sm:hidden" /> 브랜드 주방</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center pb-20 sm:pb-24">
                                        <span className="font-serif italic text-xl sm:text-2xl text-[#C9A97A]/40 tracking-tighter">VS</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-4 sm:gap-5 group flex-1 max-w-[110px]">
                                        <div className="relative flex items-end h-32 w-full bg-[#F0F0F0] rounded-t-2xl overflow-hidden shadow-inner font-black">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                whileInView={{ height: '100%' }}
                                                viewport={{ once: true, amount: 0.5 }}
                                                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                                className="w-full bg-gradient-to-t from-[#B8944A] to-[#E2C99A] rounded-t-xl shadow-lg relative z-10"
                                            />
                                            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white text-[8px] font-black px-2 py-0.5 rounded-full z-20">KCC</div>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-xl sm:text-2xl font-black text-[#C9A97A] mb-1 sm:mb-2 block leading-none">18T</span>
                                            <span className="text-[9px] sm:text-[10px] font-black text-[#111] uppercase tracking-widest leading-[1.3] block underline decoration-[#C9A97A]/50 underline-offset-4">홈씨씨<br className="sm:hidden" /> H-LINE</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full max-w-xl">
                            <div className="bg-[#1E1E1E] rounded-[40px] p-10 md:p-14 shadow-2xl relative overflow-hidden h-full flex flex-col justify-center">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-10">
                                        <div className="w-8 h-px bg-[#C9A97A]" />
                                        <span className="text-[#C9A97A] text-[12px] font-black tracking-widest">18T 100% 적용 부위</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                                        {['몸통 18T', '도어 18T', '선반 18T', '밑판 18T', '측판 18T', '전면 동일'].map(item => (
                                            <div key={item} className="flex items-center gap-4">
                                                <div className="w-6 h-6 bg-[#C9A97A] rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Check size={14} className="text-black" strokeWidth={3} />
                                                </div>
                                                <span className="text-white text-base sm:text-lg font-black tracking-tight">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 -right-10 opacity-5 text-white transform rotate-12">
                                    <ShieldCheck size={200} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-[#F8F8F8] border-l-4 border-[#C9A97A] p-8 md:p-12 rounded-r-[32px] max-w-4xl mx-auto"
                    >
                        <p className="text-lg md:text-xl text-[#333333] leading-relaxed font-medium break-keep">
                            코어 자재 역시 PB가 아닌 <strong className="text-[#C9A97A] font-black">밀도 높은 MDF 도어</strong>를 적용하여,<br className="hidden md:block" />
                            수십 년을 반복 개폐해도 <strong className="text-[#1E1E1E] font-black underline underline-offset-4 decoration-[#C9A97A]/30">경첩 고정력이 매우 우수합니다.</strong>
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Section 6: Premium Hardware (Häfele & Ferramenta) */}
            <section className="bg-[#262626] py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <span className="font-serif text-[#C9A97A] text-xl mb-4 block tracking-widest uppercase">Premium Hardware</span>
                            <h2 className="text-3xl sm:text-5xl font-black mb-8 break-keep text-white">
                                보이지 않는 곳의 명품:<br />
                                <span className="text-gradient-gold">문을 닫는 순간의 우아함</span>
                            </h2>
                            <p className="text-white/40 text-lg max-w-3xl mx-auto break-keep">
                                눈에 보이지 않는 부품까지 유럽산 프리미엄으로.<br />
                                매일 열고 닫는 순간마다 체감되는 차이입니다.
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        {[
                            {
                                tag: 'GERMANY · HÄFELE',
                                title: '저압 댐핑 경첩',
                                img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272833/7._%ED%95%98%ED%8E%A0_%EA%B2%BD%EC%B2%A9_%ED%9D%B0_gmwdia.jpg',
                                desc: '소음 없이 부드럽게 닫히는 고급스러운 주방 환경. 수만 번을 반복해도 변함없는 정숙한 클로징.',
                                country: '독일 HÄFELE社 정품',
                                icon: <Zap size={28} className="text-[#C9A97A]" />
                            },
                            {
                                tag: 'ITALY · PREMIUM',
                                title: '플리퍼 다보 선반 고정',
                                img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272830/9.%ED%94%8C%EB%A6%AC%ED%8D%BC_%EB%8B%A4%EB%B3%B4_msucap.jpg',
                                desc: '일반 삼각 다보 대비 압도적인 안정성. 무거운 그릇에도 선반 이탈을 완벽하게 방지합니다.',
                                country: '이태리 FERRAMENTA社 정품',
                                icon: <Anchor size={28} className="text-[#C9A97A]" />
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] group hover:bg-white/[0.08] transition-all duration-500 shadow-2xl overflow-hidden relative flex flex-col"
                            >
                                <div className="w-full aspect-video relative overflow-hidden">
                                    <Image
                                        src={item.img}
                                        alt={item.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#262626] via-transparent to-transparent opacity-60" />
                                </div>
                                <div className="p-10 lg:p-14 relative z-10 -mt-8">
                                    <div className="flex items-center gap-3 mb-8">
                                        <span className="bg-[#C9A97A]/20 text-[#C9A97A] text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase border border-[#C9A97A]/20">{item.tag}</span>
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-black text-white mb-6 group-hover:text-[#C9A97A] transition-colors">{item.title}</h3>
                                    <p className="text-white/40 text-base sm:text-lg leading-relaxed mb-10 break-keep">{item.desc}</p>
                                    <div className="flex items-center gap-3 text-white/20 font-bold tracking-tighter">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            {item.icon}
                                        </div>
                                        <span className="text-sm uppercase tracking-widest">{item.country}</span>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A97A]/5 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-[#C9A97A]/10 transition-colors" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 7: Eco & Safety (E0 Grade) */}
            <section className="relative py-32 px-6 overflow-hidden bg-[#0D2418]">
                <div className="absolute inset-0">
                    <Image
                        src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272834/12.%EC%9A%94%EB%A6%AC%ED%95%98%EB%8A%94_%EA%B3%B5%EA%B0%84%EC%9D%B4%EB%8B%88%EA%B9%8C_3_umq2ah.png"
                        alt="Eco Friendly Material Background"
                        fill
                        className="object-cover opacity-40 mix-blend-multiply"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0D2418]/95 via-transparent to-[#0D2418]/95" />
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="font-serif text-[#C9A97A] text-xl mb-4 block tracking-widest uppercase">Eco & Safety</span>
                            <h2 className="text-3xl sm:text-5xl font-black mb-8 break-keep text-white leading-tight">
                                요리하는 공간이니까,<br />
                                <span className="text-[#89AC76]">숨 쉬는 공기까지 생각한 안심 자재</span>
                            </h2>
                        </motion.div>
                    </div>

                    <div className="max-w-4xl mx-auto mb-20">
                        <div className="flex rounded-2xl overflow-hidden shadow-2xl border border-white/5 h-16 sm:h-20 items-stretch font-black text-xs sm:text-sm tracking-widest">
                            {['E2', 'E1', 'E0', 'SE0'].map((grade) => (
                                <div
                                    key={grade}
                                    className={`flex-1 flex items-center justify-center transition-all duration-300 ${grade === 'E0'
                                        ? 'bg-[#4CAF50] text-white scale-105 shadow-[0_0_40px_rgba(76,175,80,0.4)] z-10 ring-2 ring-white/20'
                                        : grade === 'SE0'
                                            ? 'bg-[#2E7D32] text-white/50'
                                            : grade === 'E1'
                                                ? 'bg-[#81C784] text-white/50'
                                                : 'bg-[#9E9E9E] text-white/50'
                                        }`}
                                >
                                    {grade}
                                    {grade === 'E0' && <span className="absolute -top-1 w-full h-1 bg-white/40" />}
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-white/30 mt-6 text-sm font-bold uppercase tracking-widest">Formaldehyde Emission Grade Comparison</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8 mb-20">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white/5 backdrop-blur-md rounded-[40px] p-10 flex flex-col items-center justify-center border border-white/10 group hover:bg-white/10 transition-all shadow-xl"
                        >
                            <div className="text-4xl sm:text-6xl font-black text-[#89AC76] mb-4 group-hover:scale-110 transition-transform">E0 <span className="text-xl sm:text-2xl">등급</span></div>
                            <div className="text-white/40 font-bold uppercase tracking-widest text-sm">Eco-Friendly Material Grade</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white/5 backdrop-blur-md rounded-[40px] p-10 flex flex-col items-center justify-center border border-white/10 group hover:bg-white/10 transition-all shadow-xl"
                        >
                            <div className="text-4xl sm:text-6xl font-black text-white mb-4 group-hover:scale-110 transition-transform">100<span className="text-xl sm:text-2xl">%</span></div>
                            <div className="text-white/40 font-bold uppercase tracking-widest text-sm">Full Application Of E0</div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/[0.03] border border-white/5 p-10 sm:p-16 rounded-[48px] text-center max-w-5xl mx-auto shadow-2xl backdrop-blur-sm"
                    >
                        <p className="text-lg sm:text-2xl text-white/80 leading-relaxed font-medium break-keep mb-8">
                            포름알데히드 방출량을 엄격하게 제어한<br className="sm:hidden" />
                            <strong className="text-[#81C784] font-black"> E0 등급 친환경 자재만을 사용합니다.</strong>
                        </p>
                        <p className="text-white/40 text-base sm:text-lg leading-relaxed break-keep">
                            눈이 맵지 않고 호흡기가 편안한,<br className="sm:hidden" />
                            우리 가족 모두를 위한 <span className="text-white/80 underline decoration-[#81C784] underline-offset-8">가장 안전한 주방</span>을 완성합니다.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Section 8: Custom Design (Perfect Fit) */}
            <section className="bg-white py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="font-serif text-[#C9A97A] text-xl mb-4 block tracking-widest uppercase">Custom Design</span>
                            <h2 className="text-3xl sm:text-5xl font-black mb-8 break-keep text-[#111]">
                                기성 규격에<br />
                                <span className="text-[#C9A97A]">우리 집을 맞추지 마세요</span>
                            </h2>
                            <p className="text-[#666] text-lg max-w-3xl mx-auto break-keep">
                                집이 제품에 맞춰지는 것이 아니라,<br />
                                제품이 공간에 맞춰지는 진짜 맞춤 주방.
                            </p>
                        </motion.div>
                    </div>

                    <div className="bg-[#1E1E1E] rounded-[48px] p-8 md:p-16 mb-24 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                        <div className="flex flex-col lg:flex-row items-stretch gap-10 relative z-10">
                            {[
                                {
                                    label: 'STANDARD',
                                    status: 'X',
                                    color: '#FF5252',
                                    img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775287969/13-3.%EC%A0%95%EB%A6%AC%EB%90%9C_%EC%8B%B1%ED%81%AC%EB%8C%80_rizrjp.png',
                                    desc: '어색한 틈새와 남는 공간, 몰딩 분리'
                                },
                                {
                                    label: 'H-LINE',
                                    status: '✓',
                                    color: '#C9A97A',
                                    img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272836/15-1.%EC%82%AC%EB%A1%802-1_o20ivz.jpg',
                                    desc: '공간의 제약 없는 무몰딩 완벽 핏'
                                }
                            ].map((box, i) => (
                                <div key={i} className="flex-1 bg-white/5 rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-between min-h-[300px]">
                                    <div className="text-center mb-8">
                                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-6 mx-auto transition-transform duration-500 group-hover:scale-110`} style={{ borderColor: box.color, color: box.color }}>
                                            <span className="text-2xl font-black">{box.status}</span>
                                        </div>
                                        <span className={`text-xl font-black tracking-widest`} style={{ color: box.color }}>{box.label}</span>
                                    </div>
                                    <div className="w-full aspect-video bg-white/5 rounded-2xl mb-8 relative overflow-hidden border border-white/10 group-hover:border-[#C9A97A]/30 transition-colors">
                                        <Image
                                            src={box.img}
                                            alt={box.label}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-white/40 text-sm font-bold tracking-tight">{box.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 text-center">
                            <p className="text-white/80 text-lg sm:text-xl font-bold break-keep">
                                전 제품 <span className="text-[#C9A97A]">비규격 생산(주문 제작) 가능.</span> 하이엔드 인테리어의 상징인 <br className="hidden sm:block" />
                                <span className="underline decoration-[#C9A97A] underline-offset-8">‘무몰딩 완벽 핏’</span>으로 공간의 품격을 더합니다.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 sm:gap-8">
                        {[
                            {
                                title: '전 제품 비규격 주문 제작 가능',
                                desc: '공간의 제약 없이 특수 형태 설계 가능',
                                icon: <Scissors size={24} className="text-[#C9A97A]" />
                            },
                            {
                                title: '무몰딩 완벽 핏 구현',
                                desc: '하이엔드 인테리어의 일체감을 현실로',
                                icon: <Layout size={24} className="text-[#C9A97A]" />
                            },
                            {
                                title: '비정형 구조 공간도 완벽 대응',
                                desc: '어색한 틈, 남는 공간 없이 꽉 채우는 설계',
                                icon: <Star size={24} className="text-[#C9A97A]" />
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-[#F8F8F8] rounded-3xl p-5 sm:p-10 group hover:bg-white hover:shadow-xl transition-all border border-black/5"
                            >
                                <div className="flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-0">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center sm:mb-8 flex-shrink-0 group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-xl font-black mb-0.5 sm:mb-4 text-[#111] whitespace-nowrap sm:whitespace-normal tracking-tight">{item.title}</h3>
                                        <p className="text-[#666] leading-relaxed text-xs sm:text-sm break-keep opacity-80">{item.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 9: Construction Showcase (Real Cases) */}
            <section className="bg-black py-40 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="font-serif text-[#C9A97A] text-xl mb-4 block tracking-widest uppercase">Portfolio</span>
                            <h2 className="text-4xl sm:text-6xl font-black mb-8 break-keep text-white">
                                홈씨씨 H-LINE<br />
                                <span className="text-gradient-gold text-3xl sm:text-5xl">공간의 완성, <br className="block sm:hidden" /> 실제 시공 사례</span>
                            </h2>
                        </motion.div>
                    </div>

                    <div className="space-y-40">
                        {/* CASE 1: Total 12 Images */}
                        <div className="group">
                            <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 mb-16">
                                <div className="flex-1 space-y-10">
                                    <div className="inline-block bg-white/5 border border-[#C9A97A]/30 px-6 py-2 rounded-full">
                                        <span className="text-[#C9A97A] font-black tracking-widest leading-none">CASE 01</span>
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-3xl font-black text-white">현장 정보 및 시공 사양</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-white/50 text-base">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[#C9A97A] text-xs font-black uppercase tracking-widest">Location</span>
                                                <p className="text-white/80 font-medium break-keep">서울시 강남구 개포동 (대청아파트) 25평형</p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[#C9A97A] text-xs font-black uppercase tracking-widest">Scope</span>
                                                <p className="text-white/80 font-medium break-keep">주방 / 붙박이장 / 현관장 / 거실장 / 침대</p>
                                            </div>
                                            <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                                                <span className="text-[#C9A97A] text-xs font-black uppercase tracking-widest">Door Spec</span>
                                                <p className="text-white/80 font-medium">모던 실키그레이</p>
                                            </div>
                                            <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                                                <span className="text-[#C9A97A] text-xs font-black uppercase tracking-widest">Top Spec</span>
                                                <p className="text-white/80 font-medium">MMA 슈가베이지</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                                        <h4 className="text-[#C9A97A] font-black uppercase tracking-widest text-sm flex items-center gap-2">
                                            <Star size={16} fill="currentColor" /> 현장 Point
                                        </h4>
                                        <ul className="space-y-4 text-white/60 text-sm leading-relaxed">
                                            <li className="flex gap-3">
                                                <span className="text-[#C9A97A] font-black">1)</span>
                                                <p className="break-keep">전체 맞춤가구 컬러를 통일하여 공간 전체의 디자인 완성도를 높인 현장</p>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="text-[#C9A97A] font-black">2)</span>
                                                <p className="break-keep">트렌드 가전을 고려한 맞춤 수납 설계 (빌트인 로봇청소기장 등)</p>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                            </div>

                            {/* Group 2: Kitchen Detail (3 Images) */}
                            <div className="mb-20">
                                <h5 className="text-[#C9A97A]/50 text-[10px] font-black tracking-[0.3em] uppercase mb-8 flex items-center gap-4 px-2">
                                    <span className="flex-shrink-0">Detail Cut: Kitchen</span>
                                    <div className="h-px bg-white/10 w-full" />
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {[
                                        { img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272834/14-4.%EC%82%AC%EB%A1%801-4_imtvhr.jpg', title: "'ㅡ'자 레이아웃+냉장고" },
                                        { img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272834/14-5.%EC%82%AC%EB%A1%801-5_ktgcyq.jpg', title: "상부장 하부 라인매립 조명" },
                                        { img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272835/14-6.%EC%82%AC%EB%A1%801-6_wtlwz8.jpg', title: "하부 와인냉장고" }
                                    ].map((detail, idx) => (
                                        <div key={idx} className="space-y-4 group/detail">
                                            <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden">
                                                <Image
                                                    src={detail.img}
                                                    alt={detail.title}
                                                    fill
                                                    className="object-cover group-hover/detail:scale-105 transition-transform duration-700"
                                                    unoptimized
                                                />
                                            </div>
                                            <p className="text-white/40 text-xs font-bold tracking-tight text-center group-hover/detail:text-[#C9A97A] transition-colors">{detail.title}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Group 3: Storage Detail (5 Images) - Architectural Layout */}
                            <div>
                                <h5 className="text-[#C9A97A]/50 text-[10px] font-black tracking-[0.3em] uppercase mb-8 flex items-center gap-4 px-2">
                                    <span className="flex-shrink-0">Detail Cut: Storage</span>
                                    <div className="h-px bg-white/10 w-full" />
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                                    {/* Left 4 Images in 2x2 Grid */}
                                    <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        {[
                                            { img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272835/14-7.%EC%82%AC%EB%A1%801-7_sqjhos.jpg', title: "천장라인 맞춤설계" },
                                            { img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272834/14-2.%EC%82%AC%EB%A1%801-2_dgedkj.jpg', title: "냉장고장 라인연결" },
                                            { img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272835/14-9.%EC%82%AC%EB%A1%801-9_uor2uj.jpg', title: "붙박이장" },
                                            { img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272835/14-10.%EC%82%AC%EB%A1%801-10_lc2epx.jpg', title: "현관장" }
                                        ].map((detail, idx) => (
                                            <div key={idx} className="space-y-4 group/detail">
                                                <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden">
                                                    <Image
                                                        src={detail.img}
                                                        alt={detail.title}
                                                        fill
                                                        className="object-cover group-hover/detail:scale-105 transition-transform duration-700"
                                                        unoptimized
                                                    />
                                                </div>
                                                <p className="text-white/40 text-xs font-bold tracking-tight text-center group-hover/detail:text-[#C9A97A] transition-colors uppercase">{detail.title}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Right Tall Image (Item 5) */}
                                    <div className="col-span-1 sm:col-span-2 lg:col-span-1 space-y-4 group/detail flex flex-col h-full">
                                        <div className="flex-1 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden min-h-[400px]">
                                            <Image
                                                src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272835/14-11.%EC%82%AC%EB%A1%801-11_mzyanv.jpg"
                                                alt="거실장"
                                                fill
                                                className="object-cover group-hover/detail:scale-105 transition-transform duration-700"
                                                unoptimized
                                            />
                                        </div>
                                        <p className="text-white/40 text-xs font-bold tracking-tight text-center group-hover/detail:text-[#C9A97A] transition-colors uppercase">거실장</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CASE 2 */}
                        <div className="group">
                            <div className="flex flex-col lg:flex-row-reverse items-stretch gap-16 lg:gap-24 mb-16">
                                <div className="flex-1 space-y-10">
                                    <div className="inline-block bg-white/5 border border-[#C9A97A]/30 px-6 py-2 rounded-full">
                                        <span className="text-[#C9A97A] font-black tracking-widest leading-none">CASE 02</span>
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-3xl font-black text-white">현장 정보 및 시공 사양</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-white/50 text-base">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[#C9A97A] text-xs font-black uppercase tracking-widest">Location</span>
                                                <p className="text-white/80 font-medium break-keep">인천 서구 청라동 (청라자이) 55평형</p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[#C9A97A] text-xs font-black uppercase tracking-widest">Scope</span>
                                                <p className="text-white/80 font-medium break-keep">하이엔드 주방 맞춤 인테리어</p>
                                            </div>
                                            <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                                                <span className="text-[#C9A97A] text-xs font-black uppercase tracking-widest">Door Spec</span>
                                                <p className="text-white/80 font-medium">모던 마이티그레이</p>
                                            </div>
                                            <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                                                <span className="text-[#C9A97A] text-xs font-black uppercase tracking-widest">Top Spec</span>
                                                <p className="text-white/80 font-medium text-xs">빅슬랩 슬레이트블랙 (Premium Over-size Ceramic)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                                        <h4 className="text-[#C9A97A] font-black uppercase tracking-widest text-sm flex items-center gap-2">
                                            <Star size={16} fill="currentColor" /> 현장 Point
                                        </h4>
                                        <ul className="space-y-4 text-white/60 text-sm leading-relaxed">
                                            <li className="flex gap-3">
                                                <span className="text-[#C9A97A] font-black">1)</span>
                                                <p className="break-keep">마감재 노출을 최소화한 디테일 설계 (도어 내림, 무 서라운딩 공법)</p>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="text-[#C9A97A] font-black">2)</span>
                                                <p className="break-keep">프리미엄 하드웨어(Blum)와 빅슬랩 상판을 적용하여 고급스러움 극대화</p>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="h-full min-h-[400px] bg-white/5 rounded-[40px] overflow-hidden border border-white/10 group-hover:border-[#C9A97A]/30 transition-all shadow-2xl relative">
                                        <Image
                                            src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272836/15-1.%EC%82%AC%EB%A1%802-1_o20ivz.jpg"
                                            alt="CASE 02 Main View"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-1000"
                                            unoptimized
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                                {[
                                    { img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272836/15-2.%EC%82%AC%EB%A1%802-2_hdwurl.jpg', title: '아일랜드장' },
                                    { img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272836/15-3.%EC%82%AC%EB%A1%802-3_ntqrmh.jpg', title: '하부장 도어 내림(걸레받이 노출 최소화)' },
                                    { img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272836/15-4.%EC%82%AC%EB%A1%802-4_snn84o.jpg', title: '상부장 올림(무 서라운딩)' },
                                    { img: 'https://res.cloudinary.com/dx7l09wwu/image/upload/v1775272836/15-5.%EC%82%AC%EB%A1%802-5_nry56g.jpg', title: 'Blum 리프터업 하드웨어' }
                                ].map((detail, idx) => (
                                    <div key={idx} className="space-y-4 group/detail">
                                        <div className="aspect-[3/4] lg:aspect-[10/16] bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden">
                                            <Image
                                                src={detail.img}
                                                alt={detail.title}
                                                fill
                                                className="object-cover group-hover/detail:scale-105 transition-transform duration-700"
                                                unoptimized
                                            />
                                        </div>
                                        <p className="text-center text-white/40 text-xs font-bold tracking-tight px-2 break-keep group-hover/detail:text-[#C9A97A] transition-colors">{detail.title}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 10: LG Strategic Alliance */}
            <section className="bg-[#7E0023] py-32 px-6">
                <div className="max-w-7xl mx-auto text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="font-serif italic text-white/60 text-xl tracking-widest mb-6 block uppercase text-shadow-sm">Exclusive Partnership</span>
                        <h2 className="text-4xl sm:text-6xl font-black mb-8 space-y-4 text-white">
                            <span className="block drop-shadow-lg leading-tight">가전과 가구의 <br className="block sm:hidden" /> 완벽한 조합</span>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="inline-block mt-6 px-10 py-5 bg-gradient-to-br from-[#D1D1D1] via-[#FFFFFF] to-[#A3A3A3] rounded-2xl border border-white/40 shadow-[inset_-2px_-2px_5px_rgba(0,0,0,0.2),inset_2px_2px_5px_rgba(255,255,255,0.8),0_15px_40px_rgba(0,0,0,0.3)] relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-2000" />
                                <div className="relative z-10 flex items-center justify-center gap-6 sm:gap-10">
                                    <div className="relative h-8 sm:h-12 w-24 sm:w-40">
                                        <Image
                                            src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/b9e64aa25ee54.png"
                                            alt="LG Logo"
                                            fill
                                            className="object-contain"
                                            unoptimized
                                        />
                                    </div>
                                    <span className="text-xl sm:text-4xl font-extralight opacity-30 italic text-[rgb(30,30,30)] mx-1">x</span>
                                    <div className="relative h-8 sm:h-12 w-24 sm:w-40">
                                        <Image
                                            src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1784093217/01_full_color_homecc_BI_phjl98.png"
                                            alt="KCC Logo"
                                            fill
                                            className="object-contain"
                                            unoptimized
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </h2>
                        <p className="text-white/70 text-lg max-w-3xl mx-auto break-keep leading-relaxed font-medium mb-12">
                            단순한 설치를 넘어선 일체감. 세계적인 가전 브랜드 LG전자와 전략적 제휴를 통해<br className="hidden sm:block" />
                            빌트인 주방가전에 최적화된 맞춤 주방 패키지를 선보입니다.
                        </p>

                        {/* Special Promotion Badge */}
                        <div className="inline-flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 px-6 sm:px-12 py-6 rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.1)] relative overflow-hidden group mb-16">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <span className="text-white/60 text-xs sm:text-sm font-bold tracking-widest uppercase mb-3">주방과 가전 동시 진행 시</span>
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-4">
                                    <Sparkles size={20} className="text-[#C9A97A] animate-pulse flex-shrink-0" />
                                    <span className="text-xl sm:text-3xl font-black text-white tracking-tighter">
                                        LG가전 <br className="sm:hidden" />
                                        <span className="text-[#FBBF24] whitespace-nowrap">특별 할인가로 제공</span>
                                    </span>
                                    <Sparkles size={20} className="text-[#C9A97A] animate-pulse flex-shrink-0" />
                                </div>
                                <span className="text-white/40 text-[10px] sm:text-xs">(자세한 내용은 상담 시 안내)</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="max-w-7xl mx-auto">
                    {/* Product Selection Grid: Horizontal Scroll on Mobile */}
                    <div className="flex overflow-x-auto gap-4 sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:gap-6 mb-12 sm:mb-16 px-6 sm:px-0 hide-scrollbar scroll-smooth">
                        {lgProducts.map((item, i) => (
                            <motion.div
                                key={i}
                                onClick={() => setSelectedLGProduct(i)}
                                whileHover={{ y: -5 }}
                                whileTap={{ scale: 0.98 }}
                                className={`flex-shrink-0 w-28 sm:w-auto cursor-pointer rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col items-center justify-center gap-3 sm:gap-4 transition-all duration-500 overflow-hidden relative group ${selectedLGProduct === i
                                    ? 'bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-2 ring-white/20'
                                    : 'bg-[#F5F5F5] opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                                    }`}
                            >
                                <div className="w-full aspect-square relative rounded-2xl overflow-hidden mb-2">
                                    <Image
                                        src={item.img}
                                        alt={item.name}
                                        fill
                                        className={`object-cover transition-transform duration-700 ${selectedLGProduct === i ? 'scale-110' : 'scale-100 group-hover:scale-105'}`}
                                        unoptimized
                                    />
                                    {selectedLGProduct === i && (
                                        <motion.div
                                            layoutId="active-indicator"
                                            className="absolute inset-0 bg-[#7E0023]/10 flex items-center justify-center"
                                        >
                                            <div className="w-8 h-8 bg-[#7E0023] rounded-full flex items-center justify-center shadow-lg">
                                                <Play size={14} fill="white" className="text-white ml-0.5" />
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                                <div className="text-center pb-2">
                                    <div className={`text-xs font-black mb-0.5 ${selectedLGProduct === i ? 'text-[#a50034]' : 'text-black/60'}`}>{item.name}</div>
                                    <div className={`text-[9px] uppercase tracking-widest font-extrabold ${selectedLGProduct === i ? 'text-[#a50034]/40' : 'text-black/20'}`}>{item.en}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Dynamic Media Carousel Section */}
                    <div className="max-w-7xl mx-auto group/carousel">
                        {/* Media Display Area */}
                        <div
                            className="relative aspect-[3/4] sm:aspect-video bg-[#111] rounded-[32px] sm:rounded-[48px] overflow-hidden shadow-2xl border border-white/5"
                            onMouseEnter={() => setIsLGMediaHovered(true)}
                            onMouseLeave={() => setIsLGMediaHovered(false)}
                        >
                            <AnimatePresence initial={false}>
                                <motion.div
                                    key={`${selectedLGProduct}-${currentLGMediaIdx}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    {currentMediaSet.length > 0 && currentMediaSet[currentLGMediaIdx] ? (
                                        currentMediaSet[currentLGMediaIdx].type === 'video' ? (
                                            <video
                                                src={currentMediaSet[currentLGMediaIdx].url}
                                                className="w-full h-full object-cover"
                                                autoPlay
                                                muted
                                                loop={false}
                                                onEnded={() => {
                                                    if (!isLGMediaHovered) handleNextLGMedia();
                                                }}
                                                playsInline
                                            />
                                        ) : (
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={currentMediaSet[currentLGMediaIdx].url}
                                                    alt={`LG Media ${currentLGMediaIdx}`}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                        )
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] flex items-center justify-center group">
                                            <div className="text-center">
                                                <Sparkles size={48} className="text-[#C9A97A] mb-4 mx-auto opacity-20" />
                                                <p className="text-white/20 text-sm font-bold tracking-widest uppercase">Content Coming Soon</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-100 sm:opacity-0 sm:group-hover/carousel:opacity-100 transition-opacity flex flex-col justify-end p-6 sm:p-12">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-[#C9A97A] font-black text-xs tracking-widest uppercase mb-2 block">Built-in Premium Features</span>
                                                <h4 className="text-xl sm:text-2xl font-black text-white">
                                                    {currentMediaSet.length > 0 && currentMediaSet[currentLGMediaIdx] ? currentMediaSet[currentLGMediaIdx].title : lgProducts[selectedLGProduct]?.name}
                                                </h4>
                                            </div>
                                            {currentMediaSet.length > 0 && currentMediaSet[currentLGMediaIdx]?.type === 'video' && (
                                                <div className="flex gap-4">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                                                        <Volume2 size={18} className="text-white" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Carousel Navigation Controls (Arrows) */}
                            {currentMediaSet.length > 0 && (
                                <>
                                    <button
                                        onClick={() => setCurrentLGMediaIdx(prev => (prev === 0 ? currentMediaSet.length - 1 : prev - 1))}
                                        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#7E0023] hover:border-[#7E0023] transition-all opacity-100 sm:opacity-0 sm:group-hover/carousel:opacity-100 z-30"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentLGMediaIdx(prev => (prev === currentMediaSet.length - 1 ? 0 : prev + 1))}
                                        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#7E0023] hover:border-[#7E0023] transition-all opacity-100 sm:opacity-0 sm:group-hover/carousel:opacity-100 z-30"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Dot Indicators */}
                        {currentMediaSet.length > 0 && (
                            <div className="flex justify-center gap-3 mt-8 z-30">
                                {currentMediaSet.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentLGMediaIdx(i)}
                                        className={`h-1.5 rounded-full transition-all duration-500 ${currentLGMediaIdx === i ? 'w-10 bg-[#7E0023]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Decoration & Context */}
                        <div className="mt-16 bg-[#111] p-12 rounded-[40px] flex flex-col items-center text-center border border-white/5 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#7E0023]/20 blur-[100px] -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10">
                                <span className="inline-block bg-[#7E0023] text-white px-4 py-1 rounded-full text-[10px] font-black tracking-widest mb-6 uppercase">SPECIAL PACKAGE</span>
                                <h3 className="text-2xl sm:text-3xl font-black mb-4 text-white">카테고리별 설치 가능한 모델은 상담 시 안내 드립니다.</h3>
                                <p className="text-white/40 text-base leading-relaxed max-w-2xl break-keep">
                                    가전의 규격에 가구를 맞추는 것이 아니라, 당신이 선택한 모든 주방가전이
                                    처음부터 하나였던 것처럼 빈틈없이 수납되는 '올인원 맞춤 주방'을 만나보세요!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 11: 60-Month Subscription */}
            <section className="relative py-32 px-6 overflow-hidden bg-[#131C31]">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-[#0A1525] border border-white/10 rounded-[40px] px-6 py-12 sm:p-20 relative overflow-hidden flex flex-col md:flex-row md:items-stretch gap-12 lg:gap-24 shadow-2xl">
                        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                            <CreditCard size={400} className="text-white -rotate-12 translate-x-1/2" />
                        </div>

                        <div className="relative z-10 flex-1 flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-px bg-[#C9A97A]" />
                                <span className="font-serif italic text-[#C9A97A] text-xl">Financial Freedom</span>
                            </div>
                            <h2 className="text-[1.65rem] sm:text-5xl font-black leading-[1.2] mb-8 break-keep">
                                부담 없이 시작하는<br />
                                <span className="text-gradient-gold">60개월 구독 플랜 오픈</span>
                            </h2>
                            <p className="text-white/50 text-lg leading-relaxed mb-10 break-keep">
                                월 커피 몇 잔 값으로 지금 바로<br />
                                하이엔드 맞춤 주방의 오너가 되실 수 있습니다.
                            </p>

                            <ul className="space-y-4 mb-4">
                                {[
                                    '최장 60개월 분할 결제로 부담 감소',
                                    '제휴 카드 이용 시 추가 할인 혜택',
                                    '소유권 이전까지 확실한 토탈 케어',
                                    '주방+가전 통합 구독 가능'
                                ].map((item, i) => {
                                    const isHighlight = i === 3;
                                    return (
                                        <li key={i} className={`flex items-center gap-2 sm:gap-4 text-[12.5px] sm:text-base font-bold whitespace-nowrap tracking-tighter sm:tracking-normal transition-all duration-500 ${isHighlight ? 'sm:w-fit text-white bg-white/5 p-3 sm:p-4 sm:px-8 rounded-xl sm:rounded-2xl ring-1 ring-[#C9A97A]/50 shadow-[0_0_20px_rgba(201,169,122,0.2)] animate-pulse' : 'text-white/80'}`}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isHighlight ? 'bg-[#C9A97A]' : 'bg-[#C9A97A]/20'}`}>
                                                <Check size={14} className={isHighlight ? 'text-black' : 'text-[#C9A97A]'} />
                                            </div>
                                            {item}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        <div className="relative z-10 w-full md:w-[350px] lg:w-[400px] flex">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-gradient-to-br from-[#1A1A1A] to-[#111] border border-white/10 rounded-3xl p-6 sm:p-10 text-center shadow-xl relative overflow-hidden flex-1 flex flex-col justify-center"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-[#C9A97A]" />
                                <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">Monthly Fee Starts From</span>
                                <div className="mb-8 flex flex-wrap items-baseline justify-center gap-1">
                                    <span className="text-6xl lg:text-7xl font-black text-gradient-gold tracking-tighter">59,000</span>
                                    <span className="text-xl lg:text-2xl font-bold opacity-30 ml-1">원/월<span className="text-lg font-light ml-0.5 opacity-50">~</span></span>
                                </div>
                                <p className="text-[11px] text-white/30 mb-8 leading-tight">주방 스펙 및 현장 상황에 따라<br />월 구독료는 변동될 수 있습니다.</p>
                                <button
                                    onClick={handleConsultClick}
                                    className="w-full bg-white text-black py-4 rounded-xl font-black text-[13px] sm:text-sm tracking-tighter sm:tracking-wide hover:bg-[#C9A97A] transition-colors"
                                >
                                    지금 신청하고 월 비용 확인
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>



            {/* Section 12: Brand Trust & Warranty */}
            <section className="bg-[#0D0D0D] py-32 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="md:max-w-xl">
                        <span className="text-[#C9A97A] font-serif italic text-xl mb-6 block">Legacy & Trust</span>
                        <h2 className="text-3xl sm:text-5xl font-black mb-8 break-keep">
                            맞춤 가구의 유연함에<br />
                            <span className="text-gradient-gold">대기업의 안심을 더하다.</span>
                        </h2>
                        <p className="text-white/40 text-lg leading-relaxed mb-10 break-keep">
                            소규모 업체의 불안한 A/S는 이제 잊으세요. 인테리어 전문 브랜드 KCC글라스 홈씨씨 전문가들이 실측부터 시공, 그리고 확실한 1년 무상 보증까지 책임집니다.
                        </p>
                        <div className="flex gap-8">
                            <div>
                                <div className="text-3xl font-black text-white mb-1">100%</div>
                                <div className="text-xs text-white/30 uppercase tracking-widest">KCC Quality Control</div>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div>
                                <div className="text-3xl font-black text-white mb-1">1 Year</div>
                                <div className="text-xs text-white/30 uppercase tracking-widest">Free Warranty</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full md:w-[400px] aspect-square">
                        <div className="absolute inset-0 bg-[#C9A97A]/5 blur-[120px] rounded-full" />
                        <div className="relative z-10 w-full h-full border border-[#C9A97A]/20 rounded-full flex flex-col items-center justify-center p-8 sm:p-12 text-center group overflow-hidden">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-t-2 border-l-2 border-[#C9A97A]/10 rounded-full"
                            />
                            <div className="relative w-40 h-14 mb-8">
                                <Image
                                    src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1780802495/01_full_color_homecc_BI_kl2ybf.png"
                                    alt="KCC HomeCC Logo"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                 />
                            </div>
                            <div className="space-y-2 mb-2">
                                <p className="text-white/50 text-sm sm:text-base font-bold tracking-tight">대한민국 창호 名家,</p>
                                <p className="text-white/50 text-sm sm:text-base font-bold tracking-tight">KCC글라스 홈씨씨가 만든</p>
                            </div>
                            <h3 className="text-xl sm:text-3xl font-black text-white mt-4">프리미엄 맞춤 주방</h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 13: Final CTA */}
            <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://hcc.kccglass.co.kr/interior/editor/images/000042/08_(3).jpg"
                        alt="Final CTA Background"
                        fill
                        className="object-cover opacity-20 grayscale brightness-50"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D] via-transparent to-[#0D0D0D]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-[#C9A97A] font-serif text-2xl italic mb-6 block">Ready to Transform?</span>
                        <h2 className="text-[22px] sm:text-6xl md:text-7xl font-black mb-12 tracking-tighter sm:tracking-tight break-keep">
                            당신이 꿈꾸던 그 주방,<br />
                            <span className="text-gradient-gold block mt-2 sm:mt-0">현실이 되는 가장 빠른 길</span>
                        </h2>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button
                                onClick={handleConsultClick}
                                className="w-full sm:w-auto bg-gradient-to-r from-[#E2C99A] via-[#C9A97A] to-[#B8944A] text-black px-10 py-5 sm:px-16 sm:py-6 rounded-full font-black text-base sm:text-xl whitespace-nowrap hover:scale-105 transition-all glow-gold shadow-2xl"
                            >
                                지금 무료 상담 예약하기
                            </button>
                            <button
                                onClick={handleCallClick}
                                className="w-full sm:w-auto border border-white/20 hover:bg-white/5 text-white px-8 py-5 sm:px-12 sm:py-6 rounded-full font-bold text-sm sm:text-lg whitespace-nowrap transition-all"
                            >
                                전화 상담 <span className="font-serif italic text-[#C9A97A] ml-2 text-base sm:text-xl">1588-0883</span>
                            </button>
                        </div>

                        <div className="mt-20 flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-30 font-bold tracking-[0.2em] text-[10px]">
                            <span>ESTIMATE FREE</span>
                            <span>DESIGN CUSTOM</span>
                            <span>WARRANTY PROTECT</span>
                            <span>SUBSCRIPTION OPEN</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer-styled Info */}
            <footer className="py-20 px-6 border-t border-white/5 bg-black">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 sm:opacity-50 hover:opacity-100 transition-opacity">
                    <div>
                        <img
                            src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1780802495/01_full_color_homecc_BI_kl2ybf.png"
                            alt="Logo"
                            className="h-8 mb-8"
                        />
                        <div className="text-[11px] leading-relaxed text-white/50 space-y-1.5 break-keep">
                            <p className="font-bold text-white/70">판매사 정보</p>
                            <p>
                                주식회사 티유디지털(KCC글라스 판매점) <span className="text-white/20">|</span> 대표 : 김정열 <span className="text-white/20">|</span> 주소 : 서울시 금천구 가산디지털1로 83, 802호 <span className="text-white/20">|</span> 사업자등록번호 : 220-87-15092
                            </p>
                            <p>
                                고객센터 : 1588-0883 <span className="text-white/20">|</span> 개인정보 관리자 : 김은경 (kek3171@nate.com)
                            </p>
                            <p className="text-white/30 mt-3">
                                본 페이지는 홈씨씨 인테리어 H-LINE 홍보 및 온라인 상담 신청을 위한 랜딩페이지입니다.
                            </p>
                            <p className="text-white/30">© 2026 KCC GLASS HomeCC. All Rights Reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Consultation Modal */}
            <AnimatePresence>
                {showConsultModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1100] flex items-center justify-center p-6"
                    >
                        <div
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                            onClick={() => !isSubmitting && setShowConsultModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative z-10 w-full max-w-lg bg-[#111] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 sm:p-12">
                                <button
                                    onClick={() => setShowConsultModal(false)}
                                    className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>

                                <div className="text-center mb-10">
                                    <h3 className="text-2xl font-black mb-2">프리미엄 맞춤 상담</h3>
                                    <p className="text-white/40 text-sm italic">H-LINE 마스터가 직접 연락드립니다.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-[#C9A97A] uppercase tracking-widest block mb-2 px-1">Customer Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="성함을 입력하세요"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A97A] transition-colors"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-[#C9A97A] uppercase tracking-widest block mb-2 px-1">Contact Number</label>
                                        <input
                                            type="tel"
                                            value={contact}
                                            onChange={handleAutoHyphen}
                                            placeholder="연락처를 입력하세요"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A97A] transition-colors"
                                            required
                                        />
                                    </div>

                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <div className="relative mt-1">
                                                <input
                                                    type="checkbox"
                                                    className="peer sr-only"
                                                    checked={isAgreed}
                                                    onChange={(e) => setIsAgreed(e.target.checked)}
                                                />
                                                <div className="w-5 h-5 border-2 border-white/20 rounded-md peer-checked:bg-[#C9A97A] peer-checked:border-[#C9A97A] transition-all" />
                                                <Check size={14} className="absolute top-0.5 left-0.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity" />
                                            </div>
                                            <span className="text-[12px] text-white/40 group-hover:text-white/60 transition-colors leading-relaxed">
                                                [필수] 개인정보 수집 및 이용에 동의합니다.<br />
                                                (수집항목: 성함, 연락처 / 목적: 인테리어 상담)
                                            </span>
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-[#C9A97A] text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:glow-gold transition-all disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                상담 신청 중...
                                            </>
                                        ) : (
                                            <>
                                                상담 신청 완료
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HLine2Client;
