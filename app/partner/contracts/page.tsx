'use client';

import { useState, useMemo, Suspense } from 'react';
import Cookies from 'js-cookie';
import { Search, FileText, RefreshCcw, MapPin } from 'lucide-react';
import ContractDetailModal, { Customer } from '@/app/components/ContractDetailModal';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

function PartnerContractsContent() {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const partnerSession = useMemo(() => {
        const session = Cookies.get('partner_session');
        if (!session) return null;
        try {
            return JSON.parse(session);
        } catch {
            return null;
        }
    }, []);

    const partnerName = partnerSession?.name || '';

    // Convex Data
    const convexCustomers = useQuery(api.customers.listCustomers);
    const convexContracts = useQuery(api.contracts.getContracts);

    const allMappedCustomers = useMemo(() => {
        if (!convexCustomers || !convexContracts) return [];
        const contractsMap = new Map();
        for (const c of convexContracts) {
            contractsMap.set(c.customerId, c);
        }

        const mapped = convexCustomers.map(c => {
            const contract = contractsMap.get(c._id);
            const rawStatus = contract?.contractStatus || '계약등록';
            const today = new Date().toISOString().substring(0, 10);

            // 공사완료는 시공일이 지나면 자동으로 반영(단, 결제취소 건은 반영하지 않음)
            let calculatedStatus = rawStatus;
            if (rawStatus !== '결제취소' && contract?.constructionDate && contract.constructionDate < today) {
                calculatedStatus = '공사완료';
            }

            return {
                'No.': c.no || '',
                '라벨': c.label || '일반',
                '진행구분': c.status || '접수', // 고객관리의 진행구분
                '채널': c.channel || '',
                '고객명': c.name || '',
                '연락처': c.contact || '',
                '주소': c.address || '',
                'KCC 피드백': c.feedback || '',
                '진행현황(상세)_최근': c.progress_detail || '',
                '가견적 링크': c.link_pre_kcc || '',
                '최종 견적 링크': c.link_final_kcc || '',
                '고객견적서(가)': c.link_pre_cust || '',
                '고객견적서(최종)': c.link_final_cust || '',
                '실측일자': c.measure_date || '',
                '시공일자': contract?.constructionDate || c.construct_date || '', // 계약정보 시공일 우선
                '가견적 금액': c.price_pre || 0,
                '최종견적 금액': contract?.finalQuotePrice || c.price_final || 0, // 계약정보 최종견적 우선
                '신청일': c.created_at || (c._creationTime ? new Date(c._creationTime).toISOString().split('T')[0] : ''),
                'id': c._id,
                '_creationTime': c._creationTime,
                'updatedAt': c.updatedAt,
                // ==== 계약 상세 정보 ====
                contractStatus: calculatedStatus,
                rawContractStatus: rawStatus,
                contractId: contract?._id,
                kccDepositStatus: contract?.kccDepositStatus,
                paymentMethod: contract?.paymentMethod,
                paymentAmount1: contract?.paymentAmount1,
                remainingBalance: contract?.remainingBalance,
                advancePayment: contract?.advancePayment,
                installmentAgreementDate: contract?.installmentAgreementDate,
                recordingAgreementDate: contract?.recordingAgreementDate,
            };
        });

        const myCustomers = mapped.filter(c => {
            if (!partnerSession) return false;
            const channel = String(c['채널'] || '');
            return channel.includes(partnerName) || channel === partnerSession.id;
        });

        // "계약등록" 상태만 필터링 (고객 상태가 계약등록인 것)
        const filtered = myCustomers.filter(c => String(c['진행구분']) === '계약등록');

        return filtered.sort((a, b) => {
            const timeA = Math.max(a.updatedAt || 0, a._creationTime || 0);
            const timeB = Math.max(b.updatedAt || 0, b._creationTime || 0);
            return timeB - timeA;
        });
    }, [convexCustomers, convexContracts, partnerName, partnerSession]);

    const loading = convexCustomers === undefined;

    const [searchTerm, setSearchTerm] = useState('');

    const filteredCustomers = useMemo(() => {
        return allMappedCustomers.filter(c => {
            const searchMatch = !searchTerm || (
                (c['고객명'] && String(c['고객명']).includes(searchTerm)) ||
                (c['연락처'] && String(c['연락처']).includes(searchTerm)) ||
                (c['주소'] && String(c['주소']).includes(searchTerm))
            );
            return searchMatch;
        });
    }, [allMappedCustomers, searchTerm]);

    return (
        <div className="lg:px-4 lg:py-6 space-y-8 pb-32">
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <FileText className="w-6 h-6 text-blue-600" />
                            계약 관리
                        </h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">계약등록 상태인 고객의 계약 정보를 관리합니다.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            className={`p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all ${loading ? 'animate-spin' : ''}`}
                            title="새로고침"
                        >
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                    <div className="relative group">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="고객명, 연락처, 주소 검색..."
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-4">
                    <p className="text-sm font-bold text-gray-500">조회 결과 <span className="text-blue-600">{filteredCustomers.length}</span>건</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-50 rounded-full animate-spin border-t-blue-500 shadow-lg shadow-blue-500/10"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <RefreshCcw className="w-6 h-6 text-blue-500 animate-pulse" />
                            </div>
                        </div>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="bg-white p-20 rounded-2xl border border-gray-100 text-center text-gray-400 font-bold">계약등록 상태인 고객이 없습니다.</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {filteredCustomers.map((customer: any, index: number) => (
                            <div
                                key={index}
                                onClick={() => setSelectedCustomer(customer)}
                                className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col lg:flex-row gap-4 lg:gap-5 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="lg:w-[480px] shrink-0 border-b lg:border-b-0 lg:border-r border-gray-50 pb-3 lg:pb-0 lg:pr-5">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                {(() => {
                                                    const s = customer.contractStatus;
                                                    let colorClass = "bg-gray-50 text-gray-700 border-gray-200";
                                                    if (s === '계약등록') colorClass = "bg-blue-50 text-blue-700 border-blue-200";
                                                    else if (s === '결제진행중') colorClass = "bg-orange-50 text-orange-700 border-orange-200";
                                                    else if (s === '결제완료') colorClass = "bg-green-50 text-green-700 border-green-200";
                                                    else if (s === '공사완료') colorClass = "bg-purple-50 text-purple-700 border-purple-200";
                                                    else if (s === '결제취소') colorClass = "bg-red-50 text-red-700 border-red-200";

                                                    return (
                                                        <span className={`text-[11px] font-black px-3 py-1 rounded-full border shadow-sm whitespace-nowrap ${colorClass}`}>
                                                            {s}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 tracking-tighter whitespace-nowrap">
                                                    {customer['신청일'] ? String(customer['신청일']).substring(0, 10) : '-'}
                                                </span>
                                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg whitespace-nowrap">No.{customer['No.']}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-baseline gap-3 mt-1">
                                            <h3 className="text-lg font-black text-gray-900 leading-tight">{customer['고객명']}</h3>
                                            <span className="text-sm text-gray-500 font-bold tracking-tight">{customer['연락처']}</span>
                                        </div>

                                        <div className="flex items-start gap-2 text-sm text-gray-400 font-medium">
                                            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                            <span className="truncate" title={customer['주소']}>{customer['주소']?.replace(/\s*\[\d+\]$/, '')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0 py-1 flex flex-col justify-between gap-1">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-400">결제방법</span>
                                            <span className="text-xs font-bold text-gray-800 mt-0.5">{customer.paymentMethod || '-'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-400">최종견적가</span>
                                            <span className="text-xs font-black text-blue-600 mt-0.5">
                                                {(customer.finalQuotePrice || customer['최종견적 금액'])
                                                    ? Number(customer.finalQuotePrice || customer['최종견적 금액']).toLocaleString() + '원'
                                                    : '-'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col md:col-span-2">
                                            <span className="text-[10px] font-bold text-gray-400">시공일</span>
                                            <span className="text-xs font-bold text-gray-800 mt-0.5">{customer['시공일자'] || '-'}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-row flex-wrap gap-1.5 mt-1">
                                        {(() => {
                                            const alerts = [];
                                            const isCanceled = customer.rawContractStatus === '결제취소';

                                            // 1. KCC입금여부가 입금완료가 아닐 경우
                                            if (customer.kccDepositStatus !== '입금완료') {
                                                alerts.push("KCC입금 확인");
                                            }

                                            const pm = customer.paymentMethod || '';
                                            const isCashOrCard = ['현금', '카드', '50/50(현금)', '50/50(카드)', '카드+현금'].includes(pm);
                                            const isSubscription = ['현금+구독', '카드+구독', '구독(할부)'].includes(pm);
                                            const isRental = pm === 'BSON';

                                            let currentBalance = 0;
                                            if (customer.remainingBalance !== undefined && customer.remainingBalance !== null) {
                                                currentBalance = Number(customer.remainingBalance);
                                            } else {
                                                const finalQuote = Number(customer.finalQuotePrice) || Number(customer['최종견적 금액']) || 0;
                                                const paid = Number(customer.paymentAmount1) || 0;
                                                currentBalance = finalQuote - paid;
                                            }

                                            // 2. 결제정보가 현금/카드인 경우이고 계약취소가 아닌 경우에 잔금이 0이 아닌경우
                                            if (isCashOrCard && !isCanceled && currentBalance !== 0) {
                                                alerts.push("입금/결제 완료 체크");
                                            }

                                            // 3. 결제정보가 구독(할부)인 경우이고 계약취소가 아닌 경우에 할부약정일/녹취약정일에 날짜가 없는 경우
                                            if (isSubscription && !isCanceled && !customer.installmentAgreementDate && !customer.recordingAgreementDate) {
                                                alerts.push("할부/녹취 약정 완료 체크");
                                            }

                                            // 4. 결제정보가 BSON 이고 계약취소가 아닌 경우, 녹취약정일에 날짜가 없는 경우
                                            if (isRental && !isCanceled && !customer.recordingAgreementDate) {
                                                alerts.push("렌탈 녹취약정 완료 체크");
                                            }

                                            if (alerts.length === 0) return (
                                                <div className="text-[11px] font-medium text-gray-400 italic py-1 px-1">체크사항 없음</div>
                                            );

                                            return alerts.map((alert, i) => (
                                                <div key={i} className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-1.5 rounded-md w-fit">
                                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                                    {alert}
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ContractDetailModal
                isOpen={!!selectedCustomer}
                onClose={() => setSelectedCustomer(null)}
                customer={selectedCustomer}
                userRole="partner"
            />
        </div>
    );
}

export default function PartnerContractsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PartnerContractsContent />
        </Suspense>
    );
}
