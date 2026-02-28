'use client';

import { useState, useEffect, useMemo, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { Search, Filter, Users, RefreshCcw, MapPin, Calendar, ClipboardList } from 'lucide-react';
import CustomerDetailModal from '@/app/components/CustomerDetailModal';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

type DateFilterType = 'currentMonth' | '3months' | '6months' | '1year' | 'custom';

interface Customer {
    'No.': string | number;
    '고객명': string;
    '연락처': string;
    '진행구분': string;
    '상태'?: string;
    '등록일'?: string;
    '신청일'?: string;
    '신청일시'?: string;
    'Timestamp'?: string;
    '라벨'?: string;
    '유입채널'?: string;
    updatedAt?: number;
    '주소'?: string;
    'KCC 피드백'?: string;
    '진행현황(상세)_최근'?: string;
    '가견적 링크'?: string;
    '최종 견적 링크'?: string;
    '고객견적서(최종)'?: string;
    '실측일자'?: string;
    '시공일자'?: string;
    '가견적 금액'?: string | number;
    '최종견적 금액'?: string | number;
    [key: string]: string | number | boolean | undefined | null;
}

function PartnerCustomersContent() {
    const searchParams = useSearchParams();
    const routerStatus = searchParams.get('status');

    const [partnerSession, setPartnerSession] = useState<{ id: string; name: string } | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setMounted(true);
            const session = Cookies.get('partner_session');
            if (session) {
                try {
                    setPartnerSession(JSON.parse(session));
                } catch (e) {
                    console.error("Session parse error", e);
                }
            }
        }, 0);
    }, []);

    const partnerName = partnerSession?.name || '';

    // Convex Data
    const convexCustomers = useQuery(api.customers.listCustomers);

    // Fetch dynamic settings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settingLabels = useQuery((api as any).settings.getLabels) || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settingStatuses = useQuery((api as any).settings.getStatuses) || [];

    // Correctly process and map customers data using useMemo to avoid cascading renders
    const allMappedCustomers = useMemo(() => {
        if (!convexCustomers) return [];
        const mapped = convexCustomers.map(c => ({
            'No.': c.no || '',
            '라벨': c.label || '일반',
            '진행구분': c.status || '접수',
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
            '시공일자': c.construct_date || '',
            '가견적 금액': c.price_pre || 0,
            '최종견적 금액': c.price_final || 0,
            '신청일': c.created_at || (c._creationTime ? new Date(c._creationTime).toISOString().split('T')[0] : ''),
            '신청일시': c._creationTime ? new Date(c._creationTime).toISOString() : '',
            'id': c._id,
            '_creationTime': c._creationTime,
            'updatedAt': c.updatedAt
        }));

        // Filter for my customers
        const myCustomers = mapped.filter(c => {
            if (!partnerSession) return false;
            const channel = String(c['유입채널'] || '');
            return channel.includes(partnerName) || channel === partnerSession.id;
        });

        return myCustomers.sort((a, b) => {
            const timeA = Math.max(a.updatedAt || 0, a._creationTime || 0);
            const timeB = Math.max(b.updatedAt || 0, b._creationTime || 0);

            if (timeB !== timeA) {
                return timeB - timeA;
            }

            const noA = String(a['No.'] || '').trim();
            const noB = String(b['No.'] || '').trim();
            const isAEmpty = !noA || noA.includes('-');
            const isBEmpty = !noB || noB.includes('-');

            if (isAEmpty && !isBEmpty) return -1;
            if (!isAEmpty && isBEmpty) return 1;

            const nA = parseInt(noA.replace(/[^0-9]/g, ''), 10);
            const nB = parseInt(noB.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(nA) && !isNaN(nB) && nA !== nB) return nB - nA;
            return 0;
        });
    }, [convexCustomers, partnerName, partnerSession]);

    const loading = convexCustomers === undefined;

    const fetchData = useCallback(async () => {
        // Handled by useQuery
    }, []);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(routerStatus || '');
    const [labelFilter, setLabelFilter] = useState('');

    // Date Filters
    const [dateFilter, setDateFilter] = useState<DateFilterType>('3months');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    useEffect(() => {
        setTimeout(() => {
            setCustomStartDate(format(subMonths(new Date(), 3), 'yyyy-MM-dd'));
            setCustomEndDate(format(new Date(), 'yyyy-MM-dd'));
        }, 0);
    }, []);

    // statusFilter is already initialized with routerStatus above

    // Derive unique values for filters
    const filterOptions = useMemo(() => {
        const labels = Array.from(new Set(allMappedCustomers.map(c => c['라벨']).filter(Boolean))).sort();
        const statuses = Array.from(new Set(allMappedCustomers.map(c => c['진행구분']).filter(Boolean))).sort();
        return { labels, statuses };
    }, [allMappedCustomers]);

    const filteredCustomers = useMemo(() => {
        // 1. Date filter boundaries
        const now = new Date();
        let start: Date;
        let end: Date = endOfMonth(now);

        switch (dateFilter) {
            case 'currentMonth': start = startOfMonth(now); break;
            case '3months': start = subMonths(now, 3); break;
            case '6months': start = subMonths(now, 6); break;
            case '1year': start = subMonths(now, 12); break;
            case 'custom':
                start = parseISO(customStartDate);
                end = parseISO(customEndDate);
                break;
            default: start = subMonths(now, 3);
        }

        return allMappedCustomers.filter(c => {
            // Date Filter
            const dateStr = c['신청일'] || c['신청일시'];
            if (dateStr) {
                try {
                    const itemDate = new Date(dateStr as string);
                    if (!isNaN(itemDate.getTime()) && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
                        if (!isWithinInterval(itemDate, { start, end })) return false;
                    }
                } catch { /* skip */ }
            }

            // Text Search
            const searchMatch = !searchTerm || (
                (c['고객명'] && String(c['고객명']).includes(searchTerm)) ||
                (c['연락처'] && String(c['연락처']).includes(searchTerm)) ||
                (c['주소'] && String(c['주소']).includes(searchTerm))
            );
            if (!searchMatch) return false;

            // Status Filter
            if (statusFilter && c['진행구분'] !== statusFilter) {
                if (statusFilter === '완료') {
                    if (!c['진행구분']?.includes('완료')) return false;
                } else {
                    return false;
                }
            }

            // Label Filter
            if (labelFilter && c['라벨'] !== labelFilter) return false;

            return true;
        });
    }, [allMappedCustomers, searchTerm, statusFilter, labelFilter, dateFilter, customStartDate, customEndDate]);

    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setLabelFilter('');
        setDateFilter('3months');
    };

    return (
        <div className="lg:px-4 lg:py-6 space-y-8 pb-32">
            {/* Header Area */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <Users className="w-6 h-6 text-blue-600" />
                            내 고객 관리
                        </h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">{partnerName} 채널 고객 정보를 관리합니다.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            {[
                                { id: 'currentMonth', label: '이번달' },
                                { id: '3months', label: '3개월' },
                                { id: '6months', label: '6개월' },
                                { id: '1year', label: '1년' },
                                { id: 'custom', label: '직접설정' },
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setDateFilter(opt.id as DateFilterType)}
                                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${dateFilter === opt.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {dateFilter === 'custom' && (
                            <div className="flex items-center gap-2 bg-white border p-1 rounded-xl shadow-sm animate-in fade-in slide-in-from-right-2">
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="text-xs font-bold p-1.5 outline-none bg-gray-50 rounded-lg"
                                />
                                <span className="text-gray-300">~</span>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="text-xs font-bold p-1.5 outline-none bg-gray-50 rounded-lg"
                                />
                            </div>
                        )}

                        <button
                            onClick={fetchData}
                            className={`p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all ${loading ? 'animate-spin' : ''}`}
                            title="새로고침"
                        >
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Search */}
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

                    {/* Status Filter */}
                    <div className="relative group">
                        <Filter className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <select
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none appearance-none cursor-pointer transition-all"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">진행상태 전체</option>
                            {filterOptions.statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Label Filter */}
                    <div className="relative group">
                        <div className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        </div>
                        <select
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none appearance-none cursor-pointer transition-all"
                            value={labelFilter}
                            onChange={(e) => setLabelFilter(e.target.value)}
                        >
                            <option value="">중요도 전체</option>
                            {filterOptions.labels.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>

                    <button
                        onClick={handleResetFilters}
                        className="flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl text-sm font-black hover:bg-blue-600 transition-all shadow-lg shadow-gray-200"
                    >
                        <RefreshCcw className="w-4 h-4" /> 필터 초기화
                    </button>
                </div>


            </div>

            {/* Results Header & Legend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-4">
                    <p className="text-sm font-bold text-gray-500">검색 결과 <span className="text-blue-600">{filteredCustomers.length}</span>건</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Legend: Status Bar */}
                    <div className="flex items-center gap-2 opacity-80">
                        <span className="text-[10px] font-bold text-gray-400">범례:</span>
                        <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-red-50 text-red-600 rounded-md border border-red-100">
                            <div className="w-1 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-[10px] font-black">정보수정</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
                            <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-[10px] font-black">신규등록</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded-md border border-gray-100">
                            <div className="w-1 h-3 bg-gray-300 rounded-full"></div>
                            <span className="text-[10px] font-black text-gray-400">상태유지</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Body */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-50 rounded-full animate-spin border-t-blue-500 shadow-lg shadow-blue-500/10"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <RefreshCcw className="w-6 h-6 text-blue-500 animate-pulse" />
                            </div>
                        </div>
                        <div className="text-center space-y-1">
                            <h2 className="text-gray-900 font-black text-lg tracking-tighter uppercase italic">Synchronizing Data...</h2>
                            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">클라우드 데이터베이스와 동기화 중입니다</p>
                        </div>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="bg-white p-20 rounded-2xl border border-gray-100 text-center text-gray-400 font-bold">검색 조건에 맞는 고객이 없습니다.</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredCustomers.map((customer, index) => (
                            <div
                                key={index}
                                onClick={() => setSelectedCustomer(customer)}
                                className="bg-white border border-gray-100 rounded-2xl p-3 lg:p-4 flex flex-col lg:flex-row gap-4 lg:gap-6 hover:shadow-2xl hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                {/* Accent Bar */}
                                {(() => {
                                    const now = Date.now();
                                    const oneDay = 24 * 60 * 60 * 1000;
                                    const isRecentUpdate = customer.updatedAt && (now - customer.updatedAt) <= oneDay;
                                    const isRecentNew = (now - (customer._creationTime || 0)) <= oneDay;

                                    return (
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isRecentUpdate ? 'bg-red-500' :
                                            isRecentNew ? 'bg-blue-500' :
                                                'bg-gray-300'
                                            }`}></div>
                                    );
                                })()}

                                {/* 1. 기본 정보 & 상태 */}
                                <div className="lg:w-[380px] shrink-0 border-b lg:border-b-0 lg:border-r border-gray-50 pb-3 lg:pb-0 lg:pr-6">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {(() => {
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    const dynStatus = settingStatuses?.find((s: any) => s.name === customer['진행구분']);
                                                    return (
                                                        <span
                                                            className={`text-[11px] font-black px-3 py-1 rounded-full border shadow-sm whitespace-nowrap ${!dynStatus ? (String(customer['진행구분'])?.includes('완료') ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100' :
                                                                String(customer['진행구분'])?.includes('접수') ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100' :
                                                                    String(customer['진행구분'])?.includes('예약콜') ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-indigo-100' :
                                                                        String(customer['진행구분'])?.includes('실측요청') ? 'bg-orange-50 text-orange-700 border-orange-200 shadow-orange-100' :
                                                                            String(customer['진행구분'])?.includes('가견적전달') ? 'bg-cyan-50 text-cyan-700 border-cyan-200 shadow-cyan-100' :
                                                                                String(customer['진행구분'])?.includes('실측완료') ? 'bg-teal-50 text-teal-700 border-teal-200 shadow-teal-100' :
                                                                                    String(customer['진행구분'])?.includes('거부') || String(customer['진행구분'])?.includes('부재') || String(customer['진행구분'])?.includes('취소') || String(customer['진행구분'])?.includes('등록해제') ? 'bg-gray-50 text-gray-500 border-gray-200 shadow-none' :
                                                                                        'bg-white text-blue-600 border-blue-600 shadow-blue-100') : ''
                                                                }`}
                                                            style={dynStatus ? { backgroundColor: `${dynStatus.color}20`, color: dynStatus.color, borderColor: `${dynStatus.color}40` } : undefined}
                                                        >
                                                            {customer['진행구분'] || '접수'}
                                                        </span>
                                                    );
                                                })()}
                                                {customer['라벨'] && (() => {
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    const dynLabel = settingLabels?.find((l: any) => l.name === customer['라벨']);
                                                    return (
                                                        <span
                                                            className={`text-[10px] font-black text-white px-2.5 py-1 rounded-lg tracking-widest whitespace-nowrap ${!dynLabel ? (customer['라벨'] === '완료' ? 'bg-[#107c41]' :
                                                                customer['라벨'] === '체크' ? 'bg-[#D4AF37]' :
                                                                    customer['라벨'] === '보류' ? 'bg-slate-500' :
                                                                        'bg-blue-600') : ''
                                                                }`}
                                                            style={dynLabel ? { backgroundColor: dynLabel.color } : undefined}
                                                        >
                                                            {customer['라벨']}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 tracking-tighter whitespace-nowrap">
                                                    {customer['신청일'] ? String(customer['신청일']).substring(0, 10) : '-'}
                                                </span>
                                                {customer['No.'] && <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg whitespace-nowrap">No.{customer['No.']}</span>}
                                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg whitespace-nowrap">{customer['유입채널']}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-baseline gap-3 mt-0.5">
                                            <h3 className="text-xl font-black text-gray-900 leading-tight">{customer['고객명']}</h3>
                                            <span className="text-base text-gray-500 font-bold tracking-tight">{customer['연락처']}</span>
                                        </div>

                                        <div className="flex items-start gap-2 text-sm text-gray-400 font-medium">
                                            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                            <span className="truncate" title={customer['주소']}>{customer['주소']?.replace(/\s*\[\d+\]$/, '')}</span>
                                        </div>

                                        <div className="flex gap-2">
                                            <div className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg border ${customer['실측일자'] ? 'bg-green-50/50 border-green-100 text-green-700' : 'bg-gray-50 border-gray-50 text-gray-300'}`}>
                                                <Calendar className="w-3 h-3" />
                                                <span className="font-bold">실측: {customer['실측일자'] ? String(customer['실측일자']).substring(5, 10).replace('-', '.') : '-'}</span>
                                            </div>
                                            <div className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg border ${customer['시공일자'] ? 'bg-blue-50/50 border-blue-100 text-blue-700' : 'bg-gray-50 border-gray-50 text-gray-300'}`}>
                                                <ClipboardList className="w-3 h-3" />
                                                <span className="font-bold">시공: {customer['시공일자'] ? String(customer['시공일자']).substring(5, 10).replace('-', '.') : '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. 중앙 로그 요약 */}
                                <div className="flex-1 min-w-0 py-1 flex flex-col justify-center space-y-2">
                                    <div className="space-y-2">
                                        <div className="flex gap-2 items-start group/line">
                                            <span className={`shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-lg ${customer['KCC 피드백'] ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-50 text-gray-300'}`}>피드백</span>
                                            <p className={`text-[13px] line-clamp-2 ${customer['KCC 피드백'] ? 'text-gray-700 leading-relaxed' : 'text-gray-200 italic font-medium'}`}>
                                                {customer['KCC 피드백'] ? String(customer['KCC 피드백']).split('\n')[0] : '등록된 피드백이 없습니다.'}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 items-start group/line">
                                            <span className={`shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-lg ${customer['진행현황(상세)_최근'] ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-50 text-gray-300'}`}>진행기록</span>
                                            <p className={`text-[13px] line-clamp-2 ${customer['진행현황(상세)_최근'] ? 'text-gray-600 leading-relaxed' : 'text-gray-200 italic font-medium'}`}>
                                                {customer['진행현황(상세)_최근'] ? String(customer['진행현황(상세)_최근']).split('\n')[0] : '등록된 최근 기록 없음'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. 견적 및 링크 (Right Side with Flex Column) */}
                                <div className="lg:w-56 shrink-0 flex flex-col justify-center gap-3 lg:pl-6 border-l lg:border-gray-50">
                                    <div className="flex gap-2 justify-center lg:justify-end">
                                        <BadgeLink href={customer['가견적 링크']} color="blue" label="가견적" />
                                        <BadgeLink href={customer['최종 견적 링크']} color="indigo" label="최종" />
                                        <BadgeLink href={customer['고객견적서(가)']} color="orange" label="조회" />
                                        <BadgeLink href={customer['고객견적서(최종)']} color="green" label="내관" />
                                    </div>

                                    {/* Estimate Amounts */}
                                    {(!!customer['가견적 금액'] || !!customer['최종견적 금액']) && (
                                        <div className="grid grid-cols-1 gap-1.5 px-0.5">
                                            {!!customer['가견적 금액'] && (
                                                <div className="flex justify-between items-center bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100/50">
                                                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter italic">Pre-Est</span>
                                                    <span className="text-[13px] font-bold text-blue-600 tabular-nums">
                                                        {Number(customer['가견적 금액']).toLocaleString()}
                                                        <small className="ml-0.5 text-[10px] font-medium text-blue-400/80">원</small>
                                                    </span>
                                                </div>
                                            )}
                                            {!!customer['최종견적 금액'] && (
                                                <div className="flex justify-between items-center bg-indigo-50/50 px-3 py-1.5 rounded-xl border border-indigo-100/50">
                                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter italic">Final</span>
                                                    <span className="text-[13px] font-bold text-indigo-700 tabular-nums">
                                                        {Number(customer['최종견적 금액']).toLocaleString()}
                                                        <small className="ml-0.5 text-[10px] font-medium text-indigo-400/80">원</small>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {mounted && (
                <CustomerDetailModal
                    isOpen={!!selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                    customer={selectedCustomer}
                    onUpdate={fetchData}
                    currentUser={partnerName}
                    readOnly={false}
                />
            )}
        </div>
    );
}

function BadgeLink({ href, color, label }: { href: unknown, color: string, label: string }) {
    const isActive = Boolean(href);
    const colorClasses: Record<string, string> = {
        blue: isActive ? 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-50' : 'bg-gray-50 text-gray-200 border-gray-50',
        indigo: isActive ? 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-50' : 'bg-gray-50 text-gray-200 border-gray-50',
        orange: isActive ? 'bg-orange-50 text-orange-600 border-orange-100 shadow-orange-50' : 'bg-gray-50 text-gray-200 border-gray-50',
        green: isActive ? 'bg-green-50 text-green-600 border-green-100 shadow-green-100' : 'bg-gray-50 text-gray-200 border-gray-50',
    };

    return (
        <a
            href={typeof href === 'string' ? href : undefined}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => !isActive && e.preventDefault()}
            className={`min-w-[32px] h-8 px-1.5 flex items-center justify-center rounded-xl border-2 text-[10px] whitespace-nowrap font-black transition-all ${colorClasses[color]} ${isActive ? 'hover:scale-110 active:scale-95 shadow-lg shadow-indigo-500/10' : 'cursor-default opacity-40'}`}
        >
            {label}
        </a>
    );
}

export default function PartnerCustomersPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PartnerCustomersContent />
        </Suspense>
    );
}
