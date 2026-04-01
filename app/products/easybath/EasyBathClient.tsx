"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { 
    Phone, 
    ArrowDown, 
    Check, 
    Clock, 
    Expand, 
    Droplets, 
    ShieldCheck, 
    Wind, 
    MessageCircle, 
    MapPin, 
    User, 
    ChevronRight, 
    ChevronLeft, 
    Plus, 
    Minus,
    X,
    Loader2,
    CheckCircle2,
    Star,
    Gift,
    ArrowRight,
    MousePointer2,
    Lock,
    Send,
    Calendar,
    Palette,
    Home,
    Box,
    Sparkles,
    CheckCircle,
    XCircle,
    MessagesSquare,
    Ruler,
    Wrench,
    ChevronDown
} from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface EasyBathClientProps {
    partnerId: string | null;
    category?: string;
}

export default function EasyBathClient({ partnerId, category = "욕실" }: EasyBathClientProps) {
    const [scrolled, setScrolled] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAgreed, setIsAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formStep, setFormStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);

    // Form States
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [region, setRegion] = useState('');
    const [problems, setProblems] = useState<string[]>([]);
    const [consultTime, setConsultTime] = useState('');
    const [showBanners, setShowBanners] = useState(true);

    const formRef = useRef<HTMLDivElement>(null);
    const caseRef = useRef<HTMLDivElement>(null);

    // Convex Data
    const partner = useQuery(api.partners.getPartnerByUid, partnerId ? { uid: partnerId } : "skip");
    const createCustomerMutation = useMutation(api.customers.createCustomer);

    const partnerBenefit = useMemo(() => {
        if (!partner) return null;
        const rawBenefit = partner.special_benefits || "";
        try {
            const benefitsObj = JSON.parse(rawBenefit);
            return benefitsObj['P002'] || benefitsObj['easybath'] || Object.values(benefitsObj)[0] || '';
        } catch {
            return rawBenefit;
        }
    }, [partner]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 60);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-slide for benefits
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % 5);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const scrollToCase = () => {
        caseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length <= 3) val = val;
        else if (val.length <= 7) val = val.slice(0, 3) + '-' + val.slice(3);
        else val = val.slice(0, 3) + '-' + val.slice(3, 7) + '-' + val.slice(7, 11);
        setPhone(val);
    };

    const toggleProblem = (problem: string) => {
        setProblems(prev => 
            prev.includes(problem) ? prev.filter(p => p !== problem) : [...prev, problem]
        );
    };

    const nextStep = () => {
        if (!name || !phone || !region) {
            alert('필수 정보를 모두 입력해주세요.');
            return;
        }
        setFormStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAgreed) {
            alert('개인정보 수집 및 이용에 동의해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            await createCustomerMutation({
                name,
                contact: phone,
                address: region,
                channel: partner ? partner.name : '본사(직접)',
                label: '이지바스',
                status: '접수',
                category: category,
                progress_detail: `고민: ${problems.join(', ')} / 희망시간: ${consultTime}`,
                partner_benefit: partnerBenefit || "",
                created_at: new Date().toISOString().split('T')[0]
            });

            setSubmitted(true);
            setFormStep(3);
        } catch (error) {
            console.error(error);
            alert('상담 신청 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const benefits = [
        {
            id: 0,
            num: '01',
            title: '단 하루 시공',
            desc: '창호 교체 1일 + 욕실 교체 1일, 단 이틀이면 가장 까다로운 공사가 끝납니다.',
            color: 'linear-gradient(135deg, #1a3a6e, #2d5aa0)',
            icon: <Clock />,
            extra: (
                <div className="flex items-center gap-4 mt-6">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">Day 1</div>
                        <span className="text-[10px] mt-2 font-bold">창호 교체</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300" />
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">Day 2</div>
                        <span className="text-[10px] mt-2 font-bold">욕실 교체</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300" />
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold"><Check /></div>
                        <span className="text-[10px] mt-2 font-bold">완성!</span>
                    </div>
                </div>
            )
        },
        {
            id: 1,
            num: '02',
            title: '공간 100% 유지',
            desc: '초박형 패널로 기존 공간을 100% 유지합니다. 좁은 욕실도 더 이상 좁아지지 않습니다.',
            color: 'linear-gradient(135deg, #1a5c3a, #2d8a56)',
            icon: <Expand />,
            extra: (
                <div className="w-full space-y-4 mt-6">
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold"><span>기존 방식</span><span className="text-red-500">60%만 남음</span></div>
                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-red-400" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold"><span>이지바스</span><span className="text-emerald-500">100% 유지</span></div>
                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 2,
            num: '03',
            title: '무줄눈 클린 구조',
            desc: '패널 사이 이음매가 없어 줄눈 자체가 존재하지 않습니다. 물때가 낄 틈이 없어 물청소만으로도 새것처럼!',
            color: 'linear-gradient(135deg, #4a1a6e, #7a2da0)',
            icon: <Droplets />,
            extra: (
                <div className="grid grid-cols-3 gap-2 mt-6">
                    <div className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-xl">
                        <Droplets className="w-6 h-6 text-blue-500 mb-1" />
                        <span className="text-[10px] font-bold">물청소 OK</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-xl relative">
                        <Wind className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-[10px] font-bold text-gray-400 leading-tight">힘든 청소<br/>불필요</span>
                        <X className="absolute top-1 right-1 w-3 h-3 text-red-500" />
                    </div>
                    <div className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-xl relative">
                        <ShieldCheck className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-[10px] font-bold text-gray-400 leading-tight">곰팡이<br/>걱정 제로</span>
                        <X className="absolute top-1 right-1 w-3 h-3 text-red-500" />
                    </div>
                </div>
            )
        },
        {
            id: 3,
            num: '04',
            title: '3중 결합 안심 소재',
            desc: '10년 이상 검증된 KCC의 기술력. 단순 플라스틱이 아닌 첨단 엔지니어링 소재!',
            color: 'linear-gradient(135deg, #6e3a1a, #a05e2d)',
            icon: <ShieldCheck />,
            extra: (
                <div className="space-y-2 mt-6">
                    <div className="flex items-center gap-3 p-2 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600"><Star size={16}/></div>
                        <div className="flex flex-col"><span className="text-xs font-bold leading-none">UV 코팅 마감</span><span className="text-[10px] text-gray-400">오염 방지</span></div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle2 size={16}/></div>
                        <div className="flex flex-col"><span className="text-xs font-bold leading-none">친환경 PET</span><span className="text-[10px] text-gray-400">안전 소재</span></div>
                    </div>
                </div>
            )
        },
        {
            id: 4,
            num: '05',
            title: '무분진 보양 시스템',
            desc: '거주 중 공사도 걱정 없습니다. 벽, 바닥, 가전, 가구까지 철저히 보호합니다.',
            color: 'linear-gradient(135deg, #1a4e6e, #2d7fa0)',
            icon: <Lock />,
            extra: (
                <div className="grid grid-cols-2 gap-2 mt-6">
                    {['분진 차단', '찍힘 방지', '이사 불필요', '생활 유지'].map((t, i) => (
                        <div key={i} className="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                            <Check className="w-3 h-3 text-blue-500" /> {t}
                        </div>
                    ))}
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-white font-['Noto_Sans_KR',sans-serif] text-slate-900 scroll-smooth selection:bg-orange-100 overflow-x-hidden">
            {/* Header */}
            <header className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-[#0d2247]/90 backdrop-blur-sm py-4 border-b border-white/10'}`}>
                <div className="max-w-[480px] mx-auto px-5 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="relative w-[130px] h-[34px]">
                            <Image 
                                src={scrolled 
                                    ? "https://cdn.imweb.me/upload/S20250904697320f4fd9ed/5b115594e9a66.png" 
                                    : "https://cdn.imweb.me/upload/S20250904697320f4fd9ed/e840c9a46f66a.png"} 
                                alt="KCC HomeCC Logo" 
                                fill 
                                className="object-contain transition-opacity duration-300"
                                unoptimized
                            />
                        </div>
                    </div>
                    <button onClick={scrollToForm} className="bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-black px-5 py-2.5 rounded-full transition-all active:scale-95 shadow-lg shadow-orange-500/20">
                        무료 상담 신청
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden bg-[#0d2247]">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <Image 
                        src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/de15091e6bab0.jpg" 
                        alt="Hero Background" 
                        fill 
                        className="object-cover brightness-[0.4] animate-slow-zoom"
                        unoptimized
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0d2247]/60 via-[#0d2247]/40 to-[#0d2247] z-[1]"></div>
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0d2247] to-transparent z-[2]"></div>
                </div>

                <div className="relative z-10 max-w-[480px] px-6 text-center pb-20">
                    <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/50 text-orange-300 text-[13px] font-bold px-4 py-1.5 rounded-full mb-8 animate-pulse">
                        <Star size={14} fill="currentColor" /> 욕실 리모델링의 새로운 기준
                    </div>
                    <h1 className="text-[32px] md:text-5xl font-black text-white leading-[1.2] mb-8 tracking-tighter">
                        <span className="whitespace-nowrap">단 하루 만에 완성되는,</span><br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-500 whitespace-nowrap">이음매 없는 휴식처</span>
                    </h1>
                    <p className="text-white/70 text-base md:text-lg font-medium leading-relaxed mb-12">
                        먼지, 소음, 곰팡이 걱정 없이<br />
                        욕실의 패러다임을 바꿉니다.
                    </p>

                    <div className="flex flex-wrap justify-center gap-2.5 mb-12">
                        {['단 1~2일 시공', '이음매 없는 구조', '거주 중 가능'].map((t, i) => (
                            <div key={i} className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/90 text-xs font-bold px-4 py-2 rounded-full">
                                <Check size={14} className="text-orange-400" /> {t}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-4">
                        <button onClick={scrollToForm} className="bg-gradient-to-r from-orange-600 to-orange-400 text-white text-lg font-black py-5 rounded-full shadow-2xl shadow-orange-600/40 hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-2">
                            <Phone size={20} fill="currentColor" /> 이지바스 무료 상담 신청
                        </button>
                        <button onClick={scrollToCase} className="bg-transparent border border-white/30 text-white/70 text-sm font-bold py-3.5 rounded-full hover:bg-white/5 transition-all flex items-center justify-center gap-2 mt-2">
                            시공 전후 사례 보기 <ArrowDown size={16} />
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-[11px] animate-bounce">
                    <span>스크롤하여 더 알아보기</span>
                    <ArrowDown size={14} />
                </div>
            </section>

            {/* Problem Section */}
            <section className="bg-[#1a1a2e] py-24 text-white">
                <div className="max-w-[480px] mx-auto px-10">
                    <div className="inline-block bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
                        ⚠️ 기존 방식의 한계
                    </div>
                    <h2 className="text-3xl font-black mb-4 leading-tight tracking-tight">
                        타일 덧방,<br />
                        정말 <span className="text-red-500">괜찮을까요?</span>
                    </h2>
                    <p className="text-white/60 text-sm leading-relaxed mb-12">
                        새 타일을 덧붙이는 방식은 당장은 편해 보이지만,<br />
                        두 가지 핵심 문제를 영원히 해결하지 못합니다.
                    </p>

                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4">
                            <div className="w-14 h-14 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center"><Expand size={28} /></div>
                            <h3 className="text-xl font-bold">공간 축소 문제</h3>
                            <p className="text-white/50 text-sm leading-relaxed">기존 타일 위에 두꺼운 접착제와 새 타일을 덧붙이면 욕실이 점점 좁아집니다. 이미 좁은 욕실이 더욱 답답해질 수 있습니다.</p>
                            <div className="pt-4 space-y-2">
                                <div className="flex flex-col gap-1 rounded-xl overflow-hidden border border-white/10 text-[11px] font-bold text-center">
                                    <div className="bg-slate-700/50 py-2.5 text-white/50">기존 타일</div>
                                    <div className="bg-orange-900/50 py-4 text-orange-400">두꺼운 접착제</div>
                                    <div className="bg-blue-900/50 py-2.5 text-blue-300">새 타일</div>
                                </div>
                                <span className="inline-block bg-red-500/20 text-red-400 text-[11px] font-bold px-3 py-1 rounded-full border border-red-500/30">⬅️ 공간이 줄어든다</span>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4">
                            <div className="w-14 h-14 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center"><Droplets size={28} /></div>
                            <h3 className="text-xl font-bold">영원한 곰팡이 문제</h3>
                            <p className="text-white/50 text-sm leading-relaxed">줄눈 사이로 물기와 세균이 쌓이면서 곰팡이가 반복해서 생겨납니다. 아무리 청소해도 줄눈이 있는 한 근본적인 해결이 불가능합니다.</p>
                            <div className="pt-4 flex flex-col items-center">
                                <div className="relative w-48 h-48 mb-4 overflow-hidden rounded-2xl">
                                    <Image 
                                        src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/99a3e653dc407.png" 
                                        alt="곰팡이 문제" 
                                        fill 
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <span className="inline-block bg-red-500/20 text-red-400 text-[11px] font-bold px-3 py-1 rounded-full border border-red-500/30">🦠 줄눈 곰팡이 반복 발생</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Solution Section */}
            <section className="bg-slate-50 py-24">
                <div className="max-w-[480px] mx-auto px-10 text-center">
                    <div className="inline-block bg-blue-500/10 border border-blue-500/30 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full mb-5 text-center">
                        ✨ 혁신적 솔루션
                    </div>
                    <h2 className="text-3xl font-black mb-4 leading-tight tracking-tight text-slate-900">
                        타일의 한계를 넘다,<br />
                        <span className="text-orange-500">이지바스 신소재</span>
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-12 font-medium">
                        타일 대신 얇고 강력한<br />
                        첨단 패널을 사용하여,<br />
                        철거의 고통과 공간 축소 없이<br />
                        완벽한 욕실을 구현합니다.
                    </p>

                    <div className="relative py-10 px-5 mb-16">
                        <div className="w-60 h-60 mx-auto relative group">
                            <div className="absolute inset-0 bg-blue-100 rounded-full blur-[80px] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative w-full h-full bg-gradient-to-br from-[#e8e0d0] via-[#d4c8b0] to-[#c4b89a] rounded-3xl shadow-2xl flex items-center justify-center border border-white/50 rotate-[-12deg] skew-y-[5deg] group-hover:rotate-0 group-hover:skew-y-0 transition-transform duration-500">
                                <div className="absolute inset-[-40px] inset-y-[-20%] w-[60%] h-[140%] bg-gradient-to-r from-transparent via-white/40 to-transparent -rotate-45 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-[1.5s]"></div>
                                <span className="bg-[#1a3a6e]/70 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest mt-40">Easy Bath Panel</span>
                            </div>

                            <div className="absolute -left-2 md:-left-10 top-0 text-left bg-white p-4 rounded-2xl shadow-xl border border-blue-50 flex items-center gap-3 animate-in fade-in slide-in-from-left duration-700">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#1a3a6e]"></div>
                                <div className="flex flex-col"><span className="text-xs font-bold text-slate-800">초박형 설계</span><span className="text-[10px] text-slate-400">타일 두께의 1/3</span></div>
                            </div>

                            <div className="absolute -right-2 md:-right-10 bottom-0 text-left bg-white p-4 rounded-2xl shadow-xl border border-blue-50 flex items-center gap-3 animate-in fade-in slide-in-from-right duration-700">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#1a3a6e]"></div>
                                <div className="flex flex-col"><span className="text-xs font-bold text-slate-800">이음매 제로</span><span className="text-[10px] text-slate-400">곰팡이 걱정 끝</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-row md:flex-col items-center gap-5 md:gap-3">
                            <div className="w-12 h-12 bg-[#1a3a6e] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0"><Wind size={20} /></div>
                            <div className="flex flex-col md:items-center text-left md:text-center">
                                <span className="text-sm font-bold text-slate-800">얇다</span>
                                <span className="text-[11px] text-slate-400 font-medium">공간 유지</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-row md:flex-col items-center gap-5 md:gap-3">
                            <div className="w-12 h-12 bg-[#1a3a6e] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0"><ShieldCheck size={20} /></div>
                            <div className="flex flex-col md:items-center text-left md:text-center">
                                <span className="text-sm font-bold text-slate-800">강하다</span>
                                <span className="text-[11px] text-slate-400 font-medium">고내구성</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-row md:flex-col items-center gap-5 md:gap-3">
                            <div className="w-12 h-12 bg-[#1a3a6e] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0"><Droplets size={20} /></div>
                            <div className="flex flex-col md:items-center text-left md:text-center">
                                <span className="text-sm font-bold text-slate-800">깔끔하다</span>
                                <span className="text-[11px] text-slate-400 font-medium">무줄눈 마감</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Slider */}
            <section className="py-24 bg-white relative">
                <div className="max-w-[480px] mx-auto px-8 relative">
                    <div className="inline-block bg-blue-500/10 border border-blue-500/30 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
                        🏆 5가지 핵심 장점
                    </div>
                    <h2 className="text-3xl font-black mb-10 leading-tight tracking-tight text-slate-900">
                        왜 이지바스를<br />선택해야 할까요?
                    </h2>

                    <div className="relative min-h-[420px] mb-8">
                        {benefits.map((benefit, i) => (
                            <div key={benefit.id} className={`absolute inset-0 transition-all duration-500 ${i === currentSlide ? 'opacity-100 translate-y-0 scale-100 z-10' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'}`}>
                                <div className="h-full bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100 flex flex-col">
                                    <div className="p-8 pb-6 flex items-start justify-between" style={{ background: benefit.color }}>
                                        <span className="text-5xl font-black text-white/20 leading-none">{benefit.num}</span>
                                        <div className="w-14 h-14 bg-white/20 text-white rounded-full flex items-center justify-center shadow-inner backdrop-blur-md">
                                            {React.cloneElement(benefit.icon as React.ReactElement<any>, { size: 28 })}
                                        </div>
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col">
                                        <h3 className="text-2xl font-black text-[#1a3a6e] mb-3">{benefit.title}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                            {benefit.desc}
                                        </p>
                                        <div className="mt-auto">
                                            {benefit.extra}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-center gap-6">
                        <button onClick={() => setCurrentSlide(prev => (prev - 1 + 5) % 5)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-all">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex gap-2">
                            {benefits.map((_, i) => (
                                <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-orange-500 w-8' : 'bg-slate-200'}`}></button>
                            ))}
                        </div>
                        <button onClick={() => setCurrentSlide(prev => (prev + 1) % 5)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-all">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className="py-24 bg-slate-50/50">
                <div className="max-w-[480px] mx-auto px-6 text-center">
                    <div className="inline-block bg-blue-500/10 border border-blue-500/30 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full mb-5 text-center">
                        📊 직접 비교
                    </div>
                    <h2 className="text-3xl font-black mb-12 leading-tight tracking-tight text-slate-900">
                        당신의 욕실을 위한<br />
                        <span className="text-orange-500">최선의 선택</span>
                    </h2>

                    <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100">
                        {/* Table Header */}
                        <div className="flex text-white font-black">
                            <div className="flex-1 py-5 bg-[#1e293b] text-sm opacity-90">기존 타일 덧방</div>
                            <div className="flex-1 py-5 bg-[#0d2247] text-sm relative">
                                <div className="absolute top-1/2 left-4 -translate-y-1/2 bg-orange-500 text-[9px] px-2 py-0.5 rounded-full">추천</div>
                                홈씨씨 이지바스
                            </div>
                        </div>

                        {/* Table Rows */}
                        {[
                            { icon: <Calendar size={14} />, label: '시공 기간', old: '수일 이상 소요', new: '단 1~2일' },
                            { icon: <Box size={14} />, label: '공간감', old: '두꺼워져 좁아짐', new: '초박형으로 넓게 유지' },
                            { icon: <Sparkles size={14} />, label: '위생/관리', old: '변색/곰팡이', new: '이음매 없는 청정 구조' },
                            { icon: <Palette size={14} />, label: '디자인', old: '제한적', new: '트렌디한 일체감' },
                            { icon: <Home size={14} />, label: '거주 중 시공', old: '분진/소음 심함', new: '무분진 보양 시스템' }
                        ].map((row, i) => (
                            <div key={i} className="flex flex-col border-b border-slate-50 last:border-none">
                                <div className="flex items-center gap-1.5 px-6 pt-6 pb-2 text-[13px] font-black text-slate-800">
                                    <span className="text-blue-600">{row.icon}</span>
                                    {row.label}
                                </div>
                                <div className="flex items-stretch px-4 pb-6 gap-3">
                                    <div className="flex-1 bg-red-50/50 rounded-xl p-3 flex items-center justify-center text-[11px] font-bold text-red-600 border border-red-100/50">
                                        {row.old}
                                    </div>
                                    <div className="flex-1 bg-emerald-50/50 rounded-xl p-3 flex items-center justify-center text-[11px] font-black text-emerald-600 border border-emerald-100/50">
                                        {row.new}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-14">
                        <button onClick={scrollToForm} className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg font-black py-5 rounded-full shadow-2xl shadow-orange-500/30 active:scale-95 transition-all flex items-center justify-center gap-3">
                            <Phone size={20} fill="currentColor" /> 지금 바로 무료 상담 신청
                        </button>
                    </div>
                </div>
            </section>

            {/* Before / After Section */}
            <section ref={caseRef} className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-[480px] mx-auto px-6 text-center">
                    <div className="inline-block bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
                        📸 시공 사례
                    </div>
                    <h2 className="text-3xl font-black mb-4 leading-tight tracking-tight text-slate-900">
                        낡고 좁은 욕실의<br />
                        <span className="text-[#1a3a6e]">드라마틱한 변화</span>
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-16">
                        수납 공간조차 없던 노후화된 욕실이,<br />
                        호텔급 프리미엄 공간으로 재탄생했습니다.
                    </p>

                    <div className="space-y-20">
                        {[
                            {
                                num: "01",
                                before: "https://cdn.imweb.me/upload/S20250904697320f4fd9ed/3f761457791f9.png",
                                after: "https://cdn.imweb.me/upload/S20250904697320f4fd9ed/28ed18f669e68.png",
                                tags: ['수납형 거울', '원피스 도기류', 'SMC 천장', '무줄눈 벽면']
                            },
                            {
                                num: "02",
                                before: "https://cdn.imweb.me/upload/S20250904697320f4fd9ed/c13cd4b805224.png",
                                after: "https://cdn.imweb.me/upload/S20250904697320f4fd9ed/a265672e91455.png",
                                tags: ['대형 수납장', '원피스 도기', 'SMC 천장', '무줄눈 패널']
                            }
                        ].map((c, i) => (
                            <div key={i} className="space-y-8">
                                <div className="text-left"><span className="bg-[#0d2247] text-white text-[11px] font-black px-4 py-1.5 rounded-full">CASE {c.num}</span></div>
                                <div className="relative group rounded-[40px] overflow-hidden shadow-3xl shadow-slate-100 border border-slate-100">
                                    <div className="flex">
                                        <div className="w-1/2 relative aspect-[3/4] overflow-hidden">
                                            <Image src={c.before} alt="Before" fill className="object-cover grayscale brightness-90" unoptimized />
                                            <div className="absolute top-6 left-6 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black px-4 py-1 rounded-full border border-white/20">BEFORE</div>
                                        </div>
                                        <div className="w-1/2 relative aspect-[3/4] overflow-hidden">
                                            <Image src={c.after} alt="After" fill className="object-cover" unoptimized />
                                            <div className="absolute top-6 right-6 bg-orange-500 text-white text-[10px] font-black px-4 py-1 rounded-full shadow-lg shadow-orange-500/30">AFTER</div>
                                        </div>
                                    </div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-full bg-white/50 backdrop-blur-md flex items-center justify-center pointer-events-none">
                                        <div className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-400 group-hover:scale-125 transition-transform duration-500">
                                            <MousePointer2 size={16} className="rotate-90 text-orange-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {c.tags.map((t, j) => (
                                        <div key={j} className="flex-1 bg-slate-50 text-slate-500 border border-slate-100 px-4 py-4 rounded-2xl text-[12px] font-black flex items-center justify-center gap-2">
                                            <Check size={14} className="text-emerald-500" /> {t}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 bg-[#f9f8f4] text-slate-900 font-['Noto_Sans_KR',sans-serif]">
                <div className="max-w-[480px] mx-auto px-6 text-center">
                    <div className="inline-block bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[10px] font-black px-4 py-1.5 rounded-full mb-6">
                        🔬 기술 신뢰
                    </div>
                    <h2 className="text-3xl font-black mb-12 leading-tight tracking-tight text-slate-900">
                        10년 이상 검증된<br />
                        <span className="text-orange-500">KCC의 기술력</span>
                    </h2>

                    <div className="grid grid-cols-3 gap-2.5 mb-8">
                        {[
                            { val: '10', unit: '년+', label: '기술 검증 기간' },
                            { val: '3', unit: '중', label: '결합 소재 구조' },
                            { val: '100', unit: '%', label: '공간 유지율' }
                        ].map((s, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center">
                                <div className="flex items-baseline gap-0.5 mb-1 text-slate-800 whitespace-nowrap text-center">
                                    <span className="text-2xl font-black">{s.val}</span>
                                    <span className="text-sm font-bold opacity-60">{s.unit}</span>
                                </div>
                                <span className="text-[8px] font-medium text-slate-400 whitespace-nowrap">{s.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 mb-20">
                        <h3 className="text-sm font-black text-slate-900 mb-8 text-left ml-2">3중 결합 안심 소재 구조</h3>
                        <div className="space-y-4">
                            {[
                                { n: 1, k: 'UV 코팅 마감층', d: '스크래치와 오염을 막는 강화 표면', c: 'bg-orange-50/50', tc: 'text-orange-600', ic: 'bg-orange-500' },
                                { n: 2, k: '친환경 PET 시트', d: '인체에 무해한 안전 소재', c: 'bg-emerald-50/50', tc: 'text-emerald-600', ic: 'bg-emerald-500' },
                                { n: 3, k: 'PVC 탄산칼슘보드', d: '물에 강한 내구성 기반재', c: 'bg-blue-50/50', tc: 'text-blue-600', ic: 'bg-blue-600' }
                            ].map((item, i) => (
                                <div key={i} className={`${item.c} rounded-2xl p-5 flex items-center gap-4 text-left border border-slate-100/50`}>
                                    <div className={`${item.ic} w-7 h-7 rounded-full text-white text-[11px] font-black flex items-center justify-center shrink-0 shadow-lg`}>{item.n}</div>
                                    <div>
                                        <div className={`text-xs font-black ${item.tc} mb-0.5`}>{item.k}</div>
                                        <div className="text-[10px] font-medium text-slate-400">{item.d}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-20">
                        <h3 className="text-sm font-black text-slate-900 mb-10 text-left ml-2">간편한 시공 프로세스</h3>
                        <div className="flex items-center justify-between px-2">
                            {[
                                { s: 'Step 1', t: '무료 상담', i: <MessagesSquare size={24} /> },
                                { s: 'Step 2', t: '현장 실측', i: <Ruler size={24} /> },
                                { s: 'Step 3', t: '당일 시공', i: <Wrench size={24} /> }
                            ].map((step, i) => (
                                <React.Fragment key={i}>
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-[#0d2247] text-white rounded-full flex items-center justify-center shadow-xl">
                                            {step.i}
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[10px] font-bold text-blue-600 mb-1 leading-none">{step.s}</div>
                                            <div className="text-xs font-black text-slate-800">{step.t}</div>
                                        </div>
                                    </div>
                                    {i < 2 && <ChevronRight size={16} className="text-slate-200 mt-2" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className="text-left px-2">
                        <h3 className="text-sm font-black text-slate-900 mb-8">자주 묻는 질문</h3>
                        <div className="space-y-3">
                            {[
                                { q: '정말 하루 만에 시공이 가능한가요?', a: '네, 가능합니다. 이지바스는 기존 타일을 철거하지 않고 초박형 패널을 바로 시공하는 방식이라 일반 욕실 기준 1~2일 이내에 완성됩니다.' },
                                { q: '거주 중에 공사가 가능한가요?', a: '가능합니다. 무분진 보양 시스템을 통해 벽, 바닥, 가전, 가구까지 철저히 보호하므로 이사 없이 생활하면서 시공을 완료할 수 있습니다.' },
                                { q: '작은 욕실에도 적합한가요?', a: '오히려 더 적합합니다. 초박형 패널로 기존 공간을 100% 유지하기 때문에, 좁은 욕실일수록 이지바스의 장점이 더욱 크게 체감됩니다.' },
                                { q: '곰팡이 관리가 정말 쉬운가요?', a: '네. 패널 사이 이음매가 없어 줄눈이 존재하지 않기 때문에 물때와 곰팡이가 쌓일 공간이 없습니다. 가벼운 물청소만으로도 새것처럼 유지할 수 있습니다.' }
                            ].map((faq, i) => (
                                <details key={i} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:border-blue-500/30">
                                    <summary className="p-6 text-xs font-bold text-slate-800 flex items-center justify-between cursor-pointer list-none">
                                        {faq.q}
                                        <Plus size={14} className="text-slate-300 group-open:rotate-45 transition-transform" />
                                    </summary>
                                    <div className="px-6 pb-6 text-xs text-slate-500 leading-relaxed border-t border-slate-50 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {faq.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Final Consultation Form */}
            <section ref={formRef} className="py-32 bg-[#0d2247] relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(26,58,110,0.4),transparent)] opacity-50"></div>
                
                <div className="max-w-[480px] mx-auto px-6 relative z-10 font-['Noto_Sans_KR',sans-serif]">
                    <div className="text-center mb-12">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md text-orange-400 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-2xl">
                            <Phone size={32} fill="currentColor" />
                        </div>
                        <h2 className="text-3xl font-black mb-6 leading-tight tracking-tight text-white italic">
                            욕실의 진화,<br />
                            가전처럼 쉽게 <br className="md:hidden" />
                            <span className="text-orange-400">교체하다</span>
                        </h2>
                        <p className="text-white/60 text-[13px] leading-relaxed mb-4">
                            더 이상 먼지와 소음, 곰팡이와 싸우지 마세요.<br />
                            KCC HomeCC 이지바스와 함께라면,<br />
                            욕실 교체는 <span className="font-bold text-orange-300 underline decoration-orange-500/50 underline-offset-4">완벽한 휴식처를 구매하는 일</span>입니다.
                        </p>
                    </div>

                    <div className="bg-white rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] p-8 md:p-10 relative overflow-hidden">
                        {formStep === 3 ? (
                            <div className="py-12 text-center animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/30">
                                    <Check size={40} strokeWidth={4} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter">상담 신청 완료!</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-10">
                                    담당자가 빠른 시간 내에 연락드리겠습니다.<br />
                                    이지바스로 새로운 욕실을 만나보세요.
                                </p>
                                <div className="flex flex-col gap-2">
                                    <div className="bg-emerald-50 text-emerald-600 py-3 rounded-2xl text-xs font-bold">📞 빠른 응대 보장</div>
                                    <div className="bg-blue-50 text-blue-600 py-3 rounded-2xl text-xs font-bold">🎁 무료 상담 제공</div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                                    <span>🎁 지금 신청 시</span> <span className="text-orange-500 font-black">무료 상담</span> <span>제공</span>
                                </div>

                                <div className="h-[1px] bg-slate-100 relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 flex items-center gap-2 whitespace-nowrap">
                                        <span className="text-[9px] font-bold text-slate-300">{formStep}/2 단계</span>
                                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                                            <span className="w-5 h-5 bg-[#0d2247] text-white text-[9px] font-black rounded-full flex items-center justify-center italic shrink-0">{formStep}</span>
                                            <span className="text-sm font-black text-[#0d2247] whitespace-nowrap tracking-tight">{formStep === 1 ? '기본 정보' : '욕실 고민'}</span>
                                        </div>
                                    </div>
                                </div>

                                {formStep === 1 ? (
                                    <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-right duration-500">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-800 ml-1 flex items-center gap-1.5"><User size={14} className="text-blue-900" /> 이름</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="성함을 입력해주세요" 
                                                    className="w-full bg-white border border-slate-200 focus:border-blue-600 px-5 py-4 rounded-xl outline-none transition-all font-bold text-sm text-slate-900 placeholder:text-slate-300"
                                                    value={name}
                                                    onChange={e => setName(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-800 ml-1 flex items-center gap-1.5"><Phone size={14} className="text-blue-900" /> 연락처</label>
                                                <input 
                                                    type="tel" 
                                                    placeholder="010-0000-0000" 
                                                    className="w-full bg-white border border-slate-200 focus:border-blue-600 px-5 py-4 rounded-xl outline-none transition-all font-bold text-sm text-slate-900 placeholder:text-slate-300"
                                                    value={phone}
                                                    onChange={handlePhoneChange}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-800 ml-1 flex items-center gap-1.5"><MapPin size={14} className="text-blue-900" /> 거주 지역</label>
                                                <select 
                                                    className="w-full bg-white border border-slate-200 focus:border-blue-600 px-5 py-4 rounded-xl outline-none transition-all font-bold text-sm text-slate-900 appearance-none cursor-pointer"
                                                    value={region}
                                                    onChange={e => setRegion(e.target.value)}
                                                >
                                                    <option value="" disabled className="text-slate-300">지역을 선택해주세요</option>
                                                    {['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'].map(r => (
                                                        <option key={r} value={r}>{r}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <button type="button" onClick={nextStep} className="w-full bg-[#1e488d] hover:bg-[#0d2247] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 italic">
                                            다음 단계 <ChevronRight size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-right duration-500">
                                        <div className="space-y-4">
                                            <div className="space-y-3">
                                                <label className="text-xs font-black text-slate-800 ml-1">현재 가장 큰 불편은? (중복 선택)</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {['줄눈 곰팡이', '좁은 공간', '노후화', '청소 스트레스', '오래된 디자인', '기타'].map(p => (
                                                        <button 
                                                            key={p}
                                                            type="button" 
                                                            onClick={() => toggleProblem(p)}
                                                            className={`text-xs font-bold py-3.5 px-2 rounded-xl border transition-all ${problems.includes(p) ? 'bg-blue-900 border-blue-900 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500'}`}
                                                        >
                                                            {p}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-800 ml-1">상담 희망 시간</label>
                                                <select 
                                                    className="w-full bg-white border border-slate-200 focus:border-blue-600 px-5 py-4 rounded-xl outline-none transition-all font-bold text-sm text-slate-900 appearance-none cursor-pointer"
                                                    value={consultTime}
                                                    onChange={e => setConsultTime(e.target.value)}
                                                >
                                                    <option value="" disabled>시간을 선택해주세요</option>
                                                    <option>오전 (09:00 - 12:00)</option>
                                                    <option>오후 (12:00 - 18:00)</option>
                                                    <option>저녁 (18:00 - 20:00)</option>
                                                    <option>언제든 가능</option>
                                                </select>
                                            </div>
                                            <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-[20px] cursor-pointer hover:bg-slate-100 transition-all select-none border border-slate-100">
                                                <input 
                                                    type="checkbox" 
                                                    className="mt-1 w-4 h-4 accent-blue-900 rounded" 
                                                    checked={isAgreed}
                                                    onChange={e => setIsAgreed(e.target.checked)}
                                                />
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs font-black text-slate-700">개인정보 수집 및 이용 동의</span>
                                                    <span className="text-[10px] text-slate-400 leading-tight">상담 및 서비스 제공 목적 외 다른 용도로 사용되지 않으며 보안 관리됩니다.</span>
                                                </div>
                                            </label>
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setFormStep(1)} className="w-1/3 bg-slate-100 text-slate-400 py-5 rounded-2xl font-black text-sm active:scale-95 transition-all">이전</button>
                                            <button type="submit" disabled={isSubmitting} className="flex-1 bg-orange-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 italic">
                                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={20} />} 신청 완료
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                    
                    <p className="mt-8 text-center text-white/30 text-[11px] font-black flex items-center justify-center gap-1.5 opacity-80">
                        <Lock size={10} /> 개인정보는 상담 목적 외에 사용되지 않습니다.
                    </p>
                </div>
            </section>

            {/* Partner Benefit Overlay Badge (Floating) */}
            {partner && partnerBenefit && !submitted && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[999] w-full max-w-[440px] px-8 animate-in slide-in-from-bottom-10 duration-700">
                    <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border-2 border-emerald-400/50 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-inner"><Gift size={20} /></div>
                            <div className="flex flex-col font-black">
                                <span className="text-[10px] opacity-80 uppercase tracking-widest leading-none mb-1">{partner.name} Special</span>
                                <span className="text-sm tracking-tight">{partnerBenefit}</span>
                            </div>
                        </div>
                        <Check size={20} className="text-emerald-200" />
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-[#111111] text-[#888888] py-20 pb-40 border-t border-white/5">
                <div className="max-w-[480px] mx-auto px-8 text-left">
                    <div className="mb-8">
                        <h4 className="text-white text-sm font-black mb-6 uppercase tracking-wider">판매사 정보</h4>
                        <div className="text-[11px] leading-relaxed space-y-1.5 font-medium">
                            <p>주식회사 티유디지털(KCC글라스 판매점) <span className="opacity-20 inline-block px-2">|</span> 대표 : 김정열</p>
                            <p>주소 : 서울시 금천구 가산디지털1로 83, 802호</p>
                            <p>사업자등록번호 : 220-87-15092</p>
                        </div>
                    </div>

                    <div className="text-[11px] leading-relaxed space-y-1.5 font-medium mb-12">
                        <p>고객센터 : 1588-0883</p>
                        <p>개인정보 관리자 : 김은경 (kek3171@nate.com)</p>
                    </div>

                    <div className="flex items-center gap-4 border-t border-white/5 pt-10 opacity-50">
                        <div className="relative w-[110px] h-[30px]">
                            <Image 
                                src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/e840c9a46f66a.png" 
                                alt="KCC HomeCC Logo" 
                                fill 
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                        <p className="text-[9px] uppercase tracking-widest leading-none">© 2024 KCC HomeCC. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Multi-step Fixed Bottom CTA */}
            <div className={`fixed bottom-0 left-0 right-0 z-[1001] transition-transform duration-500 ${scrolled && !submitted ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="max-w-[480px] mx-auto p-5 pb-10 relative pointer-events-none">
                    <button onClick={scrollToForm} className="relative w-full bg-gradient-to-r from-orange-600 to-orange-400 text-white text-lg font-black py-5 rounded-full shadow-[0_20px_50px_-10px_rgba(249,115,22,0.5)] animate-pulse active:scale-95 transition-all flex items-center justify-center gap-2 italic uppercase tracking-tighter pointer-events-auto">
                        <Phone size={20} fill="currentColor" /> 무료 상담/실측 신청하기
                    </button>
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-5 py-2.5 rounded-full shadow-2xl border border-white/10 whitespace-nowrap animate-bounce pointer-events-auto">
                        🔥 4월 한정 방문 실측 0원!
                    </div>
                </div>
            </div>

            {/* Floating Banner Labels (Right Side) */}
            {showBanners && !submitted && (
                <div className="fixed right-0 top-24 z-[2000] flex flex-col items-end gap-2 pointer-events-none">
                    {[
                        { t: '60개월 구독 가능', c: 'from-yellow-400 to-yellow-500', h: true },
                        { t: '원데이 시공', c: 'from-orange-500 to-orange-400' },
                        { t: '본사 시공&A/S', c: 'from-slate-800 to-slate-700' }
                    ].map((b, i) => (
                        <div key={i} 
                             className={`pointer-events-auto w-32 flex justify-center items-center bg-gradient-to-r ${b.c} ${b.h ? 'text-black ring-2 ring-yellow-400/50 shadow-yellow-500/50 scale-105' : 'text-white'} font-black text-[10px] px-3 py-3 rounded-l-2xl shadow-2xl relative overflow-hidden group animate-in slide-in-from-right duration-500`}
                             style={{ animationDelay: `${i * 100}ms` }}>
                            <div className="shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full" />
                            <span className="relative z-10">{b.t}</span>
                            {b.h && (
                                <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                            )}
                        </div>
                    ))}
                    <button 
                        onClick={() => setShowBanners(false)}
                        className="pointer-events-auto w-8 h-8 bg-slate-900/80 backdrop-blur-md text-white rounded-full flex items-center justify-center mt-2 mr-2 shadow-xl active:scale-95 transition-transform"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            <style jsx global>{`
                .clip-hex {
                    clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
                }
                
                @keyframes slow-zoom {
                    from { transform: scale(1); }
                    to { transform: scale(1.1); }
                }
                .animate-slow-zoom {
                    animation: slow-zoom 20s linear infinite alternate;
                }

                @keyframes draw-gauge {
                    from { stroke-dashoffset: 251.32; }
                    to { stroke-dashoffset: 201; }
                }

                input:not([type="checkbox"]), select, textarea {
                    -webkit-appearance: none;
                    appearance: none;
                }

                .shimmer {
                    animation: shimmer 2.5s infinite;
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
            `}</style>
        </div>
    );
}
