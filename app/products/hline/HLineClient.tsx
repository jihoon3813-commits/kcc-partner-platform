'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Phone, MessageSquare, ChevronDown, Check, ShieldCheck, Trophy, Shield, Leaf, Scissors, X, Loader2, User, PhoneCall } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface HLineClientProps {
    partnerId?: string | null;
    category?: string;
}

const HLineClient: React.FC<HLineClientProps> = ({ partnerId, category = "주방" }) => {
    const [isMounted, setIsMounted] = useState(false);
    const { scrollY } = useScroll();
    
    // Consultation States
    const [showConsultModal, setShowConsultModal] = useState(false);
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [isAgreed, setIsAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSideLabels, setShowSideLabels] = useState(true);

    const createCustomerMutation = useMutation(api.customers.createCustomer);
    const partner = useQuery(api.partners.getPartnerByUid, partnerId ? { uid: partnerId } : "skip");

    // Hero background parallax
    const heroBgY = useTransform(scrollY, [0, 800], [0, 200]);
    
    // Floating CTA visibility
    const [showFloatingCta, setShowFloatingCta] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowFloatingCta(true);
            } else {
                setShowFloatingCta(false);
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isMounted) return null;

    const handleConsultClick = () => {
        setShowConsultModal(true);
    };

    const handleCallClick = () => {
        window.location.href = 'tel:15880883';
    };

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
                channel: partner ? partner.name : "H-LINE 랜딩페이지",
                label: "일반",
                status: "접수",
                address: "",
                created_at: new Date().toISOString().split('T')[0]
            });
            alert('상담 신청이 완료되었습니다. 전문가가 곧 연락드리겠습니다.');
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
        <div className="hline-wrapper relative bg-white text-[#1E1E1E] antialiased max-w-[480px] mx-auto min-h-screen overflow-x-hidden font-sans">
            {/* Global Styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&family=Montserrat:wght@600;700;800;900&display=swap');
                
                :root {
                    --color-walnut: #5B4335;
                    --color-walnut-dark: #3D2B1F;
                    --color-ivory: #F7F2EB;
                    --color-gold: #C9A97A;
                    --color-gold-light: #E2C99A;
                    --font-kr: 'Noto Sans KR', sans-serif;
                    --font-en: 'Montserrat', sans-serif;
                }

                body {
                    background-color: #f8f9fa;
                }

                .font-kr { font-family: var(--font-kr); }
                .font-en { font-family: var(--font-en); }
                
                .text-shadow-sm {
                    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
            `}</style>

            {/* Navigation */}
            <nav className="sticky top-0 z-[900] bg-white/95 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-black/5 shadow-sm">
                <div className="flex items-center">
                    <img 
                        src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/5b115594e9a66.png" 
                        alt="HomeCC Logo" 
                        className="h-7 w-auto object-contain"
                    />
                </div>
                <span className="bg-[#5B4335] text-[#F7F2EB] text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider">H-LINE</span>
            </nav>

            {/* Floating Side Labels */}
            <AnimatePresence>
                {showSideLabels && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        className="fixed top-28 right-0 md:right-[calc(50%-235px)] z-[999] flex flex-col gap-3 items-end"
                    >
                        {[
                            { text: "맞춤제작 가능", delay: 0.6 },
                            { text: "최저가+10%할인", delay: 0.7 },
                            { text: "본사 시공&A/S", delay: 0.8 }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ x: 120, opacity: 0 }}
                                animate={{ 
                                    x: 0, 
                                    opacity: 1
                                }}
                                transition={{ 
                                    x: { duration: 0.6, delay: item.delay, ease: "easeOut" },
                                    opacity: { duration: 0.6, delay: item.delay }
                                }}
                                className="w-[125px] py-3 rounded-l-full relative overflow-hidden group shadow-[0_10px_20px_rgba(0,0,0,0.15)] flex items-center justify-center text-[12px] font-black text-white cursor-default cursor-pointer tracking-tighter"
                                style={{
                                    background: 'linear-gradient(135deg, #5B4335 0%, #C9A97A 50%, #5B4335 100%)',
                                    backgroundSize: '200% 100%',
                                }}
                            >
                                <motion.div 
                                    animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 opacity-80"
                                    style={{
                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                        backgroundSize: '200% 100%',
                                    }}
                                />
                                <span className="relative z-10 drop-shadow-md whitespace-nowrap">{item.text}</span>
                            </motion.div>
                        ))}
                        
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 1.2 }}
                            onClick={() => setShowSideLabels(false)}
                            className="mr-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black transition-colors"
                        >
                            <X size={14} />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Section 1: Hero */}
            <section className="relative h-[88vh] flex flex-col justify-end overflow-hidden bg-black">
                <motion.div 
                    className="absolute inset-0"
                    style={{ y: heroBgY }}
                >
                    <Image 
                        src="/images/hline/hero.png" 
                        alt="HomeCC H-LINE" 
                        fill 
                        className="object-cover opacity-75"
                        priority
                        unoptimized
                    />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/90" />
                
                <div className="relative z-10 px-6 pb-28">
                    <motion.span 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block bg-[#C9A97A]/20 border border-[#C9A97A]/60 text-[#E2C99A] font-en text-[10px] font-bold tracking-[2.5px] px-3 py-1.5 rounded-full backdrop-blur-sm mb-4"
                    >
                        PREMIUM CUSTOM KITCHEN
                    </motion.span>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-[28px] font-black text-white leading-tight mb-4 break-keep"
                    >
                        맞춤은 비싸고,<br />
                        저렴한 주방은 불안하셨다면.<br />
                        <em className="not-italic text-[#E2C99A]">이제 타협하지 않아도 됩니다.</em>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-white/70 text-sm leading-relaxed mb-8 break-keep"
                    >
                        사제의 유연한 맞춤 설계와<br />
                        하이엔드 브랜드의 압도적 퀄리티.<br />
                        KCC글라스 홈씨씨 H-LINE이 둘 다 드립니다.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col gap-3"
                    >
                        <button 
                            onClick={handleConsultClick}
                            className="w-full bg-gradient-to-r from-[#C9A97A] to-[#B8944A] text-[#1E1E1E] font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                        >
                            <MessageSquare size={18} />
                            무료 맞춤 상담 받기
                        </button>
                        <button 
                            onClick={handleCallClick}
                            className="w-full bg-white/10 border border-white/40 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-2 backdrop-blur-sm active:scale-95 transition-all"
                        >
                            <Phone size={16} />
                            전화 상담 · 1588-0883
                        </button>
                    </motion.div>
                </div>
                
                <div className="absolute bottom-20 right-6 z-20 flex flex-col items-center gap-2">
                    <motion.div 
                        animate={{ y: [0, 10, 0], opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-px h-10 bg-gradient-to-b from-transparent to-[#C9A97A]"
                    />
                    <span className="font-en text-[8px] tracking-widest text-[#C9A97A]/80 uppercase [writing-mode:vertical-rl]">Scroll</span>
                </div>
            </section>

            {/* Section 2: Pain Points */}
            <section className="bg-[#F7F2EB] px-6 py-20 pb-24">
                <div className="mb-10">
                    <span className="font-en text-[10px] font-bold tracking-[3px] text-[#C9A97A] uppercase mb-2 block">The Problem</span>
                    <h2 className="text-[22px] font-black leading-snug mb-3 break-keep">
                        주방을 바꾸고 싶어도<br />
                        망설이게 되는 이유
                    </h2>
                    <p className="text-[#333333] text-sm leading-relaxed break-keep">
                        맞춤형 주방을 원하지만 현실적인 고민들이 발목을 잡습니다.<br />
                        홈씨씨 H-LINE은 이 세 가지 문제를 한 번에 해결합니다.
                    </p>
                </div>

                <div className="space-y-4 mb-10">
                    {[
                        { icon: '💸', title: '맞춤형 주방은 너무 비싸다', desc: '원하는 디자인과 사양으로 설계하면 예산을 훌쩍 넘어버리는 현실' },
                        { icon: '😟', title: '저렴한 사제 주방은 내구성이 불안하다', desc: '가격은 합리적이지만 소재 품질, 시공 후 하자, A/S 걱정이 가시지 않음' },
                        { icon: '📐', title: '기성 규격이라 우리 집에 딱 안 맞는다', desc: '브랜드 주방은 정해진 규격만 있어 공간이 애매하게 남거나 몰딩이 어색함' }
                    ].map((item, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-2xl p-5 flex gap-4 shadow-sm"
                        >
                            <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                                {item.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-[15px] mb-1">{item.title}</h3>
                                <p className="text-gray-400 text-[13px] leading-snug break-keep">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-[#3D2B1F] to-[#5B4335] rounded-2xl p-6 text-center relative overflow-hidden shadow-xl"
                >
                    <div className="absolute top-[-10px] left-4 text-[80px] font-serif text-[#C9A97A]/15 leading-none select-none">"</div>
                    <p className="relative z-10 text-[#F7F2EB] text-[15px] font-semibold leading-relaxed mb-3 break-keep">
                        KCC글라스 홈씨씨가<br />
                        <strong className="text-[#E2C99A] font-black">그 타협점을 완벽하게 깼습니다.</strong>
                    </p>
                    <span className="relative z-10 font-en text-lg font-black text-[#C9A97A] tracking-widest">H-LINE</span>
                </motion.div>
            </section>

            {/* Section 3: Premium Spec */}
            <section className="bg-white px-6 py-20">
                <span className="font-en text-[10px] font-bold tracking-[3px] text-[#C9A97A] uppercase mb-2 block">Premium Inside</span>
                <h2 className="text-[22px] font-black leading-snug mb-3 break-keep">
                    보이지 않는 프리미엄의<br />
                    뼈대를 해부하다
                </h2>
                <p className="text-[#333333] text-sm leading-relaxed mb-10 break-keep">
                    겉으로 드러나지 않는 내부 스펙이 바로<br />
                    H-LINE 프리미엄의 핵심입니다.
                </p>

                <div className="space-y-6">
                    {[
                        { img: '/images/hline/18t.png', num: '01 / STRUCTURE', title: '견고한 뼈대', desc: '변형 없는 18T와 고밀도 MDF. 무거운 냄비를 올려도 흔들림 없는 수납 공간을 완성합니다.', tags: ['18T 전면 적용', '고밀도 MDF', '일반대비 20% 두꺼움'] },
                        { img: '/images/hline/eco.png', num: '02 / ECO MATERIAL', title: '친환경 안심 자재', desc: '안심하고 숨 쉴 수 있는 E0 등급. 포름알데히드 방출량을 엄격히 제어해 가족의 건강을 지킵니다.', tags: ['E0 등급 인증', '포름알데히드 제어', '가족 안심'] },
                        { img: '/images/hline/hardware.png', num: '03 / HARDWARE', title: '명품 하드웨어', desc: '수만 번을 열어와도 변함없는 독일·이태리 부품. 문을 닫는 순간 느껴지는 고급감이 다릅니다.', tags: ['독일 HÄFELE', '저소음 댐핑', '장기 내구성'] }
                    ].map((card, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100"
                        >
                            <div className="relative h-48 w-full">
                                <Image src={card.img} alt={card.title} fill className="object-cover" unoptimized />
                            </div>
                            <div className="p-5">
                                <span className="font-en text-[11px] font-bold tracking-[2px] text-[#C9A97A] mb-2 block">{card.num}</span>
                                <h3 className="text-lg font-black mb-2">{card.title}</h3>
                                <p className="text-gray-600 text-[13px] leading-relaxed mb-4 break-keep">{card.desc}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {card.tags.map(tag => (
                                        <span key={tag} className="bg-[#F7F2EB] text-[#5B4335] text-[11px] font-bold px-3 py-1 rounded-full border border-[#EDE6DB]">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Section 4: 18T Strength */}
            <section className="bg-[#1E1E1E] px-6 py-20 overflow-hidden">
                <span className="font-en text-[10px] font-bold tracking-[3px] text-[#C9A97A] uppercase mb-2 block">Structural Strength</span>
                <h2 className="text-[22px] font-black leading-snug mb-3 text-white break-keep">
                    18T의 절대 규칙:<br />
                    무거운 냄비를 올려도<br />
                    흔들림 없는 안심 수납
                </h2>
                <p className="text-white/60 text-sm leading-relaxed mb-10 break-keep">
                    일반 브랜드 주방(15T) 대비 20% 더 두껍고 견고합니다.
                </p>

                <div className="flex items-center justify-center gap-4 mb-10">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-end h-20">
                            <motion.div 
                                initial={{ height: 0 }}
                                whileInView={{ height: 50 }}
                                viewport={{ once: true }}
                                className="w-11 bg-white/20 rounded-t-lg"
                            />
                        </div>
                        <span className="font-en text-xl font-black text-white">15T</span>
                        <span className="text-[10px] text-white/40 text-center leading-tight">타사 일반<br />브랜드 주방</span>
                    </div>
                    <span className="font-en text-[13px] font-bold text-white/40 mt-12">VS</span>
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-end h-20">
                            <motion.div 
                                initial={{ height: 0 }}
                                whileInView={{ height: 75 }}
                                viewport={{ once: true }}
                                className="w-11 bg-gradient-to-t from-[#C9A97A] to-[#E2C99A] rounded-t-lg shadow-lg shadow-[#C9A97A]/20"
                            />
                        </div>
                        <span className="font-en text-xl font-black text-[#C9A97A]">18T</span>
                        <span className="text-[10px] text-white/40 text-center leading-tight font-bold">홈씨씨<br />H-LINE</span>
                    </div>
                </div>

                <div className="bg-white/5 border border-[#C9A97A]/20 rounded-2xl p-6 mb-6">
                    <p className="text-[13px] font-bold text-[#C9A97A] mb-4">✓ 18T 100% 적용 부위</p>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                        {['몸통 18T', '도어 18T', '선반 18T', '밑판 18T', '측판 18T', '전면 동일'].map(item => (
                            <div key={item} className="flex items-center gap-2 text-white text-[13px] font-medium">
                                <div className="w-5 h-5 bg-gradient-to-br from-[#C9A97A] to-[#B8944A] rounded-full flex items-center justify-center text-white text-[10px] shrink-0">
                                    <Check size={12} strokeWidth={4} />
                                </div>
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#C9A97A]/10 border-l-4 border-[#C9A97A] p-4 rounded-r-xl">
                    <p className="text-[12px] text-white/80 leading-relaxed break-keep">
                        코어 자재 역시 PB가 아닌 <strong className="text-[#C9A97A] font-bold">밀도 높은 MDF 도어</strong>를 적용하여, 수십 년을 반복 개폐해도 <strong className="text-[#C9A97A] font-bold">경첩 고정력이 우수</strong>합니다.
                    </p>
                </div>
            </section>

            {/* Section 5: Hardware */}
            <section className="bg-[#F7F2EB] px-6 py-20">
                <span className="font-en text-[10px] font-bold tracking-[3px] text-[#C9A97A] uppercase mb-2 block">Premium Hardware</span>
                <h2 className="text-[22px] font-black leading-snug mb-3 break-keep">
                    보이지 않는 곳의 명품:<br />
                    문을 닫는 순간의 우아함
                </h2>
                <p className="text-[#333333] text-sm leading-relaxed mb-10 break-keep">
                    눈에 보이지 않는 부품까지 유럽산 프리미엄으로.<br />
                    매일 열고 닫는 순간마다 체감되는 차이입니다.
                </p>

                <div className="relative rounded-2xl overflow-hidden shadow-xl mb-8">
                    <Image src="/images/hline/hardware.png" alt="Hafele Hardware" width={480} height={300} className="w-full object-cover" unoptimized />
                </div>

                <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-5 flex gap-4 shadow-sm">
                        <div className="w-11 h-11 bg-gradient-to-br from-[#5B4335] to-[#3D2B1F] rounded-xl flex items-center justify-center text-xl shrink-0">🔩</div>
                        <div>
                            <span className="inline-block font-en text-[10px] font-bold tracking-[1px] text-[#C9A97A] bg-[#C9A97A]/10 px-2 py-0.5 rounded mb-1.5 uppercase">GERMANY · HÄFELE</span>
                            <h3 className="font-bold text-[14px] mb-1 text-[#1E1E1E]">저압 댐핑 경첩</h3>
                            <p className="text-gray-400 text-[12px] leading-relaxed break-keep">소음 없이 부드럽게 닫히는 고급스러운 주방 환경. 수만 번을 반복해도 변함없는 정숙한 클로징.</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 flex gap-4 shadow-sm">
                        <div className="w-11 h-11 bg-gradient-to-br from-[#5B4335] to-[#3D2B1F] rounded-xl flex items-center justify-center text-xl shrink-0">📌</div>
                        <div>
                            <span className="inline-block font-en text-[10px] font-bold tracking-[1px] text-[#C9A97A] bg-[#C9A97A]/10 px-2 py-0.5 rounded mb-1.5 uppercase">ITALY · PREMIUM</span>
                            <h3 className="font-bold text-[14px] mb-1 text-[#1E1E1E]">플리퍼 다보 선반 고정</h3>
                            <p className="text-gray-400 text-[12px] leading-relaxed break-keep">일반 삼각 다보 대비 압도적인 안정성. 무거운 그릇에도 선반 이탈을 완벽하게 방지합니다.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 6: Eco Material */}
            <section className="bg-white px-6 py-20">
                <span className="font-en text-[10px] font-bold tracking-[3px] text-[#C9A97A] uppercase mb-2 block">Eco & Safety</span>
                <h2 className="text-[22px] font-black leading-snug mb-8 break-keep">
                    요리하는 공간이니까,<br />
                    숨 쉬는 공기까지<br />
                    생각한 안심 자재
                </h2>

                <div className="space-y-10">
                    <div className="flex items-center gap-0.5">
                        {['E2', 'E1', 'E0', 'SE0'].map((grade) => (
                            <div 
                                key={grade} 
                                className={`flex-1 py-4 text-center text-xs font-black border-r border-white/20 last:border-0 relative
                                    ${grade === 'E2' ? 'bg-[#9E9E9E] rounded-l-lg text-white' : ''}
                                    ${grade === 'E1' ? 'bg-[#81C784] text-white' : ''}
                                    ${grade === 'E0' ? 'bg-[#4CAF50] text-white ring-4 ring-[#4CAF50]/20 z-10' : ''}
                                    ${grade === 'SE0' ? 'bg-[#2E7D32] rounded-r-lg text-white' : ''}
                                `}
                            >
                                {grade}
                                {grade === 'E0' && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-30 animate-ping" />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1 bg-gray-50 rounded-2xl p-5 text-center">
                            <span className="font-en text-3xl font-black text-[#4CAF50] block leading-none mb-1">E0<span className="text-sm">등급</span></span>
                            <span className="text-[11px] text-gray-400 font-bold">친환경 자재 등급</span>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-2xl p-5 text-center">
                            <span className="font-en text-3xl font-black text-[#5B4335] block leading-none mb-1">100%</span>
                            <span className="text-[11px] text-gray-400 font-bold">전 자재 E0 적용</span>
                        </div>
                    </div>

                    <div className="bg-[#EEF6EF] rounded-2xl p-6 border border-[#EEF6EF]">
                        <p className="text-gray-700 text-sm leading-relaxed text-center break-keep">
                            포름알데히드 방출량을 엄격하게 제어한<br />
                            <strong className="font-black">E0 등급 친환경 자재</strong>만을 사용합니다.<br /><br />
                            눈이 맵지 않고 호흡기가 편안한,<br />
                            <strong className="font-black text-[#2E7D32]">우리 가족 모두를 위한 가장 안전한 주방</strong>을 완성합니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 7: Custom Fit */}
            <section className="bg-white px-6 py-20">
                <span className="font-en text-[10px] font-bold tracking-[3px] text-[#C9A97A] uppercase mb-2 block">Custom Design</span>
                <h2 className="text-[22px] font-black leading-snug mb-3 break-keep">
                    기성 규격에<br />
                    우리 집을 맞추지 마세요
                </h2>
                <p className="text-[#333333] text-sm leading-relaxed mb-10 break-keep">
                    집이 제품에 맞춰지는 것이 아니라,<br />
                    제품이 공간에 맞춰지는 진짜 맞춤 주방.
                </p>

                <div className="relative rounded-2xl overflow-hidden shadow-xl mb-10 h-64 font-bold text-white">
                    <Image src="/images/hline/custom.png" alt="Custom Kitchen" fill className="object-cover" unoptimized />
                </div>

                <div className="space-y-6">
                    {[
                        { icon: '📏', title: '전 제품 비규격 주문 제작 가능', sub: '공간의 제약 없이 특수 형태 설계 가능' },
                        { icon: '🏠', title: '무몰딩 완벽 핏 구현', sub: '하이엔드 인테리어에서나 볼 수 있던 일체감을 현실로' },
                        { icon: '🔧', title: '비정형 구조 공간도 완벽 대응', sub: '어색한 틈, 남는 공간 없이 꽉 채우는 맞춤 설계' }
                    ].map((item, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="w-10 h-10 bg-[#F7F2EB] rounded-2xl flex items-center justify-center text-xl shrink-0">
                                {item.icon}
                            </div>
                            <div>
                                <h3 className="font-black text-[15px] text-[#1E1E1E] leading-tight mb-1">{item.title}</h3>
                                <p className="text-gray-400 text-[13px] font-medium leading-tight">{item.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Section: Before & After (Added) */}
            <section className="bg-[#F7F2EB] px-6 py-24 pb-32">
                <div className="text-center mb-12">
                    <span className="font-en text-[10px] font-bold tracking-[3px] text-[#C9A97A] uppercase mb-2 block">Transformation</span>
                    <h2 className="text-[26px] font-black leading-tight break-keep">
                        H-LINE으로 완성된<br />놀라운 변화
                    </h2>
                </div>

                <div className="space-y-12">
                    {[
                        { img: '/images/hline/ba1.png', label: '낡고 오래된 주방의 세련된 변신', tags: ['Modern', 'Walnut'] },
                        { img: '/images/hline/ba2.png', label: '복잡한 동선을 해결한 효율적 재구성', tags: ['Efficiency', 'Storage'] },
                        { img: '/images/hline/ba3.png', label: '빈틈없는 완벽 핏, 커스텀의 힘', tags: ['Custom Fit', 'No Molding'] }
                    ].map((item, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-72 mb-6 ring-1 ring-black/5">
                                <Image src={item.img} alt={`BA ${i+1}`} fill className="object-cover" unoptimized />
                                <div className="absolute top-4 left-4 flex gap-1.5">
                                    {item.tags.map(tag => (
                                        <span key={tag} className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="px-2">
                                <h3 className="text-lg font-black text-[#1E1E1E] leading-tight mb-1">{item.label}</h3>
                                <p className="text-gray-400 text-sm font-medium italic">Before & After Comparison</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Section 8: Price Comparison */}
            <section className="bg-[#1E1E1E] px-6 py-24 text-center">
                <span className="font-en text-[10px] font-bold tracking-[3px] text-[#C9A97A] uppercase mb-2 block">Value Comparison</span>
                <h2 className="text-[22px] font-black leading-snug mb-4 text-white break-keep">
                    업계 1위 타사 중가 라인업의<br />
                    가격으로, 최고 사양 스펙을
                </h2>
                <p className="text-white/60 text-sm leading-relaxed mb-12 break-keep">
                    같은 가격이라면 더 좋은 스펙을 선택하는 것이 당연합니다.<br />
                    H-LINE은 가격과 품질 모두를 잡았습니다.
                </p>

                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden mb-12 shadow-2xl">
                    <div className="grid grid-cols-3 bg-white/10">
                        <div className="p-4 text-[11px] font-bold text-white/40 text-left">항목</div>
                        <div className="p-4 text-[11px] font-bold text-white/60">타사 브랜드</div>
                        <div className="p-4 text-[11px] font-black text-[#C9A97A] border-l border-white/5 bg-[#C9A97A]/5">홈씨씨 H-LINE</div>
                    </div>
                    {[
                        { label: '몸통 두께', comp: '15T', hline: '18T' },
                        { label: '도어 코어', comp: 'PB', hline: 'MDF' },
                        { label: '하드웨어', comp: '국산 일반', hline: '수입 HÄFELE' },
                        { label: '친환경', comp: 'E1', hline: 'E0' },
                        { label: '가격 지수', comp: '135%', hline: '100%' }
                    ].map((row, i) => (
                        <div key={i} className="grid grid-cols-3 border-t border-white/5 hover:bg-white/5 transition-colors">
                            <div className="p-5 text-[12px] font-bold text-white/40 text-left">{row.label}</div>
                            <div className="p-5 text-[12px] font-medium text-white/60">{row.comp}</div>
                            <div className="p-5 text-[12px] font-black text-[#E2C99A] border-l border-white/5 bg-[#C9A97A]/5">
                                {row.hline}
                                {i < 4 && <span className="block text-[8px] mt-1 bg-[#C9A97A] text-black px-1.5 py-0.5 rounded-full w-fit mx-auto scale-90">BEST</span>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-gradient-to-r from-[#C9A97A] to-[#B8944A] p-2 rounded-2xl">
                    <div className="bg-[#1E1E1E] p-5 rounded-xl border border-[#C9A97A]/30">
                        <p className="text-[14px] text-white leading-relaxed break-keep">
                            타사 최고 등급에서나 볼 수 있는<br />
                            <strong className="text-[#E2C99A] font-black">하이엔드 스펙을 타사 중가 모델 가격으로.</strong>
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 9: Accessories */}
            <section className="bg-white px-6 py-20 text-center">
                <span className="font-en text-[10px] font-bold tracking-[3px] text-[#C9A97A] uppercase mb-2 block">Free Accessories</span>
                <h2 className="text-[22px] font-black leading-snug mb-3 break-keep">
                    알아서 챙겨드리는<br />
                    완벽한 수납 솔루션 3종
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-10 break-keep">
                    추가 금액? 없습니다.<br />
                    H-LINE 고객 모두에게 기본 제공됩니다.
                </p>

                <div className="relative rounded-2xl overflow-hidden shadow-xl mb-12 h-64">
                    <Image src="/images/hline/storage.png" alt="Accessories" fill className="object-cover" unoptimized />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-10">
                    {[
                        { icon: '🚿', name: '씽크라인', desc: '배수구 아래\n선반 활용' },
                        { icon: '🥢', name: '수저함', desc: '서랍 내부\n깔끔 정리' },
                        { icon: '🔪', name: '칼꽂이', desc: '도어 안쪽\n안전 보관' }
                    ].map((item, i) => (
                        <div key={i} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col items-center">
                            <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded-[4px] font-black mb-3">무상제공</span>
                            <span className="text-3xl mb-3">{item.icon}</span>
                            <h3 className="text-xs font-black mb-1">{item.name}</h3>
                            <p className="text-[10px] text-gray-400 font-bold whitespace-pre-line leading-tight">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-center gap-4 bg-[#F7F2EB] p-5 rounded-2xl">
                    <span className="text-2xl">🎁</span>
                    <p className="text-[13px] text-gray-700 font-bold leading-snug text-left">
                        깔끔한 주방을 만드는 핵심 액세서리 3종,<br />
                        <strong className="text-[#5B4335] font-black">H-LINE이라면 모두 기본입니다.</strong>
                    </p>
                </div>
            </section>

            {/* Section 10: Warranty */}
            <section className="bg-white px-6 py-20 border-t border-gray-50">
                <span className="font-en text-[10px] font-bold tracking-[3px] text-[#C9A97A] uppercase mb-2 block">Brand Warranty</span>
                <h2 className="text-[22px] font-black leading-snug mb-3 break-keep">
                    대기업 KCC글라스가<br />
                    직접 약속하는<br />
                    확실한 사후 관리
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-10 break-keep text-shadow-sm">
                    사제 주방의 가장 큰 불안 요소였던 A/S,<br />
                    이제 걱정하지 마세요.
                </p>

                <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-12 h-64 ring-1 ring-black/5">
                    <Image src="/images/hline/warranty.png" alt="KCC Warranty" fill className="object-cover" unoptimized />
                </div>

                <div className="flex justify-between gap-2 mb-12">
                    {[
                        { num: '1', unit: '년', label: '무상\n품질보증' },
                        { num: '100', unit: '%', label: '시공 후\n무상 A/S' },
                        { num: 'KCC', unit: 'GLASS', label: '대기업\n직접 보증' }
                    ].map((card, i) => (
                        <div key={i} className="flex-1 bg-gray-50 rounded-2xl p-5 text-center flex flex-col justify-center border border-gray-100 h-32">
                            <div className="mb-1 leading-none">
                                <span className={`font-black tracking-tighter ${card.num === 'KCC' ? 'text-lg text-blue-800' : 'text-3xl text-[#1E1E1E]'}`}>{card.num}</span>
                                <span className={`font-bold ml-0.5 ${card.num === 'KCC' ? 'text-[8px] text-gray-400' : 'text-sm text-gray-400'}`}>{card.unit}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-bold whitespace-pre-line leading-tight mt-1">{card.label}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl flex flex-col items-center">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex flex-col items-center">
                            <span className="font-en text-[7px] font-bold text-gray-300 tracking-[1px]">KCC GLASS</span>
                            <span className="font-en text-lg font-black text-gray-900 leading-none">Home<span className="text-[#5B4335]">CC</span></span>
                        </div>
                        <div className="w-px h-6 bg-gray-200" />
                        <span className="text-gray-400 font-black text-sm italic">Direct Warranty</span>
                    </div>
                    <p className="text-center text-sm text-gray-600 leading-relaxed font-medium break-keep">
                        KCC글라스 본사의 엄격한 품질보증 체계를 통해<br />
                        시공 후 <strong className="text-blue-900 font-black">1년 무상 A/S</strong>를 확정적으로 제공합니다.
                    </p>
                </div>
            </section>

            {/* Section 11: Final CTA */}
            <section id="section-final-cta" className="relative h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden bg-black">
                <Image src="/images/hline/cta_bg.png" alt="CTA BG" fill className="object-cover opacity-60" unoptimized />
                <div className="absolute inset-0 bg-black/40" />
                
                <div className="relative z-10 w-full">
                    <span className="font-en text-[11px] font-black tracking-[4px] text-[#C9A97A] uppercase mb-4 block animate-pulse">START NOW</span>
                    <h2 className="text-[28px] font-black text-white leading-tight mb-6 break-keep">
                        합리적 가격으로 만나는<br />
                        <em className="not-italic text-[#E2C99A]">프리미엄 맞춤 주방,</em><br />
                        지금 경험하세요.
                    </h2>
                    <p className="text-white/70 text-sm leading-relaxed mb-12 break-keep">
                        사제의 맞춤형 핏(Fit)과 하이엔드 브랜드의 압도적 퀄리티.<br />
                        타협 없는 당신을 위한 단 하나의 솔루션, H-LINE.
                    </p>

                    <div className="flex flex-col gap-3 w-full max-w-sm mx-auto mb-12">
                        <button 
                            onClick={handleConsultClick}
                            className="bg-gradient-to-r from-[#C9A97A] to-[#B8944A] text-[#1E1E1E] font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all text-lg tracking-tight"
                        >
                            <MessageSquare size={22} fill="currentColor" stroke="none" />
                            주방 전문가 무료 상담 신청
                        </button>
                        <button 
                            onClick={handleCallClick}
                            className="bg-white/10 border border-white/30 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 backdrop-blur-md active:scale-95 transition-all"
                        >
                            <Phone size={18} fill="currentColor" stroke="none" />
                            전화 상담 <span className="font-en tracking-tighter text-[#C9A97A]">1588-0883</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2 w-full pt-10 border-t border-white/10">
                        {[
                            { icon: <Trophy size={20} />, text: 'KCC글라스\n공식 브랜드' },
                            { icon: <Shield size={20} />, text: '1년\n무상 A/S' },
                            { icon: <Leaf size={20} />, text: 'E0 등급\n친환경' },
                            { icon: <Scissors size={20} />, text: '100%\n맞춤 제작' }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="text-[#C9A97A] mb-2">{item.icon}</div>
                                <p className="text-[9px] text-white/50 font-bold leading-tight whitespace-pre-wrap">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 px-6 py-10 pb-32 text-center">
                <span className="font-en text-sm font-black text-gray-300 tracking-[1px] mb-2 block uppercase">HomeCC H-LINE</span>
                <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                    KCC글라스(주) | 고객센터 1588-0883<br />
                    © 2026 HomeCC. All rights reserved.
                </p>
            </footer>

            {/* Consultation Modal */}
            <AnimatePresence>
                {showConsultModal && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isSubmitting && setShowConsultModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[32px] w-full max-w-[400px] relative z-10 overflow-hidden shadow-2xl flex flex-col"
                        >
                            <div className="bg-[#5B4335] p-8 text-white relative">
                                <button 
                                    onClick={() => setShowConsultModal(false)} 
                                    className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                                    disabled={isSubmitting}
                                >
                                    <X size={24} />
                                </button>
                                <span className="font-en text-[10px] font-bold tracking-[3px] text-[#C9A97A] uppercase mb-2 block">Quick Consultation</span>
                                <h2 className="text-2xl font-black leading-tight">주방 전문가<br />맞춤 상담 신청</h2>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="relative">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1 block">이름</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="성함을 입력해주세요"
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-gray-800 outline-none focus:bg-white focus:border-[#C9A97A]/30 transition-all"
                                                required
                                            />
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1 block">연락처</label>
                                        <div className="relative">
                                            <input 
                                                type="tel" 
                                                value={contact}
                                                onChange={handleAutoHyphen}
                                                placeholder="010-0000-0000"
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-gray-800 outline-none focus:bg-white focus:border-[#C9A97A]/30 transition-all font-en tracking-tight"
                                                required
                                                maxLength={13}
                                            />
                                            <PhoneCall className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl cursor-pointer" onClick={() => setIsAgreed(!isAgreed)}>
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 mt-0.5 ${isAgreed ? 'bg-[#5B4335] border-[#5B4335]' : 'border-gray-300 bg-white'}`}>
                                        {isAgreed && <Check size={14} className="text-white" strokeWidth={4} />}
                                    </div>
                                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                                        <strong className="text-gray-700">개인정보 수집 및 이용 동의 (필수)</strong><br />
                                        상담 진행 및 안내를 위해 이름, 연락처 정보를 수집하며 목적 달성 후 즉시 파기합니다.
                                    </p>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-[#C9A97A] to-[#B8944A] text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="animate-spin" size={24} />
                                    ) : (
                                        <>
                                            <MessageSquare size={20} fill="currentColor" stroke="none" />
                                            무료 상담 신청하기
                                        </>
                                    )}
                                </button>
                                
                                <p className="text-center text-[10px] text-gray-300 font-medium">
                                    신청 즉시 담당 전문가가 배정되어 순차적으로 연락드립니다.
                                </p>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Floating Bottom CTA */}
            <AnimatePresence>
                {showFloatingCta && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-[480px] z-[1000] p-4 pb-8 bg-black/95 backdrop-blur-lg border-t border-[#C9A97A]/30 shadow-[0_-10px_30px_rgba(0,0,0,0.3)] flex gap-2"
                    >
                        <button 
                            onClick={handleCallClick}
                            className="flex-1 border-2 border-[#C9A97A] text-[#C9A97A] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
                        >
                            <Phone size={16} fill="currentColor" stroke="none" />
                            전화 상담
                        </button>
                        <button 
                            onClick={handleConsultClick}
                            className="flex-[2] bg-gradient-to-r from-[#C9A97A] to-[#B8944A] text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-[15px] shadow-lg shadow-[#C9A97A]/20"
                        >
                            <MessageSquare size={18} fill="currentColor" stroke="none" />
                            무료 맞춤 상담 받기
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HLineClient;
