'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, UserPlus, Calendar, Layout, MapPin, Phone, User, MessageSquare, RefreshCcw, Hash } from 'lucide-react';
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from 'date-fns';

interface DirectCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DirectCustomerModal({ isOpen, onClose }: DirectCustomerModalProps) {
    const createCustomer = useMutation(api.customers.createCustomer);
    const batchCreate = useMutation(api.customers.batchCreate);
    const convexCustomers = useQuery(api.customers.listCustomers);
    const latestNo = useQuery(api.customers.getLatestNo);

    const [formData, setFormData] = useState({
        created_at: format(new Date(), 'yyyy-MM-dd'),
        channel: '',
        customChannel: '',
        rawInfo: '',
        startNo: '',
    });

    const [parsedCustomers, setParsedCustomers] = useState<Array<{ name: string, contact: string, address: string }>>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update startNo suggestion when latestNo is available
    useEffect(() => {
        if (latestNo !== undefined && !formData.startNo) {
            setFormData(prev => ({ ...prev, startNo: (latestNo + 1).toString() }));
        }
    }, [latestNo, formData.startNo]);

    // Get unique channels for selection
    const channels = useMemo(() => {
        if (!convexCustomers) return [];
        return Array.from(new Set(convexCustomers.map(c => c.channel).filter(Boolean)));
    }, [convexCustomers]);

    // Parse raw info when it changes
    useEffect(() => {
        if (!formData.rawInfo.trim()) {
            setParsedCustomers([]);
            return;
        }

        const lines = formData.rawInfo.split('\n').filter(l => l.trim());
        const customers = lines.map(line => {
            const parts = line.split(/[,\t]|\s{2,}/).map(p => p.trim()).filter(Boolean);
            return {
                name: parts[0] || '',
                contact: parts[1] || '',
                address: parts.slice(2).join(' ') || ''
            };
        }).filter(c => c.name || c.contact);

        setParsedCustomers(customers);
    }, [formData.rawInfo]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (parsedCustomers.length === 0) {
            alert('등록할 고객 정보가 없습니다.');
            return;
        }

        setIsSubmitting(true);
        try {
            const channel = formData.channel === 'custom' ? formData.customChannel : (formData.channel || '직접등록');

            if (parsedCustomers.length === 1) {
                const customer = parsedCustomers[0];
                await createCustomer({
                    no: formData.startNo || undefined,
                    name: customer.name,
                    contact: customer.contact,
                    address: customer.address,
                    channel: channel,
                    created_at: formData.created_at,
                    status: '접수',
                    label: '일반'
                });
            } else {
                const startNum = parseInt(formData.startNo);
                const data = parsedCustomers.map((c, idx) => {
                    let no = undefined;
                    if (!isNaN(startNum)) {
                        no = (startNum + idx).toString();
                    }
                    return {
                        no,
                        name: c.name,
                        contact: c.contact,
                        address: c.address,
                        channel: channel,
                        created_at: formData.created_at,
                        status: '접수',
                        label: '일반'
                    };
                });
                await batchCreate({ customers: data });
            }

            alert(`${parsedCustomers.length}명의 고객이 등록되었습니다.`);
            onClose();
            setFormData({
                created_at: format(new Date(), 'yyyy-MM-dd'),
                channel: '',
                customChannel: '',
                rawInfo: '',
                startNo: latestNo !== undefined ? (latestNo + 1).toString() : '',
            });
            setParsedCustomers([]);
        } catch (error) {
            console.error(error);
            alert('등록 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-white/20 overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                            <UserPlus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">고객 직접 등록</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Bulk Customer Entry</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-gray-400 hover:text-gray-900">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Registration Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-500" /> 등록일
                            </label>
                            <input
                                type="date"
                                value={formData.created_at}
                                onChange={(e) => setFormData({ ...formData, created_at: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                required
                            />
                        </div>

                        {/* Starting No */}
                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                                <Hash className="w-4 h-4 text-green-500" /> 시작 고객번호 (No.)
                            </label>
                            <input
                                type="text"
                                value={formData.startNo}
                                onChange={(e) => setFormData({ ...formData, startNo: e.target.value })}
                                placeholder="생략 시 자동 부여"
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-green-100 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Channel Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                            <Layout className="w-4 h-4 text-indigo-500" /> 유입 채널
                        </label>
                        <div className="space-y-3">
                            <select
                                value={formData.channel}
                                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none appearance-none cursor-pointer"
                            >
                                <option value="">채널 선택 (기본: 직접등록)</option>
                                {channels.map((c, i) => <option key={i} value={c as string}>{c as string}</option>)}
                                <option value="custom">+ 직접 입력</option>
                            </select>
                            {formData.channel === 'custom' && (
                                <input
                                    type="text"
                                    placeholder="채널명 입력"
                                    value={formData.customChannel}
                                    onChange={(e) => setFormData({ ...formData, customChannel: e.target.value })}
                                    className="w-full px-5 py-4 bg-blue-50/50 border-2 border-blue-100 rounded-2xl text-sm font-bold focus:border-blue-400 transition-all outline-none animate-in slide-in-from-top-2"
                                    required
                                />
                            )}
                        </div>
                    </div>

                    {/* Multi-line Paste Area */}
                    <div className="space-y-2">
                        <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-orange-500" /> 고객정보 복사/붙여넣기
                        </label>
                        <div className="relative">
                            <textarea
                                placeholder="이름, 연락처, 주소 순으로 한 줄에 한 명씩 붙여넣어 주세요."
                                value={formData.rawInfo}
                                onChange={(e) => setFormData({ ...formData, rawInfo: e.target.value })}
                                className="w-full h-32 px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-orange-100 transition-all outline-none resize-none"
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold ml-1 italic">* 쉼표(,)나 탭, 또는 공백으로 구분된 여러 명의 데이터를 한 번에 등록할 수 있습니다.</p>
                    </div>

                    {/* Parsed List Preview */}
                    {parsedCustomers.length > 0 && (
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 flex justify-between items-center">
                                등록 대기 고객 리스트
                                <span className="text-blue-500">{parsedCustomers.length}명</span>
                            </label>
                            <div className="bg-blue-50/30 rounded-3xl border border-blue-100/50 max-h-48 overflow-y-auto divide-y divide-blue-100/30">
                                {parsedCustomers.map((customer, idx) => (
                                    <div key={idx} className="p-4 flex flex-col md:flex-row gap-2 md:items-center">
                                        <div className="flex items-center gap-2 min-w-[120px]">
                                            <User className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-sm font-bold text-gray-900">{customer.name || '(이름없음)'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 min-w-[140px]">
                                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-sm font-bold text-gray-600">{customer.contact || '(연락처없음)'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-1 truncate">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-xs font-medium text-gray-500 truncate">{customer.address || '(주소없음)'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition-all active:scale-[0.98]"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || parsedCustomers.length === 0}
                            className="flex-[2] py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:translate-y-[-2px] transition-all active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <RefreshCcw className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {parsedCustomers.length > 1 ? `${parsedCustomers.length}명` : ''} 고객 등록 완료
                                    <UserPlus className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
