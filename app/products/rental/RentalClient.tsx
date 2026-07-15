"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  ChevronRight, Award, Loader2, Calendar, UserCheck, Building2, Wrench, 
  Gauge, Timer, Home, ClipboardCheck, HelpCircle, X, Gift, Ruler, 
  MessageCircle, MapPin, Calculator, ShieldCheck, Flame, Droplets, 
  VolumeX, Coins, ClipboardList, Scale, Clock, Menu, Check, ChevronDown
} from 'lucide-react';
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

interface PostcodeData {
  address: string;
  addressType: string;
  bname: string;
  buildingName: string;
  zonecode: string;
}

interface RentalClientProps {
  partnerId: string | null;
  category?: string;
}

export default function RentalClient({ partnerId, category = "창호" }: RentalClientProps) {
  // Modal States
  const [showBenefitModal, setShowBenefitModal] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          benefitsStr = findVal('P_006') || findVal('P006') || findVal('rental') || Object.values(benefitsObj)[0] || '';
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

  // Consultation Form States
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [selectedSido, setSelectedSido] = useState('');
  const [selectedGungu, setSelectedGungu] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [consultType, setConsultType] = useState<'quick' | 'accurate'>('quick');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [pyeong, setPyeong] = useState('');
  const [expansion, setExpansion] = useState('');
  const [residence, setResidence] = useState('');
  const [schedule, setSchedule] = useState('');
  const [remarks, setRemarks] = useState('');
  const [aptName, setAptName] = useState('');

  // 상단바 스크롤 여부 감지 상태
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 1Day Timeline Animation States (스크롤 감지용)
  const [timelineStep, setTimelineStep] = useState(0); // 0 -> 1 -> 2 -> 3
  const timelineSectionRef = useRef<HTMLDivElement | null>(null);

  // Before/After Slider States
  const [activeTab, setActiveTab] = useState<'living' | 'bedroom' | 'veranda' | 'extended'>('living');
  const [sliderPosition, setSliderPosition] = useState(50); // 0% ~ 100%
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  // 5대 창호 성능 아코디언 상태
  const [activePerformance, setActivePerformance] = useState<number | null>(0);

  // FAQ 아코디언 상태
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const createCustomerMutation = useMutation(api.customers.createCustomer);

  // 1Day 시공 타임라인 Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 순차적 타임라인 충진 시뮬레이션
            setTimeout(() => setTimelineStep(1), 200);
            setTimeout(() => setTimelineStep(2), 1200);
            setTimeout(() => setTimelineStep(3), 2400);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (timelineSectionRef.current) {
      observer.observe(timelineSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Before/After 슬라이더 글로벌 이벤트 리스너 (부드러운 마우스 이탈 드래그 처리)
  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      let percentage = (x / rect.width) * 100;
      if (percentage < 0) percentage = 0;
      if (percentage > 100) percentage = 100;
      setSliderPosition(percentage);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isDragging || !sliderRef.current || e.touches.length === 0) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      let percentage = (x / rect.width) * 100;
      if (percentage < 0) percentage = 0;
      if (percentage > 100) percentage = 100;
      setSliderPosition(percentage);
    };

    const handleGlobalUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('mouseup', handleGlobalUp);
      window.addEventListener('touchmove', handleGlobalTouchMove);
      window.addEventListener('touchend', handleGlobalUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, [isDragging]);

  const handleSidoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSido(e.target.value);
    setSelectedGungu('');
  };

  const handleAutoHyphen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    let formatted = raw;
    if (raw.length <= 3) {
      formatted = raw;
    } else if (raw.length <= 7) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    } else if (raw.length <= 10) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6)}`;
    } else {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
    }
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

  const fetchBenefit = () => {
    if (!partner) {
      if (partnerId) alert('파트너 정보를 불러오는 중이거나 유효하지 않습니다.');
      return;
    }
    setShowBenefitModal(true);
  };

  // 상담 신청 처리
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
        remarks ? `특이사항: ${remarks}` : '',
        aptName ? `아파트명: ${aptName}` : ''
      ].filter(Boolean).join(' / ');

      let partnerBenefit = "";
      if (partner && partner.special_benefits) {
        try {
          const benefits = JSON.parse(partner.special_benefits);
          partnerBenefit = benefits['P_006'] || benefits['P006'] || benefits['rental'] || "";
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
        category: category,
        created_at: new Date().toISOString().split('T')[0]
      });

      alert('상담 신청이 정상적으로 접수되었습니다. 담당 전문가가 곧 연락드리겠습니다.');
      setShowConsultModal(false);
      setShowBenefitModal(false);
      setName(''); setContact(''); setSelectedSido(''); setSelectedGungu(''); setIsAgreed(false);
      setAddress(''); setDetailAddress(''); setPyeong(''); setExpansion(''); setResidence(''); setSchedule(''); setRemarks('');
      setAptName('');
    } catch (error: unknown) {
      console.error('Consultation Submit Error:', error);
      alert('상담 신청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 11섹션 Before/After Case 탭별 설명 및 이미지 매핑
  const beforeAfterCases = {
    living: {
      tag: "경기 부천시 32평형 아파트",
      desc: "알루미늄 외창 틈새 유격으로 인한 외풍 심각 → 에너지효율 1등급 KCC 발코니 이중창 및 26mm 더블 로이유리 설치로 겨울철 난방 온도 약 4도 상승 효과 확인.",
      beforeImg: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783924230/%EC%98%A4%EB%9E%98%EB%90%9C_%EC%95%84%ED%8C%8C%ED%8A%B8_%EA%B1%B0%EC%8B%A4_%EB%AA%A8%EC%8A%B5_xx03so.png",
      afterImg: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783924230/%EA%B9%A8%EB%81%97%ED%95%9C_%ED%99%94%EC%9D%B4%ED%8A%B8_PVC_%EC%B0%BD%ED%98%B8_%EA%B5%90%EC%B2%B4_kvkutr.png"
    },
    bedroom: {
      tag: "서울 성북구 24평형 아파트",
      desc: "도로변 유입 차량 소음(62dB)으로 수면 방해 → 고차음 성능 KCC 특화 단창 교체 후 도서관 수준(28dB)의 정숙하고 아늑한 숙면실 구현.",
      beforeImg: "",
      afterImg: ""
    },
    veranda: {
      tag: "인천 부평구 40평형 아파트",
      desc: "고질적인 환기 부족 및 유리 단열 미비로 인한 결로/곰팡이 폭발 → 하부 배수 구배를 올린 고성능 외창 설치 및 실리콘 곰팡이 방지 틈새 코팅 마감.",
      beforeImg: "",
      afterImg: ""
    },
    extended: {
      tag: "경기 일산 48평형 아파트",
      desc: "거실 발코니 확장 공사 시 저품질 이중창 조립 시공으로 단열 상실 → 초고단열 1등급 확장 전용 KCC 프라임 242 프레임 보강 교체 완료.",
      beforeImg: "",
      afterImg: ""
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans antialiased overflow-x-hidden">
      {/* ──────────────────────────────────────────────────────── */}
      {/* 상단 헤더 (높이: 80px / 모바일: 56px) */}
      {/* ──────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 border-b border-gray-100 ${
        isScrolled 
          ? 'h-12 md:h-14 bg-white shadow-md' 
          : 'h-14 md:h-20 bg-white/95 backdrop-blur-sm'
      }`}>
        <div className="max-w-[1200px] h-full mx-auto px-5 md:px-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-24 md:h-8 md:w-32">
              <Image
                src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1784093217/01_full_color_homecc_BI_phjl98.png"
                alt="KCC HomeCC Logo"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>

          {/* PC 메뉴 */}
          <nav className="hidden md:flex items-center gap-8">
            {["렌탈서비스", "월 납입 예시", "제품 성능", "시공 과정", "시공사례", "자주 묻는 질문"].map((menu, idx) => {
              const ids = ["#hero", "#pricing", "#performance", "#one-day", "#before-after", "#faq"];
              return (
                <a key={idx} href={ids[idx]} className="text-sm font-semibold hover:text-[#916843] transition-colors">
                  {menu}
                </a>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href="tel:1588-0000" className="flex items-center gap-1.5 border border-[#322214] text-[#322214] font-bold text-sm px-4 py-2 rounded-full hover:bg-[#322214] hover:text-white transition-all">
              <Clock className="w-4 h-4" />
              전화 상담
            </a>
            <button onClick={() => setShowConsultModal(true)} className="bg-[#D97706] hover:bg-[#E06C0F] text-white font-bold text-sm px-5 py-2.5 rounded-full shadow-md transition-all">
              무료 실측 신청
            </button>
          </div>

          {/* 모바일 햄버거 */}
          <button onClick={() => setMobileMenuOpen(true)} className="block md:hidden p-2 text-[#322214]">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* 모바일 사이드 메뉴 오버레이 */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative w-[75%] max-w-sm h-full bg-white p-8 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex justify-between items-center mb-8">
                <span className="font-extrabold text-base text-[#322214]">KCC 창호 렌탈</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <nav className="flex flex-col gap-6">
                {["렌탈서비스", "월 납입 예시", "제품 성능", "시공 과정", "시공사례", "자주 묻는 질문"].map((menu, idx) => {
                  const ids = ["#hero", "#pricing", "#performance", "#one-day", "#before-after", "#faq"];
                  return (
                    <a key={idx} href={ids[idx]} onClick={() => setMobileMenuOpen(false)} className="font-bold text-lg text-gray-800 hover:text-[#916843]">
                      {menu}
                    </a>
                  );
                })}
              </nav>
            </div>
            <div className="flex flex-col gap-3">
              <a href="tel:1588-0000" className="flex items-center justify-center gap-2 h-14 border border-[#322214] rounded-xl font-bold text-[#322214]">전화 상담하기</a>
              <button onClick={() => { setMobileMenuOpen(false); setShowConsultModal(true); }} className="h-14 bg-[#D97706] rounded-xl font-bold text-white shadow-md">무료 실측 신청</button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 1섹션. 히어로 */}
      {/* ──────────────────────────────────────────────────────── */}
      <section 
        id="hero" 
        className="relative w-full min-h-[780px] md:min-h-[960px] flex items-center pt-20 md:pt-24 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://res.cloudinary.com/dfkntvpmv/image/upload/v1783922255/%EA%B3%A0%EA%B8%89_%EC%8B%9C%EC%8A%A4%ED%85%9C_%EC%B0%BD%EB%AC%B8%EC%9D%98_%EB%84%93%EC%9D%80_%EA%B1%B0%EC%8B%A4_c1o6bx.png')" }}
      >
        <div className="max-w-[1200px] mx-auto px-5 md:px-0 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center w-full z-10 relative">
          {/* 좌측 콘텐츠 영역 (기존 md:col-span-5에서 md:col-span-6으로 늘려 시각적으로 더 여유 있게 배치) */}
          <div className="md:col-span-6 text-left flex flex-col items-start space-y-4 md:space-y-6">
            <span className="inline-block bg-[#916843]/10 text-[#916843] font-extrabold text-xs md:text-sm px-3.5 py-1.5 rounded-full font-outfit tracking-wider uppercase">
              KCC Homecc Window Rental
            </span>
            <h1 className="tracking-normal text-left font-title">
              {/* 첫 번째 줄: 지마켓 산스 볼드 전용 클래스 매핑 및 한 줄 고정 */}
              <span className="block text-3.5xl md:text-6xl text-[#916843] font-black mb-4 leading-tight tracking-wider whitespace-nowrap font-gmarket">
                어? 창호도 렌탈이 돼?
              </span>
              {/* 아래 두 줄: 색상은 딥 네이비로 통일하고 행간격을 좁힘 (밑줄 제거) */}
              <span className="block text-3xl md:text-5xl font-black text-[#322214] leading-[1.3] font-title">
                지금은 목돈 걱정 없이<br />
                <span className="font-black font-title" style={{ background: 'linear-gradient(to top, rgba(255, 230, 0, 0.4) 40%, transparent 40%)' }}>
                  창호를 교체하는 시대
                </span>
              </span>
            </h1>
            <p className="text-sm md:text-base text-[#222222]/90 leading-relaxed font-medium">
              본사 직영 시공과 13년 품질보증까지 완벽하게.<br />
              이제 이자 부담 없는 장기 분납 렌탈로 스마트하게 우리 집 온도를 올리세요.
            </p>
            <div className="flex flex-wrap gap-2.5 py-2">
              {["최대 60개월 분납", "13년 본사 보증", "하루 완공 시스템"].map((badge, idx) => (
                <span key={idx} className="flex items-center gap-1 bg-white/90 text-[#222222] font-bold text-xs md:text-sm px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm backdrop-blur-sm">
                  <Check className="w-3.5 h-3.5 text-[#916843]" />
                  {badge}
                </span>
              ))}
            </div>
            
            <div className="w-full flex flex-col gap-2 pt-2">
              <button onClick={() => setShowConsultModal(true)} className="w-full md:w-auto px-8 h-[60px] bg-[#D97706] hover:bg-[#E06C0F] text-white font-bold text-base rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                무료 실측 신청하기
                <ChevronRight className="w-5 h-5" />
              </button>
              <p className="text-[11px] text-[#222222] flex items-center gap-1 pl-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#916843]" />
                실측 후 계약 미진행 시에도 수수료는 0원입니다. 안심하고 신청하세요.
              </p>
            </div>

            </div>

          {/* 우측은 완전히 개방하여 웅장한 인테리어 통배경 이미지가 시원하게 보이도록 비워둠 */}
          <div className="md:col-span-6 hidden md:block"></div>
        </div>

        {/* 신뢰 정보 바 - 딥 네이비 진한 배경으로 변경 */}
        <div className="absolute bottom-0 left-0 w-full bg-[#322214] border-t border-[#916843]/20 py-5 hidden md:block z-20">
          <div className="max-w-[1200px] mx-auto flex justify-between items-center text-center">
            {[
              { num: "No.1", txt: "국내 창호 브랜드 파워" },
              { num: "100%", txt: "KCC 홈씨씨 정품 자재" },
              { num: "1/24", txt: "원데이 철거 및 완공" },
              { num: "0원", txt: "방문 실측 및 견적 수수료" }
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex justify-center items-center gap-3">
                <span className="text-xl font-extrabold text-[#D97706] font-montserrat">{item.num}</span>
                <span className="text-sm font-bold text-white tracking-tight">{item.txt}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 2섹션. 월 납입금 예시 */}
      {/* ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="bg-[#F7F5F0] py-20 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-0">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs md:text-sm font-bold text-[#916843] tracking-widest font-outfit uppercase">Monthly Payment Examples</span>
            <h2 className="text-2xl md:text-4xl font-black text-[#322214] tracking-tight leading-[1.4] font-title">우리 집 평수별 합리적인 <strong className="font-black font-title" style={{ background: 'linear-gradient(to top, rgba(255, 230, 0, 0.4) 40%, transparent 40%)' }}>월 납입 예시</strong></h2>
            <p className="text-sm md:text-base text-[#666666] tracking-tight">제휴카드 전월 실적 조건 적용 시 더 경제적인 비용으로 만날 수 있습니다.</p>
          </div>

          {/* 가격 카드 리스트 (모바일 가로 스크롤 지원) */}
          <div className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto pt-4 px-4 md:px-2 pb-6 md:pb-3 snap-x snap-mandatory scrollbar-none">
            {[
              { type: "TYPE 1 (24평형 내외)", sub: "방 3개 + 거실 + 발코니 기준", price: "114,000", orig: "154,000", desc: "발코니 이중창 및 단창 포함", featurd: true, imgUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80" },
              { type: "TYPE 2 (32평형 내외)", sub: "방 3개 + 거실 + 전후면 발코니", price: "158,000", orig: "198,000", desc: "광폭 발코니창 특화 패키지", featurd: false, imgUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80" },
              { type: "TYPE 3 (40평형 내외)", sub: "방 4개 + 거실 + 광폭 발코니", price: "205,000", orig: "245,000", desc: "거실 대형 와이드창 기본 적용", featurd: false, imgUrl: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=600&q=80" },
              { type: "TYPE 4 (48평형 이상)", sub: "대형 평형 전체 창호 교체 패키지", price: "250,000", orig: "290,000", desc: "프리미엄 라인업 풀 패키지", featurd: false, imgUrl: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783922255/%EA%B3%A0%EA%B8%89_%EC%8B%9C%EC%8A%A4%ED%85%9C_%EC%B0%BD%EB%AC%B8%EC%9D%98_%EB%84%93%EC%9D%80_%EA%B1%B0%EC%8B%A4_c1o6bx.png" }
            ].map((card, idx) => (
              <div 
                key={idx} 
                className="snap-start shrink-0 w-[285px] md:w-auto bg-white rounded-3xl flex flex-col justify-between shadow-sm overflow-hidden transition-all duration-300 ring-1 ring-gray-200/80 hover:ring-2 hover:ring-[#916843] hover:shadow-xl md:hover:-translate-y-2 hover:bg-[#916843]/[0.01] isolation-isolate"
              >
                <div>
                  {/* 카드 상단 이미지 영역 */}
                  <div className="relative w-full h-[150px] overflow-hidden bg-gray-100 rounded-t-[22px]">
                    <img 
                      src={card.imgUrl} 
                      alt={card.type} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                    {card.featurd && (
                      <span className="absolute top-3.5 left-3.5 bg-[#916843] text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-sm z-10">
                        대표 추천
                      </span>
                    )}
                  </div>

                  {/* 텍스트 콘텐츠 내부 패딩 분리 */}
                  <div className="p-5 md:p-6 pb-2">
                    <h3 className="text-base md:text-lg font-black text-[#322214] font-title">{card.type}</h3>
                    <p className="text-xs text-[#666666] mt-0.5 mb-5">{card.sub}</p>
                    
                    <div className="bg-[#F7F5F0] rounded-2xl p-4 text-center mb-5 border border-gray-100">
                      <span className="text-xs text-[#666666] line-through font-montserrat block mb-0.5">월 {card.orig}원</span>
                      <span className="inline-block bg-[#D97706]/10 text-[#D97706] text-[10px] font-bold px-2 py-0.5 rounded mb-2">제휴카드 할인 적용</span>
                      <div className="text-[#322214]">
                        <span className="text-xl md:text-2xl font-black font-montserrat">{card.price}</span>
                        <span className="text-xs md:text-sm font-bold"> 원/월</span>
                      </div>
                    </div>

                    <ul className="text-xs md:text-sm text-[#222222] space-y-2.5 mb-6">
                      <li className="flex gap-1.5 font-medium"><Check className="w-4 h-4 text-[#916843] shrink-0" />{card.desc}</li>
                      <li className="flex gap-1.5 font-medium"><Check className="w-4 h-4 text-[#916843] shrink-0" />더블 로이유리 기본 적용</li>
                      <li className="flex gap-1.5 font-medium"><Check className="w-4 h-4 text-[#916843] shrink-0" />본사 직영 시공 & 철거 무상</li>
                    </ul>
                  </div>
                </div>

                <div className="p-5 md:p-6 pt-0">
                  <button onClick={() => setShowConsultModal(true)} className={`w-full h-11 md:h-12 rounded-full font-bold text-xs md:text-sm transition-all ${
                    card.featurd ? 'bg-[#916843] hover:bg-[#322214] text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}>
                    맞춤 견적 신청
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] md:text-xs text-[#666666] text-center mt-5 leading-normal">
            ※ 상기 요금은 제휴카드(전월 30만원 실적 시 2.5만원 청구할인) 기준이며, 창수 및 자재 옵션 변동에 따라 실 시공견적은 상이할 수 있습니다.
          </p>

          <div className="text-center mt-8 md:mt-10">
            <button onClick={() => setShowConsultModal(true)} className="px-8 h-14 md:h-[60px] bg-[#D97706] hover:bg-[#E06C0F] text-white font-bold text-base rounded-full shadow-lg hover:shadow-xl transition-all">
              우리 집 예상 월 납입금 알아보기
            </button>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 3섹션. 렌탈 비교 */}
      {/* ──────────────────────────────────────────────────────── */}
      <section 
        id="comparison" 
        className="relative py-20 md:py-32 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://res.cloudinary.com/dfkntvpmv/image/upload/v1783923654/%EC%B0%BD%EB%AC%B8_%EC%A0%84%EA%B3%BC_%ED%9B%84_%EB%B9%84%EA%B5%90_pej0b9.png')" }}
      >
        {/* 시네마틱 가독성 확보용 검은색 반투명 오버레이 */}
        <div className="absolute inset-0 bg-black/75 z-0"></div>

        <div className="max-w-[1200px] mx-auto px-5 md:px-0 z-10 relative">
          <div className="text-center space-y-3 mb-12 md:mb-16">
            <span className="text-xs md:text-sm font-bold text-[#916843] tracking-widest font-outfit uppercase">Comparison Table</span>
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-[1.4] font-title">
              일반 창호 일시불 교체 vs <strong className="font-black font-title text-white" style={{ background: 'linear-gradient(to top, rgba(217, 119, 6, 0.5) 40%, transparent 40%)' }}>창호 렌탈 비교</strong>
            </h2>
            <p className="text-sm md:text-base text-stone-300 tracking-tight">목돈 마련의 장벽을 없애고, 무상 A/S 기간과 본사 케어 품질을 압도적으로 늘렸습니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-11 gap-6 md:gap-4 items-center">
            {/* 일반 교체 */}
            <div className="md:col-span-5 bg-white/70 backdrop-blur-md border border-gray-200/30 rounded-[24px] p-8 md:p-10 text-left shadow-md">
              <h3 className="text-lg md:text-xl font-bold text-[#322214] mb-8 text-center pb-4 border-b border-gray-200 font-title">일반 창호 일시불 교체</h3>
              <div className="space-y-6">
                {[
                  { title: "초기 공사 비용", desc: "1,000만원 대 내외 일시 지출 (목돈 부담)" },
                  { title: "본사 무상 A/S 보증", desc: "일반 대리점 사설 보증 1~2년 (이후 유상)" },
                  { title: "원데이 완성도", desc: "사설 팀 일정 지연, 철거/조립 별도 공정 발생" },
                  { title: "정품 자재 신뢰도", desc: "사설 조립 및 비브랜드 프레임 부자재 혼용" }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5 border-b border-gray-100 pb-4">
                    <span className="text-xs text-[#916843] font-extrabold">{item.title}</span>
                    <span className="text-sm font-bold text-[#322214]">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* VS 아이콘 */}
            <div className="md:col-span-1 flex justify-center py-2 md:py-0">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-[#D97706] text-white rounded-full flex items-center justify-center font-bold text-sm md:text-lg shadow-lg border-4 border-white">
                VS
              </div>
            </div>

            {/* 홈씨씨 렌탈 */}
            <div className="md:col-span-5 bg-[#322214]/60 backdrop-blur-md text-white border border-[#916843]/20 rounded-[24px] p-8 md:p-10 text-left shadow-2xl">
              <h3 className="text-lg md:text-xl font-bold text-white mb-8 text-center pb-4 border-b border-white/10">홈씨씨 창호 렌탈서비스</h3>
              <div className="space-y-6">
                {[
                  { title: "초기 공사 비용", desc: "초기 계약금 0원, 월 11만원대 장기 분납" },
                  { title: "본사 무상 A/S 보증", desc: "본사가 보증서 발행, 업계 최장 13년 무상" },
                  { title: "원데이 완성도", desc: "철거에서 청소까지 단 하루 완성 시공 보장" },
                  { title: "정품 자재 신뢰도", desc: "100% KCC 홈씨씨 본사 제작 정품만 조립" }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5 border-b border-white/10 pb-4">
                    <span className="text-xs text-white/50 font-bold">{item.title}</span>
                    <span className="text-sm font-extrabold text-white">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#322214]/60 border border-[#916843]/30 rounded-xl p-5 md:p-6 text-center mt-8 text-stone-200 text-sm md:text-base font-semibold backdrop-blur-sm relative z-10">
            “초기 부담금 0원으로 오늘 공사를 마치고, 렌탈 기간 내내 안심 무상 보증 혜택을 챙기세요.”
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 4섹션. 문제 공감 */}
      {/* ──────────────────────────────────────────────────────── */}
      <section id="empathy" className="bg-[#F7F5F0] py-20 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-0">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs md:text-sm font-bold text-[#916843] tracking-widest font-outfit uppercase">Pain Points</span>
            <h2 className="text-2xl md:text-4xl font-black text-[#322214] tracking-tight leading-[1.4] font-title">매년 반복되는 <strong className="font-black font-title" style={{ background: 'linear-gradient(to top, rgba(255, 230, 0, 0.4) 40%, transparent 40%)' }}>노후 창호의 불만</strong>, 겪고 계신가요?</h2>
            <p className="text-sm md:text-base text-[#666666] tracking-tight">오래된 알루미늄 샷시와 유격은 가구 경제와 거주 만족도를 악화시킵니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { 
                title: "1. 새어 나가는 난방비", 
                desc: "창 틈새 틈새바람 때문에 틀어도 썰렁하고 가스 요금이 무섭습니다.", 
                imgUrl: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783923911/%EA%B2%A8%EC%9A%B8_%EC%B6%94%EC%9C%84_%EB%8A%90%EB%81%BC%EB%8A%94_%EC%95%84%ED%8C%8C%ED%8A%B8_%EA%B1%B0%EC%8B%A4_hlieso.png" 
              },
              { 
                title: "2. 축축한 곰팡이와 결로", 
                desc: "유리 표면 온도차로 맺히는 물방울이 벽면 곰팡이를 유발합니다.", 
                imgUrl: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783923911/%EA%B2%A8%EC%9A%B8%EC%B2%A0_%EC%98%A4%EB%9E%98%EB%90%9C_%EC%95%84%ED%8C%8C%ED%8A%B8_%EC%B0%BD%EB%AC%B8_%EC%8A%B5%EA%B8%B0_%EB%AC%B8%EC%A0%9C_rux3jm.png" 
              },
              { 
                title: "3. 외부 소음과 먼지 유입", 
                desc: "도로변 자동차 소리와 미세먼지가 걸러지지 않고 집 안으로 유입됩니다.", 
                imgUrl: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783923911/%EB%8F%84%EC%8B%AC_%EC%95%84%ED%8C%8C%ED%8A%B8%EC%97%90%EC%84%9C_%EC%B0%BD%EB%AC%B8_%EB%84%88%EB%A8%B8_%EC%86%8C%EC%9D%8C_hjij35.png" 
              },
              { 
                title: "4. 수백만원 목돈 부담", 
                desc: "꼭 교체해야 하지만 일시 지출되는 시공비 때문에 계속 샷시를 씁니다.", 
                imgUrl: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783923909/e0da93ae-1efb-4d15-8fc8-6b237503785f_xg6ne5.png" 
              }
            ].map((problem, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                {/* 실물 Pain Point 이미지 연동 */}
                <div className="w-full aspect-[4/3] overflow-hidden bg-gray-100">
                  <img 
                    src={problem.imgUrl} 
                    alt={problem.title} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                    loading="lazy"
                  />
                </div>
                <div className="p-5 md:p-6 text-left flex-1 flex flex-col justify-between">
                  <h3 className="text-base font-extrabold text-[#322214] mb-2">{problem.title}</h3>
                  <p className="text-xs md:text-sm text-[#666666] leading-relaxed">{problem.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 하단 띠배너 */}
          <div className="bg-gradient-to-r from-[#322214] to-[#916843] rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left shadow-lg">
            <p className="text-base md:text-xl font-bold">
              더 이상 추위와 먼지를 참지 마세요. <strong className="text-[#D97706]">초기 비용 0원</strong>으로 해결 가능합니다.
            </p>
            <button onClick={() => setShowConsultModal(true)} className="px-6 h-12 bg-[#D97706] hover:bg-[#E06C0F] text-white font-bold text-sm rounded-full shadow-md shrink-0 transition-all">
              1분 간편 상담 신청
            </button>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 5섹션. 비용 상승 (이유) */}
      {/* ──────────────────────────────────────────────────────── */}
      <section 
        id="cost-rise" 
        className="relative py-28 md:py-40 bg-cover bg-center bg-no-repeat text-white"
        style={{ backgroundImage: "url('https://res.cloudinary.com/dfkntvpmv/image/upload/v1783924226/%ED%98%84%EB%8C%80_%EC%95%84%ED%8C%8C%ED%8A%B8_%EC%B0%BD%ED%98%B8_%ED%94%84%EB%A6%AC%EB%AF%B8%EC%97%84_%EA%B4%91%EA%B3%A0_rhx7mu.png')" }}
      >
        <div className="max-w-[1200px] mx-auto px-5 md:px-0 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center z-10 relative">
          {/* 가로 상승 그래프 - 고대비 반투명 다크 카드로 가독성을 확실하게 보정 */}
          <div className="md:col-span-5 bg-[#322214]/85 backdrop-blur-md border border-[#916843]/30 rounded-[24px] p-6 md:p-8 shadow-2xl w-full font-montserrat z-10 relative">
            <h4 className="text-sm font-sans font-extrabold mb-4 text-center text-white">연도별 평균 가스비/에너지 비용 인상폭 추이</h4>
            <div className="bg-black/30 rounded-xl p-4">
              <svg viewBox="0 0 400 240" className="w-full h-auto">
                <line x1="40" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                <line x1="40" y1="80" x2="380" y2="80" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                <line x1="40" y1="140" x2="380" y2="140" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                <line x1="40" y1="200" x2="380" y2="200" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
                <text x="30" y="24" fill="rgba(255,255,255,0.75)" fontSize="10" textAnchor="end">140%</text>
                <text x="30" y="84" fill="rgba(255,255,255,0.75)" fontSize="10" textAnchor="end">120%</text>
                <text x="30" y="144" fill="rgba(255,255,255,0.75)" fontSize="10" textAnchor="end">100%</text>
                <text x="60" y="220" fill="rgba(255,255,255,0.85)" fontSize="11" textAnchor="middle">2020</text>
                <text x="160" y="220" fill="rgba(255,255,255,0.85)" fontSize="11" textAnchor="middle">2021</text>
                <text x="260" y="220" fill="rgba(255,255,255,0.85)" fontSize="11" textAnchor="middle">2022</text>
                <text x="360" y="220" fill="#FFF" fontSize="11" textAnchor="middle" fontWeight="bold">2023</text>
                <rect x="50" y="140" width="20" height="60" rx="4" fill="#1769C2" opacity="0.7" />
                <rect x="150" y="130" width="20" height="70" rx="4" fill="#1769C2" opacity="0.9" />
                <rect x="250" y="90" width="20" height="110" rx="4" fill="#1769C2" />
                <rect x="350" y="40" width="20" height="160" rx="4" fill="#F58220" />
                <text x="60" y="130" fill="rgba(255,255,255,0.85)" fontSize="10" textAnchor="middle">100%</text>
                <text x="160" y="120" fill="rgba(255,255,255,0.9)" fontSize="10" textAnchor="middle">106%</text>
                <text x="260" y="80" fill="#FFF" fontSize="11" textAnchor="middle" fontWeight="bold">118%</text>
                <text x="360" y="30" fill="#FFF" fontSize="12" textAnchor="middle" fontWeight="black">135.6%</text>
              </svg>
            </div>
            <p className="text-[9px] text-stone-300 text-center mt-3 font-medium">※ 한국가스공사 발표 연도별 도시가스 기본 주택용 요금 기준 비교</p>
          </div>

          {/* 설득 카피 */}
          <div className="md:col-span-7 text-left space-y-5">
            <span className="text-xs font-bold text-[#D97706] tracking-widest font-outfit uppercase">Energy Saving Reason</span>
            <h3 className="text-xl md:text-4xl font-black leading-[1.7] tracking-tight font-title break-keep">
              가스 요금 <span className="text-[#D97706] font-montserrat font-black font-title" style={{ background: 'linear-gradient(to top, rgba(255, 230, 0, 0.4) 40%, transparent 40%)' }}>35.6%</span> 급등,<br />
              노후 창호를 방치하면 냉난방비 폭탄이 계속됩니다.
            </h3>
            <p className="text-sm md:text-base text-white/80 leading-relaxed">
              최근 몇 년 동안 도시가스와 주택용 전기 비용은 고공 행진을 이어가고 있습니다. 창문 틈새로 미세하게 새는 열은 가계부에 큰 손실을 초래합니다.
            </p>
            <p className="text-sm md:text-base text-white/80 leading-relaxed">
              KCC 홈씨씨의 1등급 에너지 절감 창호로 교체하여 창가를 밀폐하면 난방 에너지 유실을 차단합니다. <strong>이번 겨울이 시작되기 전, 창호 교체를 통해 난방비 절감 효과를 체감해보세요.</strong>
            </p>
            <div className="space-y-2 pt-2">
              <span className="flex items-center gap-2 text-sm font-bold text-[#D97706]"><Check className="w-4 h-4" />냉난방 효율 개선으로 에너지 유출 최고 40% 방지</span>
              <span className="flex items-center gap-2 text-sm font-bold text-[#D97706]"><Check className="w-4 h-4" />연간 환산 시 상당 규모의 전기/가스요금 세이브 가능</span>
            </div>
            <button onClick={() => setShowConsultModal(true)} className="px-8 h-14 bg-[#D97706] hover:bg-[#E06C0F] text-white font-bold text-base rounded-full shadow-lg hover:shadow-xl transition-all mt-4">
              에너지 손실 무료 진단 상담 신청
            </button>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 6섹션. 6가지 핵심 혜택 */}
      {/* ──────────────────────────────────────────────────────── */}
      <section id="benefits" className="py-20 md:py-32 bg-white">
        <div className="max-w-[1200px] mx-auto px-5 md:px-0">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs md:text-sm font-bold text-[#916843] tracking-wider uppercase">Key Benefits</span>
            <h2 className="text-2xl md:text-4xl font-black text-[#322214] tracking-tight leading-[1.4] font-title">KCC 홈씨씨 창호 렌탈의 <strong className="font-black font-title" style={{ background: 'linear-gradient(to top, rgba(255, 230, 0, 0.4) 40%, transparent 40%)' }}>6가지 혜택</strong></h2>
            <p className="text-sm md:text-base text-[#666666]">정품 자재부터 보증, 하루 시공까지 원스톱으로 관리합니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                num: "01", 
                title: "본사 직접 조립 생산", 
                desc: "본사 제조공장에서 완제품 형태로 정교하게 빌드 후 직배송합니다.",
                imgUrl: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783926973/bcd69880-779f-4ab9-968d-380121da894e.png" 
              },
              { 
                num: "02", 
                title: "초기 비용 무부담", 
                desc: "계약금, 철거 수거비 0원으로 월 분납 방식 계약이 성립됩니다.",
                imgUrl: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783926984/9c522670-ecc3-42ce-99a0-98430dc9cd7e.png" 
              },
              { 
                num: "03", 
                title: "최장 13년 본사 보증", 
                desc: "핵심 창호 부품(프로파일, 복층유리)에 대해 긴 무상케어를 제공합니다.",
                imgUrl: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783926996/25d3e79b-85f6-4284-bf10-af9649a1d737.png" 
              },
              { 
                num: "04", 
                title: "단 하루 원데이 시공", 
                desc: "아침 보양부터 완공 및 최종 흡입청소까지 하루 안에 마무리됩니다.",
                imgUrl: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783927015/02d0c2ef-bdaf-40e1-b3ea-b8187703127e.png" 
              },
              { 
                num: "05", 
                title: "제휴카드 추가 캐시백", 
                desc: "전월 실적에 맞춰 월 렌탈료를 매달 최대 2.5만원까지 감면해 드립니다.",
                imgUrl: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783927023/72d27edf-33b3-4e74-a51b-06593a055579.png" 
              },
              { 
                num: "06", 
                title: "1:1 전담 마스터 배정", 
                desc: "첫 실측부터 주문 배송, 공사 확인 및 사후 서비스까지 1:1로 밀착 케어합니다.",
                imgUrl: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783927033/3e382d7e-d130-433e-8b35-4dec423f34e4.png" 
              }
            ].map((b, idx) => (
              <div key={idx} className="bg-[#F7F5F0] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:bg-white hover:border-[#916843]/50 border border-transparent transition-all flex flex-col group cursor-pointer">
                {/* 혜택 전용 이미지 상단 배치 - 찌그러짐(꾸겨짐) 방지를 위해 명시적 세로 높이 고정 및 shrink-0 강제 */}
                <div className="w-full h-[200px] md:h-[240px] shrink-0 overflow-hidden bg-gray-100 relative">
                  <img 
                    src={b.imgUrl} 
                    alt={b.title} 
                    className="force-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                  {/* 숫자 뱃지 */}
                  <div className="absolute top-4 left-4 bg-[#322214] text-[#F7F5F0] text-xs font-extrabold font-montserrat px-3 py-1 rounded-full shadow-sm">
                    {b.num}
                  </div>
                </div>
                {/* 혜택 정보 텍스트 영역 */}
                <div className="p-6 text-left flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base md:text-lg font-black text-[#322214] mb-2">{b.title}</h4>
                    <p className="text-xs md:text-sm text-[#666666] leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button onClick={() => setShowConsultModal(true)} className="px-8 h-14 bg-[#916843] hover:bg-[#322214] text-white font-bold text-base rounded-full shadow-md transition-all">
              혜택 적용받고 렌탈 신청하기
            </button>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 7섹션. 창호 성능 */}
      {/* ──────────────────────────────────────────────────────── */}
      <section id="performance" className="bg-[#F7F5F0] py-20 md:py-32">
        {(() => {
          const performanceImages = [
            "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783927265/596d0030-cca5-45d9-bc2c-a4c8181bd7b8.png",
            "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783927275/08eeebdf-6835-47c8-ab0c-345101dd81ff.png",
            "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783927282/34929b53-6503-4778-8fd8-9494553056e3.png",
            "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783927289/1c841c73-cd60-43c7-ae28-897bdd13b7e3.png",
            "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783927296/296020e4-f927-4a82-b5f4-ae6d281a3573.png"
          ];
          return (
            <div className="max-w-[1200px] mx-auto px-5 md:px-0 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-stretch">
              {/* 좌측 이미지 */}
              <div className="md:col-span-6 h-auto min-h-[350px] md:min-h-[500px] flex">
                <div className="w-full h-full rounded-[24px] overflow-hidden shadow-lg relative">
                  <img 
                    src={performanceImages[activePerformance ?? 0]} 
                    alt="KCC 프리미엄 창호 5대 성능 정보" 
                    className="force-cover transition-all duration-500"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
              </div>

              {/* 우측 5대 성능 아코디언 */}
              <div className="md:col-span-6 text-left space-y-4">
                <span className="text-xs font-bold text-[#916843] tracking-widest font-outfit uppercase">Window Performances</span>
                <h3 className="text-2xl md:text-4xl font-black text-[#322214] mb-8 tracking-tight leading-[1.4] font-title">프리미엄 창호가 갖춰야 할 <strong className="font-black font-title" style={{ background: 'linear-gradient(to top, rgba(255, 230, 0, 0.4) 40%, transparent 40%)' }}>5대 성능</strong></h3>

                <div className="space-y-3">
                  {[
                    { title: "단열성 (Insulation)", desc: "냉난방 에너지가 유실되지 않고 바깥 기온 침입을 방지하여 실내 온도를 유지합니다. 에너지소비효율 1등급의 기초 성능입니다." },
                    { title: "기밀성 (Airtightness)", desc: "창짝과 창틀 틈새에 고밀도 모헤어 및 정밀 압착 개스킷을 적용해 틈새바람과 황사/먼지의 실내 침입을 차단합니다." },
                    { title: "차음성 (Soundproof)", desc: "두껍고 무거운 차음유리 설계로 도로변 소음, 비바람 및 공사 소리를 35dB 이상 감쇄시켜 쾌적하고 고요한 방을 제공합니다." },
                    { title: "수밀성 (Watertightness)", desc: "태풍과 큰 빗물이 몰아쳐도 틈 사이로 물이 고이거나 내부로 역류하지 않는 물받이 차단 경사로 구배 구조를 뜻합니다." },
                    { title: "내풍압성 (Windproof)", desc: "강한 강풍과 돌풍에도 유리가 휘거나 이탈 파손되지 않도록 스틸 보강재(Steel Reinforcement)를 내부에 탑재했습니다." }
                  ].map((perf, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all">
                      <div 
                        onClick={() => setActivePerformance(idx)} 
                        className={`p-5 flex items-center justify-between cursor-pointer transition-colors ${activePerformance === idx ? 'bg-[#F7F5F0]/50' : 'hover:bg-gray-50/50'}`}
                      >
                        <span className="font-extrabold text-sm md:text-base text-[#322214]"><span className="font-montserrat mr-1.5">{idx + 1}.</span>{perf.title}</span>
                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${activePerformance === idx ? 'transform rotate-180' : ''}`} />
                      </div>
                      <div className={`transition-all duration-300 overflow-hidden ${activePerformance === idx ? 'max-h-[150px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p className="px-5 pb-5 text-xs md:text-sm text-[#666666] leading-relaxed border-t border-gray-100 pt-3">
                          {perf.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 8섹션. 더블 로이유리 */}
      {/* ──────────────────────────────────────────────────────── */}
      <section id="double-loye" className="py-20 md:py-32 bg-white">
        <div className="max-w-[1200px] mx-auto px-5 md:px-0">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs md:text-sm font-bold text-[#916843] tracking-widest font-outfit uppercase">Glass Technology</span>
            <h2 className="text-2xl md:text-4xl font-black text-[#322214] tracking-tight leading-[1.4] font-title">유리의 두께와 등급이 핵심, <strong className="font-black font-title" style={{ background: 'linear-gradient(to top, rgba(255, 230, 0, 0.4) 40%, transparent 40%)' }}>더블 로이유리</strong></h2>
            <p className="text-sm md:text-base text-[#666666] tracking-tight">두 번(더블)의 은 코팅막 적용으로 적외선 열선을 차단하고 내부 열은 잡아줍니다.</p>
          </div>

          {/* 단면 일러스트 비교 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-[#F7F5F0] rounded-2xl p-6 border border-gray-200 text-left">
              <span className="bg-gray-400 text-white text-[10px] font-bold px-2.5 py-1 rounded mb-4 inline-block">일반 복층 유리</span>
              <div className="w-full aspect-[4/3] bg-white rounded-xl overflow-hidden mb-4 relative">
                <img 
                  src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1783927309/e9a7f2c1-7c6d-4e77-a8c9-81dcbe1e21d0.png" 
                  alt="일반 유리 단면 구조 및 열 관통 일러스트" 
                  className="force-contain"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  loading="lazy"
                />
              </div>
              <h4 className="text-base font-extrabold text-[#222222] mb-1">여름철 적외선 유입 증가</h4>
              <p className="text-xs md:text-sm text-[#666666] leading-relaxed">태양 직사광선이 은 차단 필터 없이 그대로 투과되어 에어컨을 세게 켜도 실내가 계속 덥고 온도 손실이 발생합니다.</p>
            </div>

            <div className="bg-[#F4F7FB] rounded-2xl p-6 border border-[#916843]/20 text-left">
              <span className="bg-[#916843] text-white text-[10px] font-bold px-2.5 py-1 rounded mb-4 inline-block">KCC 더블 로이유리</span>
              <div className="w-full aspect-[4/3] bg-white rounded-xl overflow-hidden mb-4 relative">
                <img 
                  src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1783927316/96c60a15-73df-4d11-8c5e-c600dbb991e3.png" 
                  alt="KCC 더블 로이 은 코팅 단면 차단 일러스트" 
                  className="force-contain"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  loading="lazy"
                />
              </div>
              <h4 className="text-base font-extrabold text-[#322214] mb-1">뜨거운 태양광 적외선 70% 차단</h4>
              <p className="text-xs md:text-sm text-[#666666] leading-relaxed">두 번 진공 증착 코팅된 Silver 은 복합막이 태양의 가시광선은 들여보내되 열선인 적외선은 반사하여 시원함을 확보합니다.</p>
            </div>
          </div>

          {/* 4개 혜택 설명 보드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "💡", title: "냉난방료 최고 40% 절감", desc: "연간 환산 에너지 소실을 낮춥니다." },
              { icon: "☀️", title: "자외선 차단 99%", desc: "바닥재 및 가구 변색을 억제합니다." },
              { icon: "💧", title: "결로 및 서리 맺힘 방지", desc: "실내 유리면 습기 발생률이 하락합니다." },
              { icon: "🔒", title: "안전 두께 기준 충족", desc: "두툼한 구조로 외부 충격에 단단합니다." }
            ].map((benefit, idx) => (
              <div key={idx} className="bg-[#F7F5F0] rounded-xl p-5 text-center border border-gray-200/50">
                <span className="text-2xl block mb-3">{benefit.icon}</span>
                <h4 className="text-sm font-extrabold text-[#322214] mb-1">{benefit.title}</h4>
                <p className="text-[11px] text-[#666666] leading-normal">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 9섹션. 하루 시공 */}
      {/* ──────────────────────────────────────────────────────── */}
      <section id="one-day" className="bg-[#F7F5F0] py-20 md:py-32" ref={timelineSectionRef}>
        <div className="max-w-[1200px] mx-auto px-5 md:px-0">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs md:text-sm font-bold text-[#916843] tracking-widest font-outfit uppercase">1Day Speed Construction</span>
            <h2 className="text-2xl md:text-4xl font-black text-[#322214] tracking-tight leading-[1.4] font-title">이삿짐 보관 없이 아침부터 저녁까지, <strong className="font-black font-title" style={{ background: 'linear-gradient(to top, rgba(255, 230, 0, 0.4) 40%, transparent 40%)' }}>하루 시공 완료</strong></h2>
            <p className="text-sm md:text-base text-[#666666] tracking-tight">KCC 본사 숙련 시공 매니저들이 투입되어 하루 일정 내에 철거부터 최종 완공까지 보장합니다.</p>
          </div>

          {/* 가로형 타임라인 (PC) / 세로형 (모바일) */}
          <div className="relative max-w-4xl mx-auto py-12 md:py-16">
            {/* 진행율 라인 바 */}
            <div className="absolute top-[48px] left-0 w-full h-[4px] bg-gray-200 z-0 hidden md:block">
              <div 
                className="h-full bg-[#916843] transition-all duration-[1200ms] ease-out" 
                style={{ width: timelineStep === 1 ? '0%' : timelineStep === 2 ? '50%' : timelineStep === 3 ? '100%' : '0%' }}
              ></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 text-left">
              {[
                { time: "08:30", stepNum: "STEP 01", title: "바닥 보양 및 샷시 철거", desc: "이삿짐 스크래치를 방지하는 3중 비밀 마스킹 보양 후 낡은 기존 창틀을 신속하고 안전하게 떼어냅니다.", step: 1 },
                { time: "11:00", stepNum: "STEP 02", title: "KCC 정품 틀 안착 & 폼 마감", desc: "수평 정밀 수직 측정계로 틀 균형을 밀착시킨 후, 틈새 충진 우레탄 본사 안심 폼을 빈틈없이 채웁니다.", step: 2 },
                { time: "17:30", stepNum: "STEP 03", title: "로이 유리 부착 & 실리콘 마감", desc: "더블 로이 유리를 틀에 결합하고, 외부 습기 누수를 영구 억제하는 고강도 실리콘 실링 도포 및 마감 청소 후 완료됩니다.", step: 3 }
              ].map((step, idx) => (
                <div key={idx} className="flex md:flex-col items-start gap-4 md:gap-0 group">
                  {/* 시간 마커 - 입체형으로 고급화 */}
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex flex-col items-center justify-center font-bold text-xs md:text-sm border-4 border-white shadow-md mb-6 shrink-0 transition-all font-montserrat ${
                    timelineStep >= step.step 
                      ? 'bg-gradient-to-br from-[#916843] to-[#322214] text-white' 
                      : 'bg-white text-[#666666]'
                  }`}>
                    <span className="text-[8px] md:text-[9px] opacity-75 uppercase tracking-wider font-semibold">Time</span>
                    <span className="leading-none -mt-0.5">{step.time}</span>
                  </div>
                  {/* 카드 본문 - 호버 시 솟아오르는 모션 부여 */}
                  <div className={`bg-white rounded-3xl p-6 border shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex-1 ${
                    timelineStep >= step.step 
                      ? 'border-[#916843]/30 opacity-100 scale-100' 
                      : 'border-gray-200 opacity-60 scale-95'
                  }`}>
                    {/* 이미지 영역 - 찌러짐(구겨짐) 방지를 위해 force-cover 이중잠금 적용 및 호버 줌 스케일 상향 */}
                    <div className="w-full aspect-[16/11] overflow-hidden rounded-2xl bg-gray-100 relative mb-5 shadow-inner">
                      <img 
                        src={idx === 0 
                          ? "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783927786/1da56507-79f1-4b9f-a5bf-884f3691d015.png"
                          : idx === 1 
                            ? "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783927788/b49b934c-826b-4a6e-b898-a1bf6716ad8a.png"
                            : "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783927790/9a0de9fd-779b-4648-bcf1-3b48cc0117fc.png"
                        } 
                        alt={step.title} 
                        className="force-cover transition-transform duration-700 group-hover:scale-108"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                    </div>
                    {/* 타이포그래피 계층화 및 자간 조율 */}
                    <span className="text-[10px] md:text-[11px] font-black tracking-widest text-[#916843] uppercase block mb-1 font-montserrat">{step.stepNum}</span>
                    <h4 className="text-base md:text-[17px] font-black text-[#322214] mb-2.5 leading-snug">{step.title}</h4>
                    <p className="text-xs md:text-sm text-[#666666] leading-relaxed font-light">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 완공 후 거실 이미지 영역 - 백그라운드 이미지 적용 및 찌그러짐(구겨짐) 방지 */}
          <div className="relative rounded-[24px] overflow-hidden shadow-xl h-[280px] md:h-[400px] mt-12">
            <img 
              src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1783927944/b5a9a115-e74c-4ad2-83c3-c7678e62daa8.png" 
              alt="퇴근 후 완성된 아늑하고 쾌적한 거실 풍경" 
              className="force-cover absolute inset-0 w-full h-full"
              style={{ objectFit: 'cover' }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent z-0"></div>
            <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 text-white text-left z-10">
              <h3 className="text-xl md:text-3xl font-black mb-2">저녁 퇴근길, 완전히 달라진 단열을 즉시 체감하세요.</h3>
              <p className="text-xs md:text-sm text-white/75">단 하루의 빠른 시공 약속이 온 거주기간 내내 우리 가족의 아늑함을 약속합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 10섹션. 13년 품질 보증 */}
      {/* ──────────────────────────────────────────────────────── */}
      <section id="warranty" className="relative min-h-[500px] md:min-h-[600px] flex items-center">
        {/* 거실 대형 배경 이미지 영역 - 백그라운드 이미지 적용 및 찌그러짐(구겨짐) 방지 */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1783928136/%ED%94%84%EB%A6%AC%EB%AF%B8%EC%97%84_%EC%B0%BD%EB%AC%B8_%ED%92%88%EC%A7%88_%EB%B3%B4%EC%A6%9D_%EB%B0%B0%EA%B2%BD_md60cv.png" 
            alt="프리미엄 창문 품질 보증 배경" 
            className="force-cover absolute inset-0 w-full h-full"
            style={{ objectFit: 'cover' }}
            loading="lazy"
          />
        </div>
        <div className="absolute inset-0 bg-[#322214]/85 backdrop-blur-xs z-[1]"></div>

        <div className="max-w-[1200px] mx-auto px-5 md:px-0 w-full z-10 text-white relative">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            {/* 골드 엠블럼 */}
            <div className="md:col-span-4 flex justify-center">
              <div className="w-[180px] h-[180px] md:w-[220px] md:h-[220px] rounded-full border-4 border-[#D97706]/40 bg-[#322214]/80 flex flex-col items-center justify-center shadow-2xl">
                <span className="text-5xl md:text-6xl font-black text-[#D97706] font-montserrat leading-none">13</span>
                <span className="text-base md:text-lg font-black tracking-widest font-outfit mt-1">YEARS</span>
                <span className="text-[10px] text-white/50 tracking-wider font-outfit">WARRANTY</span>
              </div>
            </div>

            {/* 설명 및 보증 조건 */}
            <div className="md:col-span-8 text-left space-y-4 md:space-y-6">
              <span className="text-xs font-bold text-[#D97706] tracking-widest font-outfit uppercase">Premium Guarantee Policy</span>
              <h3 className="text-2xl md:text-4xl font-black leading-[1.4] tracking-tight font-title">
                창틀부터 유리 부품 하자까지,<br /><strong className="font-black font-title" style={{ background: 'linear-gradient(to top, rgba(255, 230, 0, 0.4) 40%, transparent 40%)' }}>KCC 홈씨씨 본사 공인 13년 안심 품질보증</strong>
              </h3>
              <p className="text-sm md:text-base text-white/75 leading-relaxed">
                단순 대리점 사설 영수증 보증이 아닙니다. KCC 홈씨씨 본사가 직접 검수한 엄격한 완성 창에 한하여 장기 무상 교체 및 품질 보증을 보증서 형식으로 약속해 드립니다.
              </p>
              
              <ul className="text-xs md:text-sm text-white/80 space-y-3 pt-2">
                <li className="flex gap-2"><span className="text-[#D97706] font-bold">•</span><strong>프로파일 (샷시 플라스틱 틀):</strong> 자연 변형, 갈라짐 현상 발생 시 13년 보증</li>
                <li className="flex gap-2"><span className="text-[#D97706] font-bold">•</span><strong>복층 유리 (더블 로이유리):</strong> 내부 가스 누설로 인한 습기 맺힘 13년 보증</li>
                <li className="flex gap-2"><span className="text-[#D97706] font-bold">•</span><strong>구동 하드웨어 (손잡이 기어):</strong> 락킹 및 크리센트 구동 장치 마모 13년 보증</li>
              </ul>
              
              <p className="text-[10px] text-white/45">
                ※ 고무 기밀 씰 및 방충망 훼손 등 세부 소모품은 기본 부품 보증 기준(2~3년)을 적용합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 11섹션. 시공 전후 (Before/After) */}
      {/* ──────────────────────────────────────────────────────── */}
      <section id="before-after" className="py-20 md:py-32 bg-white">
        <div className="max-w-[1200px] mx-auto px-5 md:px-0">
          <div className="text-center space-y-3 mb-10">
            <span className="text-xs md:text-sm font-bold text-[#916843] tracking-widest font-outfit uppercase">Real Construction Cases</span>
            <h2 className="text-2xl md:text-4xl font-black text-[#322214] tracking-tight leading-[1.4] font-title">실제 창호 렌탈 <strong className="font-black font-title" style={{ background: 'linear-gradient(to top, rgba(255, 230, 0, 0.4) 40%, transparent 40%)' }}>시공 비포 & 애프터</strong></h2>
            <p className="text-sm md:text-base text-[#666666] tracking-tight">삐걱거리고 열 손실이 가득하던 공간이 단 열 교체로 화사하고 단열이 완비되었습니다.</p>
          </div>

          {/* 탭 버튼 */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-8">
            {[
              { id: "living", title: "거실 발코니" },
              { id: "bedroom", title: "안방 침실" },
              { id: "veranda", title: "다용도실/베란다" },
              { id: "extended", title: "거실 확장형" }
            ].map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => { setActiveTab(tab.id as any); setSliderPosition(50); }}
                className={`font-bold text-xs md:text-sm px-5 py-2.5 rounded-full transition-all border ${
                  activeTab === tab.id 
                    ? 'bg-[#916843] border-[#916843] text-white shadow-md' 
                    : 'bg-[#F7F5F0] border-gray-200 text-[#666666] hover:bg-gray-100'
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>

          {/* Before / After 드래그 슬라이더 */}
          <div className="max-w-3xl mx-auto">
            <div 
              ref={sliderRef}
              className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-gray-100 select-none cursor-ew-resize"
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setIsDragging(true)}
            >
              {/* Before 이미지 (오른쪽 아래 레이어) */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                {beforeAfterCases[activeTab].beforeImg ? (
                  <img 
                    src={beforeAfterCases[activeTab].beforeImg} 
                    alt="시공 전 모습" 
                    className="force-cover absolute inset-0 w-full h-full"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <>
                    <span className="text-xs font-bold text-gray-500 z-10">BEFORE 노후된 알루미늄 샷시 이미지</span>
                    <span className="absolute bottom-3 right-3 text-[8px] font-mono text-gray-400 bg-white/70 px-1 rounded z-10">PC: 1600×1200px / Mobile: 1080×1080px</span>
                  </>
                )}
                <span className="absolute bottom-3 left-3 bg-gray-800/80 text-white font-bold text-[10px] px-2.5 py-1 rounded z-10">BEFORE</span>
              </div>

              {/* After 이미지 (왼쪽 위 레이어, width로 범위 조절) */}
              <div 
                className="absolute inset-y-0 left-0 h-full overflow-hidden border-r-2 border-white z-10" 
                style={{ width: `${sliderPosition}%` }}
              >
                {/* 내부의 이미지 플레이스홀더 역시 너비가 슬라이더 크기(768px)로 고정되어 clipping 되어야 함 */}
                <div className="absolute inset-y-0 left-0 w-[768px] md:w-[768px] h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  {beforeAfterCases[activeTab].afterImg ? (
                    <img 
                      src={beforeAfterCases[activeTab].afterImg} 
                      alt="시공 후 모습" 
                      className="force-cover absolute inset-y-0 left-0 h-full"
                      style={{ width: '768px', maxWidth: '768px', minWidth: '768px', objectFit: 'cover' }}
                    />
                  ) : (
                    <>
                      <span className="text-xs font-bold text-gray-600 z-10">AFTER 완공된 KCC 하이샷시 유리창 이미지</span>
                      <span className="absolute bottom-3 right-3 text-[8px] font-mono text-gray-400 bg-white/70 px-1 rounded z-10">PC: 1600×1200px / Mobile: 1080×1080px</span>
                    </>
                  )}
                  <span className="absolute bottom-3 left-3 bg-[#916843] text-white font-bold text-[10px] px-2.5 py-1 rounded z-10">AFTER</span>
                </div>
              </div>

              {/* 조절 핸들 바 */}
              <div 
                className="absolute inset-y-0 z-20 w-1 bg-white cursor-ew-resize" 
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#916843] text-white border-2 border-white shadow-xl flex items-center justify-center font-bold text-xs">
                  ↔
                </div>
              </div>
            </div>

            {/* 케이스 정보 표시 */}
            <div className="bg-[#F7F5F0] rounded-xl p-5 md:p-6 text-left mt-6">
              <span className="inline-block bg-[#916843] text-white text-[10px] font-bold px-2.5 py-0.5 rounded mb-2.5">
                {beforeAfterCases[activeTab].tag}
              </span>
              <p className="text-xs md:text-sm text-[#222222] font-semibold leading-relaxed">
                {beforeAfterCases[activeTab].desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 12섹션. 무료 실측 */}
      {/* ──────────────────────────────────────────────────────── */}
      <section id="measurement" className="bg-[#F7F5F0] py-20 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-0 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center">
          {/* 좌측 실측 엔지니어 이미지 - 백그라운드 이미지 적용 및 찌그러짐(구겨짐) 방지 */}
          <div className="md:col-span-5 h-[320px] md:h-[500px]">
            <div className="w-full h-full rounded-[24px] overflow-hidden shadow-lg relative">
              <img 
                src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1783928575/9cf8fd3a-1d15-412a-a58d-28cc72e566d1.png" 
                alt="정밀 실측 중인 마스터 모습" 
                className="force-cover absolute inset-0 w-full h-full"
                style={{ objectFit: 'cover' }}
                loading="lazy"
              />
            </div>
          </div>

          {/* 우측 3단계 안내 */}
          <div className="md:col-span-7 text-left space-y-4">
            <span className="text-xs font-bold text-[#916843] tracking-widest font-outfit uppercase">3-Step Free Measurement</span>
            <h3 className="text-2xl md:text-4xl font-black text-[#322214] mb-8 tracking-tight leading-[1.4] font-title">우리 집 창문 규격에 딱 맞춰,<br /><strong className="font-black font-title" style={{ background: 'linear-gradient(to top, rgba(255, 230, 0, 0.4) 40%, transparent 40%)' }}>3단계 무료 방문 실측 프로세스</strong></h3>
            <p className="text-sm md:text-base text-[#666666] leading-relaxed mb-8 tracking-tight">
              대략적인 면적이 아닌 맞춤형 공사 설계를 위해 전문가가 직접 1:1 방문하여 유격과 깊이를 측량해 드립니다.
            </p>

            <div className="space-y-6">
              {[
                { num: "01", title: "온라인/전화 간편 접수", desc: "이름과 간단한 대략적 주소를 남겨 주시면 당일 담당 샷시 예약 매칭 해피콜이 배정됩니다." },
                { num: "02", title: "본사 공인 정밀 측량사 방문", desc: "예약 날짜에 맞춰 측량 레이저 기계를 지참한 엔지니어가 방문하여 발코니 유격을 실측합니다." },
                { num: "03", title: "견적 상세 분석서 전달", desc: "평수 및 방향별 가장 경제적인 단창/이중창 프레임 패키지 제안과 최종 월 렌탈 요금을 브리핑합니다." }
              ].map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <span className="text-lg md:text-2xl font-bold text-[#916843] font-montserrat leading-none">{step.num}</span>
                  <div>
                    <h4 className="text-sm md:text-base font-extrabold text-[#322214] mb-1">{step.title}</h4>
                    <p className="text-xs md:text-sm text-[#666666] leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 mt-8 text-center text-xs md:text-sm font-bold text-[#D97706]">
              “견적과 제안을 받아보신 뒤 계약 여부를 부담 없이 천천히 결정하셔도 됩니다.”
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 13섹션. 한정 혜택 */}
      {/* ──────────────────────────────────────────────────────── */}
      <section id="special-offers" className="bg-[#322214] text-white py-20 md:py-32">
        <div className="max-w-[1200px] mx-auto px-5 md:px-0">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs md:text-sm font-bold text-[#D97706] tracking-widest font-outfit uppercase">Exclusive Customer Events</span>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-[1.4] font-title">이번 달 실측 신청 고객 한정 <strong className="font-black font-title" style={{ background: 'linear-gradient(to top, rgba(255, 230, 0, 0.4) 40%, transparent 40%)' }}>4대 혜택</strong></h2>
            <p className="text-sm md:text-base text-white/70 tracking-tight">지금 상담 신청을 남겨 주시는 렌탈 고객님께 증정하는 본사 스페셜 프로모션입니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
            {[
              { num: "01", title: "더블 로이유리 무료 업그레이드", desc: "일반 복층유리 가격 기준으로 초고단열 26mm 더블 로이유리를 무상 시공해 드립니다. (150만원 상당 혜택)", img: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783926973/bcd69880-779b-4648-bcf1-3b48cc0117fc.png" },
              { num: "02", title: "프리미엄 기어 핸들 교체", desc: "닫는 즉시 자동 잠금 잠금 기능이 내장된 고품격 메탈릭 잠금 핸들을 외창 전구간에 적용합니다.", img: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783927015/02d0c2ef-bdaf-40e1-b3ea-b8187703127e.png" },
              { num: "03", title: "철거/수거 폐기물 수수료 면제", desc: "공사 완료 후 수거되는 수백 킬로그램의 무거운 폐샷시 철거 및 폐기 수수료를 본사가 전액 면제합니다.", img: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783927786/1da56507-79f1-4b9f-a5bf-884f3691d015.png" },
              { num: "04", title: "고밀도 알루미늄 방충망 포함", desc: "여름철 모기 및 유해 해충 침입을 촘촘히 억제하는 고강도 정품 알루미늄 방충망을 전 구간 무상 연결합니다.", img: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783927033/3e382d7e-d130-433e-8b35-4dec423f34e4.png" }
            ].map((offer, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#D97706] hover:-translate-y-2 hover:shadow-xl transition-all duration-500 flex flex-col group">
                {/* 이미지 영역 - 찌그러짐 방지 적용 */}
                <div className="w-full aspect-[16/10] overflow-hidden bg-white/10 relative">
                  <img 
                    src={offer.img} 
                    alt={offer.title} 
                    className="force-cover transition-transform duration-700 group-hover:scale-108"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                  {/* 숫자 뱃지 이미지 오버레이 */}
                  <span className="absolute top-3 left-3 w-8 h-8 rounded-full border border-[#D97706] text-white flex items-center justify-center font-bold text-xs font-montserrat bg-[#322214]/80 backdrop-blur-xs">
                    {offer.num}
                  </span>
                </div>
                {/* 텍스트 영역 */}
                <div className="p-6 flex-1 flex flex-col justify-between text-left">
                  <div>
                    <h3 className="text-base font-extrabold text-white mb-2.5 leading-snug">{offer.title}</h3>
                    <p className="text-xs text-white/70 leading-relaxed font-light">{offer.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button onClick={() => setShowConsultModal(true)} className="px-8 h-14 bg-[#D97706] hover:bg-[#E06C0F] text-white font-bold text-base rounded-full shadow-lg transition-all">
              한정 프로모션 혜택 적용 실측 예약
            </button>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 14섹션. FAQ */}
      {/* ──────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 md:py-32 bg-white">
        <div className="max-w-[1200px] mx-auto px-5 md:px-0 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* 좌측 설명 가이드 */}
          <div className="md:col-span-4 text-left flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#916843] tracking-widest font-outfit uppercase">Faq</span>
              <h2 className="text-2xl md:text-3xl font-black text-[#322214] tracking-tight leading-[1.4] font-title">자주 묻는 질문</h2>
              <p className="text-sm text-[#666666] leading-relaxed tracking-tight">KCC 홈씨씨 창호 렌탈서비스에 관해 고객님들이 가장 궁금해하시는 핵심 질의를 모았습니다.</p>
            </div>
            
            <div className="bg-[#F7F5F0] rounded-2xl p-6 border mt-8 md:mt-0 text-left">
              <h5 className="font-extrabold text-[#322214] text-sm mb-1.5">상담이 추가로 필요하신가요?</h5>
              <p className="text-xs text-[#666666] mb-4">본사 해피콜 직영 대표번호로 전화 주시면 친절하게 설명 드리겠습니다.</p>
              <a href="tel:1588-0000" className="flex items-center justify-center gap-1.5 w-full h-11 bg-[#322214] text-white font-bold text-xs rounded-xl shadow-md">
                <Clock className="w-3.5 h-3.5" />
                대표 전화: 1588-0000
              </a>
            </div>
          </div>

          {/* 우측 질문 아코디언 */}
          <div className="md:col-span-8 space-y-3.5 text-left w-full">
            {[
              { cat: "렌탈 조건", q: "창호 렌탈은 어떤 신청 자격 조건이 있어야 하나요?", a: "기본적으로 계약자 본인 명의의 자가(소유 아파트 또는 빌라, 단독주택) 소유주이신 고객님이라면 신용 등급에 중대한 결격 사유가 없는 한 무난하게 신청 가능합니다. 임차인의 경우 소유주의 명확한 서면 동의 및 연대 처리를 통해서 승인될 수 있습니다." },
              { cat: "월 납입금", q: "정말 시공 첫 달에 내는 계약금이나 초기 설치비용이 아예 없나요?", a: "네, 맞습니다. 창호 렌탈서비스는 초기 공사 자금(철거비, 유리가격, 설치인건비)이 전액 0원으로 책정됩니다. 총 시공 금액은 선택하신 36~60개월의 약정 기간 동안 분할하여 월별로 다음 달부터 이체 청구되기 시작합니다." },
              { cat: "시공", q: "현재 살고 있는 살림집인데 시공 시 먼지와 샷시 소음이 심하지 않나요?", a: "거주 중인 자택 전문 KCC 시공 엔지니어들이 투입되므로, 가구와 바닥에 스크래치 및 방진 방울 비닐 보양막 시트를 꼼꼼히 설치 후 공사를 엽니다. 아울러 하루 완공 시스템이므로 하루만 비워 주시면 깨끗하게 완공 및 최종 흡입 마무리 청소 후 인계해 드립니다." },
              { cat: "A/S", q: "13년 품질 보증 범위는 어떤 부품들이 무상에 들어가나요?", a: "본사가 정식 생산·출고한 정품 샷시의 내부 플라스틱 변형 및 휨 현상, 복층 유리 은 코팅 가스 증착 공간 사이 습기 맺힘(결로 불량) 등 핵심 자재 기능적 불량에 한해 13년간 무상 조치를 해드립니다. 단순 유리 파손 등 과실에 의한 손상은 제외됩니다." },
              { cat: "중도 해지", q: "렌탈 도중 주택 매매로 이사를 가게 되면 계약 해지는 어떻게 되나요?", a: "중도 계약 조기 해지 시에는 잔여 월 렌탈료 총합에서 선납 할인율을 차감 적용한 약정 잔여 납입 원금이 일시 상환 청구됩니다. 또는 새로 입주하시는 주택 매수인 분께 당사 승인을 거쳐 렌탈 명의 승계 처리를 연계하여 매달 인계받는 구조도 지원합니다." }
            ].map((faq, idx) => (
              <div key={idx} className="bg-[#F7F5F0] rounded-xl border border-gray-200/50 overflow-hidden transition-all">
                <div 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)} 
                  className="p-5 flex items-center gap-3 cursor-pointer hover:bg-gray-100/30"
                >
                  <span className="bg-[#916843]/10 text-[#916843] text-[10px] font-bold px-2 py-0.5 rounded shrink-0">{faq.cat}</span>
                  <h4 className="font-extrabold text-sm md:text-base text-[#322214] flex-grow tracking-tight leading-snug">{faq.q}</h4>
                  <ChevronDown className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${activeFaq === idx ? 'transform rotate-180' : ''}`} />
                </div>
                <div className={`transition-all duration-300 overflow-hidden ${activeFaq === idx ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="px-5 pb-5 text-xs md:text-sm text-[#666666] leading-relaxed border-t border-gray-200/40 pt-3">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    {/* ──────────────────────────────────────────────────────── */}
    {/* 15섹션. 최종 상담 신청 */}
    {/* ──────────────────────────────────────────────────────── */}
    <section id="consulting" className="bg-[#F7F5F0] py-20 md:py-32 border-t border-gray-200/40">
      <div className="max-w-[1200px] mx-auto px-5 md:px-0 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-stretch">
        
        {/* 좌측 상담 신청 폼 */}
        <div className="md:col-span-7 bg-white rounded-[24px] p-6 md:p-12 text-left shadow-xl border border-gray-100">
          <span className="text-xs font-bold text-[#D97706] tracking-widest font-outfit uppercase">Consultation Application</span>
          <h3 className="text-xl md:text-3xl font-black text-[#322214] mt-1 mb-2 tracking-tight leading-[1.4] font-title">무료 방문 실측 및 렌탈비용 문의</h3>
          <p className="text-xs md:text-sm text-[#666666] mb-8">정보를 남겨 주시면 전담 마스터가 유선 전화 연락 후 약정 상담을 조율합니다.</p>

          <form onSubmit={handleConsultSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-700">고객 성함 <span className="text-[#D97706]">*</span></label>
                <input 
                  type="text" 
                  placeholder="성함을 입력해 주세요." 
                  className="h-12 px-4 rounded-lg bg-[#F7F5F0] border border-gray-200 outline-none focus:border-[#916843] focus:ring-2 focus:ring-[#916843]/15 text-sm font-semibold text-[#222222]" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-700">연락처 <span className="text-[#D97706]">*</span></label>
                <input 
                  type="tel" 
                  placeholder="연락처를 입력해 주세요. (숫자만)" 
                  className="h-12 px-4 rounded-lg bg-[#F7F5F0] border border-gray-200 outline-none focus:border-[#916843] focus:ring-2 focus:ring-[#916843]/15 text-sm font-semibold text-[#222222]" 
                  required 
                  inputMode="numeric" 
                  value={contact} 
                  onChange={handleAutoHyphen} 
                  maxLength={13} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-700">설치 지역 (시/도) <span className="text-[#D97706]">*</span></label>
                <select 
                  className="h-12 px-4 rounded-lg bg-[#F7F5F0] border border-gray-200 outline-none focus:border-[#916843] text-sm font-semibold text-[#222222] cursor-pointer" 
                  required 
                  value={selectedSido} 
                  onChange={handleSidoChange}
                >
                  <option value="">시/도 선택</option>
                  {Object.keys(koreaDistrictData).map((sido) => (
                    <option key={sido} value={sido}>{sido}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-700">설치 지역 (구/군) <span className="text-[#D97706]">*</span></label>
                <select 
                  className="h-12 px-4 rounded-lg bg-[#F7F5F0] border border-gray-200 outline-none focus:border-[#916843] text-sm font-semibold text-[#222222] cursor-pointer" 
                  required 
                  value={selectedGungu} 
                  onChange={(e) => setSelectedGungu(e.target.value)} 
                  disabled={!selectedSido}
                >
                  <option value="">구/군 선택</option>
                  {selectedSido && koreaDistrictData[selectedSido].map((gungu) => (
                    <option key={gungu} value={gungu}>{gungu}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-700">아파트명 (선택)</label>
                <input 
                  type="text" 
                  placeholder="예: 홈씨씨아파트" 
                  className="h-12 px-4 rounded-lg bg-[#F7F5F0] border border-gray-200 outline-none focus:border-[#916843] focus:ring-2 focus:ring-[#916843]/15 text-sm font-semibold text-[#222222]" 
                  value={aptName}
                  onChange={(e) => setAptName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-700">평수 선택 <span className="text-[#D97706]">*</span></label>
                <select 
                  className="h-12 px-4 rounded-lg bg-[#F7F5F0] border border-gray-200 outline-none focus:border-[#916843] text-sm font-semibold text-[#222222] cursor-pointer" 
                  required 
                  value={pyeong} 
                  onChange={(e) => setPyeong(e.target.value)}
                >
                  <option value="">평형 선택</option>
                  <option value="20">20평형 미만</option>
                  <option value="24">20~24평형</option>
                  <option value="30">25~29평형</option>
                  <option value="34">30~34평형</option>
                  <option value="40">35~39평형</option>
                  <option value="44">40~44평형</option>
                  <option value="48">45~49평형</option>
                  <option value="50">50평형 이상</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mt-1 rounded border-gray-300 text-[#916843] focus:ring-0 cursor-pointer" 
                  required 
                  checked={isAgreed} 
                  onChange={(e) => setIsAgreed(e.target.checked)} 
                />
                <span className="text-xs text-[#666666] font-medium leading-normal">
                  [필수] 개인정보 수집 및 이용에 동의합니다. 제공받은 개인정보는 무료 실측 및 견적 조율 전화 상담 목적으로만 안전하게 보관/활용 후 즉시 파기됩니다.
                </span>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-14 md:h-[60px] bg-[#D97706] hover:bg-[#E06C0F] disabled:bg-gray-400 text-white font-bold text-base rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
              무료 실측 신청하고 월 납입금 확인하기
            </button>
          </form>
        </div>

        {/* 우측 밝은 거실 이미지 */}
        <div className="md:col-span-5 flex flex-col justify-between rounded-[24px] overflow-hidden shadow-xl border border-gray-100 bg-[#322214] text-white">
          <div className="w-full flex-grow relative min-h-[240px] overflow-hidden">
            <img 
              src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1783928867/ceb98cdb-26ed-4527-99ef-cde0148bd930.png" 
              alt="샷시 공사 마감된 고급 거실 인테리어" 
              className="force-cover absolute inset-0 w-full h-full"
              style={{ objectFit: 'cover' }}
              loading="lazy"
            />
          </div>
          <div className="p-8 md:p-10 text-left space-y-3">
            <h4 className="text-lg md:text-xl font-black leading-tight">상상 속 품격 있는 인테리어,<br />내일부터 현실이 됩니다.</h4>
            <p className="text-xs md:text-sm text-white/70 leading-relaxed">
              본사 공인 실측 마스터 배정은 전액 무료로 가동되며, 실측 확인 뒤 편하게 계약 여부를 보류하실 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* ──────────────────────────────────────────────────────── */}
    {/* 하단 푸터 */}
    {/* ──────────────────────────────────────────────────────── */}
    <footer className="bg-[#171E29] text-white/45 py-12 md:py-16 pb-28 md:pb-16 text-xs text-left border-t border-white/5">
      <div className="max-w-[1200px] mx-auto px-5 md:px-0 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-24 md:h-8 md:w-32 opacity-80">
              <Image
                src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/e840c9a46f66a.png"
                alt="KCC HomeCC Logo"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
          <span className="text-sm font-medium text-white/70">본사 상담 대표 센터: <strong>1588-0000</strong> (평일 09:00 ~ 18:00)</span>
        </div>
        <hr className="border-white/5" />
        <div className="flex flex-col gap-3">
          <p className="leading-relaxed">
            (주)KCC 홈씨씨 창호 | 대표이사: 홍길동 | 서울특별시 서초구 사평대로 344<br />
            사업자등록번호: 000-00-00000 | 통신판매업신고번호: 제 2026-서울서초-0000호 | 개인정보관리자: 김철수 (privacy@kcc.co.kr)
          </p>
          <p className="text-[10px] text-white/20">
            &copy; 2026 KCC Homecc Window. All Rights Reserved. 본 화면상의 예시 이미지 규격 및 견적 조건 등은 기획 디자인용 플레이스홀더 데이터입니다.
          </p>
        </div>
      </div>
    </footer>

    {/* ──────────────────────────────────────────────────────── */}
    {/* 모바일 하단 고정 바 */}
    {/* ──────────────────────────────────────────────────────── */}
    <div className="fixed bottom-0 left-0 w-full h-[64px] bg-white border-t border-gray-150 flex md:hidden z-[90] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <a href="tel:1588-0000" className="w-[35%] h-full bg-[#F7F5F0] text-[#322214] font-bold text-xs flex flex-col items-center justify-center gap-1">
        <Clock className="w-4 h-4" />
        전화 상담
      </a>
      <button onClick={() => setShowConsultModal(true)} className="w-[65%] h-full bg-[#D97706] hover:bg-[#E06C0F] text-white font-bold text-base shadow-inner">
        무료 실측 신청
      </button>
    </div>

    {/* ──────────────────────────────────────────────────────── */}
    {/* 기존 파트너 혜택 모달 (기능 유지) */}
    {/* ──────────────────────────────────────────────────────── */}
    {showBenefitModal && (
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowBenefitModal(false)}></div>
        <div className="bg-white rounded-[24px] w-full max-w-md relative z-10 overflow-hidden shadow-2xl border border-gray-100 p-6 md:p-8 animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-black text-[#322214]">{partnerDataForBenefit ? `${partnerDataForBenefit['업체명']} 회원 혜택` : '회원 특별 혜택'}</h4>
            <button onClick={() => setShowBenefitModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
          </div>
          <div className="bg-[#F7F5F0] rounded-xl p-5 border border-gray-200/50 mb-6 text-left">
            <p className="text-xs md:text-sm font-semibold text-[#222222] leading-relaxed break-keep">
              {partnerDataForBenefit ? partnerDataForBenefit['특별혜택'] : "로딩 중..."}
            </p>
          </div>
          <button onClick={() => { setShowBenefitModal(false); setShowConsultModal(true); }} className="w-full h-12 bg-[#916843] hover:bg-[#322214] text-white font-bold text-sm rounded-xl transition-all shadow-md">
            혜택 적용하고 무료 실측 받기
          </button>
        </div>
      </div>
    )}

    {/* ──────────────────────────────────────────────────────── */}
    {/* 기존 상담 신청 모달 (기능 유지) */}
    {/* ──────────────────────────────────────────────────────── */}
    {showConsultModal && (
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowConsultModal(false)}></div>
        <div className="bg-white rounded-[24px] w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
          
          {/* Modal Header */}
          <div className="p-6 md:p-8 border-b border-gray-100 bg-[#F7F5F0] flex justify-between items-center shrink-0 text-left">
            <div>
              <h3 className="text-lg md:text-xl font-black text-[#322214]">KCC홈씨씨 창호 무료 실측 상담</h3>
              <p className="text-xs font-bold text-[#666666] mt-1">상담을 예약하시면 전문가가 1:1 방문하여 창문을 측정합니다.</p>
            </div>
            <button onClick={() => setShowConsultModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-left">
            <div className="flex p-1 bg-gray-100 rounded-xl">
              <button 
                type="button" 
                onClick={() => setConsultType('quick')} 
                className={`flex-grow py-3 text-center text-xs font-black rounded-lg transition-colors ${consultType === 'quick' ? 'bg-[#322214] text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
              >
                간편 지역 상담
              </button>
              <button 
                type="button" 
                onClick={() => setConsultType('accurate')} 
                className={`flex-grow py-3 text-center text-xs font-black rounded-lg transition-colors ${consultType === 'accurate' ? 'bg-[#322214] text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
              >
                상세 주소 실측 신청
              </button>
            </div>

            <form id="consult-modal-form" onSubmit={handleConsultSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700">이름</label>
                  <input type="text" placeholder="예: 홍길동" className="h-12 px-4 rounded-lg bg-[#F7F5F0] border border-gray-200 outline-none focus:border-[#916843] focus:ring-2 focus:ring-[#916843]/15 text-sm font-semibold text-[#222222]" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700">연락처</label>
                  <input type="tel" placeholder="010-1234-5678" className="h-12 px-4 rounded-lg bg-[#F7F5F0] border border-gray-200 outline-none focus:border-[#916843] focus:ring-2 focus:ring-[#916843]/15 text-sm font-semibold text-[#222222]" required value={contact} onChange={handleAutoHyphen} maxLength={13} />
                </div>
              </div>

              {consultType === 'quick' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">시도 선택</label>
                    <select className="h-12 px-4 rounded-lg bg-[#F7F5F0] border border-gray-200 outline-none focus:border-[#916843] text-sm font-semibold text-[#222222] cursor-pointer" required value={selectedSido} onChange={handleSidoChange}>
                      <option value="">시/도 선택</option>
                      {Object.keys(koreaDistrictData).map((sido) => (
                        <option key={sido} value={sido}>{sido}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">구군 선택</label>
                    <select className="h-12 px-4 rounded-lg bg-[#F7F5F0] border border-gray-200 outline-none focus:border-[#916843] text-sm font-semibold text-[#222222] cursor-pointer" required value={selectedGungu} onChange={(e) => setSelectedGungu(e.target.value)} disabled={!selectedSido}>
                      <option value="">구/군 선택</option>
                      {selectedSido && koreaDistrictData[selectedSido].map((gungu) => (
                        <option key={gungu} value={gungu}>{gungu}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">설치 주소</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="주소 찾기를 통해 검색해 주세요." className="flex-grow h-12 px-4 rounded-lg bg-[#F7F5F0] border border-gray-200 outline-none text-sm font-semibold text-[#222222]" readOnly required value={address} />
                      <button type="button" onClick={() => setShowAddressModal(true)} className="px-5 bg-[#322214] text-white font-bold text-xs rounded-lg hover:bg-[#916843] transition-colors shrink-0">주소 찾기</button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">상세 주소</label>
                    <input type="text" placeholder="동·호수 등 상세 주소 입력" className="h-12 px-4 rounded-lg bg-[#F7F5F0] border border-gray-200 outline-none focus:border-[#916843] focus:ring-2 focus:ring-[#916843]/15 text-sm font-semibold text-[#222222]" value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} />
                  </div>
                </div>
              )}

              {/* 추가 옵션 */}
              <div className="bg-[#F7F5F0] rounded-xl p-5 border border-gray-200/50 space-y-4">
                <h4 className="text-xs font-bold text-[#322214] border-b border-gray-200 pb-2">추가 정보 입력 (선택)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 font-bold">평형</label>
                    <select className="h-10 px-3 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-[#222222] cursor-pointer" value={pyeong} onChange={(e) => setPyeong(e.target.value)}>
                      <option value="">평형 선택</option>
                      <option value="20">20평형대</option>
                      <option value="24">24평형대</option>
                      <option value="30">30평형대</option>
                      <option value="34">34평형대</option>
                      <option value="40">40평형대</option>
                      <option value="50">50평형대 이상</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 font-bold">베란다 확장</label>
                    <select className="h-10 px-3 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-[#222222] cursor-pointer" value={expansion} onChange={(e) => setExpansion(e.target.value)}>
                      <option value="">확장 여부</option>
                      <option value="전체확장">전체 확장</option>
                      <option value="부분확장">부분 확장</option>
                      <option value="비확장">비확장</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 font-bold">거주 여부</label>
                    <select className="h-10 px-3 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-[#222222] cursor-pointer" value={residence} onChange={(e) => setResidence(e.target.value)}>
                      <option value="">주거 유무</option>
                      <option value="거주중">현재 거주 중</option>
                      <option value="공실">이사 예정 (공실)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 font-bold">희망 실측일</label>
                    <input type="date" className="h-10 px-3 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-500 outline-none" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 font-bold">문의 사항</label>
                    <input type="text" placeholder="예: 오전 실측 원함" className="h-10 px-3 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-[#222222] outline-none" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* 약관 동의 */}
              <div className="pt-2 border-t border-gray-150">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" className="mt-1 rounded border-gray-300 text-[#916843] focus:ring-0 cursor-pointer" required checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} />
                  <span className="text-[11px] text-[#666666] leading-normal font-medium">
                    [필수] 개인정보 수집 및 이용약관 동의. 수집하는 개인정보 항목은 이름, 연락처, 거주 정보이며 예약 실측 이외의 어떠한 다른 목적으로 활용되지 않고 종결 후 파기됩니다.
                  </span>
                </label>
              </div>
            </form>
          </div>

          {/* Modal Footer */}
          <div className="p-6 md:p-8 border-t border-gray-100 bg-[#F7F5F0] flex gap-3 shrink-0">
            <button type="button" onClick={() => setShowConsultModal(false)} className="flex-1 h-12 border border-gray-200 bg-white rounded-xl text-xs md:text-sm font-bold text-[#666666] hover:bg-gray-50 transition-colors">취소</button>
            <button type="submit" form="consult-modal-form" disabled={isSubmitting} className="flex-[2] h-12 bg-[#322214] text-white font-bold text-xs md:text-sm rounded-xl hover:bg-[#916843] transition-colors flex items-center justify-center gap-1.5 shadow-md disabled:bg-gray-400">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              무료 실측 상담 신청 완료
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Daum 주소 검색 모달 */}
    {showAddressModal && (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddressModal(false)}></div>
        <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 overflow-hidden shadow-2xl text-gray-900 border border-gray-150">
          <div className="p-5 border-b flex justify-between items-center bg-gray-55">
            <span className="text-base font-black text-gray-800">설치 주소 검색</span>
            <button onClick={() => setShowAddressModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={18} className="text-gray-500" /></button>
          </div>
          <div className="h-[450px]">
            <DaumPostcode onComplete={handleAddressComplete} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </div>
    )}
  </div>
);
}
