'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, TrendingUp, Calendar, Filter, ClipboardList, CheckCircle2, Clock, XCircle, AlertCircle, Search, FileText, RefreshCcw, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import CustomerDetailModal from '@/app/components/CustomerDetailModal';

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
    '주소'?: string;
    '채널'?: string;
    [key: string]: string | number | boolean | undefined | null;
}

export default function PartnerDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [partnerInfo, setPartnerInfo] = useState<{ id: string; name: string } | null>(null);

    // Filters
    const [dateFilter, setDateFilter] = useState<DateFilterType>('3months');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setMounted(true);
            setCustomStartDate(format(subMonths(new Date(), 3), 'yyyy-MM-dd'));
            setCustomEndDate(format(new Date(), 'yyyy-MM-dd'));
        }, 0);
    }, []);

    // Convex Data
    const convexCustomers = useQuery(api.customers.listCustomers);
    const dbStatuses = useQuery(api.settings.getStatuses);

    useEffect(() => {
        const session = Cookies.get('partner_session');
        if (!session) {
            router.replace('/partner/login');
            return;
        }

        try {
            const myInfo = JSON.parse(session);
            setTimeout(() => {
                setPartnerInfo(myInfo);
            }, 0);

            if (convexCustomers) {
                const mapped = convexCustomers.map(c => ({
                    'No.': c.no || '',
                    '라벨': c.label || '일반',
                    '진행구분': c.status || '접수',
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
                    '시공일자': c.construct_date || '',
                    '가견적 금액': c.price_pre || 0,
                    '최종견적 금액': c.price_final || 0,
                    '신청일': c.created_at || (c._creationTime ? new Date(c._creationTime).toISOString().split('T')[0] : ''),
                    '신청일시': c._creationTime ? new Date(c._creationTime).toISOString() : '',
                    'id': c._id,
                    '_creationTime': c._creationTime || 0
                }));

                // Filter for my customers
                const myCustomers = mapped.filter(c => {
                    const channel = String(c['채널'] || '');
                    return channel.includes(myInfo.name) || (myInfo.id && channel === myInfo.id);
                });

                // Ensure sorting by No. descending, but those without No. (online entries) stay at the top
                const sorted = myCustomers.sort((a, b) => {
                    const noA = String(a['No.'] || '');
                    const noB = String(b['No.'] || '');
                    const isAEmpty = !noA || noA.includes('-');
                    const isBEmpty = !noB || noB.includes('-');

                    if (isAEmpty && !isBEmpty) return -1;
                    if (!isAEmpty && isBEmpty) return 1;
                    if (isAEmpty && isBEmpty) return (b._creationTime || 0) - (a._creationTime || 0);

                    const nA = parseInt(noA.replace(/[^0-9]/g, ''), 10);
                    const nB = parseInt(noB.replace(/[^0-9]/g, ''), 10);
                    if (nA !== nB) return nB - nA;
                    return (b._creationTime || 0) - (a._creationTime || 0);
                });

                setTimeout(() => {
                    setAllCustomers(sorted);
                    setLoading(false);
                }, 0);
            }
        } catch (e) {
            console.error("Session parse error", e);
            Cookies.remove('partner_session');
            router.replace('/partner/login');
        }
    }, [convexCustomers, router]);

    const fetchData = useCallback(async () => {
        // Handled by useQuery
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Date filtering logic
    const filteredCustomers = useMemo(() => {
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

        return allCustomers.filter(c => {
            const dateStr = c['신청일'] || c['신청일시'] || c['Timestamp'] || c['등록일'];
            if (!dateStr) return true;
            try {
                const itemDate = new Date(dateStr as string);
                if (isNaN(itemDate.getTime())) return true;
                if (isNaN(start.getTime()) || isNaN(end.getTime())) return true;
                return isWithinInterval(itemDate, { start, end });
            } catch {
                return true;
            }
        });
    }, [allCustomers, dateFilter, customStartDate, customEndDate]);

    // Customer status counts (dynamic)
    const customerStats = useMemo(() => {
        const stats: Record<string, number> = {
            '전체': filteredCustomers.length
        };

        if (dbStatuses) {
            dbStatuses.forEach((s: any) => {
                stats[s.name] = 0;
            });
        }

        filteredCustomers.forEach(c => {
            const status = c['진행구분'] || '접수';
            if (stats[status] !== undefined || dbStatuses?.some((s: any) => s.name === status)) {
                stats[status] = (stats[status] || 0) + 1;
            } else if (status) {
                stats[status] = (stats[status] || 0) + 1;
            }
        });
        return stats;
    }, [filteredCustomers, dbStatuses]);

    // Top 4 statuses based on customer count (excluding '전체')
    const topStatuses = useMemo(() => {
        if (!dbStatuses) return [];
        return [...dbStatuses]
            .map((s: any) => ({
                name: s.name,
                count: customerStats[s.name] || 0,
                color: s.color
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 4);
    }, [customerStats, dbStatuses]);

    return (
        <div className="space-y-12 pb-20 relative">
            {loading && allCustomers.length === 0 && (
                <div className="absolute inset-x-0 top-60 z-50 flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 border-8 border-gray-100 rounded-full animate-spin border-t-blue-600"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <TrendingUp className="w-8 h-8 text-blue-600 animate-pulse" />
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-black text-gray-900 tracking-tighter italic">AGGREGATING ANALYTICS</p>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1 animate-pulse">데이터 분석 및 통계를 생성 중입니다...</p>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        대시보드
                        <button onClick={fetchData} className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${loading ? 'animate-spin' : ''}`} title="새로고침">
                            <RefreshCcw className="w-5 h-5 text-gray-400" />
                        </button>
                    </h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">실시간 고객 유입 및 현황을 분석합니다.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex bg-gray-100 p-1 rounded-xl mr-2">
                        {[
                            { id: 'currentMonth', label: '당월' },
                            { id: '3months', label: '3개월' },
                            { id: '6months', label: '6개월' },
                            { id: '1year', label: '1년' },
                            { id: 'custom', label: '기간선택' },
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setDateFilter(opt.id as DateFilterType)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${dateFilter === opt.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
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

                    <Link href="/partner/customers" className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-black hover:bg-blue-600 transition-all flex items-center gap-2">
                        <Users className="w-3 h-3" /> 고객 리스트
                    </Link>
                </div>
            </div>

            {/* 1. 고객 현황 (Customer Status) */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <ClipboardList className="w-6 h-6 text-blue-600" />
                        </div>
                        고객 현황
                    </h2>
                    <Link href="/partner/customers" className="text-sm font-bold text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                        전체보기 <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Top Stats Overview */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <button
                            onClick={() => router.push('/partner/customers')}
                            className="bg-gray-900 p-6 rounded-2xl shadow-sm hover:translate-y-[2px] transition-all text-left flex flex-col justify-between h-32 group relative overflow-hidden"
                        >
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <span className="text-sm font-bold text-gray-400">전체 고객</span>
                                <div className="text-5xl font-black tracking-tighter text-white tabular-nums">
                                    {loading ? '...' : customerStats['전체']}
                                </div>
                            </div>
                        </button>

                        {/* Top 4 populated statuses */}
                        {topStatuses.map((status, idx) => (
                            <div
                                key={idx}
                                className="bg-white px-6 py-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group cursor-pointer hover:border-blue-100 transition-colors"
                                onClick={() => router.push(`/partner/customers?status=${status.name}`)}
                            >
                                <div className="absolute top-0 right-0 w-2 h-full opacity-20" style={{ backgroundColor: status.color }} />
                                <span className="text-sm font-bold text-gray-500 truncate" title={status.name}>{status.name}</span>
                                <div className="text-5xl font-black tracking-tighter text-gray-900 tabular-nums">
                                    {loading ? '...' : status.count}
                                </div>
                            </div>
                        ))}
                        {/* Fill empty spots if less than 4 top statuses */}
                        {Array.from({ length: Math.max(0, 4 - topStatuses.length) }).map((_, idx) => (
                            <div key={`empty-${idx}`} className="bg-white/50 px-6 py-6 rounded-2xl border border-dashed border-gray-200 shadow-sm flex flex-col justify-center h-32 items-center text-gray-400 text-xs text-center">
                                빈 상태
                            </div>
                        ))}
                    </div>

                    {/* Detailed Status List (Dynamic Grid) */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
                            <h3 className="text-lg font-black text-gray-900">전체 진행현황</h3>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                                {dbStatuses?.length || 0}개 항목
                            </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {dbStatuses?.map((s: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => router.push(`/partner/customers?status=${s.name}`)}
                                    className="flex items-center justify-between group hover:bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-100/50 hover:border-gray-200 transition-all text-left"
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                                        <span className="text-sm text-gray-600 font-medium truncate group-hover:text-gray-900 transition-colors">
                                            {s.name}
                                        </span>
                                    </div>
                                    <span className={`text-sm font-black tabular-nums shrink-0 pl-2 ${customerStats[s.name] ? 'text-gray-900' : 'text-gray-300'}`}>
                                        {loading ? '-' : customerStats[s.name] || 0}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Customers List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-lg font-black flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        최근 고객 <span className="text-gray-400 text-xs font-medium ml-1">Most Recent 10</span>
                    </h2>
                    <Link href="/partner/customers" className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1">
                        전체보기 <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3">등록일</th>
                                <th className="px-6 py-3">진행구분</th>
                                <th className="px-6 py-3">No.</th>
                                <th className="px-6 py-3">고객명</th>
                                <th className="px-6 py-3">연락처</th>
                                <th className="px-6 py-3">주소</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">데이터를 불러오는 중입니다...</td>
                                </tr>
                            ) : allCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">등록된 고객이 없습니다.</td>
                                </tr>
                            ) : (
                                allCustomers
                                    .slice(0, 10)
                                    .map((customer, idx) => (
                                        <tr
                                            key={idx}
                                            onClick={() => setSelectedCustomer(customer)}
                                            className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-3 text-gray-500 font-medium whitespace-nowrap">
                                                {customer['신청일'] || '-'}
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${String(customer['진행구분']).includes('완료') || String(customer['진행구분']).includes('계약') ? 'bg-green-100 text-green-700' :
                                                    String(customer['진행구분']) === '접수' ? 'bg-orange-100 text-orange-700' :
                                                        String(customer['진행구분']) === '예약콜' ? 'bg-indigo-100 text-indigo-700' :
                                                            String(customer['진행구분']) === '부재' ? 'bg-gray-100 text-gray-500' :
                                                                String(customer['진행구분']).includes('가견적') ? 'bg-purple-100 text-purple-700' :
                                                                    String(customer['진행구분']).includes('실측') ? 'bg-blue-100 text-blue-700' :
                                                                        String(customer['진행구분']).includes('최종') ? 'bg-teal-100 text-teal-700' :
                                                                            String(customer['진행구분']) === '취소' || String(customer['진행구분']) === '거부' ? 'bg-red-100 text-red-700' :
                                                                                'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {customer['진행구분'] || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-gray-900 font-bold">
                                                {customer['No.']}
                                            </td>
                                            <td className="px-6 py-3 text-gray-900 font-bold">
                                                {customer['고객명']}
                                            </td>
                                            <td className="px-6 py-3 text-gray-500 font-medium">
                                                {customer['연락처']}
                                            </td>
                                            <td className="px-6 py-3 text-gray-500 max-w-xs truncate" title={customer['주소']}>
                                                {customer['주소']}
                                            </td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {mounted && (
                <CustomerDetailModal
                    isOpen={!!selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                    customer={selectedCustomer}
                    currentUser={partnerInfo?.name || ''}
                    onUpdate={fetchData}
                    readOnly={false}
                />
            )}
        </div>
    );
}
