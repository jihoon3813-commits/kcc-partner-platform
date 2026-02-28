'use client';

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { Calculator, CheckCircle, Calendar, Phone, MapPin, Search } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";

function EstimateContent() {
    const searchParams = useSearchParams();
    const name = searchParams.get('n');
    const phone = searchParams.get('p');
    const type = searchParams.get('t');

    // Fetch estimate
    const estimate = useQuery(api.estimates.getPublicEstimate,
        (name && phone && type) ? { n: name, p: phone, t: type } : "skip"
    );

    const formatKrw = (val: number | undefined) => {
        if (typeof val !== 'number') return '0원';
        return val.toLocaleString() + '원';
    };

    // Calculate fixed package upfront
    const calcFixedPackage = (loan: number) => {
        if (!estimate) return '해당없음';
        const upfront = (estimate.finalBenefit || 0) - loan;
        return upfront >= 0 ? formatKrw(upfront) : '해당없음';
    };

    if (!name || !phone || !type) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <Search size={48} className="text-gray-300 mb-4" />
                <h1 className="text-2xl font-black text-gray-800 mb-2">잘못된 접근입니다.</h1>
                <p className="text-gray-500 font-bold text-center">정상적인 견적서 링크를 통해 접속해주세요.</p>
            </div>
        );
    }

    if (estimate === undefined) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 font-bold text-gray-500 text-sm">견적서를 불러오는 중입니다...</p>
            </div>
        );
    }

    if (estimate === null) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-black text-gray-800 mb-2">견적서를 찾을 수 없습니다.</h1>
                <p className="text-gray-500 font-bold">요청하신 정보와 일치하는 견적서가 없습니다.<br />담당자에게 문의해주세요.</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#f4f6f8] text-gray-900 pb-20 selection:bg-blue-100 font-sans">
            {/* Header */}
            <header className="bg-white px-6 py-5 shadow-sm sticky top-0 z-10">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="h-6 w-24 relative">
                        <Image
                            src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/5b115594e9a66.png"
                            alt="KCC HomeCC Logo"
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    </div>
                    <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">프리미엄 견적서</span>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 mt-8 space-y-6">

                {/* Greeting Section */}
                <div className="text-center mb-10">
                    <p className="text-blue-600 font-black mb-2 animate-pulse">KCC홈씨씨 윈도우 프리미엄 구독 서비스</p>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#122649] break-keep">
                        {estimate.customerName} 고객님을 위한<br />맞춤 견적서
                    </h1>
                </div>

                {/* Primary Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transform hover:-translate-y-1 transition-transform">
                        <div className="flex items-center gap-2 text-gray-400 font-black mb-4">
                            <Calculator size={18} />
                            최종 견적가
                        </div>
                        <p className="text-3xl font-bold text-gray-800 tracking-tighter line-through decoration-red-500/30 decoration-[3px]">
                            {formatKrw(estimate.finalQuote)}
                        </p>
                    </div>
                    <div className="bg-[#122649] p-6 rounded-2xl shadow-xl border-t border-blue-400 transform hover:-translate-y-1 transition-transform relative overflow-hidden">
                        <div className="absolute -right-6 -bottom-6 opacity-10">
                            <CheckCircle size={150} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-blue-200 font-black mb-3">
                                <CheckCircle size={18} className="text-blue-400" />
                                고객 부담금 (최종 혜택가)
                            </div>
                            <p className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                                {formatKrw(estimate.finalBenefit)}
                            </p>
                            {(estimate.extraDiscount > 0 || estimate.discountRate > 0) && (
                                <div className="mt-4 inline-block bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-blue-100">
                                    총 {formatKrw((estimate.finalQuote - estimate.finalBenefit))} 할인 혜택 적용!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <h3 className="text-lg font-black text-gray-800 border-b border-gray-100 pb-4">고객 정보</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                <Phone size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold mb-1">연락처</p>
                                <p className="font-bold text-gray-800">{estimate.customerPhone}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold mb-1">주소</p>
                                <p className="font-bold text-gray-800">{estimate.address}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold mb-1">견적일</p>
                                <p className="font-bold text-gray-800">{estimate.date}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rental Information */}
                <div>
                    <h3 className="text-xl font-black text-[#122649] mb-4 mt-10">렌탈구독 월 납입금 (일반형)</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <p className="text-xs font-black text-gray-400 mb-2">24개월</p>
                            <p className="font-black text-gray-800">{estimate.subs?.sub24?.toLocaleString()}원</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <p className="text-xs font-black text-gray-400 mb-2">36개월</p>
                            <p className="font-black text-gray-800">{estimate.subs?.sub36?.toLocaleString()}원</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <p className="text-xs font-black text-gray-400 mb-2">48개월</p>
                            <p className="font-black text-gray-800">{estimate.subs?.sub48?.toLocaleString()}원</p>
                        </div>
                        <div className="bg-[#b89558] text-white p-5 rounded-2xl shadow-md border border-[#a68449] text-center transform scale-105 relative z-10">
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black whitespace-nowrap">BEST 추천</span>
                            <p className="text-xs font-black text-[#f1e6d4] mb-2">60개월</p>
                            <p className="font-black text-xl tracking-tighter">{estimate.subs?.sub60?.toLocaleString()}원</p>
                        </div>
                    </div>
                </div>

                {/* Fixed Subs Package */}
                <div>
                    <h3 className="text-xl font-black text-[#122649] mb-4 mt-10">60개월 렌탈 고정형 패키지</h3>
                    <p className="text-sm font-bold text-gray-500 mb-4">선납금을 내고 매월 정해진 금액만 납부하는 합리적인 패키지입니다.</p>
                    <div className="space-y-3">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                                <div>
                                    <p className="text-xs font-black text-gray-400">패키지 A</p>
                                    <p className="font-bold text-[#122649]">월 납입금 111,000원</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-gray-400">초기 선납금</p>
                                <p className="font-black text-lg text-blue-600">{calcFixedPackage(5000000)}</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-purple-500 rounded-full"></div>
                                <div>
                                    <p className="text-xs font-black text-gray-400">패키지 B</p>
                                    <p className="font-bold text-[#122649]">월 납입금 222,000원</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-gray-400">초기 선납금</p>
                                <p className="font-black text-lg text-purple-600">{calcFixedPackage(10000000)}</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-orange-500 rounded-full"></div>
                                <div>
                                    <p className="text-xs font-black text-gray-400">패키지 C</p>
                                    <p className="font-bold text-[#122649]">월 납입금 333,000원</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-gray-400">초기 선납금</p>
                                <p className="font-black text-lg text-orange-600">{calcFixedPackage(15000000)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Note */}
                {estimate.remark && (
                    <div className="bg-gray-100 p-6 rounded-2xl mt-8">
                        <p className="text-sm font-black text-gray-500 mb-2">담당자 안내사항</p>
                        <p className="text-sm font-bold text-gray-700 whitespace-pre-wrap">{estimate.remark}</p>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function PublicEstimatePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        }>
            <EstimateContent />
        </Suspense>
    );
}
