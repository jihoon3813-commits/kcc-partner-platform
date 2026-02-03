'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar, UserCheck, Building2, Wrench, Gauge,
  Timer, Home, ClipboardCheck, X, Search, Loader2
} from 'lucide-react';
import DaumPostcode from 'react-daum-postcode';

export default function LandingPage() {
  // Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Data State
  const [formData, setFormData] = useState({
    parentPartnerId: '',
    parentPartnerName: '',
    companyName: '',
    ceoName: '',
    contact: '',
    address: '',
    detailAddress: '',
    id: '',
    password: '',
    confirmPassword: '',
    businessNumber: '',
    accountNumber: '',
    email: '',
  });

  // Partner Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ 아이디: string; 업체명: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Handle Auto Hyphen for Phone
  const handleContactHyphen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    let formatted = raw;
    if (raw.length > 3 && raw.length <= 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    else if (raw.length > 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
    setFormData({ ...formData, contact: formatted });
  };

  // Handle Auto Hyphen for Business Number
  const handleBusinessNumberHyphen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    let formatted = raw;
    if (raw.length <= 3) formatted = raw;
    else if (raw.length <= 5) formatted = `${raw.slice(0, 3)}-${raw.slice(3, 5)}-${raw.slice(5, 10)}`;
    else if (raw.length <= 10) formatted = `${raw.slice(0, 3)}-${raw.slice(3, 5)}-${raw.slice(5, 10)}`;
    setFormData({ ...formData, businessNumber: formatted });
  };

  // Handle Address Complete
  const handleAddressComplete = (data: { address: string; addressType: string; bname: string; buildingName: string }) => {
    let fullAddress = data.address;
    if (data.addressType === 'R') {
      let extraAddress = '';
      if (data.bname !== '') extraAddress += data.bname;
      if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
      fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
    }
    setFormData({ ...formData, address: fullAddress });
    setShowAddressModal(false);
  };

  // Search Partners
  const searchPartners = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/data?action=read_partners&query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        // Backend returns all partners in 'data', so we filter here
        const allPartners = data.data || [];
        const filtered = allPartners.filter((p: any) =>
          p['업체명'] && p['업체명'].toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Real-time Search Effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      searchPartners(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Required fields check
    if (!formData.companyName || !formData.ceoName || !formData.contact || !formData.address || !formData.id || !formData.password) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/partners/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.companyName,
          ceoName: formData.ceoName,
          contact: formData.contact,
          address: `${formData.address} ${formData.detailAddress}`,
          id: formData.id,
          password: formData.password,
          businessNumber: formData.businessNumber,
          accountNumber: formData.accountNumber,
          email: formData.email,
          parentPartnerId: formData.parentPartnerId,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        alert('파트너 신청이 완료되었습니다! 검토 후 연락드리겠습니다.');
        setShowApplyModal(false);
        // Reset form
        setFormData({
          parentPartnerId: '',
          parentPartnerName: '',
          companyName: '',
          ceoName: '',
          contact: '',
          address: '',
          detailAddress: '',
          id: '',
          password: '',
          confirmPassword: '',
          businessNumber: '',
          accountNumber: '',
          email: '',
        });
      } else {
        alert(result.error || '신청 중 오류가 발생했습니다.');
      }
    } catch {
      alert('통신 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 selection:bg-blue-100 overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-20 flex items-center px-6 md:px-12 z-[100] transition-all bg-white/80 backdrop-blur-md border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-32 relative">
            <Image
              src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/5b115594e9a66.png"
              alt="KCC HomeCC Logo"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <span className="font-black text-xl tracking-tighter text-[#122649] border-l pl-2 border-gray-200">Partner</span>
        </Link>
        <div className="ml-auto flex gap-6 text-sm font-bold text-gray-500">
          <Link href="/products/onev" className="hover:text-[#122649]">상품페이지</Link>
          <Link href="/admin" className="hover:text-[#122649]">본사 Admin</Link>
          <Link href="/partner" className="hover:text-[#122649]">파트너 Admin</Link>
        </div>
      </header>

      {/* 1. Hero Section (Image 2) */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80"
            className="opacity-40 object-cover scale-105 animate-slow-zoom"
            alt="Hero Background"
            fill
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/50"></div>
        </div>
        <div className="container mx-auto px-8 md:px-20 relative z-10 text-center text-white mt-20">
          <div className="inline-block border border-white/30 bg-white/10 backdrop-blur-md px-8 py-3 rounded-full mb-12 animate-fade-in-up">
            <span className="text-blue-300 font-black tracking-widest uppercase">Premium Membership</span>
          </div>
          <h1 className="text-5xl lg:text-9xl font-black mb-8 tracking-tighter leading-none">
            <span className="block text-gray-400 text-3xl md:text-5xl mb-4 font-light tracking-normal opacity-80">목돈 깨지 마세요!</span>
            KCC홈씨씨<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600"><br></br>윈도우ONE</span><br />
            <span className="text-white text-7xl md:text-9xl">구독 서비스</span>
          </h1>
          <p className="text-xl md:text-3xl font-medium mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed">
            대한민국 창호의 기준, <span className="text-white font-bold underline decoration-blue-500 underline-offset-8">13년 품질보증</span>으로<br />당신의 일상을 완벽하게 바꿉니다.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-12 py-6 bg-white text-black font-black text-xl rounded-full hover:scale-105 transition-all shadow-xl"
            >
              파트너 신청하기
            </button>
          </div>
        </div>
      </section>

      {/* 2. Subscription Benefits Section (Image 3) */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-5 lg:px-24 max-w-4xl text-center">
          <div className="inline-block px-8 py-3 bg-white border-2 border-orange-200 text-orange-600 rounded-full text-lg font-black tracking-tight mb-12 shadow-sm animate-fade-in">
            난방비·소음·결로 샷시 하나로 끝!
          </div>
          <div className="mb-16">
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight tracking-tighter">
              <span className="relative inline-block">
                60개월
                <span className="absolute -bottom-2 left-0 w-full h-3 bg-blue-600/20 -z-10 rotate-1"></span>
              </span> 창호구독<br />
              <span className="text-gray-900">초특가 패키지</span>
            </h2>
          </div>
          <div className="relative inline-block mb-24 min-w-[320px]">
            <div className="bg-[#122649] text-white px-12 py-5 rounded-xl text-2xl font-black relative z-10 shadow-2xl skew-x-[-10deg]">
              <div className="skew-x-[10deg]">홈씨씨 윈도우 6가지 특전</div>
            </div>
            <div className="absolute -left-3 bottom-[-10px] w-6 h-6 bg-[#0a162b] rotate-45 -z-10"></div>
            <div className="absolute -right-3 bottom-[-10px] w-6 h-6 bg-[#0a162b] rotate-45 -z-10"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Calendar className="w-10 h-10" />, title: "60개월 구독 혜택", desc: "월 11만원대 (21평 기준)", badge: "금융형 구독" },
              { icon: <UserCheck className="w-10 h-10" />, title: "전문가 직접 시공", desc: "균일한 시공 품질 및 본사 관리", badge: "직영 시공" },
              { icon: <Building2 className="w-10 h-10" />, title: "본사 제작 완성창", desc: "KCC가 직접 제작/공급하는 정품", badge: "정품 보증" },
              { icon: <Wrench className="w-10 h-10" />, title: "1Day 프리미엄 시공", desc: "거주 중에도 하루 만에 교체 완료", badge: "당일 공사" },
              { icon: <Gauge className="w-10 h-10" />, title: "에너지 효율 1등급", desc: "냉난방비 절감에 최적화된 창호", badge: "고성능" },
              { icon: <Timer className="w-10 h-10" />, title: "13년 최장 품질보증", desc: "업계 최장 기간 안심 AS 제공", badge: "롱라이프" },
            ].map((item, i) => (
              <div key={i} className="group relative bg-gray-100 p-6 md:p-8 rounded-[35px] border-2 border-transparent hover:border-blue-500/30 hover:bg-white hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-all duration-500 text-left flex flex-row md:flex-col items-center md:items-start h-full cursor-default gap-4 md:gap-0">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-500 shrink-0 text-blue-600 group-hover:text-white md:mb-6">
                  {item.icon}
                </div>
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Free Consultation Section (Image 4) */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-5 lg:px-24 max-w-4xl flex flex-col items-center">
          <div className="relative bg-[#122649] text-white p-12 md:p-16 rounded-[40px] text-center mb-16 shadow-2xl w-full">
            <h3 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter italic">
              &apos;실측/상담 0원&apos;
            </h3>
            <p className="text-xl md:text-2xl font-bold opacity-90">
              부담없이 실측 받아보고<br />결정하세요
            </p>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#122649] rotate-45"></div>
          </div>
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

      {/* Partner Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !isSubmitting && setShowApplyModal(false)}></div>
          <div className="bg-white rounded-[40px] w-full max-w-4xl relative z-10 overflow-hidden shadow-3xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="bg-[#122649] p-8 text-white relative shrink-0">
              <button
                onClick={() => setShowApplyModal(false)}
                className="absolute top-6 right-6 hover:rotate-90 transition-transform"
                disabled={isSubmitting}
              >
                <X size={32} />
              </button>
              <h2 className="text-3xl font-black tracking-tight">KCC 홈씨씨 파트너 등록 신청</h2>
              <p className="text-blue-200 mt-2 font-bold">성공적인 비즈니스를 위한 파트너십을 시작하세요.</p>
            </div>
            <div className="p-8 overflow-y-auto no-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. 상위 파트너 검색 */}
                <div className="bg-gray-50 p-6 rounded-3xl">
                  <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-4">상위 파트너 검색</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="상위 파트너 검색"
                        className="w-full py-4 pr-4 pl-16 bg-white border border-gray-200 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:font-normal placeholder:text-gray-400"
                      />
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                    <button
                      type="button"
                      onClick={() => searchPartners(searchQuery)}
                      disabled={isSearching}
                      className="px-8 bg-[#122649] text-white font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center"
                    >
                      {isSearching ? <Loader2 className="animate-spin" /> : '조회'}
                    </button>
                  </div>
                  {showSearchResults && (
                    <div className="mt-4 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg animate-in fade-in slide-in-from-top-2">
                      {searchResults.length > 0 ? (
                        searchResults.map((p) => (
                          <div
                            key={p['아이디']}
                            onClick={() => {
                              setFormData({ ...formData, parentPartnerId: p['아이디'], parentPartnerName: p['업체명'] });
                              setShowSearchResults(false);
                              setSearchQuery(p['업체명']);
                            }}
                            className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors border-b last:border-b-0"
                          >
                            <span className="font-bold">{p['업체명']}</span>
                            <span className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded-full">{p['아이디']}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-400 font-bold">검색 결과가 없습니다.</div>
                      )}
                    </div>
                  )}
                  {formData.parentPartnerName && (
                    <div className="mt-3 flex items-center gap-2 text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 w-fit">
                      <UserCheck size={18} />
                      선택된 상위 파트너: {formData.parentPartnerName}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, parentPartnerId: '', parentPartnerName: '' });
                          setSearchQuery('');
                        }}
                        className="ml-2 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 필수 항목 */}
                  <div>
                    <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">업체명 <span className="text-red-500">*</span></label>
                    <input
                      type="text" required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="업체명 입력"
                      className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-blue-500/20 transition-all placeholder:font-normal placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">대표자명 <span className="text-red-500">*</span></label>
                    <input
                      type="text" required
                      value={formData.ceoName}
                      onChange={(e) => setFormData({ ...formData, ceoName: e.target.value })}
                      placeholder="대표자명 입력"
                      className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-blue-500/20 transition-all placeholder:font-normal placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">연락처 <span className="text-red-500">*</span></label>
                    <input
                      type="tel" required
                      inputMode="numeric"
                      value={formData.contact}
                      onChange={handleContactHyphen}
                      placeholder="010-0000-0000"
                      className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-blue-500/20 transition-all placeholder:font-normal placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">아이디 <span className="text-red-500">*</span></label>
                    <input
                      type="text" required
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      placeholder="사용할 아이디 입력"
                      className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-blue-500/20 transition-all placeholder:font-normal placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">비밀번호 <span className="text-red-500">*</span></label>
                    <input
                      type="password" required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="비밀번호 입력"
                      className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-blue-500/20 transition-all placeholder:font-normal placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">비밀번호 확인 <span className="text-red-500">*</span></label>
                    <input
                      type="password" required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="비밀번호 다시 입력"
                      className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-blue-500/20 transition-all placeholder:font-normal placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* 주소 (필수) */}
                <div>
                  <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">주소 <span className="text-red-500">*</span></label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text" readOnly required
                      value={formData.address}
                      placeholder="도로명 주소 검색"
                      className="flex-1 p-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none cursor-not-allowed placeholder:font-normal placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(true)}
                      className="px-6 bg-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-300 transition-all"
                    >
                      검색
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.detailAddress}
                    onChange={(e) => setFormData({ ...formData, detailAddress: e.target.value })}
                    placeholder="상세 주소 입력"
                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-blue-500/20 transition-all placeholder:font-normal placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 선택 항목 */}
                  <div>
                    <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">사업자번호 (선택)</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={formData.businessNumber}
                      onChange={handleBusinessNumberHyphen}
                      placeholder="000-00-00000"
                      className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-blue-500/20 transition-all placeholder:font-normal placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">계좌번호 (선택)</label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="은행명 계좌번호"
                      className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-blue-500/20 transition-all placeholder:font-normal placeholder:text-gray-400"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">이메일 (선택)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@email.com"
                      className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-blue-500/20 transition-all placeholder:font-normal placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-6 bg-[#122649] text-white text-2xl font-black rounded-[30px] shadow-2xl hover:translate-y-[-4px] active:translate-y-0 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? '신청 처리 중...' : '파트너 신청완료'}
                </button>
              </form>
            </div>
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

      {/* Global Animations Style */}
      <style jsx global>{`
        @keyframes slowZoom {
          0% { transform: scale(1.05); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1.05); }
        }
        .animate-slow-zoom {
          animation: slowZoom 30s ease-in-out infinite;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}
