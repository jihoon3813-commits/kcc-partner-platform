'use client';

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useMemo, useState } from "react";
import ConstructionCalendar from "@/app/components/ConstructionCalendar";
import { CalendarDays } from "lucide-react";
import Cookies from "js-cookie";

export default function PartnerCalendarPage() {
    const [partnerId, setPartnerId] = useState<string | null>(null);

    useEffect(() => {
        const session = Cookies.get('partner_session');
        if (session) {
            try {
                const parsed = JSON.parse(session);
                setPartnerId(parsed.id);
            } catch {
                // Ignore
            }
        }
    }, []);

    const partnerName = partnerId; // For simple usage as channel filter

    // 전체 고객 목록 가져오기
    const convexCustomers = useQuery(api.customers.listCustomers);

    // 달력용 데이터 가공 (파트너 전용 필터링 포함)
    const calendarData = useMemo(() => {
        if (!convexCustomers || !partnerName) return [];

        return convexCustomers
            .filter((c: any) => {
                const channel = String(c.channel || '');
                return channel.includes(partnerName) || channel === partnerId;
            })
            .map((c: any) => ({
                ...c,
                id: c._id,
                'No.': c.no || '-',
                '고객명': c.name || '',
                '주소': c.address || '',
                '시공일자': c.construct_date || '',
                '진행구분': c.status || '접수',
                '유입채널': c.channel || '',
                '연락처': c.contact || '',
                '신청일': c.created_at || '',
                '라벨': c.label || '',
                'KCC 피드백': c.feedback || '',
                '진행현황(상세)_최근': c.progress_detail || '',
                '실측일자': c.measure_date || '',
                '가견적 금액': c.price_pre || 0,
                '최종견적 금액': c.price_final || 0,
                updatedAt: c.updatedAt
            }));
    }, [convexCustomers]);

    if (!partnerId) {
        return (
            <div className="w-full h-[600px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
            <div className="mb-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center text-white shadow-lg shadow-[hsl(var(--primary))]/20">
                        <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">시공 캘린더</h1>
                        <p className="text-sm font-semibold text-gray-500 mt-1">
                            우리 업체의 확정 시공일정을 월별로 확인합니다.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                {convexCustomers === undefined ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                        <p className="text-gray-500 font-medium">일정 데이터를 불러오는 중...</p>
                    </div>
                ) : (
                    <ConstructionCalendar data={calendarData} />
                )}
            </div>
        </div>
    );
}
