'use client';

import { useState, useEffect } from 'react';
import { RefreshCcw, History, User, Users, Trash2, CheckCircle, Search } from 'lucide-react';

interface Log {
    'Timestamp': string;
    'Category': string;
    'Action': string;
    'Actor': string;
    'Details': string;
}

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/data?action=read_logs');
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                setLogs(json.data);
            }
        } catch {
            // Error handling
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 필터링 로직
    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            (log['Details'] && log['Details'].toLowerCase().includes(searchTerm.toLowerCase())) ||
            (log['Actor'] && log['Actor'].toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = filterCategory === 'All' || log['Category'] === filterCategory;

        return matchesSearch && matchesCategory;
    });

    // 통계 계산
    const stats = {
        total: logs.length,
        today: logs.filter(l => {
            const logDate = new Date(l['Timestamp']);
            const today = new Date();
            return logDate.toDateString() === today.toDateString();
        }).length,
        partners: logs.filter(l => l['Category'] === '파트너').length,
        customers: logs.filter(l => l['Category'] === '고객').length
    };

    const getIcon = (category: string, action: string) => {
        if (action === '삭제') return <Trash2 className="w-4 h-4 text-red-500" />;
        if (action === '승인') return <CheckCircle className="w-4 h-4 text-green-500" />;
        if (category === '파트너') return <Users className="w-4 h-4 text-blue-500" />;
        if (category === '고객') return <User className="w-4 h-4 text-indigo-500" />;
        return <History className="w-4 h-4 text-gray-500" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">활동 로그</h1>
                    <p className="text-gray-500">시스템 내 모든 주요 활동 기록을 모니터링합니다.</p>
                </div>
                <button
                    onClick={() => {
                        setIsRefreshing(true);
                        setTimeout(() => window.location.reload(), 800);
                    }}
                    className={`bg-white border px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2 ${isRefreshing ? 'text-blue-500' : ''}`}
                >
                    <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 새로고침
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <p className="text-xs font-medium text-gray-400">총 로그 수</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <p className="text-xs font-medium text-gray-400">오늘 활동</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{stats.today}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <p className="text-xs font-medium text-gray-400">파트너 관련</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.partners}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <p className="text-xs font-medium text-gray-400">고객 관련</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.customers}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="내용 또는 사용자 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                </div>
                <div className="flex gap-2">
                    {['All', '파트너', '고객'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${filterCategory === cat
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {cat === 'All' ? '전체' : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3 font-medium">시간</th>
                                <th className="px-6 py-3 font-medium">카테고리</th>
                                <th className="px-6 py-3 font-medium">액션</th>
                                <th className="px-6 py-3 font-medium">수행자</th>
                                <th className="px-6 py-3 font-medium">상세 내용</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        로그를 불러오는 중입니다...
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        기록된 로그가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                                            {log['Timestamp']}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${log['Category'] === '파트너'
                                                ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                : log['Category'] === '고객'
                                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                                    : 'bg-gray-50 text-gray-700 border-gray-100'
                                                }`}>
                                                {getIcon(log['Category'], log['Action'])}
                                                {log['Category']}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 font-medium text-gray-900">
                                            {log['Action']}
                                        </td>
                                        <td className="px-6 py-3 text-gray-600">
                                            {log['Actor']}
                                        </td>
                                        <td className="px-6 py-3 text-gray-600">
                                            {log['Details']}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isRefreshing && (
                <div className="fixed inset-0 z-[1000] bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-spin border-t-blue-600 shadow-xl shadow-blue-500/10"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <RefreshCcw className="w-6 h-6 text-blue-600 animate-pulse" />
                        </div>
                    </div>
                    <p className="mt-4 text-blue-900 font-black text-lg tracking-tighter uppercase italic animate-pulse">Refreshing Page...</p>
                </div>
            )}
        </div>
    );
}
