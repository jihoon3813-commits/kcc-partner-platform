'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Cookies from 'js-cookie';
import { Search, FileText, RefreshCcw, MapPin, Trash2, ListOrdered } from 'lucide-react';
import ContractDetailModal, { Customer } from '@/app/components/ContractDetailModal';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function PartnerContractsContent() {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const deleteContractMutation = useMutation(api.contracts.deleteContract);
    const updateCustomerMutation = useMutation(api.customers.updateCustomer);

    const [partnerSession, setPartnerSession] = useState<{ id: string; name: string } | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setMounted(true);
            const session = Cookies.get('partner_session');
            if (session) {
                try {
                    setPartnerSession(JSON.parse(session));
                } catch {
                    // skip
                }
            }
        }, 0);
    }, []);

    const partnerName = partnerSession?.name || '';

    // Convex Data
    const convexCustomers = useQuery(api.customers.listCustomers);
    const convexContracts = useQuery(api.contracts.getContracts);

    // Filtering & Sorting State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [checklistFilter, setChecklistFilter] = useState('');
    const [sortOption, setSortOption] = useState<'reg_desc' | 'reg_asc' | 'no_asc' | 'no_desc' | 'reception_asc' | 'reception_desc'>('reg_desc');

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

            const pm = contract?.paymentMethod || '';
            const isCanceled = rawStatus === '결제취소';
            const finalQuote = Number(contract?.finalQuotePrice) || Number(c.price_final) || 0;
            const paid = Number(contract?.paymentAmount1) || 0;
            const remaining = Number(contract?.remainingBalance) ?? (finalQuote - paid);

            const isCashOrCard = ['현금', '카드', '50/50(현금)', '50/50(카드)', '카드+현금'].includes(pm);
            const isSubscription = ['현금+구독', '카드+구독', '구독(할부)'].includes(pm);
            const isRental = pm === 'BSON';

            // Alerts logic
            const alerts = [];
            if (contract?.kccDepositStatus !== '입금완료') alerts.push("KCC입금 확인");
            if (isCashOrCard && !isCanceled && remaining !== 0) alerts.push("입금/결제 완료 체크");
            if (isSubscription && !isCanceled && !contract?.installmentAgreementDate && !contract?.recordingAgreementDate) alerts.push("할부/녹취 약정 완료 체크");
            if (isRental && !isCanceled && !contract?.recordingAgreementDate) alerts.push("렌탈 녹취약정 완료 체크");

            return {
                'No.': c.no || '',
                '라벨': c.label || '일반',
                '진행구분': c.status || '접수', // 고객관리의 진행구분
                '유입채널': c.channel || '',
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
                alerts: alerts
            };
        });

        const myCustomers = mapped.filter(c => {
            if (!partnerSession) return false;
            const channel = String(c['유입채널'] || '');
            return channel.includes(partnerName) || channel === partnerSession.id;
        });

        // "계약등록" 상태만 필터링 (고객 상태가 계약등록인 것)
        return myCustomers.filter(c => String(c['진행구분']) === '계약등록');
    }, [convexCustomers, convexContracts, partnerName, partnerSession]);

    // Sorting Helper
    const parseNoStr = (noStr: string | number) => {
        const parts = String(noStr).split('-');
        const base = parseInt(parts[0].replace(/[^0-9]/g, ''), 10);
        const suffix = parts.length > 1 ? parseInt(parts[1].replace(/[^0-9]/g, ''), 10) : 0;
        return { base: isNaN(base) ? 0 : base, suffix: isNaN(suffix) ? 0 : suffix };
    };

    const filteredCustomers = useMemo(() => {
        // First sort
        const sorted = [...allMappedCustomers].sort((a, b) => {
            if (sortOption === 'reg_desc') {
                const timeA = Math.max(a.updatedAt || 0, a._creationTime || 0);
                const timeB = Math.max(b.updatedAt || 0, b._creationTime || 0);
                return timeB - timeA;
            }
            if (sortOption === 'reg_asc') {
                const timeA = Math.max(a.updatedAt || 0, a._creationTime || 0);
                const timeB = Math.max(b.updatedAt || 0, b._creationTime || 0);
                return timeA - timeB;
            }
            if (sortOption === 'no_asc') {
                const noA = parseNoStr(a['No.']);
                const noB = parseNoStr(b['No.']);
                if (noA.base !== noB.base) return noA.base - noB.base;
                return noA.suffix - noB.suffix;
            }
            if (sortOption === 'no_desc') {
                const noA = parseNoStr(a['No.']);
                const noB = parseNoStr(b['No.']);
                if (noA.base !== noB.base) return noB.base - noA.base;
                return noB.suffix - noA.suffix;
            }
            if (sortOption === 'reception_asc') {
                return (a['신청일'] || '').localeCompare(b['신청일'] || '');
            }
            if (sortOption === 'reception_desc') {
                return (b['신청일'] || '').localeCompare(a['신청일'] || '');
            }
            return 0;
        });

        // Then filter
        return sorted.filter((c: any) => {
            const searchMatch = !searchTerm || (
                (c['고객명'] && String(c['고객명']).includes(searchTerm)) ||
                (c['연락처'] && String(c['연락처']).includes(searchTerm)) ||
                (c['주소'] && String(c['주소']).includes(searchTerm))
            );
            if (!searchMatch) return false;

            if (statusFilter && c.contractStatus !== statusFilter) return false;
            if (checklistFilter && !c.alerts.includes(checklistFilter)) return false;

            return true;
        });
    }, [allMappedCustomers, searchTerm, statusFilter, checklistFilter, sortOption]);

    const filterOptions = useMemo(() => {
        const statuses = Array.from(new Set(allMappedCustomers.map(c => c.contractStatus).filter(Boolean))).sort();
        return { statuses };
    }, [allMappedCustomers]);

    const handleDelete = async (e: React.MouseEvent, customer: { id: any; '고객명': string }) => {
        e.stopPropagation();
        if (confirm(`'${customer['고객명']}' 고객의 계약 정보를 등록해제 하시겠습니까? (고객 상태가 '등록해제'로 변경되며 리스트에서 제외됩니다)`)) {
            try {
                await deleteContractMutation({ customerId: customer.id });
                await updateCustomerMutation({
                    id: customer.id,
                    updates: { status: '등록해제' }
                });
                alert('등록해제 되었습니다.');
            } catch (err) {
                console.error(err);
                alert('삭제 중 오류가 발생했습니다.');
            }
        }
    };

    if (!mounted) return null;

    const loading = convexCustomers === undefined;

    return (
        <div className="lg:px-4 lg:py-6 space-y-6 pb-10">
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-50 pb-6">
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
                            onClick={() => window.location.reload()}
                            title="새로고침"
                        >
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-start gap-3">
                    <div className="flex-1 min-w-[150px]">
                        <label className="text-[11px] font-black text-gray-400 mb-1.5 ml-1 block">검색어 (이름, 연락처, 주소)</label>
                        <div className="relative group">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="검색어를 입력하세요..."
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="w-full lg:w-[150px] shrink-0">
                        <label className="text-[11px] font-black text-gray-400 mb-1.5 ml-1 block">계약 진행상태</label>
                        <select
                            className="w-full px-3 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-200 transition-all cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">전체 상태</option>
                            {filterOptions.statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="w-full lg:w-[190px] shrink-0">
                        <label className="text-[11px] font-black text-gray-400 mb-1.5 ml-1 block text-red-600">체크리스트 필터</label>
                        <select
                            className="w-full px-3 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-200 transition-all cursor-pointer text-red-600 truncate"
                            value={checklistFilter}
                            onChange={(e) => setChecklistFilter(e.target.value)}
                        >
                            <option value="" className="text-gray-900">전체 항목</option>
                            <option value="KCC입금 확인">KCC입금 확인 필요</option>
                            <option value="입금/결제 완료 체크">입금/결제 체크 필요</option>
                            <option value="할부/녹취 약정 완료 체크">할부/녹취 약정 체크 필요</option>
                            <option value="렌탈 녹취약정 완료 체크">렌탈 녹취약정 체크 필요</option>
                        </select>
                    </div>

                    <div className="w-full lg:w-[210px] shrink-0">
                        <label className="text-[11px] font-black text-gray-400 mb-1.5 ml-1 block">정렬 기준</label>
                        <div className="relative group">
                            <ListOrdered className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <select
                                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-200 transition-all cursor-pointer truncate"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value as any)}
                            >
                                <option value="reg_desc">등록일 최신순(시스템)</option>
                                <option value="reg_asc">등록일 오래된순(시스템)</option>
                                <option value="reception_desc">접수일 최신순(엑셀)</option>
                                <option value="reception_asc">접수일 오래된순(엑셀)</option>
                                <option value="no_desc">고객번호 큰순</option>
                                <option value="no_asc">고객번호 작은순</option>
                            </select>
                        </div>
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

                                    {/* Delete Button Container */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => handleDelete(e, customer)}
                                            className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                                            title="계약 등록해제"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
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
                                            const alerts = customer.alerts || [];
                                            if (alerts.length === 0) return (
                                                <div className="text-[11px] font-medium text-gray-400 italic py-1 px-1">체크사항 없음</div>
                                            );

                                            return alerts.map((alert: string, i: number) => (
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
