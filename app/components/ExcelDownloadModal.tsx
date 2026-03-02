'use client';

import { useState } from 'react';
import { X, Calendar, Download, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns';

interface ExcelDownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any[];
    filename: string;
    dateField: string; // The field to use for date filtering (e.g., '신청일' or 'contractDate')
}

export default function ExcelDownloadModal({ isOpen, onClose, data, filename, dateField }: ExcelDownloadModalProps) {
    const today = new Date();
    const [startDate, setStartDate] = useState(format(startOfMonth(today), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(today), 'yyyy-MM-dd'));
    const [quickFilter, setQuickFilter] = useState('currentMonth');

    if (!isOpen) return null;

    const handleQuickFilter = (type: string) => {
        setQuickFilter(type);
        const now = new Date();
        switch (type) {
            case 'currentMonth':
                setStartDate(format(startOfMonth(now), 'yyyy-MM-dd'));
                setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'));
                break;
            case 'lastMonth':
                const lastMonth = subMonths(now, 1);
                setStartDate(format(startOfMonth(lastMonth), 'yyyy-MM-dd'));
                setEndDate(format(endOfMonth(lastMonth), 'yyyy-MM-dd'));
                break;
            case '3months':
                setStartDate(format(subMonths(now, 3), 'yyyy-MM-dd'));
                setEndDate(format(now, 'yyyy-MM-dd'));
                break;
            case 'all':
                setStartDate('2020-01-01');
                setEndDate(format(now, 'yyyy-MM-dd'));
                break;
        }
    };

    const handleDownload = () => {
        try {
            const start = parseISO(startDate);
            const end = parseISO(endDate);
            end.setHours(23, 59, 59, 999);

            // Filter data by date
            const filteredData = data.filter(item => {
                const itemDateStr = item[dateField];
                if (!itemDateStr) return false;
                try {
                    const itemDate = new Date(itemDateStr);
                    return isWithinInterval(itemDate, { start, end });
                } catch {
                    return false;
                }
            });

            if (filteredData.length === 0) {
                alert('선택한 기간에 해당하는 데이터가 없습니다.');
                return;
            }

            // Prepare data for Excel (removing internal fields if any)
            const excelData = filteredData.map(({ id, _creationTime, updatedAt, contractId, alerts, ...rest }) => rest);

            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Data");

            // Save file
            const fullFilename = `${filename}_${startDate}_${endDate}.xlsx`;
            XLSX.writeFile(wb, fullFilename);
            onClose();
        } catch (error) {
            console.error('Excel Download Error:', error);
            alert('엑셀 다운로드 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Download className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 tracking-tight">엑셀 데이터 다운로드</h2>
                            <p className="text-xs text-gray-500 font-bold">원하는 기간을 선택하여 추출하세요.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl transition-all">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Quick Filters */}
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { id: 'currentMonth', label: '이번 달' },
                            { id: 'lastMonth', label: '지난 달' },
                            { id: '3months', label: '3개월' },
                            { id: 'all', label: '전체' },
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => handleQuickFilter(btn.id)}
                                className={`py-2 px-1 text-[11px] font-black rounded-xl border transition-all ${quickFilter === btn.id
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                        : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-500'
                                    }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    {/* Date Inputs */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-gray-400 ml-1">시작일</label>
                                <div className="relative">
                                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => {
                                            setStartDate(e.target.value);
                                            setQuickFilter('');
                                        }}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-blue-200 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-gray-400 ml-1">종료일</label>
                                <div className="relative">
                                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => {
                                            setEndDate(e.target.value);
                                            setQuickFilter('');
                                        }}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-blue-200 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notice */}
                    <div className="bg-blue-50/50 p-4 rounded-2xl flex gap-3 border border-blue-100">
                        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                        <p className="text-xs text-blue-700 font-bold leading-relaxed">
                            선택한 기간 동안 등록된 데이터를 엑셀 파일로 바로 다운로드합니다. 데이터 양이 많을 경우 잠시 기다려 주세요.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0">
                    <button
                        onClick={handleDownload}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 group"
                    >
                        <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                        엑셀 다운로드 시작
                    </button>
                </div>
            </div>
        </div>
    );
}
