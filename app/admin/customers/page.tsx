'use client';

import { useState, useEffect, useMemo, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Calendar, MapPin, ClipboardList, TrendingUp, X, CheckCircle2, RefreshCcw, Upload, UserPlus, Trash2, CheckSquare, Square, ChevronLeft, ChevronRight, ListOrdered, Copy, Download } from 'lucide-react';
import CustomerDetailModal from '@/app/components/CustomerDetailModal';
import DirectCustomerModal from '@/app/components/DirectCustomerModal';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type DateFilterType = 'currentMonth' | '3months' | '6months' | '1year' | 'custom';

interface Customer {
    'No.': string | number;
    '신청일'?: string;
    '신청일시'?: string;
    '고객명': string;
    '연락처': string;
    '주소': string;
    '진행구분': string;
    '라벨'?: string;
    '채널': string;
    'KCC 피드백'?: string;
    '진행현황(상세)_최근'?: string;
    '가견적 링크'?: string;
    '최종 견적 링크'?: string;
    '고객견적서(가)'?: string;
    '고객견적서(최종)'?: string;
    '실측일자'?: string;
    '시공일자'?: string;
    '가견적 금액'?: string | number;
    '최종견적 금액'?: string | number;
    _creationTime?: number; // Added for sorting
    updatedAt?: number;
    [key: string]: string | number | boolean | undefined | null;
}

