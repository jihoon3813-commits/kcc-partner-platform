'use client';

import React, { useState } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    parseISO,
    isBefore,
    startOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CustomerDetailModal from '@/app/components/CustomerDetailModal';

// 기존 Customer 타입 재사용 (필요한 속성만)
export interface Customer {
    id: string;
    _id: string; // Convex ID
    'No.': string | number;
    '고객명': string;
    '주소': string;
    '시공일자'?: string;
    '진행구분': string;
    '유입채널': string;
    '연락처': string;
    [key: string]: any;
}

interface ConstructionCalendarProps {
    data: Customer[];
}

export default function ConstructionCalendar({ data }: ConstructionCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const checkIsPast = (date: Date) => {
        const today = startOfDay(new Date());
        return isBefore(date, today);
    };

    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    // 현재 월의 시작일과 종료일
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    // 달력의 첫 번째 칸과 마지막 칸 (이전/다음 달 포함 날짜)
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    // 날짜 포맷
    const dateFormat = "d";
    const today = startOfDay(new Date());

    // 달력 칸 생성
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
            formattedDate = format(day, dateFormat);
            const cloneDay = day;

            // 해당 날짜의 고객(시공일자 일치) 필터링
            const dayCustomers = data.filter(customer => {
                if (!customer['시공일자']) return false;
                try {
                    // YYYY-MM-DD 형식 파싱
                    const parsedDate = parseISO(customer['시공일자']);
                    return isSameDay(parsedDate, cloneDay);
                } catch {
                    return false;
                }
            });

            // 스타일 결정
            const isPast = checkIsPast(cloneDay);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, today);

            let dayClasses = "min-h-[120px] p-2 border-b border-r bg-white relative transition-colors ";
            if (!isCurrentMonth) {
                dayClasses += "bg-gray-50/50 ";
            }
            if (isToday) {
                dayClasses += "bg-blue-50/30 ";
            }

            let textClasses = "text-sm font-semibold mb-2 ";
            if (!isCurrentMonth) {
                textClasses += "text-gray-400";
            } else if (i === 0) {
                textClasses += "text-red-500"; // 일요일
            } else if (i === 6) {
                textClasses += "text-blue-500"; // 토요일
            } else {
                textClasses += "text-gray-700";
            }

            days.push(
                <div key={day.toString()} className={dayClasses}>
                    <div className={textClasses}>
                        {formattedDate}
                    </div>
                    <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[80px] no-scrollbar">
                        {dayCustomers.map((customer, idx) => {
                            // 지난 일정 회색 처리
                            const badgeColor = isPast ? "bg-gray-100 text-gray-500" : "bg-blue-50 text-blue-700 hover:bg-blue-100";

                            return (
                                <div
                                    key={`${customer._id}-${idx}`}
                                    onClick={() => setSelectedCustomer(customer)}
                                    className={`text-xs px-2 py-1 rounded truncate cursor-pointer transition-colors ${badgeColor}`}
                                >
                                    <span className="font-bold">{customer['고객명']}</span>
                                    {customer['주소'] && <span className="ml-1 opacity-75">{customer['주소'].split(' ')[0]} {customer['주소'].split(' ')[1]}</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
            day = addDays(day, 1);
        }
        rows.push(
            <div className="grid grid-cols-7" key={day.toString()}>
                {days}
            </div>
        );
        days = [];
    }

    return (
        <div className="w-full h-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                        {format(currentMonth, 'yyyy.MM')}
                    </h2>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
                    확정시공일 기준 일정
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((dayName, idx) => (
                    <div key={dayName} className={`py-3 text-center text-xs font-black tracking-widest ${idx === 0 ? 'text-red-400' : idx === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
                        {dayName}
                    </div>
                ))}
            </div>

            {/* Calendar Body */}
            <div className="flex-1 overflow-y-auto min-h-[600px]">
                {rows}
            </div>

            {/* Note: CustomerDetailModal 연동은 호출부에서 관리하거나 여기서 내장 */}
            {selectedCustomer && (
                <CustomerDetailModal
                    isOpen={!!selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                    customer={selectedCustomer}
                    onUpdate={() => {
                        // 정보 업데이트 시 달력 갱신이 필요하다면 여기에 처리 로직 추가
                        // 이 컴포넌트는 상위에서 데이터를 주입받으므로 상위 의존성을 가짐
                        setSelectedCustomer(null);
                    }}
                />
            )}
        </div>
    );
}
