import { X, ExternalLink, Download } from 'lucide-react';
import React from 'react';

interface EstimateDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    estimate: any;
}

export default function EstimateDetailModal({ isOpen, onClose, estimate }: EstimateDetailModalProps) {
    if (!isOpen || !estimate) return null;

    const formatKrw = (val: number | undefined) => {
        if (typeof val !== 'number') return '0원';
        return val.toLocaleString() + '원';
    };

    const publicUrl = `${window.location.origin}/estimate?n=${encodeURIComponent(estimate.customerName)}&p=${encodeURIComponent(estimate.customerPhone)}&t=${encodeURIComponent(estimate.statusType)}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(publicUrl);
        alert('견적서 링크가 복사되었습니다.\n이 링크를 고객에게 전달하시면 됩니다.');
    };

    const handlePdfDownload = () => {
        alert('PDF 다운로드 기능은 준비 중입니다.');
    };

    // Calculate fixed package upfront
    const calcFixedPackage = (loan: number) => {
        const upfront = (estimate.finalBenefit || 0) - loan;
        return upfront >= 0 ? formatKrw(upfront) : '해당없음';
    };

    // Derive Supply Cost from finalBenefit and margin amount
    const supplyCost = estimate.finalBenefit - estimate.marginAmount;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-[#f8fafc] w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-[#0f172a] text-white px-8 py-6 rounded-t-2xl relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                    <h2 className="text-2xl font-black">{estimate.customerName} 고객님 견적 상세</h2>
                    <p className="text-sm text-gray-400 font-bold mt-2">
                        {estimate.date} {estimate.branch ? `| ${estimate.branch}` : ''}
                    </p>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto space-y-6">
                    {/* 기본 정보 */}
                    <section>
                        <h3 className="text-sm font-black text-gray-500 mb-3">기본 정보</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <p className="text-[11px] font-black text-gray-400 mb-1">견적 구분</p>
                                <p className="font-bold text-gray-800">{estimate.statusType}</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <p className="text-[11px] font-black text-gray-400 mb-1">고객 연락처</p>
                                <p className="font-bold text-gray-800">{estimate.customerPhone}</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <p className="text-[11px] font-black text-gray-400 mb-1">설치 주소</p>
                                <p className="font-bold text-gray-800 break-all line-clamp-2">{estimate.address || '-'}</p>
                            </div>
                        </div>
                    </section>

                    {/* 가격 및 마진 분석 (관리자/파트너용에만 보임) */}
                    <section>
                        <h3 className="text-sm font-black text-gray-500 mb-3">가격 및 마진 분석</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <p className="text-[11px] font-black text-gray-400 mb-1">공급가 (VAT포함)</p>
                                <p className="font-bold text-gray-600">{formatKrw(supplyCost)}</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <p className="text-[11px] font-black text-gray-400 mb-1">할인율</p>
                                <p className="font-bold text-red-500">{estimate.discountRate}%</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <p className="text-[11px] font-black text-gray-400 mb-1">추가 할인금액</p>
                                <p className="font-bold text-red-500">{formatKrw(estimate.extraDiscount)}</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <p className="text-[11px] font-black text-gray-400 mb-1">마진율</p>
                                <p className="font-bold text-gray-800">{estimate.marginRate?.toFixed(1)}%</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                                <p className="text-[11px] font-black text-gray-400 mb-1">최종 견적가</p>
                                <p className="text-xl font-black text-gray-800">{formatKrw(estimate.finalQuote)}</p>
                            </div>
                            <div className="bg-[#0f172a] p-5 rounded-xl shadow-md flex flex-col justify-center">
                                <p className="text-[11px] font-black text-blue-300 mb-1">고객 실 부담금</p>
                                <p className="text-2xl font-black text-white">{formatKrw(estimate.finalBenefit)}</p>
                            </div>
                            <div className="bg-green-50/50 p-5 rounded-xl border border-green-100 flex flex-col justify-center">
                                <p className="text-[11px] font-black text-green-600 mb-1">마진 금액</p>
                                <p className="text-xl font-black text-green-600 tracking-tight">{formatKrw(estimate.marginAmount)}</p>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 렌탈기간별 월 납입금 */}
                        <section>
                            <h3 className="text-sm font-black text-gray-500 mb-3">렌탈기간별 월 납입금</h3>
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="grid grid-cols-2 p-2">
                                    <div className="flex justify-between items-center px-4 py-3 border-r border-b border-gray-50">
                                        <span className="text-xs font-bold text-gray-500">24개월</span>
                                        <span className="font-black text-gray-800">{estimate.subs?.sub24?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-50">
                                        <span className="text-xs font-bold text-gray-500">36개월</span>
                                        <span className="font-black text-gray-800">{estimate.subs?.sub36?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-4 py-3 border-r border-gray-50">
                                        <span className="text-xs font-bold text-gray-500">48개월</span>
                                        <span className="font-black text-gray-800">{estimate.subs?.sub48?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-4 py-3 bg-amber-50/30">
                                        <span className="text-xs font-bold text-gray-500">60개월</span>
                                        <span className="font-black text-amber-600">{estimate.subs?.sub60?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 기타 정보 */}
                        <section>
                            <h3 className="text-sm font-black text-gray-500 mb-3">기타 정보</h3>
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm h-[calc(100%-30px)]">
                                <p className="text-[11px] font-black text-gray-400 mb-2">비고 (Remark)</p>
                                <p className="text-sm font-medium text-gray-700">{estimate.remark || '-'}</p>
                            </div>
                        </section>
                    </div>

                    {/* 60개월 렌탈 고정형 패키지 */}
                    <section>
                        <h3 className="text-sm font-black text-gray-500 mb-3">60개월 렌탈 고정형 패키지 (선납금)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-center">
                                <p className="text-[11px] font-black text-gray-500 mb-3">월 111,000원 고정</p>
                                <p className="font-black text-gray-800">{calcFixedPackage(5000000)}</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-center">
                                <p className="text-[11px] font-black text-gray-500 mb-3">월 222,000원 고정</p>
                                <p className="font-black text-gray-800">{calcFixedPackage(10000000)}</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-center">
                                <p className="text-[11px] font-black text-gray-500 mb-3">월 333,000원 고정</p>
                                <p className="font-black text-gray-800">{calcFixedPackage(15000000)}</p>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Footer Buttons */}
                <div className="bg-white border-t border-gray-100 p-6 flex flex-col md:flex-row gap-4 justify-between items-center rounded-b-2xl shrink-0">
                    <button
                        onClick={handleCopyLink}
                        className="w-full md:w-auto flex-1 flex items-center justify-center gap-2 bg-[#001a3d] hover:bg-[#0f172a] text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md group"
                    >
                        <ExternalLink size={18} className="group-hover:scale-110 transition-transform" />
                        발송견적 (WEB)
                    </button>
                    <button
                        onClick={handlePdfDownload}
                        className="w-full md:w-auto flex-1 flex items-center justify-center gap-2 bg-[#b89558] hover:bg-[#a68449] text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md group"
                    >
                        <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
                        PDF 다운로드
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full md:w-auto px-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
