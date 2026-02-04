"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { ChevronRight, Award, Loader2, Calendar, UserCheck, Building2, Wrench, Gauge, Timer, Home, ClipboardCheck, HelpCircle, X, Gift, Ruler, MessageCircle, MapPin } from 'lucide-react';
import DaumPostcode from 'react-daum-postcode';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const koreaDistrictData: { [key: string]: string[] } = {
    "서울특별시": ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
    "경기도": ["수원시", "고양시", "용인시", "성남시", "부천시", "화성시", "안산시", "남양주시", "안양시", "평택시", "시흥시", "파주시", "의정부시", "김포시", "광주시", "광명시", "군포시", "하남시", "오산시", "양주시", "이천시", "구리시", "의왕시", "포천시", "양평군", "여주시", "동두천시", "가평군", "과천시", "연천군"],
    "인천광역시": ["계양구", "미추홀구", "남동구", "동구", "부평구", "서구", "연수구", "중구", "강화군", "옹진군"],
    "부산광역시": ["강서구", "금정구", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구", "기장군"],
    "대구광역시": ["남구", "달서구", "동구", "북구", "서구", "수성구", "중구", "달성군"],
    "광주광역시": ["광산구", "남구", "동구", "북구", "서구"],
    "대전광역시": ["대덕구", "동구", "서구", "유성구", "중구"],
    "울산광역시": ["남구", "동구", "북구", "중구", "울주군"],
    "세종특별자치시": ["세종시"],
    "강원특별자치도": ["춘천시", "원주시", "강릉시", "동해시", "태백시", "속초시", "삼척시", "홍천군", "횡성군", "영월군", "평창군", "정선군", "철원군", "화천군", "양구군", "인제군", "고성군", "양양군"],
    "충청북도": ["청주시", "충주시", "제천시", "보은군", "옥천군", "영동군", "증평군", "진천군", "괴산군", "음성군", "단양군"],
    "충청남도": ["천안시", "공주시", "보령시", "아산시", "서산시", "논산시", "계룡시", "당진시", "금산군", "부여군", "서천군", "청양군", "홍성군", "예산군", "태안군"],
    "전북특별자치도": ["전주시", "군산시", "익산시", "정읍시", "남원시", "김제시", "완주군", "진안군", "무주군", "장수군", "임실군", "순창군", "고창군", "부안군"],
    "전라남도": ["목포시", "여수시", "순천시", "나주시", "광양시", "담양군", "곡성군", "구례군", "고흥군", "보성군", "화순군", "장흥군", "강진군", "해남군", "영암군", "무안군", "함평군", "영광군", "장성군", "완도군", "진도군", "신안군"],
    "경상북도": ["포항시", "경주시", "김천시", "안동시", "구미시", "영주시", "영천시", "상주시", "문경시", "경산시", "군위군", "의성군", "청송군", "영양군", "영덕군", "청도군", "고령군", "성주군", "칠곡군", "예천군", "봉화군", "울진군", "울릉군"],
    "경상남도": ["창원시", "진주시", "통영시", "사천시", "김해시", "밀양시", "거제시", "양산시", "의령군", "함안군", "창녕군", "고성군", "남해군", "하동군", "산청군", "함양군", "거창군", "합천군"],
    "제주특별자치도": ["제주시", "서귀포시"]
};

interface PartnerData {
    '아이디': string;
    '업체명': string;
    '특별혜택'?: string;
    [key: string]: unknown;
}

interface PostcodeData {
    address: string;
    addressType: string;
    bname: string;
    buildingName: string;
    zonecode: string;
}

interface ONEVClientProps {
    initialPartnerData: PartnerData | null;
    partnerId: string | null;
}

export default function ONEVClient({ partnerId }: ONEVClientProps) {
    const [showBenefitModal, setShowBenefitModal] = useState(false);

    // Convex Data
    const partner = useQuery(api.partners.getPartnerByUid, partnerId ? { uid: partnerId } : "skip");
    const partnerDataForBenefit = useMemo(() => {
        if (!partner) return null;
        const rawBenefit = partner.special_benefits || "";
        let benefitsStr = rawBenefit;

        try {
            if (rawBenefit && (rawBenefit.startsWith('{') || rawBenefit.startsWith('['))) {
                const benefitsObj = JSON.parse(rawBenefit);
                if (typeof benefitsObj === 'object') {
                    const findVal = (target: string) => {
                        const key = Object.keys(benefitsObj).find(k => k.toLowerCase() === target.toLowerCase());
                        return key ? benefitsObj[key] : null;
                    };
                    benefitsStr = findVal('P001') || findVal('onev') || findVal('vbf140') || Object.values(benefitsObj)[0] || '';
                }
            }
        } catch (e) {
            console.warn('Benefit parsing failed:', e);
        }

        if (!benefitsStr || benefitsStr === '{}') {
            benefitsStr = '등록된 특별 혜택이 없습니다. 본사 혜택과 동일하게 적용됩니다.';
        }

        return { ...partner, '특별혜택': benefitsStr, '업체명': partner.name };
    }, [partner]);

    // Consultation States
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [selectedSido, setSelectedSido] = useState('');
    const [selectedGungu, setSelectedGungu] = useState('');
    const [isAgreed, setIsAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showConsultModal, setShowConsultModal] = useState(false);
    const [consultType, setConsultType] = useState<'quick' | 'accurate'>('quick');
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [address, setAddress] = useState('');
    const [detailAddress, setDetailAddress] = useState('');
    const [pyeong, setPyeong] = useState('');
    const [expansion, setExpansion] = useState('');
    const [residence, setResidence] = useState('');
    const [schedule, setSchedule] = useState('');
    const [remarks, setRemarks] = useState('');

    const createCustomerMutation = useMutation(api.customers.createCustomer);

    // Check for 'consult' query param
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('consult') === 'true') {
                setShowConsultModal(true);
            }
        }
    }, []);

    const fetchBenefit = () => {
        if (!partner) {
            if (partnerId) alert('파트너 정보를 불러오는 중이거나 유효하지 않습니다.');
            return;
        }
        setShowBenefitModal(true);
    };

    const handleSidoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSido(e.target.value);
        setSelectedGungu('');
    };

    const handleAutoHyphen = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        let formatted = raw;
        if (raw.length > 3 && raw.length <= 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
        else if (raw.length > 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
        setContact(formatted);
    };

    const handleAddressComplete = (data: PostcodeData) => {
        let fullAddress = data.address;
        let extraAddress = '';
        if (data.addressType === 'R') {
            if (data.bname !== '') extraAddress += data.bname;
            if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }
        setAddress(fullAddress);
        setShowAddressModal(false);
    };

    const handleConsultSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAgreed) return alert('개인정보 수집 및 이용에 동의해주세요.');
        if (consultType === 'accurate' && !address) return alert('주소를 입력해주세요.');

        setIsSubmitting(true);
        try {
            const progressDetail = [
                pyeong ? `평형: ${pyeong}` : '',
                expansion ? `확장: ${expansion}` : '',
                residence ? `거주: ${residence}` : '',
                schedule ? `희망일: ${schedule}` : '',
                remarks ? `특이사항: ${remarks}` : ''
            ].filter(Boolean).join(' / ');

            let partnerBenefit = "";
            if (partner && partner.special_benefits) {
                try {
                    const benefits = JSON.parse(partner.special_benefits);
                    partnerBenefit = benefits['P001'] || ""; // 'P001' is the code for ONEV
                } catch (e) {
                    console.error("Benefit parse error", e);
                }
            }

            await createCustomerMutation({
                name,
                contact,
                address: consultType === 'quick' ? `${selectedSido} ${selectedGungu}` : `${address} ${detailAddress}`,
                channel: partner ? partner.name : '본사(직접)',
                label: '일반',
                status: '접수',
                progress_detail: progressDetail,
                partner_benefit: partnerBenefit,
                created_at: new Date().toISOString().split('T')[0]
            });

            alert('상담 신청이 정상적으로 접수되었습니다. 곧 연락드리겠습니다.');
            setShowConsultModal(false);
            setShowBenefitModal(false);
            setName(''); setContact(''); setSelectedSido(''); setSelectedGungu(''); setIsAgreed(false);
            setAddress(''); setDetailAddress(''); setPyeong(''); setExpansion(''); setResidence(''); setSchedule(''); setRemarks('');
        } catch (error: unknown) {
            console.error('Consultation Submit Error:', error);
            alert('상담 신청 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100 overflow-x-hidden">
            {/* 1. Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
                <div className="absolute inset-0 z-0">
                    <Image src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/f5fba29b1ca8c.png" className="opacity-40 object-cover scale-105 animate-slow-zoom" alt="Hero Background" fill unoptimized priority />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/50"></div>
                </div>
                <div className="container mx-auto px-8 md:px-20 relative z-10 text-center text-white mt-20">
                    <div className="inline-block w-[280px] md:w-auto border border-white/30 bg-white/10 backdrop-blur-md px-4 md:px-8 py-3 rounded-full mb-12 animate-fade-in-up">
                        <span className="text-blue-300 font-black tracking-widest uppercase text-sm md:text-base">Premium Membership</span>
                    </div>
                    <h1 className="text-5xl lg:text-9xl font-black mb-8 tracking-tighter leading-none break-keep">
                        <span className="block text-gray-400 text-3xl md:text-5xl mb-4 font-light tracking-normal opacity-80">목돈 깨지 마세요!</span>
                        KCC홈씨씨<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">윈도우ONE</span><br />
                        <span className="text-white text-6xl md:text-[160px] whitespace-nowrap">구독서비스</span>
                    </h1>
                    <p className="text-xl md:text-3xl font-medium mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        대한민국 창호의 기준, <span className="text-white font-bold underline decoration-blue-500 underline-offset-8"><br className="md:hidden" />13년 품질보증</span>으로<br />당신의 일상을 완벽하게 바꿉니다.
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 w-full max-w-md md:max-w-none mx-auto">
                        <button onClick={() => setShowConsultModal(true)} className="w-full md:w-auto px-6 md:px-12 py-5 md:py-6 bg-white text-black font-black text-lg md:text-xl rounded-full hover:scale-105 transition-all shadow-xl">상담 예약하기</button>
                        {partnerId && (
                            <button onClick={fetchBenefit} disabled={partner === undefined} className="w-full md:w-auto px-6 md:px-12 py-5 md:py-6 bg-orange-600 text-white font-black text-lg md:text-xl rounded-full hover:scale-105 transition-all shadow-[0_0_30px_rgba(234,88,12,0.5)] flex items-center justify-center gap-2 whitespace-nowrap">
                                {partner === undefined ? <Loader2 className="animate-spin" /> : <Gift className="shrink-0" />}
                                파트너 단독 혜택보기
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* New Subscription Benefits Section */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-5 lg:px-24 max-w-4xl text-center">
                    {/* Badge */}
                    <div className="inline-block px-8 py-3 bg-white border-2 border-orange-200 text-orange-600 rounded-full text-lg font-black tracking-tight mb-12 shadow-sm animate-fade-in">
                        난방비·소음·결로 샷시 하나로 끝!
                    </div>

                    {/* Main Title */}
                    <div className="mb-16">
                        <h2 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight tracking-tighter">
                            <span className="relative inline-block">
                                60개월
                                <span className="absolute -bottom-2 left-0 w-full h-3 bg-blue-600/20 -z-10 rotate-1"></span>
                            </span><br className="md:hidden" />창호구독<br />
                            <span className="text-gray-900">초특가 패키지</span>
                        </h2>
                    </div>

                    {/* Sub Ribbon */}
                    <div className="relative inline-block mb-24 min-w-[320px]">
                        <div className="bg-[#122649] text-white px-12 py-5 rounded-xl text-2xl font-black relative z-10 shadow-2xl skew-x-[-10deg]">
                            <div className="skew-x-[10deg]">홈씨씨 윈도우<br className="md:hidden" />6가지 특전</div>
                        </div>
                        {/* Decorative fold effect */}
                        <div className="absolute -left-3 bottom-[-10px] w-6 h-6 bg-[#0a162b] rotate-45 -z-10"></div>
                        <div className="absolute -right-3 bottom-[-10px] w-6 h-6 bg-[#0a162b] rotate-45 -z-10"></div>
                    </div>

                    {/* Benefits Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Calendar className="w-10 h-10 text-blue-600" />,
                                title: "60개월 구독 혜택",
                                desc: "월 11만원대 (21평 기준)",
                                badge: "금융형 구독"
                            },
                            {
                                icon: <UserCheck className="w-10 h-10 text-blue-600" />,
                                title: "전문가 직접 시공",
                                desc: "균일한 시공 품질 및 본사 관리",
                                badge: "직영 시공"
                            },
                            {
                                icon: <Building2 className="w-10 h-10 text-blue-600" />,
                                title: "본사 제작 완성창",
                                desc: "KCC가 직접 제작/공급하는 정품",
                                badge: "정품 보증"
                            },
                            {
                                icon: <Wrench className="w-10 h-10 text-blue-600" />,
                                title: "1Day 프리미엄 시공",
                                desc: "거주 중에도 하루 만에 교체 완료",
                                badge: "당일 공사"
                            },
                            {
                                icon: <Gauge className="w-10 h-10 text-blue-600" />,
                                title: "에너지 효율 1등급",
                                desc: "냉난방비 절감에 최적화된 창호",
                                badge: "고성능"
                            },
                            {
                                icon: <Timer className="w-10 h-10 text-blue-600" />,
                                title: "13년 최장 품질보증",
                                desc: "업계 최장 기간 안심 AS 제공",
                                badge: "롱라이프"
                            },
                        ].map((item, i) => (
                            <div key={i} className="group relative bg-gray-100 p-6 md:p-8 rounded-[35px] border-2 border-transparent hover:border-blue-500/30 hover:bg-white hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-all duration-500 text-left flex flex-row md:flex-col items-center md:items-start h-full cursor-default gap-4 md:gap-0">
                                {/* Icon wrapper - Solid colored on hover */}
                                <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-500 shrink-0 text-blue-600 group-hover:text-blue-600 md:mb-6">
                                    <div className="group-hover:opacity-0 transition-opacity duration-300">
                                        {item.icon}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-full mb-3 inline-block">
                                        {item.badge}
                                    </span>
                                    <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm font-bold leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>

                                {/* Hover Arrow */}
                                <div className="absolute bottom-8 right-8 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-500 shadow-sm">
                                    <ChevronRight className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefit Modal */}
            {showBenefitModal && partnerDataForBenefit && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowBenefitModal(false)}></div>
                    <div className="bg-white rounded-[40px] w-full max-w-lg relative z-10 overflow-hidden shadow-3xl animate-in fade-in zoom-in duration-300">
                        <div className="bg-orange-600 p-10 text-white relative">
                            <button onClick={() => setShowBenefitModal(false)} className="absolute top-6 right-6 hover:rotate-90 transition-transform"><X size={32} /></button>
                            <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-white/20 rounded-xl"><Gift size={24} /></div><span className="text-sm font-black uppercase tracking-widest">Partner Special</span></div>
                            <h2 className="text-3xl font-black leading-tight">{partnerDataForBenefit['업체명']} 전용<br /><span className="text-yellow-300">시크릿 혜택 안내</span></h2>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="text-2xl font-black text-gray-800 whitespace-pre-wrap leading-tight bg-orange-50 p-8 rounded-3xl border-2 border-dashed border-orange-200 text-center italic">
                                &quot;{partnerDataForBenefit['특별혜택']}&quot;
                            </div>
                            <button onClick={() => { setShowBenefitModal(false); document.getElementById('final-cta')?.scrollIntoView({ behavior: 'smooth' }); }} className="w-full py-6 bg-black text-white text-2xl font-black rounded-2xl hover:bg-gray-900 transition-all">혜택 적용하여 상담받기</button>
                        </div>
                    </div>
                </div>
            )}


            {/* Free Consultation Section */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-5 lg:px-24 max-w-4xl flex flex-col items-center">
                    {/* Speech Bubble Box */}
                    <div className="relative bg-[#122649] text-white p-12 md:p-16 rounded-[40px] text-center mb-16 shadow-2xl w-full">
                        <h3 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter italic">
                            &apos;실측/상담<br className="md:hidden" />0원&apos;
                        </h3>
                        <p className="text-xl md:text-2xl font-bold opacity-90">
                            부담없이 실측 받아보고<br className="md:hidden" />결정하세요
                        </p>
                        {/* Bubble Tail */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#122649] rotate-45"></div>
                    </div>

                    {/* Simple Icon Benefits */}
                    <div className="grid grid-cols-2 gap-12 md:gap-24 mb-24 w-full">
                        <div className="text-center group">
                            <div className="w-32 h-32 mx-auto mb-8 flex items-center justify-center text-[#122649] bg-gray-50 rounded-full group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-500 shadow-inner">
                                <ClipboardCheck className="w-16 h-16" />
                            </div>
                            <p className="text-xl md:text-2xl font-black text-gray-800 leading-tight">
                                무료 방문<br />실측/상담
                            </p>
                        </div>
                        <div className="text-center group">
                            <div className="w-32 h-32 mx-auto mb-8 flex items-center justify-center text-[#122649] bg-gray-50 rounded-full group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-500 shadow-inner">
                                <Home className="w-16 h-16" />
                            </div>
                            <p className="text-xl md:text-2xl font-black text-gray-800 leading-tight">
                                시공 후 무료<br />방문 안전점검
                            </p>
                        </div>
                    </div>
                </div>

                {/* Background Interior Image at bottom */}
                <div className="relative h-[600px] w-full">
                    <Image
                        src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80"
                        alt="KCC Window Interior"
                        fill
                        className="object-cover"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-transparent"></div>
                </div>
            </section>

            {/* Rising Interior Costs Section */}
            <section className="py-16 md:py-32 bg-[#122649] text-white overflow-hidden text-center">
                <div className="container mx-auto px-5 lg:px-24 max-w-4xl">
                    <div className="mb-10 md:mb-20">
                        <div className="relative inline-block">
                            <h2 className="text-7xl md:text-9xl font-black italic text-[#ff8a00] mb-4 tracking-tighter animate-pulse">
                                35.6% UP!
                            </h2>
                            <div className="absolute -bottom-4 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#ff8a00] to-transparent opacity-50"></div>
                        </div>
                        <h3 className="text-4xl md:text-6xl font-black mt-8 md:mt-16 mb-4 md:mb-8 tracking-tight">
                            매년 오르는<br className="md:hidden" />인테리어 비용!
                        </h3>
                        <p className="text-2xl md:text-3xl font-bold opacity-80 text-blue-100/70">
                            인테리어 물가,<br className="md:hidden" />3년 새 <span className="text-white border-b-4 border-orange-500">35.6% 상승</span>
                        </p>
                    </div>

                    {/* Chart Container */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-[60px] p-8 md:p-16 border border-white/10 shadow-3xl relative max-w-5xl mx-auto">
                        <div className="relative h-[300px] md:h-[400px] w-full mt-10">
                            {/* Y-axis Labels */}
                            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] md:text-sm font-black text-white/30 tracking-widest uppercase pr-4 md:pr-8 border-r border-white/5 py-2">
                                <span>140</span>
                                <span>130</span>
                                <span>120</span>
                                <span>110</span>
                                <span>100</span>
                                <span>90</span>
                            </div>

                            {/* Chart SVG */}
                            <svg className="absolute inset-0 left-12 md:left-20 w-[calc(100%-48px)] md:w-[calc(100%-80px)] h-full overflow-visible" viewBox="0 0 400 300">
                                {/* Vertical Grids */}
                                {[0, 1, 2, 3].map(i => (
                                    <line key={i} x1={50 + i * 100} y1="0" x2={50 + i * 100} y2="300" stroke="white" strokeOpacity="0.05" strokeWidth="2" />
                                ))}

                                {/* Connection Line - Animated Loop */}
                                <path
                                    d="M 50 210 L 150 160 L 250 110 L 350 50"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeDasharray="500"
                                    strokeDashoffset="500"
                                    className="drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-draw-line-loop"
                                />

                                {/* Moving Arrowhead - Follows the path */}
                                <path
                                    d="M -10 -8 L 10 0 L -10 8 Z"
                                    fill="white"
                                    className="animate-move-arrow-loop drop-shadow-lg"
                                    style={{ offsetPath: "path('M 50 210 L 150 160 L 250 110 L 350 50')", offsetRotate: "auto" }}
                                />

                                {/* Data Points & Labels */}
                                {[
                                    { x: 50, y: 210, val: '100.0', year: '2020', delay: '0s' },
                                    { x: 150, y: 160, val: '111.9', year: '2021', delay: '0.6s' },
                                    { x: 250, y: 110, val: '123.7', year: '2022', delay: '1.2s' },
                                    { x: 350, y: 50, val: '135.6', year: '2023', delay: '1.8s' },
                                ].map((p, i) => (
                                    <g key={i} className="animate-fade-in-up-loop" style={{ animationDelay: p.delay, opacity: 0 }}>
                                        <circle cx={p.x} cy={p.y} r="8" fill="white" className="drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                                        <text x={p.x} y={p.y - 25} textAnchor="middle" fill="white" className="text-xl font-black italic tabular-nums">{p.val}</text>
                                        <text x={p.x} y={340} textAnchor="middle" fill="white" fillOpacity="0.4" className="text-sm font-bold tracking-widest">{p.year}</text>
                                    </g>
                                ))}

                                {/* Final Highlight Label */}
                                <g transform="translate(350, 10)" className="animate-bounce" style={{ animationDuration: '3s' }}>
                                    <text textAnchor="middle" fill="#ff8a00" className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter drop-shadow-lg">35.6% UP</text>
                                </g>
                            </svg>
                        </div>
                    </div>

                    <div className="mt-20 flex flex-col items-center gap-4">
                        <p className="text-white/40 font-bold text-sm tracking-widest italic">
                            2020-2023 기준<br className="md:hidden" />(출처 : 한국건설산업연구원)
                        </p>
                    </div>
                </div>
            </section>

            {/* Subscription Solution Section */}
            <section className="py-12 md:py-24 bg-[#122649] text-white text-center pb-20 md:pb-40">
                <div className="container mx-auto px-5 lg:px-24 max-w-4xl">
                    <h3 className="text-3xl md:text-5xl font-black mb-4 opacity-80">답은?</h3>
                    <h2 className="text-5xl md:text-8xl font-black mb-6 md:mb-12 tracking-tighter leading-tight">
                        KCC글라스의<br />홈씨씨 윈도우<br className="md:hidden" />구독!
                    </h2>

                    {/* Badge */}
                    <div className="inline-block border-[3px] border-[#ff8a00] rounded-full px-6 md:px-10 py-3 md:py-4 mb-10 md:mb-20 bg-[#ff8a00]/5 shadow-[0_0_20px_rgba(255,138,0,0.2)]">
                        <span className="text-[#ff8a00] text-lg md:text-3xl font-black tracking-tight">
                            부담 없이 60개월 균등하게<br className="md:hidden" />나눠 내니까!
                        </span>
                    </div>

                    {/* Solution Cards */}
                    <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto">
                        {[
                            { no: '01', text: '비용 상승 및 인플레이션 걱정 NO' },
                            { no: '02', text: '최대 60개월 구독으로 부담 DOWN' },
                            { no: '03', text: '합리적인 견적과 품질을 제안합니다.' }
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-[20px] md:rounded-[30px] p-6 md:p-10 flex flex-col md:flex-row items-center md:items-center shadow-[0_15px_40px_rgba(0,0,0,0.2)] border-b-[8px] border-gray-200 group hover:translate-y-1 hover:border-b-[4px] transition-all duration-300">
                                <span className="text-[#ff8a00] text-3xl md:text-4xl font-black md:mr-8 italic tracking-tighter shrink-0 tabular-nums mb-2 md:mb-0">
                                    {item.no}.
                                </span>
                                <p className="text-gray-900 text-xl md:text-4xl font-black text-center md:text-left leading-tight tracking-tight w-full md:w-auto break-keep">
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Window Replacement Section */}
            <section className="py-16 md:py-24 bg-white text-center">
                <div className="container mx-auto px-5 lg:px-24 max-w-5xl">
                    <div className="mb-12 md:mb-16 flex flex-col items-center">
                        <div className="w-14 h-14 md:w-20 md:h-20 bg-[#122649] text-white rounded-full flex items-center justify-center mb-6 md:mb-10 shadow-xl">
                            <HelpCircle className="w-7 h-7 md:w-11 md:h-11" />
                        </div>
                        <h2 className="text-3xl md:text-7xl font-black text-[#122649] mb-4 md:mb-8 tracking-tighter">
                            창호교체,<br className="md:hidden" /> 왜 필요한가요?
                        </h2>
                        <p className="text-base md:text-2xl font-bold text-gray-600 leading-relaxed max-w-3xl break-keep">
                            노후화된 창은 처짐과 뒤틀림, 유격이 계속 진행되어<br className="hidden md:block" />
                            기본 성능을 다하지 못하고 기능성이 나빠집니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
                        {[
                            { title: '곰팡이 발생', img: 'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/ce5262457e6aa.png' },
                            { title: '난방비 증가', img: 'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/51b0086563e87.png' },
                            { title: '빗물, 소음', img: 'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/cf9834b5da915.png' }
                        ].map((item, i) => (
                            <div key={i} className="group">
                                <div className="relative aspect-video md:aspect-square rounded-[20px] md:rounded-[40px] overflow-hidden mb-4 md:mb-8 shadow-2xl group-hover:scale-[1.02] transition-transform duration-500">
                                    <Image
                                        src={item.img}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <h4 className="text-xl md:text-3xl font-black text-gray-800">
                                    {item.title}
                                </h4>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Window Performance Hexagon Section */}
            <section className="py-24 relative overflow-hidden min-h-[900px] flex items-center bg-[#0a0f18]">
                {/* Background Image with Dark Overlay */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80"
                        alt="Modern Living Room"
                        fill
                        className="object-cover opacity-40 grayscale-[0.2]"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f18]/90 via-[#0a1528]/70 to-[#0a0f18]/95"></div>
                </div>

                <div className="container mx-auto px-5 lg:px-24 text-center relative z-10">
                    <h3 className="text-3xl md:text-5xl font-black mb-6 text-white opacity-80 tracking-tight">창호성능,</h3>
                    <h2 className="text-5xl md:text-8xl font-black mb-12 text-white tracking-tighter">꼼꼼하게<br className="md:hidden" />따져보세요!</h2>

                    <div className="max-w-5xl mx-auto space-y-4 mb-20 text-base md:text-2xl font-bold text-gray-200 leading-relaxed bg-black/40 backdrop-blur-md p-6 md:p-8 rounded-[40px] shadow-2xl border border-white/10 break-keep">
                        <p className="tracking-tighter">창호는 어떤 외부 조건에 관계없이<br className="md:hidden" />집안 환경을 그대로 유지해 주어야 합니다.</p>
                        <p className="text-white font-black underline decoration-[#ff8a00] decoration-4 underline-offset-8">단열성 / 기밀성 / 차음성 / 내풍압성 / 수밀성을 꼭 확인하세요!</p>
                    </div>

                    {/* Hexagon Grid Container */}
                    <div className="relative min-h-[500px] md:min-h-[850px] max-w-5xl mx-auto mt-20 flex items-center justify-center scale-90 md:scale-100">
                        {/* Centered Hexagon (기밀성) */}
                        <div className="absolute z-10 w-48 h-48 md:w-80 md:h-80 transition-all duration-500 hover:scale-105 group drop-shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                            <div className="w-full h-full bg-[#ff8a00] clip-hex p-[4px] md:p-[6px]"> {/* Vivid Border */}
                                <div className="w-full h-full bg-white clip-hex flex flex-col items-center justify-center">
                                    <span className="text-2xl md:text-5xl font-black mb-1 md:mb-3 text-gray-900 tracking-tighter">기밀성</span>
                                    <span className="text-xs md:text-xl font-bold text-gray-500 text-center leading-tight">내부 공기를<br />보존하는 기능</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Left (단열성) */}
                        <div className="absolute -translate-x-[75%] -translate-y-[65%] w-36 h-36 md:w-72 md:h-72 transition-all duration-500 hover:scale-105 group drop-shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
                            <div className="w-full h-full bg-white/30 clip-hex p-[2px] md:p-[3px]">
                                <div className="w-full h-full bg-white/95 clip-hex flex flex-col items-center justify-center backdrop-blur-md">
                                    <span className="text-xl md:text-4xl font-black mb-1 md:mb-2 text-[#122649]">단열성</span>
                                    <span className="text-[10px] md:text-lg font-bold text-gray-500 text-center leading-tight">내외부 온도를<br />차단하는 기능</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Right (차음성) */}
                        <div className="absolute translate-x-[75%] -translate-y-[65%] w-36 h-36 md:w-72 md:h-72 transition-all duration-500 hover:scale-105 group drop-shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
                            <div className="w-full h-full bg-white/30 clip-hex p-[2px] md:p-[3px]">
                                <div className="w-full h-full bg-white/95 clip-hex flex flex-col items-center justify-center backdrop-blur-md">
                                    <span className="text-xl md:text-4xl font-black mb-1 md:mb-2 text-[#122649]">차음성</span>
                                    <span className="text-[10px] md:text-lg font-bold text-gray-400 text-center leading-tight">내외부 소음을<br />차단하는 기능</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Left (내풍압성) */}
                        <div className="absolute -translate-x-[75%] translate-y-[65%] w-36 h-36 md:w-72 md:h-72 transition-all duration-500 hover:scale-105 group drop-shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
                            <div className="w-full h-full bg-white/30 clip-hex p-[2px] md:p-[3px]">
                                <div className="w-full h-full bg-white/95 clip-hex flex flex-col items-center justify-center backdrop-blur-md">
                                    <span className="text-xl md:text-4xl font-black mb-1 md:mb-2 text-[#122649]">내풍압성</span>
                                    <span className="text-[10px] md:text-lg font-bold text-gray-400 text-center leading-tight">외부 풍압을<br />견디는 강도</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Right (수밀성) */}
                        <div className="absolute translate-x-[75%] translate-y-[65%] w-36 h-36 md:w-72 md:h-72 transition-all duration-500 hover:scale-105 group drop-shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
                            <div className="w-full h-full bg-white/30 clip-hex p-[2px] md:p-[3px]">
                                <div className="w-full h-full bg-white/95 clip-hex flex flex-col items-center justify-center backdrop-blur-md">
                                    <span className="text-xl md:text-4xl font-black mb-1 md:mb-2 text-[#122649]">수밀성</span>
                                    <span className="text-[10px] md:text-lg font-bold text-gray-400 text-center leading-tight">외부 빗물을<br />차단하는 성능</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Energy Efficiency Section */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-5 lg:px-24 text-center">
                    <div className="mb-16">
                        <h3 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 tracking-tight">기본에 충실하다!</h3>
                        <h2 className="text-5xl md:text-7xl font-black text-[#122649] tracking-tighter">
                            뛰어난<br className="md:hidden" />에너지효율 <span className="text-[#122649]"><br className="md:hidden" />1등급</span>
                        </h2>
                    </div>

                    <div className="max-w-3xl mx-auto mb-20 text-xl md:text-2xl font-bold text-gray-500 leading-relaxed space-y-2">
                        <p>냉기를 막고 온기를 지켜<br className="md:hidden" />냉·난방비를 줄여주고</p>
                        <p>태풍·장마 걱정없이 실내를<br className="md:hidden" />튼튼하게 보호하며</p>
                        <p>외부의 소음까지 차단합니다.</p>
                    </div>

                    {/* Energy Grade Gauge */}
                    <div className="relative max-w-2xl mx-auto mb-20">
                        <div className="relative aspect-[2/1] w-full max-w-lg mx-auto">
                            {/* Gauge Background (Semicircle) */}
                            <svg viewBox="0 0 200 100" className="w-full h-full">
                                <defs>
                                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#7ed321" />
                                        <stop offset="25%" stopColor="#bdcc2b" />
                                        <stop offset="50%" stopColor="#f8e71c" />
                                        <stop offset="75%" stopColor="#f5a623" />
                                        <stop offset="100%" stopColor="#d0021b" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M 20 100 A 80 80 0 0 1 180 100"
                                    fill="none"
                                    stroke="#f3f4f6"
                                    strokeWidth="20"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M 20 100 A 80 80 0 0 1 180 100"
                                    fill="none"
                                    stroke="url(#gaugeGradient)"
                                    strokeWidth="20"
                                    strokeLinecap="round"
                                    strokeDasharray="251.32"
                                    strokeDashoffset="251.32"
                                    className="animate-[draw-gauge_2s_ease-out_forwards]"
                                />
                                {/* Marker lines */}
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <line
                                        key={i}
                                        x1={100 + 70 * Math.cos((180 + i * 45) * Math.PI / 180)}
                                        y1={100 + 70 * Math.sin((180 + i * 45) * Math.PI / 180)}
                                        x2={100 + 90 * Math.cos((180 + i * 45) * Math.PI / 180)}
                                        y2={100 + 90 * Math.sin((180 + i * 45) * Math.PI / 180)}
                                        stroke="white"
                                        strokeWidth="1"
                                    />
                                ))}
                            </svg>

                            {/* Center Value */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-baseline justify-center gap-1 w-full translate-y-2">
                                <span className="text-[120px] md:text-[180px] font-black text-[#7ed321] leading-none tracking-tighter">1</span>
                                <span className="text-4xl md:text-6xl font-black text-gray-800 tracking-tighter">등급</span>
                            </div>
                        </div>
                    </div>

                    <div className="inline-block bg-[#F8FAFC] px-10 py-8 rounded-[30px] shadow-sm border border-gray-100">
                        <p className="text-2xl md:text-3xl font-black text-gray-800 leading-tight">
                            KCC 홈씨씨 윈도우는 열 손실을 최소화 하여<br className="hidden md:block" />
                            냉난방효율을 개선할 수 있는 <span className="text-blue-600"><br className="md:hidden" />고성능 창호</span>입니다!
                        </p>
                    </div>
                </div>
            </section>

            {/* Glass Performance Section */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-5 lg:px-24 text-center">
                    <div className="mb-12 flex flex-col items-center">
                        <span className="inline-block px-6 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-black mb-8">KCC HomeCC</span>
                        <h2 className="text-5xl md:text-7xl font-black text-[#122649] leading-tight tracking-tighter">
                            창호 면적의<br className="md:hidden" />80%는<br />유리입니다.
                        </h2>
                    </div>

                    <div className="max-w-4xl mx-auto mb-20">
                        <div className="bg-[#111111] text-white p-10 md:p-16 rounded-[40px] shadow-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-xl md:text-2xl font-bold mb-4 text-gray-400">창호의 성능을<br className="md:hidden" />결정짓는 것은 유리!</p>
                                <h3 className="text-xl md:text-5xl font-black leading-tight tracking-tighter break-keep">
                                    <span className="text-[#ffcb05]">KCC글라스가 직접 생산</span>한<br />
                                    더블로이유리를 사용합니다!
                                </h3>
                            </div>
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {[
                            { title: '우수한 단열', desc: '두 겹의 은막 코팅으로 단열성 UP', img: 'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/2f132f6c78244.png' },
                            { title: '프라이버시 보호', desc: '프라이버시 보호 기능 UP', img: 'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/7bc0d8c223ddf.png' },
                            { title: '태양열 차단', desc: '태양열 차단으로 냉방비 SAVE', img: 'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/7402ea548f260.png' },
                            { title: '자외선 차단', desc: '일반유리 대비 자외선 차단효과 우수', img: 'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/cbc27b322011e.png' }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-6 md:p-12 rounded-[40px] shadow-[0_15px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-2 group border border-gray-50 flex flex-row md:flex-col items-center text-left md:text-center">
                                <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0 md:mx-auto mb-0 mr-6 md:mr-0 md:mb-10">
                                    <Image
                                        src={item.img}
                                        alt={item.title}
                                        fill
                                        className="object-contain group-hover:scale-110 transition-transform duration-500"
                                        unoptimized
                                    />
                                </div>
                                <div>
                                    <h4 className="text-xl md:text-3xl font-black mb-2 md:mb-4 text-[#122649] tracking-tighter whitespace-nowrap">{item.title}</h4>
                                    <p className="text-gray-500 font-bold leading-relaxed whitespace-pre-line text-base md:text-lg">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* Glass Importance (Comparison) */}
            <section className="py-32 bg-[#051428] text-white">
                <div className="container mx-auto px-2 lg:px-24 text-center">
                    <h2 className="text-3xl md:text-7xl font-black mb-6 md:mb-12 tracking-[-0.075em] md:tracking-tighter italic underline decoration-blue-500 underline-offset-[10px] md:underline-offset-[20px] whitespace-nowrap">유리는 역시, KCC글라스</h2>
                    <p className="text-xl md:text-3xl text-blue-400 font-bold mb-12 md:mb-24 tracking-tight md:tracking-widest mt-6 md:mt-12 break-keep leading-relaxed">창호 성능의 핵심,<br className="md:hidden" />유리를 보면 정답이 보입니다.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-20 max-w-6xl mx-auto">
                        <div className="bg-white/5 p-6 md:p-16 rounded-[40px] md:rounded-[80px] border border-white/10 hover:bg-white/10 transition-all text-left">
                            <div className="text-gray-500 mb-4 md:mb-10 font-bold text-lg md:text-3xl tracking-widest uppercase italic border-b border-white/10 pb-4">Standard Glass</div>
                            <h3 className="text-2xl md:text-5xl font-black mb-4 md:mb-8 whitespace-nowrap">일반 투명 유리</h3>
                            <p className="text-gray-400 text-base md:text-2xl font-medium leading-relaxed break-keep">열 전달이 매우 쉬워 냉방과 난방 시 에너지 손실이 심각하며, 결로에 취약합니다.</p>
                        </div>

                        {/* KCC Premium Glass */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-900 p-6 md:p-16 rounded-[40px] md:rounded-[80px] shadow-[0_0_80px_rgba(37,99,235,0.4)] hover:scale-105 transition-all text-left relative overflow-hidden">
                            <Award className="absolute -top-10 -right-10 w-40 h-40 md:w-60 md:h-60 opacity-10 rotate-12" />
                            <div className="text-yellow-400 mb-4 md:mb-10 font-black text-lg md:text-3xl tracking-widest uppercase italic border-b border-white/20 pb-4">KCC Premium Glass</div>
                            <h3 className="text-2xl md:text-5xl font-black mb-4 md:mb-8 text-white text-shadow whitespace-nowrap">KCC글라스 로이 유리</h3>
                            <p className="text-blue-100 text-base md:text-2xl font-medium leading-relaxed">특수 은(Silver) 코팅 레이어가 태양열을 차단하고 실내 온기를 잡아두는 고성능 유리입니다.</p>
                        </div>
                    </div>
                </div>
            </section >




            {/* 5. Double Low-E Glass Upgrade */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-5 lg:px-24">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[60px] md:rounded-[100px] p-8 md:p-24 border-4 md:border-8 border-white shadow-2xl relative overflow-hidden group">
                        {/* Special Benefit Badge */}
                        <div className="absolute top-10 left-10 md:top-14 md:left-20 z-20">
                            <div className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black rounded-full text-xl shadow-[0_10px_30px_rgba(239,68,68,0.3)] animate-bounce-slow">
                                <Gift size={24} className="animate-pulse" />
                                특별 혜택
                            </div>
                        </div>

                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                        <div className="flex-1 space-y-6 md:space-y-10 relative z-10 pt-28 md:pt-0">
                            <h2 className="text-3xl md:text-6xl font-black tracking-tighter leading-tight whitespace-nowrap">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">더블 로이유리</span><br />
                                한정 무상 업그레이드!
                            </h2>
                            <p className="text-2xl font-bold text-slate-600 leading-relaxed">
                                냉난방비를 무려 <span className="text-blue-600 font-black">40% 이상</span> 직접적으로 절감시켜주는 최고가 로이유리, 지금 신청 세대에 한해 추가금 없이 업그레이드 해드립니다.
                            </p>
                            <div className="flex items-center gap-8">
                                <div className="w-24 h-2 bg-blue-600 rounded-full shadow-sm"></div>
                                <p className="text-3xl font-black text-blue-600 italic tracking-tight">선착순 100세대 한정</p>
                            </div>
                        </div>
                        <div className="flex-1 flex justify-center scale-110 relative">
                            {/* Decorative Glow */}
                            <div className="absolute inset-0 bg-blue-400/20 blur-[80px] rounded-full group-hover:bg-blue-400/30 transition-colors duration-700"></div>

                            <div className="relative w-80 h-80 bg-white rounded-full flex items-center justify-center shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-700">
                                <div className="absolute inset-4 border-4 border-dashed border-blue-50 rounded-full animate-[spin_30s_linear_infinite]"></div>
                                <Image
                                    src="https://cdn.imweb.me/thumbnail/20260116/00e3228651622.png"
                                    alt="Double Low-E Glass Graphic"
                                    fill
                                    className="object-contain p-8 relative z-10"
                                    unoptimized
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section >





            {/* 10. KCC Window Subscription Pricing */}
            <section className="py-32 bg-slate-900 overflow-hidden">
                <div className="container mx-auto px-5 lg:px-24 text-center">
                    <div className="mb-20">
                        <span className="text-white font-black text-xl uppercase tracking-widest mb-4 block">KCC HomeCC</span>
                        <h2 className="text-6xl md:text-8xl font-black text-[#ff6b35] leading-tight tracking-tighter mb-6">
                            윈도우 구독!
                        </h2>
                        <p className="text-2xl md:text-4xl font-black text-gray-200 tracking-tight">
                            부담 없이 60개월<br className="md:hidden" />균등하게 나눠 내니까!
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-8">
                        {[
                            {
                                type: "TYPE 1",
                                title: "21평 비확장",
                                sub: "(2BAY / 복도식)",
                                price: "116,000",
                                img: "https://cdn.imweb.me/upload/S20250904697320f4fd9ed/f004fa04a38e5.png"
                            },
                            {
                                type: "TYPE 2",
                                title: "32평 확장",
                                sub: "(2BAY / 계단식)",
                                price: "203,000",
                                img: "https://cdn.imweb.me/upload/S20250904697320f4fd9ed/c22b54ee63233.png"
                            },
                            {
                                type: "TYPE 3",
                                title: "32평 비확장",
                                sub: "(3BAY / 계단식)",
                                price: "248,000",
                                img: "https://cdn.imweb.me/upload/S20250904697320f4fd9ed/41dbec0332fa0.png"
                            },
                            {
                                type: "TYPE 4",
                                title: "42평 비확장",
                                sub: "(3BAY / 계단식)",
                                price: "296,000",
                                img: "https://cdn.imweb.me/upload/S20250904697320f4fd9ed/c172daed2da9c.png"
                            }
                        ].map((plan, i) => (
                            <div key={i} className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl border-2 border-transparent hover:border-[#ff6b35]/20 flex flex-col md:flex-row items-center gap-10 transition-all duration-500 group">
                                <div className="flex-1 text-left space-y-4">
                                    <span className="text-xl font-black text-gray-900">{plan.type}</span>
                                    <h3 className="text-4xl md:text-5xl font-black text-[#ff6b35] tracking-tight line-clamp-1">{plan.title}</h3>
                                    <p className="text-xl font-bold text-gray-400">{plan.sub}</p>
                                    <div className="pt-4 border-t border-gray-100 mt-6">
                                        <p className="text-3xl md:text-4xl font-black text-gray-800">
                                            월 <span className="text-gray-900 tabular-nums">{plan.price}</span> 원
                                        </p>
                                    </div>
                                </div>
                                <div className="hidden md:flex w-full md:w-64 h-48 relative rounded-3xl overflow-hidden shadow-inner bg-gray-50 items-center justify-center p-4">
                                    <Image
                                        src={plan.img}
                                        alt={plan.title}
                                        fill
                                        className="object-contain p-2 group-hover:scale-110 transition-transform duration-700"
                                        unoptimized
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-gray-400 font-medium text-sm mt-12 text-center max-w-4xl mx-auto">
                        * 실제 견적금액은 각 가정의 평수/창호수량/시공환경<br className="md:hidden" />등에 따라 달라질 수 있습니다.
                    </p>
                </div>
            </section >

            {/* 11. 1-Day Construction Process */}
            <section className="py-20 md:py-40 bg-white">
                <div className="container mx-auto px-5 lg:px-24 text-center">
                    <h2 className="text-4xl md:text-6xl font-black mb-6 md:mb-12 tracking-tighter">거주 중에도<br className="md:hidden" />가능한 <span className="text-blue-600"><br className="md:hidden" />하루의 기적</span></h2>
                    <p className="text-lg md:text-2xl text-gray-500 mb-12 md:mb-24 max-w-2xl mx-auto font-bold tracking-tight break-keep">아침 출근 후 저녁 퇴근까지, 당신의 공간을 완벽하게 바꿔드립니다.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20 max-w-7xl mx-auto">
                        {[
                            { step: '08:30', title: '완벽 보양', desc: '특수 필름과 에어백을 이용해 가구와 바닥을 100% 보호합니다.' },
                            { step: '11:00', title: '정밀 교체', desc: '본사 표준 시공 팀이 기존 창을 안전하게 철거하고 신규 프레임을 안착시킵니다.' },
                            { step: '17:30', title: '마감 & 정리', desc: '최종 실리콘 작업 후 시공 흔적 하나 없이 완벽하게 청소하여 인도합니다.' },
                        ].map((item, i) => (
                            <div key={i} className="group flex flex-col items-center">
                                <div className="text-2xl md:text-4xl font-black text-blue-600 mb-6 md:mb-10 bg-blue-50 w-32 h-32 md:w-44 md:h-44 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xl scale-110 relative">
                                    <div className="absolute inset-2 border-2 border-dashed border-blue-200 rounded-full group-hover:border-white/50"></div>
                                    {item.step}
                                </div>
                                <h3 className="text-2xl md:text-4xl font-black mb-4 md:mb-6 tracking-tight">{item.title}</h3>
                                <p className="text-gray-500 text-base md:text-xl font-bold leading-relaxed break-keep">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* 12. 13-Year Gold Warranty */}
            <section className="py-24 md:py-48 bg-gradient-to-b from-[#1a1a1a] to-[#000] text-white text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/5 rounded-full blur-[150px]"></div>
                <div className="container mx-auto px-5 lg:px-24 relative z-10">
                    <div className="mb-12 md:mb-24 scale-100 md:scale-125">
                        <Award className="w-32 h-32 md:w-56 md:h-56 text-[#D4AF37] mx-auto mb-8 md:mb-16 animate-pulse" />
                        <h2 className="text-6xl md:text-[180px] font-black tracking-tighter italic leading-none opacity-90 drop-shadow-[0_0_50px_rgba(212,175,55,0.3)]">13 YEARS</h2>
                        <p className="text-xl md:text-4xl font-black tracking-[.3em] md:tracking-[.5em] text-[#D4AF37] uppercase mt-4">Master Gold Warranty</p>
                    </div>
                    <p className="text-2xl md:text-6xl font-black mb-8 md:mb-16 leading-tight tracking-tighter max-w-5xl mx-auto italic">차원이 다른 자부심,<br />본사가 직접 보증하는 <span className="text-[#D4AF37]"><br className="md:hidden" />13년의 약속</span></p>
                    <p className="text-base md:text-2xl text-gray-500 font-bold max-w-3xl mx-auto leading-relaxed break-keep">프레임 변질, 유리 결로,<br className="md:hidden" />하드웨어 기능 저하 시<br></br>평생에 가까운 안심 서비스를<br className="md:hidden" />약속드립니다.</p>
                </div>
            </section >

            {/* 13. Case Study Gallery */}
            <section className="py-16 md:py-32 bg-white text-center">
                <div className="container mx-auto px-5 lg:px-24">
                    <div className="mb-12 md:mb-24">
                        <h2 className="text-3xl md:text-6xl font-black mb-4 md:mb-6 tracking-tight text-[#122649]"><span className="text-[#122649]">홈씨씨 윈도우</span> <span className="text-[#D4AF37] underline decoration-4 underline-offset-8">시공사례</span></h2>
                        <p className="text-base md:text-2xl text-gray-500 font-bold">미세먼지·소음 걱정 없는 깨끗한 우리 집</p>
                    </div>
                    <div className="max-w-7xl mx-auto space-y-12 md:space-y-32">
                        {[
                            {
                                b: 'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/a66927dde3d9c.png',
                                a: 'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/fb82d9dda21ac.png',
                                bt: '칙칙하고 답답한 시야의 낡은 창호',
                                at: '탁 트인 개방감, 온 집안이 화사해지는 홈씨씨 뷰'
                            },
                            {
                                b: 'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/f21acfd5ad8ec.png',
                                a: 'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/d4074aa8aaff1.png',
                                bt: '곰팡이, 미세먼지 유입으로 고통받던 거실',
                                at: '햇살 가득, 결로 걱정 없는 쾌적한 KCC 홈씨씨 거실'
                            },
                            {
                                b: 'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/d634ca21e0ac7.png',
                                a: 'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/93c6725072a29.png',
                                bt: '찬바람과 소음이 그대로 들어오던 창가',
                                at: '조용하고 훈훈함만 남은 KCC 홈씨씨 창호'
                            },
                            {
                                b: 'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/9545a9af1d242.png',
                                a: 'https://cdn.imweb.me/upload/S20250904697320f4fd9ed/78a0baf52a42b.png',
                                bt: '집안을 좁아 보이게 만들던 낡은 창호',
                                at: '한겨울에도 훈훈하고 넓은 KCC 홈씨씨 단열 창호'
                            }
                        ].map((item, i) => (
                            <div key={i} className="grid grid-cols-2 gap-3 md:gap-20">
                                <div className="group space-y-3 md:space-y-8">
                                    <div className="relative h-[200px] md:h-[600px] w-full overflow-hidden rounded-[20px] md:rounded-[80px] shadow-lg">
                                        <Image src={item.b} className="object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105" alt="Before" fill unoptimized />
                                        <div className="absolute top-3 left-3 md:top-10 md:left-10 bg-black/50 backdrop-blur-md px-3 py-1 md:px-8 md:py-3 rounded-full text-white font-black text-[10px] md:text-xl">BEFORE</div>
                                    </div>
                                    <p className="text-gray-400 font-bold text-xs md:text-2xl italic leading-tight break-keep">{item.bt}</p>
                                </div>
                                <div className="group space-y-3 md:space-y-8">
                                    <div className="relative h-[200px] md:h-[600px] w-full overflow-hidden rounded-[20px] md:rounded-[80px] shadow-2xl border-2 md:border-4 border-blue-50">
                                        <Image src={item.a} className="object-cover transition-all duration-1000 group-hover:scale-110" alt="After" fill unoptimized />
                                        <div className="absolute top-3 left-3 md:top-10 md:left-10 bg-blue-600 px-3 py-1 md:px-8 md:py-3 rounded-full text-white font-black text-[10px] md:text-xl shadow-xl">AFTER</div>
                                    </div>
                                    <p className="text-gray-900 font-black text-xs md:text-2xl leading-tight break-keep">{item.at}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* 14. Final CTA Form */}
            <section id="final-cta" className="py-12 md:py-48 bg-white overflow-hidden relative">
                <div className="container mx-auto px-5 lg:px-24 max-w-5xl relative z-10">
                    <div className="bg-gradient-to-br from-[#2a1d17] to-[#120a07] px-6 py-12 lg:p-32 rounded-[30px] lg:rounded-[100px] text-white shadow-[0_50px_100px_rgba(0,0,0,0.3)] relative overflow-hidden border-t-[8px] lg:border-t-[12px] border-[#D4AF37] text-center">
                        <div className="absolute top-0 right-0 p-32 opacity-5 -rotate-12 scale-150"><Award size={200} /></div>
                        <div className="mb-10 md:mb-16">
                            <p className="text-base md:text-2xl text-gray-400 mb-4 font-medium tracking-widest">아직도 망설이십니까?</p>
                            <h2 className="text-4xl lg:text-8xl font-black mb-6 md:mb-8 drop-shadow-2xl tracking-tighter leading-none text-white">지금<br className="md:hidden" />바꾸셔야<br className="md:hidden" />합니다.</h2>
                            <div className="w-20 h-1 bg-[#b8860b] mx-auto mb-6 md:mb-8"></div>
                            <p className="text-lg md:text-3xl text-[#b8860b] font-bold break-keep">더 이상의 고민은 <br className="md:hidden" />난방비만 버릴 뿐입니다.</p>
                        </div>

                        <div className="space-y-4 max-w-2xl mx-auto mb-10 md:mb-16 text-left pl-2 md:pl-0">
                            {[
                                "목돈 부담 없이,<br class='md:hidden' /> 최장 <span class='text-yellow-400'>60개월 구독</span>",
                                "겨울 추위 끝,<br class='md:hidden' /> 차원이 다른 <span class='text-yellow-400'>단열 기술</span>",
                                "업계 유일!<br class='md:hidden' /> <span class='text-yellow-400'>13년 최장 품질 보증</span>"
                            ].map((html, i) => (
                                <div key={i} className="flex items-center gap-3 md:gap-6 text-base md:text-2xl font-bold text-gray-200">
                                    <div className="shrink-0 w-6 h-6 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-[#b8860b] flex items-center justify-center text-black font-black text-xs md:text-xl shadow-lg">✓</div>
                                    <p dangerouslySetInnerHTML={{ __html: html }} className="leading-tight"></p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 max-w-3xl mx-auto mb-10 md:mb-20">
                            {[
                                "<strong>[한정 혜택]</strong> 블랙 STS 방충망 <br class='md:hidden' /><span class='font-normal'>무상 업그레이드</span>",
                                "<strong>[한정 혜택]</strong> 더블 로이(Double Low-E) <br class='md:hidden' /><span class='font-normal'>무상 업그레이드</span>"
                            ].map((html, i) => (
                                <div key={i} className="bg-gradient-to-r from-[#b8860b] to-[#8a6608] p-4 md:p-6 rounded-[20px] md:rounded-full text-black text-sm md:text-2xl font-bold shadow-lg flex items-center justify-start md:justify-center gap-3 leading-tight text-left md:text-center">
                                    <Gift size={20} className="text-red-900 shrink-0 md:w-6 md:h-6" />
                                    <span dangerouslySetInnerHTML={{ __html: html }} className="break-keep"></span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-center gap-2 md:gap-4 text-lg md:text-4xl font-black text-[#d4af37] mb-8 md:mb-16 animate-pulse">
                            <Ruler className="text-gray-400 w-5 h-5 md:w-10 md:h-10" />
                            100% 무료!<br className="md:hidden" />실측 상담부터 받아보세요.
                        </div>

                        <div className="text-center">
                            <button onClick={() => setShowConsultModal(true)} className="px-8 py-4 md:px-16 md:py-8 bg-[#D4AF37] text-black text-xl md:text-3xl font-black rounded-[40px] shadow-[0_20px_50px_rgba(212,175,55,0.4)] hover:bg-[#B8860B] hover:-translate-y-2 transition-all active:scale-95 uppercase tracking-tight animate-bounce-slow w-full md:w-auto">
                                무료 상담 신청하기
                            </button>
                        </div>
                    </div>
                </div>
            </section >

            {/* 15. FAQ Section */}
            <section className="py-12 lg:py-24 bg-[#1a1a1a] text-white">
                <div className="container mx-auto px-5 lg:px-24 max-w-5xl">
                    <h2 className="text-3xl lg:text-5xl font-black mb-10 lg:mb-16 text-center">자주 묻는 Q&A</h2>

                    <div className="space-y-8 lg:space-y-16">
                        {/* 제품 관련 */}
                        <div>
                            <h3 className="text-2xl font-bold mb-6 text-gray-400 border-b border-gray-700 pb-2">제품 관련</h3>
                            <div className="space-y-8">
                                <div>
                                    <p className="text-xl font-bold mb-2 text-white">Q. 홈씨씨 윈도우가 무엇인가요?</p>
                                    <p className="text-gray-400 leading-relaxed font-medium">A. 홈씨씨 윈도우는 건축 및 인테리어 자재 전문기업 KCC글라스의 인테리어 전문 브랜드인 &apos;홈씨씨&apos;에서 보증하는 프리미엄 창호입니다.</p>
                                </div>
                                <div>
                                    <p className="text-xl font-bold mb-2 text-white">Q. 홈씨씨 윈도우는 왜 프리미엄 창호인가요?</p>
                                    <p className="text-gray-400 leading-relaxed font-medium">A. 홈씨씨 윈도우는 국내유리 1위 KCC글라스의 고품질 유리와 전용 자재들로 본사관리 하에 가공제작되어 1-Day 시공 및 13년 품질보증의 체계적인 A/S를 제공하고 있습니다.</p>
                                </div>
                            </div>
                        </div>

                        {/* 결제 관련 */}
                        <div>
                            <h3 className="text-2xl font-bold mb-6 text-gray-400 border-b border-gray-700 pb-2">결제 관련</h3>
                            <div className="space-y-8">
                                <div>
                                    <p className="text-xl font-bold mb-2 text-white">Q. 온라인으로 창호 구매하면 믿을 수 있나요?</p>
                                    <p className="text-gray-400 leading-relaxed font-medium">A. 고객 주문부터 시공까지 전 프로세스를 직접 관리합니다.</p>
                                </div>
                                <div>
                                    <p className="text-xl font-bold mb-2 text-white">Q. 시공 시간은 얼마나 걸리나요?</p>
                                    <p className="text-gray-400 leading-relaxed font-medium">A. 홈씨씨 전문 시공시스템으로 철거부터 마무리 하루 만에 시공 가능합니다. 시공 당일 엘리베이터 사용 관련하여 사무소와 사전 협의가 필요합니다.</p>
                                </div>
                            </div>
                        </div>

                        {/* A/S 관련 */}
                        <div>
                            <h3 className="text-2xl font-bold mb-6 text-gray-400 border-b border-gray-700 pb-2">A/S 관련</h3>
                            <div className="space-y-8">
                                <div>
                                    <p className="text-xl font-bold mb-2 text-white">Q. 창호 A/S는 어떻게 하나요?</p>
                                    <p className="text-gray-400 leading-relaxed font-medium">A. 해당 상품은 본사 시공을 통해 업계 최장 13년 품질 보증 서비스를 해드리고 있었습니다. 부품 내역에 따라 보증 기간이 상이하므로 자세한 내용 홈씨씨 홈페이지를 확인해주시기 바랍니다.</p>
                                </div>
                            </div>
                        </div>

                        {/* 환불/교환 */}
                        <div>
                            <h3 className="text-2xl font-bold mb-6 text-gray-400 border-b border-gray-700 pb-2">환불/교환</h3>
                            <div className="space-y-8">
                                <div>
                                    <p className="text-xl font-bold mb-2 text-white">Q. 환불은 가능한가요?</p>
                                    <p className="text-gray-400 leading-relaxed font-medium">A. 해당 상품은 상담권으로 언제든 청약 철회(상담취소)가 가능합니다. 다만 홈씨씨 컨설턴트와의 상담/실측 후 홈씨씨 윈도우 제품에 대한 최종결제가 완료된 이후에는 주문제작 되는 시공 상품의 특성상 단순 변심에 의한 취소/교환/반품이 불가합니다.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* Footer */}
            {/* Footer */}
            <footer className="bg-[#0f0f0f] py-16 text-gray-400 text-xs md:text-sm font-medium border-t border-gray-800/30">
                <div className="container mx-auto px-6 lg:px-24">
                    {/* Disclaimer Section */}
                    <div className="text-center mb-10 pb-10 border-b border-gray-800/50 leading-relaxed break-keep">
                        <p className="mb-2">본 상품은 ㈜케이씨씨글라스의 판매점인 ㈜티유디지털에서 판매하는 상품으로, 본 상품에 대한 상담 및 견적/시공 진행은 ㈜티유디지털에서 실시합니다.</p>
                        <p>㈜케이씨씨글라스는 창호 공급사이며, 본 구독 상품의 서비스 제공과는 무관함을 알려드립니다.</p>
                    </div>

                    {/* Info Section */}
                    <div className="text-left space-y-4 md:space-y-2">
                        <h4 className="text-white font-bold text-base mb-4">판매사 정보</h4>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 flex-wrap opacity-80">
                            <p>주식회사 티유디지털(KCC글라스 판매점)</p>
                            <span className="hidden md:block text-gray-700">|</span>
                            <p>대표 : 김정열</p>
                            <span className="hidden md:block text-gray-700">|</span>
                            <p>주소 : 서울시 금천구 가산디지털1로 83, 802호</p>
                            <span className="hidden md:block text-gray-700">|</span>
                            <p>사업자등록번호 : 220-87-15092</p>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 flex-wrap opacity-80">
                            <p>고객센터 : 1588-0883</p>
                            <span className="hidden md:block text-gray-700">|</span>
                            <p>개인정보 관리자 : 김은경 (kek3171@nate.com)</p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Floating Consultation Button */}
            <div className="fixed bottom-6 right-6 z-[999] animate-bounce-slow">
                <button onClick={() => setShowConsultModal(true)} className="flex items-center gap-3 bg-[#D4AF37] text-black px-8 py-5 rounded-full font-black text-xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:scale-105 transition-all">
                    <MessageCircle size={28} />
                    <span>무료 견적 상담</span>
                </button>
            </div>

            {/* Benefit Modal */}
            {showBenefitModal && partnerDataForBenefit && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowBenefitModal(false)}></div>
                    <div className="bg-white rounded-[30px] w-full max-w-md relative z-10 overflow-hidden shadow-3xl animate-in zoom-in duration-300">
                        {/* Header */}
                        <div className="bg-[#EA580C] p-6 md:p-8 text-white text-center relative">
                            <button onClick={() => setShowBenefitModal(false)} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                            <div className="flex items-center justify-center gap-2 mb-4 opacity-90">
                                <span className="bg-white/20 p-1.5 rounded-lg"><Gift size={16} /></span>
                                <span className="font-black tracking-widest text-xs md:text-sm">PARTNER SPECIAL</span>
                            </div>
                            <h2 className="text-xl md:text-3xl font-black leading-tight mb-2">
                                {partnerDataForBenefit['업체명']} 전용<br />
                                <span className="text-[#FCD34D]">시크릿 혜택 안내</span>
                            </h2>
                        </div>

                        {/* Content */}
                        <div className="p-6 md:p-8">
                            <div className="border-2 border-dashed border-orange-200 bg-orange-50 rounded-2xl p-4 md:p-8 text-center mb-6 md:mb-8">
                                <p className="text-lg md:text-2xl font-black text-[#EA580C] italic break-keep leading-snug">
                                    &quot;{partnerDataForBenefit['특별혜택'] || '혜택 정보를 불러올 수 없습니다.'}&quot;
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setShowBenefitModal(false);
                                    setShowConsultModal(true);
                                }}
                                className="w-full py-5 bg-black text-white font-black text-xl rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                혜택 적용하여 상담받기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Consultation Modal */}
            {showConsultModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowConsultModal(false)}></div>
                    <div className="bg-white rounded-[20px] md:rounded-[40px] w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
                        <div className="bg-[#D4AF37] p-4 md:p-8 text-black relative">
                            <button onClick={() => setShowConsultModal(false)} className="absolute top-4 right-4 md:top-6 md:right-6 hover:rotate-90 transition-transform"><X size={24} className="md:w-8 md:h-8" /></button>
                            <h2 className="text-xl md:text-3xl font-black">무료 견적 상담 신청</h2>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200">
                            <button onClick={() => setConsultType('quick')} className={`flex-1 py-3 md:py-6 font-black text-base md:text-xl transition-colors ${consultType === 'quick' ? 'bg-white text-[#D4AF37] border-b-4 border-[#D4AF37]' : 'bg-gray-50 text-gray-400'}`}>빠른 상담</button>
                            <button onClick={() => setConsultType('accurate')} className={`flex-1 py-3 md:py-6 font-black text-base md:text-xl transition-colors ${consultType === 'accurate' ? 'bg-white text-[#D4AF37] border-b-4 border-[#D4AF37]' : 'bg-gray-50 text-gray-400'}`}>정확한 상담</button>
                        </div>

                        <form className="p-4 md:p-8 space-y-4 md:space-y-6" onSubmit={handleConsultSubmit}>
                            <div className="space-y-2 md:space-y-4">
                                <label className="block text-gray-500 font-bold mb-1 text-sm md:text-base">성함</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl font-bold border border-transparent focus:border-[#D4AF37] outline-none text-sm md:text-base" required placeholder="성함 입력" />
                            </div>
                            <div className="space-y-2 md:space-y-4">
                                <label className="block text-gray-500 font-bold mb-1 text-sm md:text-base">연락처</label>
                                <input type="tel" value={contact} onChange={handleAutoHyphen} className="w-full p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl font-bold border border-transparent focus:border-[#D4AF37] outline-none text-sm md:text-base" required placeholder="010-0000-0000" pattern="[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}" />
                            </div>

                            {consultType === 'quick' ? (
                                <div className="grid grid-cols-2 gap-2 md:gap-4">
                                    <select className="p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl font-bold outline-none text-sm md:text-base" value={selectedSido} onChange={handleSidoChange} required>
                                        <option value="">시/도 선택</option>
                                        {Object.keys(koreaDistrictData).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <select className="p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl font-bold outline-none text-sm md:text-base" value={selectedGungu} onChange={(e) => setSelectedGungu(e.target.value)} required>
                                        <option value="">시/구/군</option>
                                        {selectedSido && koreaDistrictData[selectedSido].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2 md:space-y-4">
                                        <label className="block text-gray-500 font-bold mb-1 text-sm md:text-base">주소</label>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setShowAddressModal(true)} className="px-4 md:px-6 bg-black text-white rounded-lg md:rounded-xl font-bold text-sm md:text-base"><MapPin size={18} className="md:w-5 md:h-5" /></button>
                                            <input type="text" value={address} readOnly className="flex-1 p-3 md:p-4 bg-gray-100 rounded-lg md:rounded-xl font-bold text-sm md:text-base" placeholder="주소 검색" onClick={() => setShowAddressModal(true)} />
                                        </div>
                                        <input type="text" value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} className="w-full p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl font-bold border border-transparent focus:border-[#D4AF37] outline-none text-sm md:text-base" placeholder="상세주소 입력" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 md:gap-4">
                                        <div>
                                            <label className="block text-gray-500 font-bold mb-1 text-sm md:text-base">평형</label>
                                            <input type="text" value={pyeong} onChange={(e) => setPyeong(e.target.value)} className="w-full p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl font-bold outline-none text-sm md:text-base" placeholder="30평" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 font-bold mb-1 text-sm md:text-base">확장 여부</label>
                                            <select value={expansion} onChange={(e) => setExpansion(e.target.value)} className="w-full p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl font-bold outline-none text-sm md:text-base">
                                                <option value="">선택</option>
                                                <option value="확장됨">확장됨</option>
                                                <option value="안됨">안됨</option>
                                                <option value="모름">모름</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 md:gap-4">
                                        <div>
                                            <label className="block text-gray-500 font-bold mb-1 text-sm md:text-base">거주 상태</label>
                                            <select value={residence} onChange={(e) => setResidence(e.target.value)} className="w-full p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl font-bold outline-none text-sm md:text-base">
                                                <option value="">선택</option>
                                                <option value="거주중">거주중</option>
                                                <option value="공실">공실 (이사예정)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 font-bold mb-1 text-sm md:text-base">희망 시공</label>
                                            <select value={schedule} onChange={(e) => setSchedule(e.target.value)} className="w-full p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl font-bold outline-none text-sm md:text-base">
                                                <option value="">선택</option>
                                                <option value="즉시">즉시</option>
                                                <option value="1~2개월">1~2개월 내</option>
                                                <option value="3개월후">3개월 후</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-bold mb-1 text-sm md:text-base">특이사항</label>
                                        <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl font-bold outline-none h-20 md:h-24 resize-none text-sm md:text-base" placeholder="특이사항을 입력해주세요."></textarea>
                                    </div>
                                </>
                            )}

                            <div className="flex items-center gap-2 md:gap-3 pt-2 md:pt-4">
                                <input type="checkbox" id="modal-agree" required checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} className="w-5 h-5 md:w-6 md:h-6 accent-[#D4AF37]" />
                                <label htmlFor="modal-agree" className="text-gray-500 font-bold cursor-pointer select-none text-sm md:text-base">개인정보 수집 및 이용 동의</label>
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full py-4 md:py-6 bg-[#D4AF37] text-black font-black text-lg md:text-2xl rounded-xl md:rounded-2xl shadow-lg hover:bg-[#b8860b] active:scale-95 transition-all">
                                {isSubmitting ? '접수 중...' : '상담 신청하기'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Address Search Modal */}
            {showAddressModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddressModal(false)}></div>
                    <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 overflow-hidden shadow-2xl">
                        <div className="p-4 flex justify-between items-center border-b">
                            <h3 className="font-bold text-lg">주소 검색</h3>
                            <button onClick={() => setShowAddressModal(false)}><X size={24} /></button>
                        </div>
                        <div className="h-[500px]">
                            <DaumPostcode onComplete={handleAddressComplete} style={{ height: '100%' }} />
                        </div>
                    </div>
                </div>
            )}

            <div className="h-24 lg:hidden"></div>
            <style jsx global>{`
                @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
                body {
                    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif !important;
                }
                @keyframes drawLineLoop {
                    0% { stroke-dashoffset: 500; opacity: 0; }
                    2% { opacity: 1; }
                    40%, 85% { stroke-dashoffset: 0; opacity: 1; }
                    95%, 100% { stroke-dashoffset: 0; opacity: 0; }
                }
                .animate-draw-line-loop {
                    animation: drawLineLoop 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
                @keyframes moveArrowLoop {
                    0% { offset-distance: 0%; opacity: 0; }
                    2% { opacity: 1; }
                    40%, 85% { offset-distance: 100%; opacity: 1; }
                    95%, 100% { offset-distance: 100%; opacity: 0; }
                }
                .animate-move-arrow-loop {
                    animation: moveArrowLoop 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
                @keyframes fadeInUpLoop {
                    0% { opacity: 0; transform: translateY(20px); }
                    5% { opacity: 1; transform: translateY(0); }
                    85% { opacity: 1; transform: translateY(0); }
                    95%, 100% { opacity: 0; transform: translateY(0); }
                }
                .animate-fade-in-up-loop {
                    animation: fadeInUpLoop 5s ease-out infinite;
                }
                @keyframes bounceSlow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounceSlow 3s ease-in-out infinite;
                }
                .clip-hex {
                    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                }
                @keyframes draw-gauge {
                    from { stroke-dashoffset: 251.32; }
                    to { stroke-dashoffset: 0; }
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none; /* IE and Edge */
                    scrollbar-width: none; /* Firefox */
                }
            `}</style>
        </div >
    );
}
