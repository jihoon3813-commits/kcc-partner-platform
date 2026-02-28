/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Calculator, FileText, CheckCircle, Save, Upload, Search, Calendar, FileDown, Eye, History } from 'lucide-react';
import { parseExcelEstimate } from '@/app/lib/excelParser';
import EstimateDetailModal from '@/app/components/EstimateDetailModal';

export default function AdminEstimatesPage() {
    const [activeTab, setActiveTab] = useState<'send' | 'lookup' | 'rental' | 'installment'>('send');

    // === SEND ESTIMATE STATE ===
    const [file, setFile] = useState<File | null>(null);
    const [estimateData, setEstimateData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // Modal State
    const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
    const [isEstimateModalOpen, setIsEstimateModalOpen] = useState(false);

    // Form State
    const [statusType, setStatusType] = useState('가견적');
    const [priceMultiplier, setPriceMultiplier] = useState(1.35);
    const [supplyCost, setSupplyCost] = useState(0);
    const [discountRate, setDiscountRate] = useState(8);
    const [extraDiscount, setExtraDiscount] = useState(0);
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [address, setAddress] = useState('');

    // Customer Selection state
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const customers = useQuery(api.customers.listCustomers);

    const formatPhoneNumber = (value: string) => {
        if (!value) return value;
        const raw = value.replace(/[^\d]/g, '');
        if (raw.length < 4) return raw;
        if (raw.length <= 7) return `${raw.slice(0, 3)}-${raw.slice(3)}`;
        if (raw.length <= 11) return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
        return raw;
    };

    const formatKrw = (val: number) => {
        return Math.floor(val || 0).toLocaleString() + "원";
    };

    const handleExcelUpload = async (fileToParse: File) => {
        if (!fileToParse) return;
        setFile(fileToParse);
        setLoading(true);
        setStatus("엑셀 파일을 분석하고 있습니다...");

        try {
            const data: any = await parseExcelEstimate(fileToParse);
            setEstimateData(data);
            setCustomerName(data.customerName || '');
            setCustomerPhone(data.customerPhone ? formatPhoneNumber(data.customerPhone) : '');
            setAddress(data.address || '');

            if (data.totalSum) {
                setSupplyCost(data.totalSum);
            }
            setPriceMultiplier(1.35);
            setStatus("분석 완료!");
        } catch (error: any) {
            console.error(error);
            alert("엑셀 분석 실패: " + (error.message || error));
        } finally {
            setLoading(false);
        }
    };

    const handleFetchCustomerExcel = async (url: string, fileName: string) => {
        if (!url) return;
        setIsCustomerModalOpen(false);
        setLoading(true);
        setStatus("해당 링크의 엑셀 파일을 불러오고 있습니다...");
        try {
            const res = await fetch(`/api/proxy-download?url=${encodeURIComponent(url)}`);
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "네트워크 응답이 정상이 아닙니다.");
            }
            const blob = await res.blob();
            const fetchedFile = new File([blob], fileName || "estimate.xlsx", { type: blob.type });
            await handleExcelUpload(fetchedFile);
        } catch (error: any) {
            console.error(error);
            alert("엑셀 다운로드 실패: " + error.message + "\n직접 파일을 다운로드하여 업로드해주세요.");
        } finally {
            setLoading(false);
        }
    };

    const calculations = useMemo(() => {
        if (!estimateData) return { kccQuote: 0, finalQuote: 0, finalBenefit: 0, marginAmount: 0, marginRate: 0, subs: { 24: 0, 36: 0, 48: 0, 60: 0 } };

        const kccQuote = estimateData.totalSum || 0;
        const baseCost = supplyCost > 0 ? supplyCost : 0;
        const otherCost = estimateData.totalEtc || 0;
        const materialCost = Math.max(0, baseCost - otherCost);

        const rawFinalQuote = (materialCost * priceMultiplier) + otherCost;
        const finalQuote = Math.floor(rawFinalQuote / 100) * 100;

        const discountAmt = Math.floor((finalQuote * (discountRate / 100)) / 100) * 100;
        const finalBenefit = finalQuote - discountAmt - extraDiscount;

        const marginAmount = finalBenefit - baseCost;
        const marginRate = baseCost > 0 ? (marginAmount / finalBenefit) * 100 : 0;

        const annualRate = 0.1;
        const subs: any = {};
        for (const m of [24, 36, 48, 60]) {
            const r = annualRate / 12;
            const pmt = (finalBenefit * r) / (1 - Math.pow(1 + r, -m));
            subs[`sub${m}`] = Math.floor(pmt / 10) * 10;
        }

        return { kccQuote, finalQuote, finalBenefit, marginAmount, marginRate, subs };
    }, [estimateData, supplyCost, priceMultiplier, discountRate, extraDiscount]);

    const saveEstimateMutation = useMutation(api.estimates.saveEstimate);
    const handleRegisterClick = async () => {
        if (!file || !estimateData) {
            alert("엑셀 견적서가 필요합니다.");
            return;
        }
        if (supplyCost <= 0) {
            if (!window.confirm("공급가(매입가)가 0원입니다. 진행하시겠습니까?")) return;
        }

        const processedItems = estimateData.items.map((item: any) => {
            if (item.isEtc) return item;
            return {
                ...item,
                price: Math.floor(item.price * priceMultiplier)
            };
        });

        setLoading(true);
        try {
            await saveEstimateMutation({
                date: new Date().toISOString().substring(0, 10),
                statusType,
                customerName: customerName,
                customerPhone: customerPhone,
                address: address,
                totalSum: estimateData.totalSum,
                finalQuote: calculations.finalQuote,
                finalBenefit: calculations.finalBenefit,
                discountRate,
                extraDiscount,
                marginAmount: calculations.marginAmount,
                marginRate: calculations.marginRate,
                subs: calculations.subs,
                items: JSON.stringify(processedItems),
            });
            alert("성공적으로 저장되었습니다.");
            setFile(null);
            setEstimateData(null);
            setSupplyCost(0);
            setCustomerPhone('');
            setCustomerName('');
            setAddress('');
        } catch (e: any) {
            console.error(e);
            alert("저장 실패: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    // QUOTES LIST
    const quotes = useQuery(api.estimates.getEstimates) || [];
    const updateRemark = useMutation(api.estimates.updateEstimateRemark);
    const handleUpdateRemark = async (id: any, newRemark: string) => {
        await updateRemark({ id, remark: newRemark });
    };

    // RENTALS LIST
    const rentals = useQuery(api.rentalApplications.getRentalApplications) || [];
    const updateRentalStatus = useMutation(api.rentalApplications.updateRentalApplicationStatus);
    const handleUpdateRentalStatus = async (id: any, status: string) => {
        if (window.confirm(`상태를 [${status}]로 변경하시겠습니까?`)) {
            await updateRentalStatus({ id, status });
        }
    };

    // INSTALLMENTS LIST
    const installments = useQuery(api.installmentApplications.getInstallmentApplications) || [];
    const updateInstallmentStatus = useMutation(api.installmentApplications.updateInstallmentApplicationStatus);
    const handleUpdateInstallmentStatus = async (id: any, status: string) => {
        if (window.confirm(`상태를 [${status}]로 변경하시겠습니까?`)) {
            await updateInstallmentStatus({ id, status });
        }
    };

    // Render Sub-components
    return (
        <div className="lg:px-4 lg:py-6 space-y-8 pb-32">
            {/* Header */}
            <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100 gap-4">
                <div>
                    <h1 className="text-xl font-black text-[#001a3d]">견적관리</h1>
                    <p className="text-xs text-gray-400 font-bold mt-1">견적발송 / 실시간 견적조회 / 렌탈 및 할부 신청내역</p>
                </div>

                <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100 overflow-x-auto w-full md:w-auto">
                    {[
                        { id: 'send', label: '견적발송', icon: Calculator },
                        { id: 'lookup', label: '견적조회', icon: FileText },
                        { id: 'rental', label: '렌탈신청 내역', icon: History },
                        { id: 'installment', label: '할부신청 내역', icon: History }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === t.id ? 'bg-[#001a3d] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <t.icon size={16} /> {t.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* SEND TAB */}
            {activeTab === 'send' && (
                <div className="space-y-6">
                    <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex gap-2">
                            {['가견적', '책임견적', '최종견적'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setStatusType(t)}
                                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all border ${statusType === t ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' : 'text-gray-400 border-gray-100 hover:bg-gray-50'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        <div>
                            <button
                                onClick={() => setIsCustomerModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#001a3d] text-white rounded-lg text-xs font-bold shadow hover:bg-blue-900"
                            >
                                <Search size={14} /> 기존 고객 연동
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'} relative cursor-pointer group`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    handleExcelUpload(e.dataTransfer.files[0]);
                                }
                            }}
                        >
                            <input
                                type="file"
                                accept=".xlsx"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) handleExcelUpload(e.target.files[0]);
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <FileDown className="w-10 h-10 text-gray-400 mb-3 group-hover:text-blue-500 transition-colors" />
                            <p className="font-bold text-gray-700 mb-1">엑셀 견적서 업로드 (.xlsx)</p>
                            <p className="text-xs text-gray-400 font-medium">클릭하거나 파일을 드래그하여 놓으세요</p>
                            {file && <p className="mt-4 text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{file.name}</p>}
                        </div>
                    </div>

                    {loading && (
                        <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                            <p className="font-bold text-gray-600 text-sm">{status}</p>
                        </div>
                    )}

                    {!loading && estimateData && (
                        <div className="space-y-6">
                            <div className="bg-[#001a3d] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 text-white/5 opacity-50"><CheckCircle size={120} /></div>
                                <h3 className="font-bold flex items-center gap-2 text-lg mb-5 relative z-10">
                                    <CheckCircle size={20} className="text-green-400" />
                                    엑셀 데이터 추출
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 relative z-10">
                                    <div>
                                        <p className="text-xs text-blue-200 font-bold mb-1.5">고객명 (수정가능)</p>
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm font-bold w-full focus:outline-none focus:border-white/40"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-200 font-bold mb-1.5">연락처 (수정가능)</p>
                                        <input
                                            type="text"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(formatPhoneNumber(e.target.value))}
                                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm font-bold w-full focus:outline-none focus:border-white/40"
                                        />
                                    </div>
                                    <div className="md:col-span-2 lg:col-span-1">
                                        <p className="text-xs text-blue-200 font-bold mb-1.5">주소 (수정가능)</p>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm font-bold w-full focus:outline-none focus:border-white/40"
                                        />
                                    </div>
                                    <div className="lg:border-l lg:border-white/10 lg:pl-6">
                                        <p className="text-xs text-yellow-500 font-bold mb-1.5">KCC 원 견적가</p>
                                        <p className="text-2xl font-black text-yellow-500">{formatKrw(estimateData.totalSum)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                                    <h4 className="font-bold text-gray-800 flex items-center gap-2 text-[15px]">
                                        <Calculator size={18} className="text-blue-500" />
                                        마진 및 가격 설정
                                    </h4>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <label className="text-xs font-bold text-gray-500 mb-1.5 block">자재비 배율 (기본 1.35)</label>
                                        <div className="flex items-center gap-2">
                                            <input type="number" step="0.01" value={priceMultiplier} onChange={(e) => setPriceMultiplier(Number(e.target.value))} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none" />
                                            <span className="text-sm font-bold text-gray-400">배</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 mb-1.5 block">공급가 (VAT포함)</label>
                                            <input type="text" value={supplyCost.toLocaleString()} onChange={(e) => setSupplyCost(Number(e.target.value.replace(/[^0-9]/g, '')))} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 mb-1.5 block">할인율 (%)</label>
                                            <input type="number" step="0.1" value={discountRate} onChange={(e) => setDiscountRate(Number(e.target.value))} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-bold text-gray-500 mb-1.5 block">추가 할인금액</label>
                                            <input type="text" value={extraDiscount.toLocaleString()} onChange={(e) => setExtraDiscount(Number(e.target.value.replace(/[^0-9]/g, '')))} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-[6px] border-l-[#001a3d] space-y-5">
                                    <h4 className="font-bold text-gray-800 text-[15px]">수익성 분석 결과</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                                            <p className="text-[11px] text-gray-400 font-bold mb-1">최종 견적가</p>
                                            <p className="text-xl font-black text-gray-800 tracking-tight">{formatKrw(calculations.finalQuote)}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-blue-50 flex flex-col justify-center">
                                            <p className="text-[11px] text-blue-500 font-bold mb-1">최종 혜택가 (고객 부담금)</p>
                                            <p className="text-2xl font-black text-[#001a3d] tracking-tight">{formatKrw(calculations.finalBenefit)}</p>
                                        </div>
                                        <div className="p-4 rounded-xl border border-gray-100">
                                            <p className="text-[11px] text-gray-400 font-bold mb-1">마진 금액</p>
                                            <p className={`text-lg font-black tracking-tight ${calculations.marginAmount >= 0 ? 'text-green-600' : 'text-red-500'}`}>{formatKrw(calculations.marginAmount)}</p>
                                        </div>
                                        <div className="p-4 rounded-xl border border-gray-100">
                                            <p className="text-[11px] text-gray-400 font-bold mb-1">마진율</p>
                                            <p className={`text-lg font-black tracking-tight ${calculations.marginRate >= 0 ? 'text-gray-800' : 'text-red-500'}`}>{calculations.marginRate.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100 pt-4">
                                        <p className="text-[11px] text-gray-400 font-bold mb-2">월 예상 구독료</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[24, 36, 48, 60].map((m: any) => (
                                                <div key={m} className={`p-2.5 rounded-lg text-center ${m === 60 ? 'bg-[#001a3d] text-white' : 'bg-gray-50 text-gray-600'}`}>
                                                    <p className="text-[10px] opacity-70 mb-0.5">{m}개월</p>
                                                    <p className="text-xs font-black">{formatKrw(calculations.subs[`sub${m}`]).replace('원', '')}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleRegisterClick} className="w-full bg-[#001a3d] text-white h-16 rounded-xl text-lg font-black shadow-lg hover:bg-blue-900 transition-colors">견적 데이터 저장</button>
                        </div>
                    )}
                </div>
            )}

            {/* LOOKUP TAB */}
            {activeTab === 'lookup' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs text-center border-b border-gray-200">
                                    <th className="py-3 px-4 font-bold border-r border-gray-200">등록일</th>
                                    <th className="py-3 px-4 font-bold border-r border-gray-200">구분</th>
                                    <th className="py-3 px-4 font-bold border-r border-gray-200">고객명</th>
                                    <th className="py-3 px-4 font-bold border-r border-gray-200">연락처</th>
                                    <th className="py-3 px-4 font-bold border-r border-gray-200">최종혜택가</th>
                                    <th className="py-3 px-4 font-bold border-r border-gray-200">할인율</th>
                                    <th className="py-3 px-4 font-bold border-r border-gray-200">마진액</th>
                                    <th className="py-3 px-4 font-bold">비고</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotes?.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center py-10 text-gray-400 font-bold">데이터가 없습니다.</td></tr>
                                ) : (quotes || []).map((q: any) => (
                                    <tr
                                        key={q._id}
                                        className="border-b border-gray-100 hover:bg-gray-50 text-xs text-center cursor-pointer"
                                        onClick={() => {
                                            setSelectedEstimate(q);
                                            setIsEstimateModalOpen(true);
                                        }}
                                    >
                                        <td className="py-3 px-4 whitespace-nowrap">{q.date}</td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black ${q.statusType === '가견적' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>{q.statusType}</span>
                                        </td>
                                        <td className="py-3 px-4 font-black">{q.customerName}</td>
                                        <td className="py-3 px-4 text-gray-500">{q.customerPhone}</td>
                                        <td className="py-3 px-4 font-black tracking-tighter text-blue-600">{q.finalBenefit?.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-gray-500">{q.discountRate}%</td>
                                        <td className="py-3 px-4 font-black tracking-tighter text-red-600">{q.marginAmount?.toLocaleString()}</td>
                                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                defaultValue={q.remark || ''}
                                                onBlur={(e) => handleUpdateRemark(q._id, e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                                                placeholder="비고 입력"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* RENTAL TAB */}
            {activeTab === 'rental' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs text-center border-b border-gray-200">
                                    <th className="py-3 px-3 font-bold border-r border-gray-200">등록일</th>
                                    <th className="py-3 px-3 font-bold border-r border-gray-200">상태</th>
                                    <th className="py-3 px-3 font-bold border-r border-gray-200">가맹점(파트너)</th>
                                    <th className="py-3 px-3 font-bold border-r border-gray-200">고객명/연락처</th>
                                    <th className="py-3 px-3 font-bold border-r border-gray-200">견적금액</th>
                                    <th className="py-3 px-3 font-bold border-r border-gray-200">구독기간</th>
                                    <th className="py-3 px-3 font-bold">서류확인</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rentals?.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-10 text-gray-400 font-bold">신청 내역이 없습니다.</td></tr>
                                ) : (rentals || []).map((r: any) => (
                                    <tr key={r._id} className="border-b border-gray-100 hover:bg-gray-50 text-xs text-center">
                                        <td className="py-3 px-3 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-3">
                                            <select
                                                value={r.status || '접수'}
                                                onChange={(e) => handleUpdateRentalStatus(r._id, e.target.value)}
                                                className="bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold font-sans outline-none focus:border-blue-500"
                                            >
                                                {["접수", "심사중", "승인완료", "승인불가", "취소"].map(st => <option key={st} value={st}>{st}</option>)}
                                            </select>
                                        </td>
                                        <td className="py-3 px-3 font-bold whitespace-nowrap">{r.partnerName || '-'}</td>
                                        <td className="py-3 px-3 text-left">
                                            <span className="font-black block">{r.customerName}</span>
                                            <span className="text-gray-400 block tracking-tighter">{r.phone}</span>
                                        </td>
                                        <td className="py-3 px-3 font-black text-blue-600">{r.amount?.toLocaleString()}원</td>
                                        <td className="py-3 px-3 font-bold">{r.months}개월</td>
                                        <td className="py-3 px-3">
                                            {r.documents ? (
                                                <button onClick={() => alert("서류조회 기능 준비중")} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">조회가능</button>
                                            ) : <span className="text-gray-300">-</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* INSTALLMENT TAB */}
            {activeTab === 'installment' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs text-center border-b border-gray-200">
                                    <th className="py-3 px-3 font-bold border-r border-gray-200">등록일</th>
                                    <th className="py-3 px-3 font-bold border-r border-gray-200">상태</th>
                                    <th className="py-3 px-3 font-bold border-r border-gray-200">가맹점(파트너)</th>
                                    <th className="py-3 px-3 font-bold border-r border-gray-200">고객명/연락처</th>
                                    <th className="py-3 px-3 font-bold border-r border-gray-200">견적금액</th>
                                    <th className="py-3 px-3 font-bold border-r border-gray-200">구독기간</th>
                                    <th className="py-3 px-3 font-bold">서류확인</th>
                                </tr>
                            </thead>
                            <tbody>
                                {installments?.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-10 text-gray-400 font-bold">신청 내역이 없습니다.</td></tr>
                                ) : (installments || []).map((r: any) => (
                                    <tr key={r._id} className="border-b border-gray-100 hover:bg-gray-50 text-xs text-center">
                                        <td className="py-3 px-3 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-3">
                                            <select
                                                value={r.status || '접수'}
                                                onChange={(e) => handleUpdateInstallmentStatus(r._id, e.target.value)}
                                                className="bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold font-sans outline-none focus:border-blue-500"
                                            >
                                                {["접수", "심사중", "승인완료", "승인불가", "취소"].map(st => <option key={st} value={st}>{st}</option>)}
                                            </select>
                                        </td>
                                        <td className="py-3 px-3 font-bold whitespace-nowrap">{r.partnerName || '-'}</td>
                                        <td className="py-3 px-3 text-left">
                                            <span className="font-black block">{r.customerName}</span>
                                            <span className="text-gray-400 block tracking-tighter">{r.phone}</span>
                                        </td>
                                        <td className="py-3 px-3 font-black text-blue-600">{r.amount?.toLocaleString()}원</td>
                                        <td className="py-3 px-3 font-bold">{r.months}개월</td>
                                        <td className="py-3 px-3">
                                            {r.documents ? (
                                                <button onClick={() => alert("서류조회 기능 준비중")} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">조회가능</button>
                                            ) : <span className="text-gray-300">-</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* CUSTOMER SELECTION MODAL */}
            {isCustomerModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[85vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-black text-gray-800 text-lg">기존 고객 연동 (견적 엑셀 가져오기)</h3>
                            <button onClick={() => setIsCustomerModalOpen(false)} className="text-gray-400 hover:text-red-500 text-xl font-bold">&times;</button>
                        </div>
                        <div className="border-b border-gray-200 px-4 py-3 bg-white">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="고객명 또는 연락처로 검색..."
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-bold"
                                    value={customerSearchTerm}
                                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 bg-white space-y-3">
                            {!customers ? (
                                <p className="text-center py-10 text-gray-400 font-bold">불러오는 중...</p>
                            ) : customers.filter((c: any) => {
                                const hasLink = Boolean(c.link_pre_kcc) || Boolean(c.link_final_kcc);
                                if (!hasLink) return false;
                                if (!customerSearchTerm) return true;
                                const searchLower = customerSearchTerm.toLowerCase();
                                const name = c.name || '';
                                const phone = c.contact || '';
                                return name.toLowerCase().includes(searchLower) || phone.toLowerCase().includes(searchLower);
                            }).length === 0 ? (
                                <p className="text-center py-10 text-gray-400 font-bold">검색 결과가 없습니다.</p>
                            ) : (
                                customers.filter((c: any) => {
                                    const hasLink = Boolean(c.link_pre_kcc) || Boolean(c.link_final_kcc);
                                    if (!hasLink) return false;
                                    if (!customerSearchTerm) return true;
                                    const searchLower = customerSearchTerm.toLowerCase();
                                    const name = c.name || '';
                                    const phone = c.contact || '';
                                    return name.toLowerCase().includes(searchLower) || phone.toLowerCase().includes(searchLower);
                                }).map((c: any) => {
                                    const hasPreLink = Boolean(c.link_pre_kcc);
                                    const hasFinalLink = Boolean(c.link_final_kcc);

                                    return (
                                        <div key={c._id} className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4 hover:border-blue-300 transition-colors">
                                            <div>
                                                <p className="font-black text-gray-800">{c.name} <span className="text-xs text-gray-400 font-bold ml-2">No.{c.no}</span></p>
                                                <p className="text-xs text-gray-500">{c.contact}</p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {hasPreLink && (
                                                    <button
                                                        onClick={() => handleFetchCustomerExcel(c.link_pre_kcc, `${c.name}_가견적.xlsx`)}
                                                        className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold rounded-lg flex items-center gap-1"
                                                    >
                                                        <FileDown size={14} /> 가견적 파일
                                                    </button>
                                                )}
                                                {hasFinalLink && (
                                                    <button
                                                        onClick={() => handleFetchCustomerExcel(c.link_final_kcc, `${c.name}_최종견적.xlsx`)}
                                                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-lg flex items-center gap-1"
                                                    >
                                                        <FileDown size={14} /> 최종견적 파일
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            <EstimateDetailModal
                isOpen={isEstimateModalOpen}
                onClose={() => setIsEstimateModalOpen(false)}
                estimate={selectedEstimate}
            />
        </div>
    );
}
