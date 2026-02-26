'use client';

import { useState, useRef, useEffect } from 'react';
import { Printer, Home, Phone, Calendar, Info } from 'lucide-react';

export default function NoticePage() {
    const [dongUnit, setDongUnit] = useState('106동 1505호');
    const [constructDate, setConstructDate] = useState('2026.01.30');
    const [duration, setDuration] = useState('1일간');
    const [contact, setContact] = useState('1588-0883');

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 no-print">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <Printer className="w-6 h-6 text-blue-600" />
                            공사안내문 생성기
                        </h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">필수 정보를 입력하고 PDF로 저장하거나 인쇄하세요.</p>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                    >
                        <Printer className="w-5 h-5" />
                        PDF 다운로드 / 인쇄
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">동/호수 정보</span>
                            <div className="mt-1.5 relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Home className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    value={dongUnit}
                                    onChange={(e) => setDongUnit(e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all"
                                    placeholder="예: 106동 1505호"
                                />
                            </div>
                        </label>
                    </div>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">시공일자</span>
                            <div className="mt-1.5 relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Calendar className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    value={constructDate}
                                    onChange={(e) => setConstructDate(e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all"
                                    placeholder="예: 2026.01.30"
                                />
                            </div>
                        </label>
                    </div>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">기간 (선택)</span>
                            <div className="mt-1.5 relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Info className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all"
                                    placeholder="예: 1일간"
                                />
                            </div>
                        </label>
                    </div>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-xs font-black text-gray-404 uppercase tracking-widest ml-1">문의 전화</span>
                            <div className="mt-1.5 relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Phone className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all"
                                    placeholder="예: 1588-0883"
                                />
                            </div>
                        </label>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3">
                    <Info className="w-5 h-5 text-blue-500 shrink-0" />
                    <div className="text-xs text-blue-700 leading-relaxed font-medium">
                        브라우저 인쇄 창에서 <span className="font-bold underline">대상: PDF로 저장</span>을 선택하고, <span className="font-bold underline">설정 더보기 &gt; 배경 그래픽</span> 체크박스를 반드시 선택해야 디자인이 온전히 유지됩니다.
                    </div>
                </div>
            </div>

            {/* Preview Section */}
            <div className="flex justify-center bg-gray-50/50 rounded-3xl p-4 lg:p-10 border border-dashed border-gray-200 overflow-x-auto">
                <div ref={printRef} className="notice-print-area shadow-2xl scale-[0.6] origin-top lg:scale-100 mb-[-250px] lg:mb-0">
                    {/* The actual Notice Design */}
                    <div className="notice-container">
                        {/* Diamond Pattern Background */}
                        <div className="notice-bg-pattern"></div>
                        <div className="notice-bg-pattern-2"></div>

                        <div className="notice-content-wrapper">
                            {/* Arch Frame */}
                            <div className="notice-arch-frame">
                                {/* Icon at top */}
                                <div className="notice-top-icon-circle">
                                    <Home className="w-12 h-12 text-white" strokeWidth={2.5} />
                                </div>

                                <div className="notice-inner-content">
                                    <h1 className="notice-title">
                                        인테리어<br />공사안내
                                    </h1>

                                    <div className="notice-dong-unit">
                                        {dongUnit}
                                    </div>

                                    <div className="notice-divider-container">
                                        <div className="notice-divider"></div>
                                        <div className="notice-date-text">
                                            {constructDate} ({duration})
                                        </div>
                                        <div className="notice-divider"></div>
                                    </div>

                                    <div className="notice-message">
                                        위 기간 동안 내부 인테리어 공사(창호 교체)<br />
                                        를 진행함에 따라 소음 등 불편함이 있을 수 있으니,<br />
                                        입주민 여러분의 너른 양해를 부탁드립니다.<br />
                                        감사합니다.
                                    </div>

                                    <div className="notice-footer">
                                        <img
                                            src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/5b115594e9a66.png"
                                            alt="KCC HomeCC"
                                            className="notice-footer-logo"
                                        />
                                        <div className="notice-trademark">
                                            거주지 창호 교체는 완성창 전문 기업 KCC 홈씨씨가 잘합니다.
                                        </div>
                                        <div className="notice-contact">
                                            (문의 : {contact})
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; margin: 0 !important; }
                    .notice-print-area { 
                        padding: 0 !important; 
                        margin: 0 !important; 
                        transform: none !important; 
                        box-shadow: none !important;
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 210mm !important;
                        height: 297mm !important;
                        z-index: 9999 !important;
                    }
                    .notice-container { 
                        box-shadow: none !important; 
                        border: none !important; 
                    }
                    @page { margin: 0; size: A4 portrait; }
                }

                .notice-print-area {
                    width: 210mm;
                    height: 297mm;
                    background: white;
                    overflow: hidden;
                    box-sizing: border-box;
                    flex-shrink: 0;
                }

                .notice-container {
                    width:100%;
                    height: 100%;
                    position: relative;
                    background-color: #f1df91; /* Adjusted mustard */
                    display: flex;
                    flex-direction: column;
                    padding: 40px;
                    box-sizing: border-box;
                    font-family: 'Pretendard', 'Inter', 'Noto Sans KR', sans-serif;
                }

                .notice-bg-pattern {
                    position: absolute;
                    inset: 0;
                    opacity: 0.12;
                    background-image: 
                        linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), 
                        linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000);
                    background-size: 40px 40px;
                    background-position: 0 0, 20px 20px;
                    mask-image: linear-gradient(to bottom, black 60%, transparent);
                }

                .notice-bg-pattern-2 {
                    position: absolute;
                    inset: 0;
                    opacity: 0.25;
                    background-image: radial-gradient(circle, #8b7325 1.2px, transparent 1.2px);
                    background-size: 20px 20px;
                    mask-image: linear-gradient(to bottom, black 70%, transparent);
                }

                .notice-content-wrapper {
                    position: relative;
                    z-index: 10;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    padding-top: 20px;
                }

                .notice-arch-frame {
                    width: 94%;
                    max-width: 720px;
                    background-color: #fefcf5; /* Inner off-white */
                    border: 5px solid #000;
                    border-radius: 360px 360px 60px 60px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 0 40px 80px 40px;
                    margin-top: 80px;
                    position: relative;
                    box-shadow: 0 40px 80px -20px rgba(0,0,0,0.12);
                }

                .notice-top-icon-circle {
                    position: absolute;
                    top: -65px;
                    width: 130px;
                    height: 130px;
                    background: #000;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 6px solid #fefcf5;
                }

                .notice-inner-content {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding-top: 100px;
                }

                .notice-title {
                    font-size: 110px;
                    font-weight: 900;
                    color: #000;
                    line-height: 0.95;
                    letter-spacing: -4px;
                    margin-bottom: 70px;
                    text-align: center;
                    word-break: keep-all;
                }

                .notice-dong-unit {
                    background: #ebd88b;
                    border-radius: 70px;
                    padding: 24px 90px;
                    font-size: 58px;
                    font-weight: 900;
                    color: #000;
                    margin-bottom: 60px;
                    box-shadow: inset 0 2px 8px rgba(0,0,0,0.08);
                }

                .notice-divider-container {
                    width: 90%;
                    margin-bottom: 60px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .notice-divider {
                    width: 100%;
                    height: 4px;
                    background: #000;
                }

                .notice-date-text {
                    font-size: 38px;
                    font-weight: 900;
                    color: #000;
                    padding: 20px 0;
                    letter-spacing: -1px;
                }

                .notice-message {
                    font-size: 28px;
                    line-height: 1.5;
                    color: #111;
                    text-align: center;
                    font-weight: 700;
                    margin-top: 20px;
                    word-break: keep-all;
                }

                .notice-footer {
                    margin-top: 90px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                }

                .notice-footer-logo {
                    height: 52px;
                    margin-bottom: 24px;
                }

                .notice-trademark {
                    font-size: 18px;
                    font-weight: 700;
                    color: #222;
                    margin-bottom: 10px;
                    text-align: center;
                }

                .notice-contact {
                    font-size: 20px;
                    font-weight: 900;
                    color: #000;
                    letter-spacing: 0.5px;
                }
            `}</style>
        </div>
    );
}
