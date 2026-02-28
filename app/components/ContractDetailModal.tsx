'use client';

import { useState, useEffect } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const EXTERNAL_CONVEX_URL = "https://beaming-elk-778.convex.cloud";
const externalClient = new ConvexHttpClient(EXTERNAL_CONVEX_URL);

export interface Customer {
    id: string; // convex id
    no?: string | number;
    'No.'?: string | number; // For compatibility
    name?: string;
    '고객명'?: string; // For compatibility
    contact?: string;
    '연락처'?: string; // For compatibility
    address?: string;
    '주소'?: string; // For compatibility
    channel?: string;
    '채널'?: string; // For compatibility
    created_at?: string;
    '신청일'?: string; // For compatibility
    _creationTime?: number;
}

interface Appliance {
    productName?: string;
    modelName?: string;
    deliveryDate?: string;
    remark?: string;
}

interface ExternalQuoteResult {
    finalBenefit?: number;
    kccPrice?: number;
    [key: string]: unknown;
}

interface ContractFormData {
    customerId?: string;
    contractStatus?: string;
    contractDate?: string;
    applicationDate?: string;
    constructionDate?: string;
    finalQuotePrice?: string | number;
    kccSupplyPrice?: string | number;
    kccDepositStatus?: string;
    constructionContractStatus?: string;
    paymentMethod?: string;
    paymentAmount1?: string | number;
    paymentDate1?: string;
    remainingBalance?: string | number;
    remainingBalanceDate?: string;
    advancePayment?: string | number;
    hasInterest?: string;
    totalSubscriptionFee?: string | number;
    subscriptionMonths?: string | number;
    monthlySubscriptionFee?: string | number;
    installmentAgreementDate?: string;
    recordingAgreementDate?: string;
    appliances?: string;
}

interface ContractDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
    userRole?: 'admin' | 'partner';
}

