'use client';

import { useState, useRef } from 'react';
import { Printer, Home, Phone, Calendar, Info, Trash2, History, Plus, FileText, ChevronRight, Save, CheckCircle2 } from 'lucide-react';
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function NoticePage() {
    // Convex hooks
    const notices = useQuery(api.notices.getNotices) || [];
    const addNoticeMutation = useMutation(api.notices.addNotice);
    const deleteNoticeMutation = useMutation(api.notices.deleteNotice);

    // Form state
    const [dongUnit, setDongUnit] = useState('106동 1505호');
    const [constructDate, setConstructDate] = useState('2026.01.30');
    const [duration, setDuration] = useState('1일간');
    const [contact, setContact] = useState('1588-0883');

    // UI state
    const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
    const [isSaved, setIsSaved] = useState(false);

    const printRef = useRef<HTMLDivElement>(null);

    const handleSave = async () => {
        try {
            await addNoticeMutation({
                dongUnit,
                constructDate,
                duration,
                contact
            });
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (e) {
            console.error("Failed to save notice history", e);
            alert("저장에 실패했습니다.");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleLoadFromHistory = (notice: any) => {
        setDongUnit(notice.dongUnit);
        setConstructDate(notice.constructDate);
        setDuration(notice.duration);
        setContact(notice.contact);
        setActiveTab('generate');
    };

    const handleDeleteFromHistory = async (e: React.MouseEvent, id: any) => {
        e.stopPropagation();
        if (confirm('이 안내문 내역을 삭제하시겠습니까?')) {
            await deleteNoticeMutation({ id });
        }
    };

    // Shared design component to ensure consistency
    const NoticeContent = ({ dong, date, dur, phone }: { dong: string, date: string, dur: string, phone: string }) => (
        <div className="notice-container">
            <div className="notice-bg-pattern"></div>
            <div className="notice-bg-pattern-2"></div>

            <div className="notice-content-wrapper">
                <div className="notice-arch-frame">
                    <div className="notice-top-icon-circle">
                        <Home className="w-12 h-12 text-white" strokeWidth={2.5} />
                    </div>

                    <div className="notice-inner-content">
                        <h1 className="notice-title">
                            인테리어<br />공사안내
                        </h1>

                        <div className="notice-dong-unit">
                            {dong}
                        </div>

                        <div className="notice-divider-container">
                            <div className="notice-divider"></div>
                            <div className="notice-date-text">
                                {date} ({dur})
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
                                (문의 : {phone})
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* 1. SCREEN ONLY UI (HIDDEN DURING PRINT) */}
            <div className="no-print space-y-6">
                {/* Header Area */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                <Printer className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-gray-900 tracking-tight">공사안내문 시스템</h1>
                                <p className="text-xs text-gray-500 font-bold mt-0.5 uppercase tracking-wider">Construction Notice Management</p>
                            </div>
                        </div>

                        <div className="flex items-center bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                            <button
                                onClick={() => setActiveTab('generate')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'generate' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Plus className="w-4 h-4" />
                                새 안내문 생성
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <History className="w-4 h-4" />
                                생성 내역 관리 ({notices.length})
                            </button>
                        </div>
                    </div>
                </div>

                {activeTab === 'generate' ? (
                    <>
                        {/* Input Section */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-500" />
                                        정보 입력
                                    </h2>
                                    <p className="text-sm text-gray-500 font-medium">안내문에 표시될 필수 정보를 작성해 주세요.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaved}
                                        className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-base transition-all active:scale-95 group ${isSaved ? 'bg-green-50 text-green-600 border-2 border-green-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-lg shadow-gray-200/50'}`}
                                    >
                                        {isSaved ? (
                                            <>
                                                <CheckCircle2 className="w-5 h-5" />
                                                저장 완료
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                내역 저장
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handlePrint}
                                        className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-base hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 group"
                                    >
                                        <Printer className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                        인쇄 / PDF 다운로드
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 border-l-2 border-blue-500 pl-2 uppercase tracking-widest">동/호수 정보</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                            <Home className="w-4 h-4" />
                                        </span>
                                        <input
                                            type="text"
                                            value={dongUnit}
                                            onChange={(e) => setDongUnit(e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-transparent hover:bg-gray-100 focus:bg-white focus:border-blue-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold focus:ring-0 transition-all outline-none"
                                            placeholder="예: 106동 1505호"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 border-l-2 border-blue-500 pl-2 uppercase tracking-widest">시공일자</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                            <Calendar className="w-4 h-4" />
                                        </span>
                                        <input
                                            type="text"
                                            value={constructDate}
                                            onChange={(e) => setConstructDate(e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-transparent hover:bg-gray-100 focus:bg-white focus:border-blue-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold focus:ring-0 transition-all outline-none"
                                            placeholder="예: 2026.01.30"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 border-l-2 border-blue-500 pl-2 uppercase tracking-widest">기간 (설명)</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                            <Info className="w-4 h-4" />
                                        </span>
                                        <input
                                            type="text"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-transparent hover:bg-gray-100 focus:bg-white focus:border-blue-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold focus:ring-0 transition-all outline-none"
                                            placeholder="예: 1일간"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 border-l-2 border-blue-500 pl-2 uppercase tracking-widest">문의 전화</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                            <Phone className="w-4 h-4" />
                                        </span>
                                        <input
                                            type="text"
                                            value={contact}
                                            onChange={(e) => setContact(e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-transparent hover:bg-gray-100 focus:bg-white focus:border-blue-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold focus:ring-0 transition-all outline-none"
                                            placeholder="예: 1588-0883"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 flex gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                                    <Info className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="text-sm text-blue-800 leading-relaxed font-bold">
                                    배경 디자인과 이미지가 포함된 PDF를 저장하려면?<br />
                                    <span className="text-xs font-medium text-blue-600 tracking-tight block mt-1 underline decoration-blue-200">
                                        인쇄 설정 더보기 &gt; '배경 그래픽' 체크박스를 반드시 선택해 주세요.
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Screen Preview with scale logic */}
                        <div className="flex justify-center bg-gray-200/30 rounded-[2rem] p-4 lg:p-10 border-4 border-dashed border-gray-100 overflow-x-auto">
                            <div className="shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] scale-[0.5] sm:scale-[0.6] md:scale-[0.7] lg:scale-95 origin-top mb-[-400px] sm:mb-[-200px] lg:mb-0">
                                <div className="notice-print-area">
                                    <NoticeContent dong={dongUnit} date={constructDate} dur={duration} phone={contact} />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* History Tab Section */
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                    <History className="w-5 h-5 text-indigo-500" />
                                    생성 내역
                                </h2>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Storage Log</p>
                            </div>
                        </div>

                        {notices.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                    <FileText className="w-8 h-8 opacity-20" />
                                </div>
                                <p className="font-bold">저장된 안내문 내역이 없습니다.</p>
                                <button
                                    onClick={() => setActiveTab('generate')}
                                    className="mt-4 text-sm text-blue-600 font-black hover:underline"
                                >
                                    첫 안내문 만들기 →
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {notices.map((n) => (
                                    <div
                                        key={n._id}
                                        onClick={() => handleLoadFromHistory(n)}
                                        className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-3 flex gap-2">
                                            <button
                                                onClick={(e) => handleDeleteFromHistory(e, n._id)}
                                                className="p-2 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:rotate-6 transition-all duration-300">
                                            <FileText className="w-5 h-5 text-indigo-600 group-hover:text-white" />
                                        </div>

                                        <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{n.dongUnit}</h3>
                                        <div className="space-y-2 mt-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold p-2 bg-gray-50 rounded-lg">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {n.constructDate} <span className="text-[10px] text-gray-300 mx-1">|</span> {n.duration}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold p-2 bg-gray-50 rounded-lg">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {n.contact}
                                            </div>
                                        </div>

                                        <div className="mt-5 flex items-center justify-between">
                                            <div className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                                                {new Date(n.createdAt).toLocaleDateString()} 생성
                                            </div>
                                            <div className="flex items-center gap-1 text-xs font-black text-blue-600 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                                불러오기
                                                <ChevronRight className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 2. PRINT ONLY AREA (HIDDEN ON SCREEN) */}
            <div id="print-takeover" className="print-only-container">
                <NoticeContent dong={dongUnit} date={constructDate} dur={duration} phone={contact} />
            </div>

            <style jsx global>{`
                /* Hide everything except our print takeover div when printing */
                @media print {
                    body > *:not(#print-takeover):not(script):not(style) {
                        display: none !important;
                    }
                    div:has(> #print-takeover) {
                        display: block !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        border: none !important;
                    }
                    /* Reset Next.js layout wrappers if they are parents */
                    html, body, main {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        overflow: visible !important;
                        display: block !important;
                    }
                    .print-only-container {
                        display: block !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 210mm !important;
                        height: 297mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background-color: #f1df91 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        z-index: 9999999 !important;
                    }
                    @page {
                        margin: 0 !important;
                        size: A4 portrait !important;
                    }
                }
                @media screen {
                    .print-only-container {
                        display: none !important;
                    }
                }
            `}</style>

            <style jsx>{`
                .notice-print-area {
                    width: 210mm;
                    height: 297mm;
                    background: white;
                    overflow: hidden;
                    box-sizing: border-box;
                    flex-shrink: 0;
                }

                :global(.notice-container) {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    background-color: #f1df91;
                    display: flex;
                    flex-direction: column;
                    padding: 40px;
                    box-sizing: border-box;
                    font-family: 'Pretendard', 'Inter', 'Noto Sans KR', sans-serif;
                }

                :global(.notice-bg-pattern) {
                    position: absolute;
                    inset: 0;
                    opacity: 0.12;
                    background-image: 
                        linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), 
                        linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000);
                    background-size: 40px 40px;
                    background-position: 0 0, 20px 20px;
                    -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent);
                    mask-image: linear-gradient(to bottom, black 60%, transparent);
                }

                :global(.notice-bg-pattern-2) {
                    position: absolute;
                    inset: 0;
                    opacity: 0.25;
                    background-image: radial-gradient(circle, #8b7325 1.2px, transparent 1.2px);
                    background-size: 20px 20px;
                    -webkit-mask-image: linear-gradient(to bottom, black 70%, transparent);
                    mask-image: linear-gradient(to bottom, black 70%, transparent);
                }

                :global(.notice-content-wrapper) {
                    position: relative;
                    z-index: 10;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    padding-top: 10px;
                }

                :global(.notice-arch-frame) {
                    width: 92%;
                    max-width: 680px;
                    background-color: #fefcf5;
                    border: 5px solid #000;
                    border-radius: 340px 340px 50px 50px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 0 35px 50px 35px;
                    margin-top: 60px;
                    position: relative;
                    box-shadow: 0 30px 60px -20px rgba(0,0,0,0.1);
                }

                :global(.notice-top-icon-circle) {
                    position: absolute;
                    top: -60px;
                    width: 120px;
                    height: 120px;
                    background: #000;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 5px solid #fefcf5;
                }

                :global(.notice-inner-content) {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding-top: 80px;
                }

                :global(.notice-title) {
                    font-size: 84px;
                    font-weight: 900;
                    color: #000;
                    line-height: 1;
                    letter-spacing: -3px;
                    margin-bottom: 50px;
                    text-align: center;
                    word-break: keep-all;
                }

                :global(.notice-dong-unit) {
                    background: #ebd88b;
                    border-radius: 60px;
                    padding: 18px 70px;
                    font-size: 44px;
                    font-weight: 900;
                    color: #000;
                    margin-bottom: 40px;
                    box-shadow: inset 0 2px 6px rgba(0,0,0,0.06);
                }

                :global(.notice-divider-container) {
                    width: 85%;
                    margin-bottom: 40px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                :global(.notice-divider) {
                    width: 100%;
                    height: 3.5px;
                    background: #000;
                }

                :global(.notice-date-text) {
                    font-size: 32px;
                    font-weight: 800;
                    color: #000;
                    padding: 15px 0;
                    letter-spacing: -0.5px;
                }

                :global(.notice-message) {
                    font-size: 22px;
                    line-height: 1.6;
                    color: #111;
                    text-align: center;
                    font-weight: 700;
                    margin-top: 10px;
                    word-break: keep-all;
                }

                :global(.notice-footer) {
                    margin-top: 50px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                }

                :global(.notice-footer-logo) {
                    height: 44px;
                    margin-bottom: 18px;
                }

                :global(.notice-trademark) {
                    font-size: 15px;
                    font-weight: 700;
                    color: #222;
                    margin-bottom: 6px;
                    text-align: center;
                }

                :global(.notice-contact) {
                    font-size: 16px;
                    font-weight: 900;
                    color: #000;
                    letter-spacing: 0.5px;
                }
            `}</style>
        </div>
    );
}
