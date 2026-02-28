'use client';

import { useState, useMemo } from 'react';
import { Users, TrendingUp, Calendar, ArrowRight, Filter, ClipboardList, CheckCircle2, Clock, XCircle, AlertCircle, Search, FileText, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

type DateFilterType = 'currentMonth' | '3months' | '6months' | '1year' | 'custom';

interface Partner {
    '아이디': string;
    '업체명': string;
    '대표명'?: string;
    '연락처'?: string;
    '상태'?: string;
    '등록일'?: string;
    '신청일시'?: string;
    'Timestamp'?: string;
    [key: string]: string | number | boolean | undefined | null;
}

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
    [key: string]: string | number | boolean | undefined | null;
}

export default function AdminDashboard() {
    const router = useRouter();

    // Convex Queries
    const convexCustomers = useQuery(api.customers.listCustomers);
    const convexPartners = useQuery(api.partners.listPartners);

    // Filters
    const [dateFilter, setDateFilter] = useState<DateFilterType>('3months');
    const [customStartDate, setCustomStartDate] = useState(format(subMonths(new Date(), 3), 'yyyy-MM-dd'));
    const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // Loading State
    const loading = convexCustomers === undefined || convexPartners === undefined;

    // Map Convex Data to Legacy Structure
    const allData = useMemo(() => {
        if (!convexCustomers || !convexPartners) return { customers: [], partners: [] };

        const customers = convexCustomers.map(c => ({
            'No.': c.no || '',
            '고객명': c.name || '',
            '연락처': c.contact || '',
            '주소': c.address || '',
            '진행구분': c.status || '접수',
            '라벨': c.label || '일반',
            '채널': c.channel || '',
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
            '등록일': c._creationTime ? new Date(c._creationTime).toISOString().split('T')[0] : '', // Fallback for date filter
            'Timestamp': c._creationTime ? new Date(c._creationTime).toISOString() : '',
        }));

        const partners = convexPartners.map(p => ({
            '아이디': p.uid,
            '업체명': p.name,
            '대표명': p.ceo_name,
            '연락처': p.contact,
            '주소': p.address,
            '상태': p.status || '승인대기',
            '사업자번호': p.business_number,
            '계좌번호': p.account_number,
            '이메일': p.email,
            '등록일': p._creationTime ? new Date(p._creationTime).toISOString().split('T')[0] : '',
            '신청일시': p._creationTime ? new Date(p._creationTime).toISOString() : '',
            'Timestamp': p._creationTime ? new Date(p._creationTime).toISOString() : '',
        }));

        return { customers, partners };
    }, [convexCustomers, convexPartners]);

    // Date filtering logic
    const filteredData = useMemo(() => {
        const now = new Date();
        let start: Date;
        let end: Date = endOfMonth(now);

        switch (dateFilter) {
            case 'currentMonth':
                start = startOfMonth(now);
                break;
            case '3months':
                start = subMonths(now, 3);
                break;
            case '6months':
                start = subMonths(now, 6);
                break;
            case '1year':
                start = subMonths(now, 12);
                break;
            case 'custom':
                start = parseISO(customStartDate);
                end = parseISO(customEndDate);
                break;
            default:
                start = subMonths(now, 3);
        }

        const filterByDate = (item: Customer | Partner) => {
            // 다양한 날짜 식별자 지원 (등록일 추가)
            const dateStr = item['신청일'] || item['신청일시'] || item['Timestamp'] || item['등록일'];
            if (!dateStr) return true; // 날짜 필드가 아예 없으면 필터에서 제외하지 않음 (연동 체크용)
            try {
                const itemDate = new Date(dateStr as string);
                if (isNaN(itemDate.getTime())) return true;
                return isWithinInterval(itemDate, { start, end });
            } catch {
                return true;
            }
        };

        return {
            customers: allData.customers.filter(filterByDate),
            partners: allData.partners.filter(filterByDate)
        };
    }, [allData, dateFilter, customStartDate, customEndDate]);

    // Customer status counts
    const customerStats = useMemo(() => {
        const stats: Record<string, number> = {
            '전체': filteredData.customers.length,
            '접수': 0,
            '부재': 0,
            '예약콜': 0,
            '거부': 0,
            '사이즈요청': 0,
            '가견적요청': 0,
            '가견적전달': 0,
            '가견적불가': 0,
            '실측요청': 0,
            '실측진행': 0,
            '실측취소': 0,
            '최종견적요청': 0,
            '최종견적전달': 0,
            '최종고민중': 0,
            '견적후취소': 0,
            '계약진행': 0,
            '결제완료': 0,
            '공사완료': 0,
            '재견적작업': 0,
            '수정견적전달': 0
        };

        filteredData.customers.forEach(c => {
            const status = c['진행구분'] || '접수';
            if (stats[status] !== undefined) {
                stats[status]++;
            }
        });
        return stats;
    }, [filteredData.customers]);

    // Partner stats
    const partnerStats = useMemo(() => {
        const total = filteredData.partners.length;
        const pending = filteredData.partners.filter(p => p['상태'] === '승인대기').length;
        const approved = total - pending;
        return { total, pending, approved };
    }, [filteredData.partners]);

    // Customer status groups and their items
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

    // Calculate group totals
    const groupStats = useMemo(() => {
        return statusGroups.map(group => {
            const total = group.items.reduce((acc, item) => acc + (customerStats[item.status] || 0), 0);
            return { title: group.title, total };
        });
    }, [customerStats, statusGroups]);

    return (
        <div className="space-y-12 relative">
            {loading && filteredData.customers.length === 0 && (
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

            {/* Header with Date Filter */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        대시보드
                        <div className="flex items-center gap-2">
                            <button onClick={() => { }} className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${loading ? 'animate-spin' : ''}`} title="자동 동기화 중">
                                <RefreshCcw className="w-5 h-5 text-gray-400" />
                            </button>
                            <button
                                onClick={async () => {
                                    if (confirm('데이터베이스 시트가 없거나 초기화가 필요하신가요? \n모든 필수 시트가 자동으로 생성됩니다.')) {
                                        try {
                                            const res = await fetch('/api/data?action=init_database', { method: 'POST', body: JSON.stringify({}) });
                                            const result = await res.json();
                                            alert(result.message);
                                        } catch {
                                            alert('초기화 실패');
                                        }
                                    }
                                }}
                                className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-black hover:bg-blue-600 transition-all flex items-center gap-2"
                            >
                                <ClipboardList className="w-3 h-3" />
                                DB 초기화
                            </button>
                        </div>
                    </h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">실시간 고객 유입 및 파트너 현황을 분석합니다.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">

                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        {(['currentMonth', '3months', '6months', '1year', 'custom'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setDateFilter(type)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${dateFilter === type ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {type === 'currentMonth' ? '당월' : type === '3months' ? '3개월' : type === '6months' ? '6개월' : type === '1year' ? '1년' : '기간선택'}
                            </button>
                        ))}
                    </div>
                    {dateFilter === 'custom' && (
                        <div className="flex items-center gap-2 mt-2 lg:mt-0">
                            <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="border rounded-lg px-2 py-1 text-xs outline-none" />
                            <span className="text-gray-400">~</span>
                            <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="border rounded-lg px-2 py-1 text-xs outline-none" />
                        </div>
                    )}
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
                    <Link href="/admin/customers" className="text-sm font-bold text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                        전체보기 <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Simple Top Stats (No icons, just numbers) */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <button
                            onClick={() => router.push('/admin/customers')}
                            className="bg-gray-900 p-6 rounded-2xl shadow-sm hover:translate-y-[2px] transition-all text-left flex flex-col justify-between h-32 group relative overflow-hidden"
                        >
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <span className="text-sm font-bold text-gray-400">전체 고객</span>
                                <div className="text-5xl font-black tracking-tighter text-white tabular-nums">
                                    {customerStats['전체']}
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
                                    {groupStats[idx].total}
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
                                            onClick={() => router.push(`/admin/customers?status=${item.status}`)}
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


            {/* 2. 파트너 현황 (Partner Status) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black flex items-center gap-2"><Users className="w-5 h-5 text-indigo-600" /> 파트너 현황</h2>
                    <Link href="/admin/partners" className="text-sm font-bold text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors">전체보기 <ArrowRight className="w-4 h-4" /></Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-4">
                    {/* 파트너 요약 카드 */}
                    <div className="lg:col-span-1 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col justify-center">
                        <div className="inline-flex p-4 bg-indigo-50 rounded-full mb-4 mx-auto">
                            <Users className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div className="text-4xl font-black tracking-tighter">{partnerStats.total}</div>
                        <div className="text-sm font-bold text-gray-400">전체 등록 파트너</div>
                        <div className="grid grid-cols-2 mt-6 pt-6 border-t border-gray-50">
                            <div>
                                <div className="text-xl font-black text-orange-500">{partnerStats.pending}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">승인 대기</div>
                            </div>
                            <div>
                                <div className="text-xl font-black text-green-600">{partnerStats.approved}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">정상 파트너</div>
                            </div>
                        </div>
                    </div>

                    {/* 최근 신청 파트너 리스트 */}
                    <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">최근 신청 파트너 (최신 6건)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {loading ? (
                                <div className="col-span-full text-center py-10 text-gray-400 text-sm">로딩 중...</div>
                            ) : filteredData.partners.length === 0 ? (
                                <div className="col-span-full text-center py-10 text-gray-400 text-sm">신청 내역 없음</div>
                            ) : (
                                filteredData.partners.slice(0, 6).map((p, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100">
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-gray-900 truncate">{p['업체명'] || '-'} </p>
                                            <p className="text-[10px] text-gray-500 font-medium">{p['등록일'] || p['신청일시']?.substring(0, 10) || p['Timestamp']?.substring(0, 10) || '-'} </p>
                                            <p className="text-[10px] text-gray-400 truncate">{p['연락처']}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black ${p['상태'] === '승인대기' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                            {p['상태'] || '승인대기'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
