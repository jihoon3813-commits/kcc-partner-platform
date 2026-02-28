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
    const [customStartDate, setCustomStartDate] = useState(format(subMonths(new Date(), 3), 'yyyy-MM-dd'));
    const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // Convex Data
    const convexCustomers = useQuery(api.customers.listCustomers);

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
                    '신청일시': c._creationTime ? new Date(c._creationTime).toLocaleString() : '',
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
                return isWithinInterval(itemDate, { start, end });
            } catch {
                return true;
            }
        });
    }, [allCustomers, dateFilter, customStartDate, customEndDate]);

    // Customer status counts
    const customerStats = useMemo(() => {
        const stats: Record<string, number> = {
            '전체': filteredCustomers.length,
            '접수': 0, '부재': 0, '예약콜': 0, '거부': 0,
            '사이즈요청': 0, '가견적요청': 0, '가견적전달': 0, '가견적불가': 0,
            '실측요청': 0, '실측진행': 0, '실측취소': 0,
            '최종견적요청': 0, '최종견적전달': 0, '최종고민중': 0, '견적후취소': 0,
            '계약진행': 0, '결제완료': 0, '공사완료': 0,
            '재견적작업': 0, '수정견적전달': 0
        };

        filteredCustomers.forEach(c => {
            const status = c['진행구분'] || '접수';
            if (stats[status] !== undefined) {
                stats[status]++;
            }
        });
        return stats;
    }, [filteredCustomers]);

    // Status groups (Exactly the same as Admin)
    const statusGroups = useMemo(() => [
        {
            title: '상담단계',
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            items: [
                { label: '접수', color: 'bg-orange-500', icon: <Clock className="w-3.5 h-3.5" />, status: '접수' },
                { label: '부재', color: 'bg-gray-400', icon: <AlertCircle className="w-3.5 h-3.5" />, status: '부재' },
                { label: '예약콜', color: 'bg-indigo-400', icon: <Calendar className="w-3.5 h-3.5" />, status: '예약콜' },
                { label: '거부', color: 'bg-red-400', icon: <XCircle className="w-3.5 h-3.5" />, status: '거부' },
            ]
        },
        {
            title: '가견적단계',
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            items: [
                { label: '가견적요청', color: 'bg-purple-500', icon: <FileText className="w-3.5 h-3.5" />, status: '가견적요청' },
                { label: '가견적전달', color: 'bg-purple-600', icon: <FileText className="w-3.5 h-3.5" />, status: '가견적전달' },
                { label: '가견적불가', color: 'bg-red-600', icon: <AlertCircle className="w-3.5 h-3.5" />, status: '가견적불가' },
                { label: '사이즈요청', color: 'bg-yellow-500', icon: <Filter className="w-3.5 h-3.5" />, status: '사이즈요청' },
                { label: '실측요청', color: 'bg-blue-400', icon: <Search className="w-3.5 h-3.5" />, status: '실측요청' },
                { label: '실측진행', color: 'bg-blue-500', icon: <Search className="w-3.5 h-3.5" />, status: '실측진행' },
                { label: '실측취소', color: 'bg-gray-500', icon: <XCircle className="w-3.5 h-3.5" />, status: '실측취소' },
            ]
        },
        {
            title: '최종견적단계',
            color: 'text-teal-600',
            bg: 'bg-teal-50',
            items: [
                { label: '최종견적요청', color: 'bg-teal-500', icon: <ClipboardList className="w-3.5 h-3.5" />, status: '최종견적요청' },
                { label: '최종견적전달', color: 'bg-teal-600', icon: <ClipboardList className="w-3.5 h-3.5" />, status: '최종견적전달' },
                { label: '수정견적전달', color: 'bg-orange-700', icon: <FileText className="w-3.5 h-3.5" />, status: '수정견적전달' },
                { label: '재견적작업', color: 'bg-orange-600', icon: <RefreshCcw className="w-3.5 h-3.5" />, status: '재견적작업' },
                { label: '견적후취소', color: 'bg-red-700', icon: <XCircle className="w-3.5 h-3.5" />, status: '견적후취소' },
            ]
        },
        {
            title: '계약단계',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            items: [
                { label: '최종고민중', color: 'bg-yellow-600', icon: <Clock className="w-3.5 h-3.5" />, status: '최종고민중' },
                { label: '계약진행', color: 'bg-emerald-500', icon: <CheckCircle2 className="w-3.5 h-3.5" />, status: '계약진행' },
                { label: '결제완료', color: 'bg-emerald-600', icon: <CheckCircle2 className="w-3.5 h-3.5" />, status: '결제완료' },
                { label: '공사완료', color: 'bg-green-600', icon: <CheckCircle2 className="w-3.5 h-3.5" />, status: '공사완료' },
            ]
        }
    ], []);

    const groupStats = useMemo(() => {
        return statusGroups.map(group => {
            const total = group.items.reduce((acc, item) => acc + (customerStats[item.status] || 0), 0);
            return { title: group.title, total };
        });
    }, [customerStats, statusGroups]);

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
                    {/* Simple Top Stats (No icons, just numbers) */}
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

                        {statusGroups.map((group, idx) => (
                            <div
                                key={idx}
                                className="bg-white px-6 py-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32"
                            >
                                <span className="text-sm font-bold text-gray-400">{group.title}</span>
                                <div className={`text-5xl font-black tracking-tighter ${group.color} tabular-nums`}>
                                    {loading ? '...' : groupStats[idx].total}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Cleaner Detailed Status List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {statusGroups.map((group, gIdx) => (
                            <div key={gIdx} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <div className="text-base font-black text-gray-900 mb-5 pb-3 border-b border-gray-100 flex justify-between items-center">
                                    {group.title}
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${group.bg} ${group.color}`}>
                                        {loading ? '-' : groupStats[gIdx].total}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {group.items.map((item, iIdx) => (
                                        <button
                                            key={iIdx}
                                            onClick={() => router.push(`/partner/customers?status=${item.status}`)}
                                            className="w-full flex items-center justify-between group hover:bg-gray-50 px-2.5 py-2 rounded-lg -mx-2.5 transition-colors"
                                        >
                                            <span className="text-sm text-gray-500 font-medium group-hover:text-gray-900 transition-colors">
                                                {item.label}
                                            </span>
                                            <span className={`text-sm font-bold tabular-nums ${customerStats[item.status] ? 'text-gray-900' : 'text-gray-300'}`}>
                                                {loading ? '-' : customerStats[item.status] || 0}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
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

            <CustomerDetailModal
                isOpen={!!selectedCustomer}
                onClose={() => setSelectedCustomer(null)}
                customer={selectedCustomer}
                currentUser={partnerInfo?.name || ''}
                onUpdate={fetchData}
                readOnly={true}
            />
        </div>
    );
}
