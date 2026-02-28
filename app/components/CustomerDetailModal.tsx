'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Save, Trash2, Edit2, Check, User, Phone, MapPin, Calendar, Link as LinkIcon, Send, Settings, ExternalLink, FileText } from 'lucide-react';
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface Customer {
    'No.': string | number;
    '고객명'?: string;
    '연락처'?: string;
    '주소'?: string;
    '라벨'?: string;
    '진행구분'?: string;
    '실측일자'?: string;
    '시공일자'?: string;
    '가견적 링크'?: string;
    '최종 견적 링크'?: string;
    '고객견적서(가)'?: string;
    '고객견적서(최종)'?: string;
    '진행현황(상세)_최근'?: string;
    'KCC 피드백'?: string;
    [key: string]: string | number | boolean | undefined | null;
}

interface Settings {
    labels: string[];
    statuses: string[];
    progressAuthors: string[];
    feedbackAuthors: string[];
}

interface CustomerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
    onUpdate: () => void;
    currentUser?: string;
    readOnly?: boolean;
}

export default function CustomerDetailModal({ isOpen, onClose, customer, onUpdate, readOnly = false }: CustomerDetailModalProps) {
    const [activeTab, setActiveTab] = useState('progress'); // progress, history, feedback
    const [formData, setFormData] = useState<Partial<Customer>>({});
    const [loading, setLoading] = useState(false);

    const convexLabels = useQuery(api.settings.getLabels);
    const convexStatuses = useQuery(api.settings.getStatuses);
    const convexAuthors = useQuery(api.settings.getAuthors);

    const settings = useMemo(() => ({
        labels: (convexLabels || []).map(l => l.name),
        statuses: (convexStatuses || []).map(s => s.name),
        progressAuthors: (convexAuthors || []).filter(a => a.type === 'progress').map(a => a.name),
        feedbackAuthors: (convexAuthors || []).filter(a => a.type === 'feedback').map(a => a.name)
    }), [convexLabels, convexStatuses, convexAuthors]);

    // 헤더 직접 수정 모드
    const [isHeaderEditing, setIsHeaderEditing] = useState(false);

    // 로그 관리용 상태
    const [progressLogs, setProgressLogs] = useState<string[]>([]);
    const [feedbackLogs, setFeedbackLogs] = useState<string[]>([]);

    // 새 로그 입력 상태
    const [newLogText, setNewLogText] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState('');
    const [isImportant, setIsImportant] = useState(false);

    const scrollBottomRef = useRef<HTMLDivElement>(null);
    const updateCustomerMutation = useMutation(api.customers.updateCustomer);

    useEffect(() => {
        if (isOpen && customer) {
            setTimeout(() => {
                const initialData = { ...customer };
                if (initialData['주소']) {
                    initialData['주소'] = String(initialData['주소']).replace(/\s*\[\d+\]$/, '');
                }
                setFormData(initialData);

                const pLogs = customer['진행현황(상세)_최근'] ? String(customer['진행현황(상세)_최근']).split('\n').filter(Boolean) : [];
                const fLogs = customer['KCC 피드백'] ? String(customer['KCC 피드백']).split('\n').filter(Boolean) : [];

                setProgressLogs(pLogs);
                setFeedbackLogs(fLogs);
                setIsHeaderEditing(false); // 리셋
            }, 0);
        }
    }, [isOpen, customer]);

    // 탭 변경 시 해당 탭의 기본 작성자로 자동 변경
    useEffect(() => {
        setTimeout(() => {
            if (activeTab === 'progress') {
                if (settings.progressAuthors && settings.progressAuthors.length > 0) {
                    setSelectedAuthor(settings.progressAuthors[0]);
                } else {
                    setSelectedAuthor('');
                }
            } else if (activeTab === 'feedback') {
                if (settings.feedbackAuthors && settings.feedbackAuthors.length > 0) {
                    setSelectedAuthor(settings.feedbackAuthors[0]);
                } else {
                    setSelectedAuthor('');
                }
            }
        }, 0);
    }, [activeTab, settings]);

    // 로그 추가 시 스크롤 하단으로
    useEffect(() => {
        if (scrollBottomRef.current) {
            scrollBottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [progressLogs, feedbackLogs, activeTab]);



    const handleSaveLeftPanel = async () => {
        if (!customer?.id) return alert('고객 ID가 없습니다.');
        setLoading(true);
        try {
            await updateCustomerMutation({
                // @ts-expect-error - id format coming from external data vs convex internal type
                id: customer.id,
                updates: {
                    no: formData['No.'] as string,
                    channel: formData['유입채널'] as string,
                    label: formData['라벨'] as string,
                    status: formData['진행구분'] as string,
                    name: formData['고객명'] as string,
                    contact: formData['연락처'] as string,
                    address: formData['주소'] as string,
                    measure_date: formData['실측일자'] as string,
                    construct_date: formData['시공일자'] as string,
                    link_pre_kcc: formData['가견적 링크'] as string,
                    link_final_kcc: formData['최종 견적 링크'] as string,
                    link_pre_cust: formData['고객견적서(가)'] as string,
                    link_final_cust: formData['고객견적서(최종)'] as string,
                    price_pre: formData['가견적 금액'] ? Number(formData['가견적 금액']) : undefined,
                    price_final: formData['최종견적 금액'] ? Number(formData['최종견적 금액']) : undefined,
                }
            });
            alert('저장되었습니다.');
            setIsHeaderEditing(false); // 헤더 수정모드 종료
            onUpdate();
            onClose();
        } catch (e: unknown) {
            console.error('Update Error:', e);
            alert('저장 실패: ' + (e instanceof Error ? e.message : '오류 발생'));
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterContract = async () => {
        if (!customer?.id) return alert('고객 ID가 없습니다.');
        if (!confirm('진행구분을 [계약등록]으로 변경하시겠습니까?')) return;
        setLoading(true);
        try {
            await updateCustomerMutation({
                // @ts-expect-error - id format coming from external data vs convex internal type
                id: customer.id,
                updates: {
                    status: '계약등록'
                }
            });
            alert('계약등록 상태로 변경되었습니다.');
            onUpdate();
            onClose();
        } catch (e: unknown) {
            console.error('Update Error:', e);
            alert('변경 실패: ' + (e instanceof Error ? e.message : '오류 발생'));
        } finally {
            setLoading(false);
        }
    };

    // 로그 추가
    const handleAddLog = () => {
        if (!newLogText.trim()) return;

        const type = activeTab === 'feedback' ? 'feedback' : 'progress';

        const today = new Date();
        const dateStr = `[${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}]`;
        const importantMark = isImportant ? '[중요] ' : '';
        const logEntry = `${dateStr} ${selectedAuthor ? `[${selectedAuthor}]` : ''} ${importantMark}${newLogText}`;

        let updatedLogs;
        if (type === 'progress') {
            updatedLogs = [logEntry, ...progressLogs];
            setProgressLogs(updatedLogs);
        } else {
            updatedLogs = [logEntry, ...feedbackLogs];
            setFeedbackLogs(updatedLogs);
        }

        setNewLogText('');
        setIsImportant(false);
        saveLogsToServer(type, updatedLogs);
    };

    const handleDeleteLog = (index: number) => {
        if (!confirm('이 로그를 삭제하시겠습니까?')) return;
        const type = activeTab === 'feedback' ? 'feedback' : 'progress';

        let updatedLogs;
        if (type === 'progress') {
            updatedLogs = progressLogs.filter((_, i) => i !== index);
            setProgressLogs(updatedLogs);
        } else {
            updatedLogs = feedbackLogs.filter((_, i) => i !== index);
            setFeedbackLogs(updatedLogs);
        }
        saveLogsToServer(type, updatedLogs);
    };

    const saveLogsToServer = async (type: 'progress' | 'feedback', logs: string[]) => {
        if (!customer?.id) return;
        const fieldName = type === 'progress' ? 'progress_detail' : 'feedback';
        const fullText = logs.join('\n');

        try {
            await updateCustomerMutation({
                // @ts-expect-error - customer.id is string from external but validated as convex id here
                id: customer.id,
                updates: {
                    [fieldName]: fullText
                }
            });
            onUpdate();
        } catch (e: unknown) {
            console.error("Log save failed", e);
        }
    };

    // 링크 수정 핸들러
    const handleEditLink = (key: string, currentVal: string) => {
        const url = prompt('링크를 입력하세요', currentVal || '');
        if (url !== null) {
            setFormData({ ...formData, [key]: url });
        }
    };



    if (!isOpen || !customer) return null;

    const currentLogs = activeTab === 'feedback' ? feedbackLogs : progressLogs;

    // 링크 렌더링 헬퍼
    const renderLinkButtons = (label: string, key: string, colorClass: string) => {
        const hasLink = !!formData[key];

        return (
            <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-medium">{label}</span>
                <div className="flex gap-1">
                    {hasLink ? (
                        <>
                            <a
                                href={String(formData[key] || '')}
                                target="_blank"
                                rel="noreferrer"
                                className={`flex-1 py-2 rounded border text-xs font-bold flex items-center justify-center transition-all ${colorClass} hover:opacity-80 active:scale-95 shadow-sm`}
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span className="ml-1">이동</span>
                            </a>
                            {!readOnly && (
                                <button
                                    onClick={() => handleEditLink(key, String(formData[key] || ''))}
                                    className={`px-2 rounded border text-xs font-medium bg-white hover:bg-gray-50 text-gray-500 shadow-sm transition-colors`}
                                >
                                    <Edit2 className="w-3 h-3" />
                                </button>
                            )}
                        </>
                    ) : (
                        <button
                            className={`w-full py-2 rounded border text-xs font-medium transition-colors bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed`}
                            onClick={() => !readOnly && handleEditLink(key, '')}
                            disabled={readOnly}
                        >
                            {readOnly ? '미등록' : '등록'}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
            <div className="bg-gray-100 rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden font-sans">

                {/* 1. Header Area */}
                <div className="bg-[#1e293b] text-white px-6 py-5 flex justify-between items-start shrink-0">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1 min-h-[32px]">
                            {isHeaderEditing ? (
                                <input
                                    type="text"
                                    className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1 font-bold text-xl outline-none focus:ring-1 w-48"
                                    value={formData['고객명'] || ''}
                                    onChange={(e) => setFormData({ ...formData, '고객명': e.target.value })}
                                />
                            ) : (
                                <h2 className="text-2xl font-bold tracking-tight">{formData['고객명']}</h2>
                            )}

                            <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-2 py-1 border border-slate-600">
                                {isHeaderEditing ? (
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">No.</span>
                                        <input
                                            type="text"
                                            className="bg-slate-700 border-none text-white rounded px-1 py-0.5 text-xs font-bold outline-none focus:ring-1 w-20"
                                            value={formData['No.'] || ''}
                                            onChange={(e) => setFormData({ ...formData, 'No.': e.target.value })}
                                        />
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-300 font-medium">No. {formData['No.']}</span>
                                )}
                            </div>

                            {!readOnly && (
                                <button
                                    onClick={() => isHeaderEditing ? handleSaveLeftPanel() : setIsHeaderEditing(true)}
                                    className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-700"
                                    title={isHeaderEditing ? "저장" : "정보 수정"}
                                >
                                    {isHeaderEditing ? <Check className="w-4 h-4 text-green-400" /> : <Edit2 className="w-4 h-4" />}
                                </button>
                            )}

                            {isHeaderEditing && (
                                <button
                                    onClick={() => {
                                        setIsHeaderEditing(false);
                                        setFormData({ ...formData, ...customer }); // 원복
                                    }}
                                    className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-700"
                                    title="취소"
                                >
                                    <X className="w-4 h-4 text-red-400" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-400 font-light mt-2 h-6">
                            <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                                <Phone className="w-3.5 h-3.5 shrink-0" />
                                {isHeaderEditing ? (
                                    <input
                                        type="text"
                                        className="bg-slate-700 border-slate-600 text-white rounded px-2 py-0.5 text-xs outline-none focus:ring-1 w-full"
                                        value={formData['연락처'] || ''}
                                        onChange={(e) => setFormData({ ...formData, '연락처': e.target.value })}
                                        placeholder="연락처"
                                    />
                                ) : (
                                    <span>{formData['연락처']}</span>
                                )}
                            </div>
                            <div className="w-px h-3 bg-slate-600 shrink-0"></div>
                            <div className="flex items-center gap-1.5 flex-1">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                {isHeaderEditing ? (
                                    <input
                                        type="text"
                                        className="bg-slate-700 border-slate-600 text-white rounded px-2 py-0.5 text-xs outline-none focus:ring-1 w-full"
                                        value={formData['주소'] || ''}
                                        onChange={(e) => setFormData({ ...formData, '주소': e.target.value })}
                                        placeholder="주소"
                                    />
                                ) : (
                                    <span>{formData['주소']}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!readOnly && (
                            <button
                                onClick={handleRegisterContract}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-md transition-all flex items-center gap-1.5 ml-4"
                            >
                                <FileText className="w-4 h-4" />
                                계약등록
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-white p-2 rounded-full transition-all ml-2"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* 2. Main Content */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Left Sidebar */}
                    <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto p-5 shrink-0 flex flex-col gap-5">

                        {/* Status Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
                            <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm border-b pb-2 mb-2">
                                <Settings className="w-4 h-4 text-gray-500" />
                                상태 변경
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">라벨</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all disabled:opacity-70 disabled:bg-gray-100"
                                        value={formData['라벨'] || ''}
                                        onChange={(e) => setFormData({ ...formData, '라벨': e.target.value })}
                                        disabled={readOnly}
                                    >
                                        <option value="">선택 안함</option>
                                        {(convexLabels || []).map((l) => <option key={l._id} value={l.name}>{l.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">진행구분</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all disabled:opacity-70 disabled:bg-gray-100"
                                        value={formData['진행구분'] || ''}
                                        onChange={(e) => setFormData({ ...formData, '진행구분': e.target.value })}
                                        disabled={readOnly}
                                    >
                                        <option value="">상태 선택</option>
                                        {(convexStatuses || []).map((s) => <option key={s._id} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">유입채널</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all disabled:opacity-70 disabled:bg-gray-100 placeholder:text-gray-400"
                                        value={(formData['유입채널'] as string) || ''}
                                        onChange={(e) => setFormData({ ...formData, '유입채널': e.target.value })}
                                        disabled={readOnly}
                                        placeholder="유입채널 입력"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Schedule Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
                            <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm border-b pb-2 mb-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                일정 관리
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-green-600 mb-1.5">실측일</label>
                                    <input
                                        type="date"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-green-100 focus:border-green-400 outline-none transition-all disabled:opacity-70 disabled:bg-gray-100"
                                        value={formData['실측일자'] ? String(formData['실측일자']).substring(0, 10) : ''}
                                        onChange={(e) => setFormData({ ...formData, '실측일자': e.target.value })}
                                        disabled={readOnly}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-blue-600 mb-1.5">시공일</label>
                                    <input
                                        type="date"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all disabled:opacity-70 disabled:bg-gray-100"
                                        value={formData['시공일자'] ? String(formData['시공일자']).substring(0, 10) : ''}
                                        onChange={(e) => setFormData({ ...formData, '시공일자': e.target.value })}
                                        disabled={readOnly}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Links Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
                            <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm border-b pb-2 mb-2">
                                <LinkIcon className="w-4 h-4 text-gray-500" />
                                견적서 링크
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {renderLinkButtons('가견적', '가견적 링크', 'bg-blue-50 text-blue-600 border-blue-100')}
                                {renderLinkButtons('최종견적', '최종 견적 링크', 'bg-indigo-50 text-indigo-600 border-indigo-100')}
                                {renderLinkButtons('견적조회', '고객견적서(가)', 'bg-orange-50 text-orange-600 border-orange-100')}
                                {renderLinkButtons('내관도', '고객견적서(최종)', 'bg-green-50 text-green-600 border-green-100')}
                            </div>
                        </div>



                        {!readOnly && (
                            <button
                                onClick={handleSaveLeftPanel}
                                disabled={loading}
                                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 mt-auto shadow-md transition-all"
                            >
                                {loading ? '저장 중...' : <><Save className="w-4 h-4" /> 변경사항 저장</>}
                            </button>
                        )}
                    </div>

                    {/* Right Content Area (Logs) */}
                    <div className="flex-1 bg-[#F8FAFC] flex flex-col min-w-0">
                        {/* Tabs */}
                        <div className="flex bg-white border-b border-gray-200 px-6">
                            {[
                                { id: 'progress', label: '진행현황' },
                                { id: 'feedback', label: '피드백' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-4 text-sm font-semibold transition-all relative ${activeTab === tab.id
                                        ? 'text-blue-600'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {currentLogs.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-300 text-sm">
                                    기록 없음
                                </div>
                            ) : (
                                currentLogs.map((log, idx) => (
                                    <div key={idx} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex gap-3 group">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                                    {log.startsWith('[') ? log.split(']')[0] + ']' : 'Today'}
                                                </div>
                                                {!readOnly && (
                                                    <button onClick={() => handleDeleteLog(idx)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                                                {log}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={scrollBottomRef} />
                        </div>

                        {/* Input Area */}
                        {!readOnly && (
                            <div className="p-4 bg-white border-t border-gray-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <select
                                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 outline-none"
                                        value={selectedAuthor}
                                        onChange={(e) => setSelectedAuthor(e.target.value)}
                                    >
                                        <option value="">작성자 선택</option>
                                        {(activeTab === 'feedback' ? settings.feedbackAuthors : settings.progressAuthors).map((a: string) => (
                                            <option key={a} value={a}>{a}</option>
                                        ))}
                                    </select>
                                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isImportant ? 'bg-red-500 border-red-500' : 'border-gray-300 bg-white'}`}>
                                            {isImportant && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} />
                                        <span className="text-xs text-gray-500">중요</span>
                                    </label>
                                </div>
                                <div className="relative">
                                    <textarea
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-none transition-all"
                                        placeholder="내용 입력..."
                                        rows={1}
                                        value={newLogText}
                                        onChange={(e) => setNewLogText(e.target.value)}
                                        // Enter to submit (Shift+Enter for newline)
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleAddLog();
                                            }
                                        }}
                                        style={{ minHeight: '52px', maxHeight: '120px' }}
                                    />
                                    <button
                                        onClick={handleAddLog}
                                        disabled={!newLogText.trim()}
                                        className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