function AdminCustomersContent() {
    const searchParams = useSearchParams();
    const routerStatus = searchParams.get('status');

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);

    // Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Search & Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(routerStatus || '');
    const [labelFilter, setLabelFilter] = useState('');
    const [partnerFilter, setPartnerFilter] = useState('');

    // Date Filters
    const [dateFilter, setDateFilter] = useState<DateFilterType>('3months');
    const [customStartDate, setCustomStartDate] = useState(format(subMonths(new Date(), 3), 'yyyy-MM-dd'));
    const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);

    const batchCreate = useMutation(api.customers.batchCreate);
    const [isUploading, setIsUploading] = useState(false);

    // Convex Data Fetching
    const convexCustomers = useQuery(api.customers.listCustomers);
    const batchDelete = useMutation(api.customers.batchDelete);
    const duplicateCustomerMutation = useMutation(api.customers.duplicateCustomer);

    // Fetch dynamic settings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settingLabels = useQuery((api as any).settings.getLabels) || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settingStatuses = useQuery((api as any).settings.getStatuses) || [];

    const handleDuplicate = async (e: React.MouseEvent, customerId: string) => {
        e.stopPropagation();
        if (!confirm('이 고객 정보를 복제하시겠습니까?')) return;

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await duplicateCustomerMutation({ id: customerId as any });
        } catch (error) {
            console.error(error);
            alert('복제 중 오류가 발생했습니다.');
        }
    };

    const allMappedCustomers = useMemo(() => {
        if (!convexCustomers) return [];
        // Map Convex data to legacy interface
        const mapped = convexCustomers.map(c => ({
            'id': c._id,
            'No.': c.no || '-',
            '신청일': c._creationTime ? new Date(c._creationTime).toISOString().split('T')[0] : '',
            '신청일시': c._creationTime ? new Date(c._creationTime).toLocaleString() : '',
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
            '_creationTime': c._creationTime,
            'updatedAt': c.updatedAt,
        }));

        return mapped.sort((a, b) => {
            const timeA = Math.max(a.updatedAt || 0, a._creationTime || 0);
            const timeB = Math.max(b.updatedAt || 0, b._creationTime || 0);

            if (timeB !== timeA) {
                return timeB - timeA;
            }

            const noA = String(a['No.'] || '').trim();
            const noB = String(b['No.'] || '').trim();

            // Check if No is genuinely empty or a placeholder
            const isAEmpty = !noA || noA === '-' || noA === 'No.-' || noA.startsWith('NS_');
            const isBEmpty = !noB || noB === '-' || noB === 'No.-' || noB.startsWith('NS_');

            if (isAEmpty && !isBEmpty) return -1;
            if (!isAEmpty && isBEmpty) return 1;

            // Extract base number and suffix
            const parseNo = (noStr: string) => {
                const parts = noStr.split('-');
                const base = parseInt(parts[0].replace(/[^0-9]/g, ''), 10);
                const suffix = parts.length > 1 ? parseInt(parts[1].replace(/[^0-9]/g, ''), 10) : 0;
                return { base: isNaN(base) ? 0 : base, suffix: isNaN(suffix) ? 0 : suffix };
            };

            const numA = parseNo(noA);
            const numB = parseNo(noB);

            if (numA.base !== numB.base) {
                return numB.base - numA.base;
            }
            if (numA.suffix !== numB.suffix) {
                return numB.suffix - numA.suffix;
            }
            return 0;
        });
    }, [convexCustomers]);

    const loading = convexCustomers === undefined;

    // Manual refresh is handled by Convex reactivity, but we keep the handler for UI compatibility
    const fetchData = useCallback(() => { }, []);


    useEffect(() => {
        if (routerStatus && routerStatus !== statusFilter) setStatusFilter(routerStatus);
    }, [routerStatus, statusFilter]);

    // Derive unique values for filters
    const filterOptions = useMemo(() => {
        const labels = Array.from(new Set(allMappedCustomers.map(c => c['라벨']).filter(Boolean)));
        const statuses = Array.from(new Set(allMappedCustomers.map(c => c['진행구분']).filter(Boolean)));
        const partners = Array.from(new Set(allMappedCustomers.map(c => c['채널']).filter(Boolean)));
        return { labels, statuses, partners };
    }, [allMappedCustomers]);

    // Filtering logic
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
                    if (!isWithinInterval(itemDate, { start, end })) return false;
                } catch { /* skip date check if invalid */ }
            }

            // Text Search
            const searchMatch = !searchTerm ||
                (c['고객명'] && c['고객명'].includes(searchTerm)) ||
                (c['연락처'] && c['연락처'].includes(searchTerm)) ||
                (c['주소'] && c['주소'].includes(searchTerm));
            if (!searchMatch) return false;

            // Status Filter
            if (statusFilter && c['진행구분'] !== statusFilter) {
                // '완료' 필터일 경우 '완료' 글자가 들어간 모든 상태 포함
                if (statusFilter === '완료') {
                    if (!c['진행구분']?.includes('완료')) return false;
                } else {
                    return false;
                }
            }

            // Label Filter
            if (labelFilter && c['라벨'] !== labelFilter) return false;

            // Partner Filter
            if (partnerFilter && c['채널'] !== partnerFilter) return false;

            return true;
        });
    }, [allMappedCustomers, searchTerm, statusFilter, labelFilter, partnerFilter, dateFilter, customStartDate, customEndDate]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, labelFilter, partnerFilter, dateFilter]);

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const paginatedCustomers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredCustomers.slice(start, start + itemsPerPage);
    }, [filteredCustomers, currentPage, itemsPerPage]);

    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setLabelFilter('');
        setPartnerFilter('');
        setDateFilter('3months');
        setSelectedIds(new Set());
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredCustomers.length && filteredCustomers.length > 0) {
            setSelectedIds(new Set());
        } else {
            const newSelected = new Set(filteredCustomers.map(c => c.id as string));
            setSelectedIds(newSelected);
        }
    };

    const toggleSelect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleBatchDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`${selectedIds.size}명의 고객 데이터를 삭제하시겠습니까?`)) return;

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await batchDelete({ ids: Array.from(selectedIds) as any });
            alert('삭제되었습니다.');
            setSelectedIds(new Set());
        } catch (err) {
            console.error(err);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                // Clean data: replace \r\n with \n and filter empty lines
                const rows = text.replace(/\r/g, '').split('\n').filter(row => row.trim());
                if (rows.length < 2) return alert('등록할 데이터가 없습니다 (헤더 포함 최소 2줄 필요).');

                const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
                const data = rows.slice(1).map((row) => {
                    const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
                    const obj: Record<string, string | number> = {};
                    headers.forEach((header, i) => {
                        const val = values[i];
                        if (val === undefined || val === '') return;

                        const mapping: Record<string, string> = {
                            'No.': 'no',
                            '라벨': 'label',
                            '진행구분': 'status',
                            '진행현황(상세)_최근': 'progress_detail',
                            '신청일': 'created_at',
                            '접수일': 'created_at',
                            '등록일': 'created_at',
                            '채널': 'channel',
                            '고객명': 'name',
                            '연락처': 'contact',
                            '주소': 'address',
                            'KCC 피드백': 'feedback',
                            '가견적 링크': 'link_pre_kcc',
                            '가견적': 'link_pre_kcc',
                            '최종 견적 링크': 'link_final_kcc',
                            '최종견적': 'link_final_kcc',
                            '고객견적서(가)': 'link_pre_cust',
                            '견적조회': 'link_pre_cust',
                            '고객견적서(최종)': 'link_final_cust',
                            '내관도': 'link_final_cust',
                            '실측일자': 'measure_date',
                            '시공일자': 'construct_date',
                            '가견적 금액': 'price_pre',
                            '최종견적 금액': 'price_final'
                        };
                        const field = mapping[header] || header;

                        // Type conversion for numeric fields
                        if (field === 'price_pre' || field === 'price_final') {
                            const num = parseFloat(val.replace(/[^0-9.-]/g, ''));
                            obj[field] = isNaN(num) ? 0 : num;
                        } else {
                            obj[field] = val;
                        }
                    });
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return obj as any;
                });

                const result = await batchCreate({ customers: data });
                if (result.success) {
                    alert(`${result.count}명의 고객 데이터가 일괄 등록되었습니다.`);
                }
            } catch (err: unknown) {
                console.error(err);
                alert(`오류 발생: ${err instanceof Error ? err.message : 'CSV 파싱 또는 데이터 형식이 올바르지 않습니다.'}`);
            } finally {
                setIsUploading(false);
                e.target.value = '';
            }
        };

        // Try UTF-8 first, fallback to EUC-KR if needed (or just use reader handle based on user feedback)
        // For simplicity, let's try reading as a Blob to detect encoding or just stick to one for now.
        // Most modern Excel exports use UTF-8 now, but legacy is EUC-KR.
        reader.readAsText(file, 'UTF-8');
    };

    const downloadSampleCsv = () => {
        const headers = [
            'No.', '접수일', '고객명', '연락처', '주소', '라벨', '진행구분', '채널',
            '진행현황(상세)_최근', 'KCC 피드백', '가견적 링크', '최종 견적 링크',
            '견적조회', '내관도', '실측일자', '시공일자',
            '가견적 금액', '최종견적 금액'
        ];
        const sampleData = [
            '1', '2024-05-01', '홍길동', '010-1234-5678', '서울특별시 강남구 테헤란로 123', '일반', '접수', '네이버블로그',
            '상담 진행 중입니다.', '특이사항 없음', 'http://link.to/pre', 'http://link.to/final',
            '', '', '2024-05-20', '2024-06-01', '1500000', '1450000'
        ];

        const csvContent = [
            "\uFEFF" + headers.join(','), // UTF-8 BOM for Excel compatibility
            sampleData.join(',')
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `customer_batch_sample_${format(new Date(), 'yyyyMMdd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="lg:px-4 lg:py-2 space-y-6">
            {/* Header & Main Controls */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">고객 현황 관리</h1>
                        <p className="text-sm text-gray-500 font-medium">전체 고객의 상태와 인입 정보를 정밀 필터링하여 관리합니다.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            {(['currentMonth', '3months', '6months', 'custom'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setDateFilter(type)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${dateFilter === type ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {type === 'currentMonth' ? '당월' : type === '3months' ? '3개월' : type === '6months' ? '6개월' : '직접선택'}
                                </button>
                            ))}
                        </div>
                        {dateFilter === 'custom' && (
                            <div className="flex items-center gap-2">
                                <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="border rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-100" />
                                <span className="text-gray-400">~</span>
                                <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="border rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-100" />
                            </div>
                        )}

                        <div className="h-6 w-[1px] bg-gray-200 mx-2 hidden lg:block"></div>

                        <button
                            onClick={downloadSampleCsv}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all border border-gray-200"
                            title="샘플 양식 다운로드"
                        >
                            <Download className="w-3.5 h-3.5" />
                            양식 다운로드
                        </button>

                        <label className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 cursor-pointer hover:bg-indigo-700 transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Upload className="w-3.5 h-3.5" />
                            {isUploading ? '등록 중...' : 'CSV 일괄 등록'}
                            <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
                        </label>

                        <button
                            onClick={() => setIsDirectModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                        >
                            <UserPlus className="w-3.5 h-3.5" />
                            고객 직접등록
                        </button>

                        <button
                            onClick={fetchData}
                            className={`p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all ${loading ? 'animate-spin' : ''}`}
                            title="새로고침"
                        >
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleResetFilters}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="필터 초기화"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="고객명, 연락처, 주소 검색..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Label Filter */}
                    <div className="relative">
                        <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            className="w-full pl-9 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
                            value={labelFilter}
                            onChange={(e) => setLabelFilter(e.target.value)}
                        >
                            <option value="">라벨 전체</option>
                            {filterOptions.labels.filter((l): l is string => Boolean(l)).map((l, i) => <option key={i} value={l}>{l}</option>)}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <CheckCircle2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            className="w-full pl-9 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">진행구분 전체</option>
                            {filterOptions.statuses.filter((s): s is string => Boolean(s)).map((s, i) => <option key={i} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Partner Filter */}
                    <div className="relative">
                        <TrendingUp className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            className="w-full pl-9 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
                            value={partnerFilter}
                            onChange={(e) => setPartnerFilter(e.target.value)}
                        >
                            <option value="">파트너 전체</option>
                            {filterOptions.partners.filter((p): p is string => Boolean(p)).map((p, i) => <option key={i} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* List Header & Summary */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        {selectedIds.size === filteredCustomers.length && filteredCustomers.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                            <Square className="w-4 h-4 text-gray-300" />
                        )}
                        전체선택
                    </button>
                    <p className="text-sm font-bold text-gray-500">검색 결과 <span className="text-blue-600">{filteredCustomers.length}</span>건</p>

                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleBatchDelete}
                            className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-black border border-red-100 hover:bg-red-100 transition-all animate-in fade-in slide-in-from-left-2"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            {selectedIds.size}명 삭제
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                    <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg">
                        <ListOrdered className="w-3 h-3 text-gray-400" />
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="bg-transparent border-none text-[11px] font-black text-gray-500 outline-none cursor-pointer"
                        >
                            <option value={50}>50개씩 보기</option>
                            <option value={100}>100개씩 보기</option>
                            <option value={200}>200개씩 보기</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4 ml-2 border-l pl-4 border-gray-100">
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
            </div>

            {/* Customer List */}
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
                            <p className="text-gray-900 font-black text-lg tracking-tighter uppercase italic">Synchronizing Data...</p>
                            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">클라우드 데이터베이스와 동기화 중입니다</p>
                        </div>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="bg-white p-20 rounded-2xl border border-gray-100 text-center text-gray-400 font-bold">검색 조건에 맞는 고객이 없습니다.</div>
                ) : (
                    paginatedCustomers.map((customer, index) => (
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

                            {/* Checkbox */}
                            <div className="shrink-0 flex items-center pr-2" onClick={(e) => toggleSelect(customer['id'] as string, e)}>
                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.has(customer['id'] as string)
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-gray-200 group-hover:border-blue-200 bg-gray-50'
                                    }`}>
                                    {selectedIds.has(customer['id'] as string) && <CheckSquare className="w-3.5 h-3.5" />}
                                </div>
                            </div>

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
                                                        className={`text-[11px] font-black px-3 py-1 rounded-full border shadow-sm whitespace-nowrap ${!dynStatus ? (customer['진행구분']?.includes('완료') ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100' :
                                                            customer['진행구분']?.includes('접수') ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100' :
                                                                customer['진행구분']?.includes('예약콜') ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-indigo-100' :
                                                                    customer['진행구분']?.includes('실측요청') ? 'bg-orange-50 text-orange-700 border-orange-200 shadow-orange-100' :
                                                                        customer['진행구분']?.includes('가견적전달') ? 'bg-cyan-50 text-cyan-700 border-cyan-200 shadow-cyan-100' :
                                                                            customer['진행구분']?.includes('실측완료') ? 'bg-teal-50 text-teal-700 border-teal-200 shadow-teal-100' :
                                                                                customer['진행구분']?.includes('거부') || customer['진행구분']?.includes('부재') || customer['진행구분']?.includes('취소') ? 'bg-gray-50 text-gray-500 border-gray-200 shadow-none' :
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
                                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg whitespace-nowrap">{customer['채널']}</span>
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
                                            {customer['KCC 피드백'] || '등록된 피드백이 없습니다.'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 items-start group/line">
                                        <span className={`shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-lg ${customer['진행현황(상세)_최근'] ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-50 text-gray-300'}`}>진행기록</span>
                                        <p className={`text-[13px] line-clamp-2 ${customer['진행현황(상세)_최근'] ? 'text-gray-700 leading-relaxed' : 'text-gray-200 italic'}`}>
                                            {customer['진행현황(상세)_최근'] || '최근 진행 기록이 없습니다.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 3. 우측 컨트롤 & 일정 */}
                            <div className="lg:w-48 shrink-0 flex flex-col justify-center gap-3 border-t lg:border-t-0 lg:border-l border-gray-50 pt-3 lg:pt-0 lg:pl-6" onClick={(e) => e.stopPropagation()}>
                                <div className="flex gap-2 justify-end lg:justify-start items-center">
                                    <BadgeLink href={customer['가견적 링크']} color="blue" label="가견적" />
                                    <BadgeLink href={customer['최종 견적 링크']} color="indigo" label="최종" />
                                    <BadgeLink href={customer['고객견적서(가)']} color="orange" label="조회" />
                                    <BadgeLink href={customer['고객견적서(최종)']} color="green" label="내관" />

                                    <div className="w-[1px] h-6 bg-gray-100 mx-0.5 hidden lg:block"></div>
                                    <button
                                        onClick={(e) => handleDuplicate(e, customer['id'] as string)}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm"
                                        title="고객 정보 복제"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
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
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {
                totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 hover:border-blue-100 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:border-gray-100 transition-all font-bold"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum: number;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${currentPage === pageNum
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                                            : 'bg-white text-gray-400 hover:text-gray-900 border border-gray-100'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 hover:border-blue-100 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:border-gray-100 transition-all font-bold"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )
            }

            {/* Detailed Popup */}
            <CustomerDetailModal
                isOpen={!!selectedCustomer}
                onClose={() => setSelectedCustomer(null)}
                customer={selectedCustomer}
                onUpdate={fetchData}
            />

            <DirectCustomerModal
                isOpen={isDirectModalOpen}
                onClose={() => setIsDirectModalOpen(false)}
            />
        </div>
    );
}

export default function AdminCustomersPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center font-bold text-gray-400">화면 고치는 중...</div>}>
            <AdminCustomersContent />
        </Suspense>
    );
}

// 뱃지 링크 컴포넌트
function BadgeLink({ href, color, label }: { href: string | undefined, color: string, label: string }) {
    const colorClasses: Record<string, string> = {
        blue: href ? 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-50' : 'bg-gray-50 text-gray-200 border-gray-50',
        indigo: href ? 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-50' : 'bg-gray-50 text-gray-200 border-gray-50',
        orange: href ? 'bg-orange-50 text-orange-600 border-orange-100 shadow-orange-50' : 'bg-gray-50 text-gray-200 border-gray-50',
        green: href ? 'bg-green-50 text-green-600 border-green-100 shadow-green-100' : 'bg-gray-50 text-gray-200 border-gray-50',
    };

    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => !href && e.preventDefault()}
            className={`w-8 h-8 flex items-center justify-center rounded-xl border-2 text-[9px] font-black transition-all ${colorClasses[color]} ${href ? 'hover:scale-110 active:scale-95 shadow-lg shadow-indigo-500/10' : 'cursor-default opacity-40'}`}
        >
            {label}
        </a>
    );
}