export default function ContractDetailModal({ isOpen, onClose, customer, userRole = 'admin' }: ContractDetailModalProps) {
    const existingContract = useQuery(api.contracts.getContractByCustomerId, customer?.id ? { customerId: customer.id } : "skip");
    const saveContractMutation = useMutation(api.contracts.saveContract);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<ContractFormData>>({});

    // PLUS 가전
    const [appliances, setAppliances] = useState<Appliance[]>([]);

    useEffect(() => {
        if (isOpen && customer) {
            if (existingContract) {
                setFormData(existingContract);
                try {
                    setAppliances(existingContract.appliances ? JSON.parse(existingContract.appliances) : []);
                } catch {
                    setAppliances([]);
                }
            } else {
                setFormData({
                    customerId: customer.id,
                    contractStatus: '계약등록',
                    contractDate: new Date().toISOString().substring(0, 10),
                    applicationDate: customer['신청일'] || (customer._creationTime ? new Date(customer._creationTime).toISOString().substring(0, 10) : ''),
                    paymentMethod: '현금',
                });
                setAppliances([]);
            }
        }
    }, [isOpen, customer, existingContract]);

    useEffect(() => {
        if (!isOpen) return;
        const pm = formData.paymentMethod || '';
        const isCashOrCard = ['현금', '카드', '50/50(현금)', '50/50(카드)', '카드+현금'].includes(pm);
        if (isCashOrCard) {
            const finalQuote = Number(formData.finalQuotePrice) || 0;
            const paid = Number(formData.paymentAmount1) || 0;
            const balance = finalQuote - paid;
            if (formData.remainingBalance !== balance) {
                setFormData((prev) => ({ ...prev, remainingBalance: balance }));
            }
        }
    }, [isOpen, formData.paymentMethod, formData.finalQuotePrice, formData.paymentAmount1, formData.remainingBalance]);

    if (!isOpen || !customer) return null;

    const handleSave = async () => {
        if (userRole === 'partner') return;
        setLoading(true);
        try {
            await saveContractMutation({
                customerId: customer.id,
                contractStatus: formData.contractStatus,
                contractDate: formData.contractDate,
                applicationDate: formData.applicationDate,

                constructionDate: formData.constructionDate,
                finalQuotePrice: formData.finalQuotePrice ? Number(formData.finalQuotePrice) : undefined,
                kccSupplyPrice: formData.kccSupplyPrice ? Number(formData.kccSupplyPrice) : undefined,
                kccDepositStatus: formData.kccDepositStatus,
                constructionContractStatus: formData.constructionContractStatus,
                paymentMethod: formData.paymentMethod,

                paymentAmount1: formData.paymentAmount1 ? Number(formData.paymentAmount1) : undefined,
                paymentDate1: formData.paymentDate1,
                remainingBalance: formData.remainingBalance ? Number(formData.remainingBalance) : undefined,
                remainingBalanceDate: formData.remainingBalanceDate,

                advancePayment: formData.advancePayment ? Number(formData.advancePayment) : undefined,
                hasInterest: formData.hasInterest,
                totalSubscriptionFee: formData.totalSubscriptionFee ? Number(formData.totalSubscriptionFee) : undefined,
                subscriptionMonths: formData.subscriptionMonths ? Number(formData.subscriptionMonths) : undefined,
                monthlySubscriptionFee: formData.monthlySubscriptionFee ? Number(formData.monthlySubscriptionFee) : undefined,
                installmentAgreementDate: formData.installmentAgreementDate,
                recordingAgreementDate: formData.recordingAgreementDate,

                appliances: JSON.stringify(appliances),
            });
            alert('계약 정보가 저장되었습니다.');
            onClose();
        } catch (e: unknown) {
            console.error(e);
            alert('저장 실패: ' + (e instanceof Error ? e.message : String(e)));
        } finally {
            setLoading(false);
        }
    };

    const handleSyncFromEstimateSystem = async () => {
        const name = customer.name || customer['고객명'];
        const phone = customer.contact || customer['연락처'];

        if (!name || !phone) {
            return alert('고객명과 연락처가 있어야 조회 가능합니다.');
        }

        setLoading(true);
        try {
            // @ts-expect-error - externalClient.query expects a specific type that we are bypassing for external connection
            const result = await externalClient.query("quotes:searchQuote", {
                name: String(name),
                phone: String(phone)
            }) as ExternalQuoteResult | null;

            if (result) {
                const updates: Partial<ContractFormData> = {};
                // 최종견적가는 최종혜택가(고객 실 부담금)을 가져옴
                if (result.finalBenefit) updates.finalQuotePrice = Number(result.finalBenefit);
                if (result.kccPrice) updates.kccSupplyPrice = Number(result.kccPrice);

                setFormData((prev) => ({ ...prev, ...updates }));
                alert('견적 시스템에서 데이터를 가져왔습니다.\n(최종혜택가 -> 최종견적가 연동됨)');
            } else {
                alert('견적 시스템에서 해당 고객의 데이터를 찾을 수 없습니다.');
            }
        } catch (e: unknown) {
            console.error('Sync Error:', e);
            alert('연동 실패: ' + (e instanceof Error ? e.message : '오류 발생'));
        } finally {
            setLoading(false);
        }
    };

    const isReadOnly = userRole === 'partner';

    const isCashOrCard = ['현금', '카드', '50/50(현금)', '50/50(카드)', '카드+현금'].includes(formData.paymentMethod || '');
    const isSubscription = ['현금+구독', '카드+구독', '구독(할부)'].includes(formData.paymentMethod || '');
    const isRental = formData.paymentMethod === 'BSON';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden font-sans">

                {/* Header */}
                <div className="bg-[#1e293b] text-white px-6 py-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <h2 className="text-xl font-bold tracking-tight">계약 등록 / 관리</h2>
                        <span className="bg-slate-700 text-xs px-2 py-1 rounded-md text-slate-300 ml-2">{customer.name || customer['고객명'] || '-'} 고객님</span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 bg-slate-700/50 rounded-full hover:bg-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col gap-6">

                    {/* 섹션 1: 기본정보 */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="font-bold text-gray-800">기본 정보</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-500">진행구분</span>
                                <select
                                    disabled={isReadOnly}
                                    className={`bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-lg px-2 py-1 outline-none font-bold cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200`}
                                    value={formData.contractStatus || '계약등록'}
                                    onChange={(e) => setFormData({ ...formData, contractStatus: e.target.value })}
                                >
                                    <option value="계약등록">계약등록</option>
                                    <option value="결제진행중">결제진행중</option>
                                    <option value="결제완료">결제완료</option>
                                    <option value="공사완료">공사완료</option>
                                    <option value="결제취소">결제취소</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">계약등록일</label>
                                <input type="date" disabled={isReadOnly} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
                                    value={formData.contractDate || ''} onChange={(e) => setFormData({ ...formData, contractDate: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">신청일</label>
                                <input type="date" disabled={isReadOnly} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
                                    value={formData.applicationDate || ''} onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">고객번호</label>
                                <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600 font-medium">{customer.no || customer['No.'] || '-'}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">유입채널(지점)</label>
                                <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600 font-medium">{customer.channel || customer['채널'] || '-'}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">고객명</label>
                                <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600 font-medium">{customer.name || customer['고객명'] || '-'}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">연락처</label>
                                <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600 font-medium">{customer.contact || customer['연락처'] || '-'}</div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-500 mb-1">주소</label>
                                <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600 font-medium truncate">{customer.address || customer['주소'] || '-'}</div>
                            </div>
                        </div>
                    </div>

                    {/* 섹션 2: 계약정보 */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="font-bold text-gray-800">계약 정보</h3>
                            {userRole === 'admin' && (
                                <button
                                    onClick={handleSyncFromEstimateSystem}
                                    className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 font-bold hover:bg-blue-100 transition-colors"
                                >
                                    견적금액 연동
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">시공일</label>
                                <input type="date" disabled={isReadOnly} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
                                    value={formData.constructionDate || ''} onChange={(e) => setFormData({ ...formData, constructionDate: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">최종견적가</label>
                                <input type="text" disabled={isReadOnly} placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 tabular-nums text-right disabled:bg-gray-100"
                                    value={formData.finalQuotePrice ? Number(formData.finalQuotePrice).toLocaleString() : ''}
                                    onChange={(e) => setFormData({ ...formData, finalQuotePrice: e.target.value.replace(/[^0-9]/g, '') })} />
                            </div>
                            {userRole === 'admin' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">KCC공급가</label>
                                    <input type="text" placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 tabular-nums text-right font-bold text-blue-600"
                                        value={formData.kccSupplyPrice ? Number(formData.kccSupplyPrice).toLocaleString() : ''}
                                        onChange={(e) => setFormData({ ...formData, kccSupplyPrice: e.target.value.replace(/[^0-9]/g, '') })} />
                                </div>
                            )}
                            {userRole === 'admin' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">KCC입금여부</label>
                                    <select disabled={isReadOnly} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
                                        value={formData.kccDepositStatus || ''} onChange={(e) => setFormData({ ...formData, kccDepositStatus: e.target.value })}>
                                        <option value="">선택</option>
                                        <option value="입금대기">입금대기</option>
                                        <option value="입금완료">입금완료</option>
                                        <option value="계약취소">계약취소</option>
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">시공계약서</label>
                                <select disabled={isReadOnly} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
                                    value={formData.constructionContractStatus || ''} onChange={(e) => setFormData({ ...formData, constructionContractStatus: e.target.value })}>
                                    <option value="">선택</option>
                                    <option value="진행대기">진행대기</option>
                                    <option value="발송완료">발송완료</option>
                                    <option value="서명완료">서명완료</option>
                                    <option value="계약취소">계약취소</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">결제방법</label>
                                <select disabled={isReadOnly} className="w-full bg-blue-50 border border-blue-200 text-blue-800 font-bold rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
                                    value={formData.paymentMethod || '현금'} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}>
                                    {['현금', '카드', '50/50(현금)', '50/50(카드)', '카드+현금', '구독(할부)', '현금+구독', '카드+구독', 'BSON'].map(pm => (
                                        <option key={pm} value={pm}>{pm}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 섹션 3: 결제정보 (조건부 노출) */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                            결제 정보
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-normal">
                                {isCashOrCard ? '현금/카드' : isSubscription ? '구독(할부)' : isRental ? '렌탈패키지' : ''}
                            </span>
                        </h3>

                        {isCashOrCard && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">입금/결제금액(1차)</label>
                                    <input type="text" placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-right tabular-nums focus:border-blue-500 outline-none"
                                        value={formData.paymentAmount1 ? Number(formData.paymentAmount1).toLocaleString() : ''}
                                        onChange={(e) => setFormData({ ...formData, paymentAmount1: e.target.value.replace(/[^0-9]/g, '') })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">입금/결제일(1차)</label>
                                    <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        value={formData.paymentDate1 || ''} onChange={(e) => setFormData({ ...formData, paymentDate1: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">잔금</label>
                                    <input type="text" placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-right tabular-nums focus:border-blue-500 outline-none"
                                        value={formData.remainingBalance ? Number(formData.remainingBalance).toLocaleString() : ''}
                                        onChange={(e) => setFormData({ ...formData, remainingBalance: e.target.value.replace(/[^0-9]/g, '') })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">잔금 결제일</label>
                                    <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        value={formData.remainingBalanceDate || ''} onChange={(e) => setFormData({ ...formData, remainingBalanceDate: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {isSubscription && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">선납금</label>
                                    <input type="text" placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-right tabular-nums focus:border-blue-500 outline-none"
                                        value={formData.advancePayment ? Number(formData.advancePayment).toLocaleString() : ''}
                                        onChange={(e) => setFormData({ ...formData, advancePayment: e.target.value.replace(/[^0-9]/g, '') })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">이자유무</label>
                                    <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        value={formData.hasInterest || ''} onChange={(e) => setFormData({ ...formData, hasInterest: e.target.value })}>
                                        <option value="">선택</option>
                                        <option value="유">유 (있음)</option>
                                        <option value="무">무 (없음)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">총구독료</label>
                                    <input type="text" placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-right tabular-nums focus:border-blue-500 outline-none"
                                        value={formData.totalSubscriptionFee ? Number(formData.totalSubscriptionFee).toLocaleString() : ''}
                                        onChange={(e) => setFormData({ ...formData, totalSubscriptionFee: e.target.value.replace(/[^0-9]/g, '') })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">구독개월</label>
                                    <input type="number" placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-right focus:border-blue-500 outline-none"
                                        value={formData.subscriptionMonths || ''} onChange={(e) => setFormData({ ...formData, subscriptionMonths: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">월구독료</label>
                                    <input type="text" placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-right tabular-nums focus:border-blue-500 outline-none"
                                        value={formData.monthlySubscriptionFee ? Number(formData.monthlySubscriptionFee).toLocaleString() : ''}
                                        onChange={(e) => setFormData({ ...formData, monthlySubscriptionFee: e.target.value.replace(/[^0-9]/g, '') })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">할부약정일(모바일)</label>
                                    <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        value={formData.installmentAgreementDate || ''} onChange={(e) => setFormData({ ...formData, installmentAgreementDate: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">녹취약정일</label>
                                    <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        value={formData.recordingAgreementDate || ''} onChange={(e) => setFormData({ ...formData, recordingAgreementDate: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {isRental && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">선납금</label>
                                    <input type="text" placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-right tabular-nums focus:border-blue-500 outline-none"
                                        value={formData.advancePayment ? Number(formData.advancePayment).toLocaleString() : ''}
                                        onChange={(e) => setFormData({ ...formData, advancePayment: e.target.value.replace(/[^0-9]/g, '') })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">구독개월</label>
                                    <input type="number" placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-right focus:border-blue-500 outline-none"
                                        value={formData.subscriptionMonths || ''} onChange={(e) => setFormData({ ...formData, subscriptionMonths: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">월구독료</label>
                                    <input type="text" placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-right tabular-nums focus:border-blue-500 outline-none"
                                        value={formData.monthlySubscriptionFee ? Number(formData.monthlySubscriptionFee).toLocaleString() : ''}
                                        onChange={(e) => setFormData({ ...formData, monthlySubscriptionFee: e.target.value.replace(/[^0-9]/g, '') })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">녹취약정일</label>
                                    <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        value={formData.recordingAgreementDate || ''} onChange={(e) => setFormData({ ...formData, recordingAgreementDate: e.target.value })} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 섹션 4: PLUS 가전 */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="font-bold text-gray-800">PLUS 가전</h3>
                            <button onClick={() => setAppliances([...appliances, {}])} className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">+ 가전 추가</button>
                        </div>

                        {appliances.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">등록된 가전이 없습니다.</p>
                        ) : (
                            <div className="space-y-3">
                                {appliances.map((app, idx) => (
                                    <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <input type="text" placeholder="제품명" className="flex-1 min-w-[120px] bg-white border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-400"
                                            value={app.productName || ''} onChange={(e) => {
                                                const newArr = [...appliances];
                                                newArr[idx].productName = e.target.value;
                                                setAppliances(newArr);
                                            }} />
                                        <input type="text" placeholder="모델명" className="flex-1 min-w-[120px] bg-white border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-400"
                                            value={app.modelName || ''} onChange={(e) => {
                                                const newArr = [...appliances];
                                                newArr[idx].modelName = e.target.value;
                                                setAppliances(newArr);
                                            }} />
                                        <input type="date" className="w-[130px] bg-white border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-400"
                                            value={app.deliveryDate || ''} onChange={(e) => {
                                                const newArr = [...appliances];
                                                newArr[idx].deliveryDate = e.target.value;
                                                setAppliances(newArr);
                                            }} />
                                        <input type="text" placeholder="비고" className="flex-1 min-w-[100px] bg-white border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-400"
                                            value={app.remark || ''} onChange={(e) => {
                                                const newArr = [...appliances];
                                                newArr[idx].remark = e.target.value;
                                                setAppliances(newArr);
                                            }} />
                                        <button onClick={() => setAppliances(appliances.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 p-1">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end gap-3 shrink-0">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors">
                        닫기
                    </button>
                    {!isReadOnly && (
                        <button onClick={handleSave} disabled={loading} className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            {loading ? '저장 중...' : '계약 정보 저장'}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}

