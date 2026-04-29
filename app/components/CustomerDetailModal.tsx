'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Save, Trash2, Edit2, Check, User, Phone, MapPin, Calendar, Link as LinkIcon, Send, Settings, ExternalLink, FileText, Star, Copy, History } from 'lucide-react';
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Cookies from 'js-cookie';

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
    'history'?: string;
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
    const [adminInfo, setAdminInfo] = useState<{ id: string, name: string, role: string } | null>(null);

    useEffect(() => {
        const auth = Cookies.get('admin_session');
        if (auth) {
            setAdminInfo(JSON.parse(auth));
        }
    }, []);

    const convexLabels = useQuery(api.settings.getLabels);
    const convexStatuses = useQuery(api.settings.getStatuses);
    const convexAuthors = useQuery(api.settings.getAuthors);

    const settings = useMemo(() => ({
        labels: (convexLabels || []).map(l => l.name),
        statuses: (convexStatuses || []).map(s => s.name),
        progressAuthors: (convexAuthors || [])
            .filter(a => a.type === 'progress')
            .filter(a => {
                if (adminInfo?.role === 'tm' && adminInfo?.id?.toUpperCase() !== 'TM') {
                    const assignedTm = typeof a.assignedTm === 'string' ? a.assignedTm.toUpperCase() : '';
                    const currentAdminId = adminInfo.id.toUpperCase();
                    return assignedTm === currentAdminId;
                }
                return true;
            })
            .map(a => a.name),
        feedbackAuthors: (convexAuthors || []).filter(a => a.type === 'feedback').map(a => a.name)
    }), [convexLabels, convexStatuses, convexAuthors, adminInfo]);

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
    const updateContractStatusMutation = useMutation(api.contracts.updateContractStatus);

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
            const updates: any = {
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
                history: customer.history // Default to current history
            };

            // 자동 히스토리 기록 로직
            const diffs: string[] = [];
            const fieldsToTrack = [
                { key: '고객명', label: '고객명' },
                { key: '연락처', label: '연락처' },
                { key: '주소', label: '주소' },
                { key: '라벨', label: '라벨' },
                { key: '진행구분', label: '진행상태' },
                { key: '실측일자', label: '실측일자' },
                { key: '시공일자', label: '시공일자' },
                { key: '가견적 금액', label: '가견적가' },
                { key: '최종견적 금액', label: '최종견적가' },
                { key: '가견적 링크', label: '가견적 링크' },
                { key: '최종 견적 링크', label: '최종견적 링크' },
                { key: '고객견적서(최종)', label: '내관도 링크' },
            ];

            fieldsToTrack.forEach(field => {
                const oldVal = String(customer[field.key] || '').trim();
                const newVal = String(formData[field.key] || '').trim();
                if (oldVal !== newVal) {
                    if (field.key.includes('링크') || field.key.includes('고객견적서')) {
                        const oldLinks = oldVal.split('\n').filter(Boolean).length;
                        const newLinks = newVal.split('\n').filter(Boolean).length;
                        const action = newLinks > oldLinks ? '추가' : '수정';
                        diffs.push(`${field.label} ${action}`);
                    } else {
                        diffs.push(`${field.label} 수정(${oldVal || '없음'} → ${newVal || '없음'})`);
                    }
                }
            });

            if (diffs.length > 0) {
                const auth = Cookies.get('admin_session');
                const adminName = auth ? JSON.parse(auth).name : '관리자';
                const now = new Date();
                const mm = String(now.getMonth() + 1).padStart(2, '0');
                const dd = String(now.getDate()).padStart(2, '0');
                const hh = String(now.getHours()).padStart(2, '0');
                const min = String(now.getMinutes()).padStart(2, '0');
                const timestamp = `${mm}-${dd} ${hh}:${min}`;
                
                const historyEntry = `[${timestamp}] [${adminName}] ${diffs.join(', ')}`;
                const currentHistory = customer.history || '';
                updates.history = currentHistory ? `${historyEntry}\n${currentHistory}` : historyEntry;
            }

            await updateCustomerMutation({
                // @ts-expect-error - id format coming from external data vs convex internal type
                id: customer.id,
                updates: updates
            });
            if (formData['진행구분'] === '계약등록') {
                await updateContractStatusMutation({
                    // @ts-expect-error - id format coming from external data vs convex internal type
                    customerId: customer.id,
                    contractStatus: '계약등록'
                });
            }
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
            await updateContractStatusMutation({
                // @ts-expect-error - id format coming from external data vs convex internal type
                customerId: customer.id,
                contractStatus: '계약등록'
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
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const hh = String(today.getHours()).padStart(2, '0');
        const min = String(today.getMinutes()).padStart(2, '0');
        const dateStr = `[${mm}-${dd} ${hh}:${min}]`;
        const importantMark = isImportant ? '⭐ ' : '';
        const authorMark = selectedAuthor ? `[${selectedAuthor}] ` : '';
        const logEntry = `${dateStr} ${authorMark}${importantMark}${newLogText}`;

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

    // 링크 추가 핸들러
    const handleAddLink = (key: string, label: string) => {
        const url = prompt(`${label} 새로운 링크를 입력하세요`);
        if (url) {
            const now = new Date();
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const hh = String(now.getHours()).padStart(2, '0');
            const min = String(now.getMinutes()).padStart(2, '0');
            const dateStr = `${mm}-${dd} ${hh}:${min}`;

            const current = formData[key] ? String(formData[key]) : '';
            const updated = current ? `${current}\n${url.trim()}|${dateStr}|reg` : `${url.trim()}|${dateStr}|reg`;
            setFormData({ ...formData, [key]: updated });
        }
    };

    // 링크 수정 핸들러
    const handleEditLinkItem = (key: string, index: number, linkStr: string) => {
        const parts = linkStr.split('|');
        const existingUrl = parts[0];
        const url = prompt('링크를 수정하세요 (빈칸 입력시 삭제)', existingUrl);
        if (url !== null) {
            const currentLinks = String(formData[key] || '').split(/[\n,]/).map(s => s.trim()).filter(Boolean);
            if (url.trim() === '') {
                currentLinks.splice(index, 1);
            } else {
                const now = new Date();
                const mm = String(now.getMonth() + 1).padStart(2, '0');
                const dd = String(now.getDate()).padStart(2, '0');
                const hh = String(now.getHours()).padStart(2, '0');
                const min = String(now.getMinutes()).padStart(2, '0');
                const dateStr = `${mm}-${dd} ${hh}:${min}`;
                currentLinks[index] = `${url.trim()}|${dateStr}|edit`;
            }
            setFormData({ ...formData, [key]: currentLinks.join('\n') });
        }
    };



    if (!isOpen || !customer) return null;

    const currentLogs = activeTab === 'feedback' ? feedbackLogs : progressLogs;

    const parseLog = (logText: string) => {
        let dateStr = 'Today';
        let content = logText.trim();
        let isImportant = false;
        let authorStr = '';

        const dateMatch = content.match(/^(\[\d{2}-\d{2}(?:\s\d{2}:\d{2})?\])\s*/);
        if (dateMatch) {
            dateStr = dateMatch[1];
            content = content.substring(dateMatch[0].length).trim();
        }

        const authorMatch = content.match(/^(\[.*?\])\s*/);
        if (authorMatch && !authorMatch[0].includes('중요')) {
            authorStr = authorMatch[1].replace(/\[|\]/g, '').trim();
            content = content.substring(authorMatch[0].length).trim();
        }

        if (content.startsWith('[중요]')) {
            isImportant = true;
            content = content.substring(4).trim();
        } else if (content.startsWith('⭐')) {
            isImportant = true;
            content = content.substring(1).trim();
        }

        return { dateStr, authorStr, isImportant, content };
    };

    // 링크 렌더링 헬퍼
    const renderLinkButtons = (label: string, key: string, colorClass: string) => {
        const rawValue = String(formData[key] || '');
        const links = rawValue.split(/[\n,]/).map(s => s.trim()).filter(Boolean);

        return (
            <div className="space-y-1 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between px-1 mb-2">
                    <span className="text-xs text-gray-700 font-bold">{label}</span>
                    {!readOnly && (
                        <button
                            onClick={() => handleAddLink(key, label)}
                            className="text-[10px] items-center flex gap-1 bg-white border px-2 py-1.5 rounded-lg text-gray-500 shadow-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                            title="새 링크 추가"
                        >
                            <span className="font-black tracking-tight">+ 추가</span>
                        </button>
                    )}
                </div>
                <div className="space-y-1.5">
                    {links.length > 0 ? (
                        links.map((linkStr, idx) => {
                            const parts = linkStr.split('|');
                            const link = parts[0];
                            let regDate = parts[1] || '';
                            const type = parts[2] || 'reg';

                            // 소급 적용: 날짜가 없는 경우 진행로그에서 찾기
                            if (!regDate) {
                                const searchTerms = [`${label}${idx + 1}`, `${label} ${idx + 1}`];
                                if (links.length === 1) searchTerms.push(label);
                                
                                for (const log of progressLogs) {
                                    if (searchTerms.some(term => log.includes(term))) {
                                        const dateMatch = log.match(/^\[(\d{2}-\d{2}\s\d{2}:\d{2})\]/);
                                        if (dateMatch) {
                                            regDate = dateMatch[1];
                                            break;
                                        }
                                    }
                                }
                            }

                            let formattedHref = link;
                            if (formattedHref && !/^https?:\/\//i.test(formattedHref)) {
                                formattedHref = `http://${formattedHref}`;
                            }
                            return (
                                <div key={idx} className="flex flex-col gap-1">
                                    <div className="flex gap-1.5 items-stretch">
                                        <a
                                            href={formattedHref}
                                            target="_blank"
                                            rel="noreferrer"
                                            className={`flex-1 py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center transition-all ${colorClass} hover:opacity-80 active:scale-95 shadow-sm min-w-0`}
                                            title={link}
                                        >
                                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                            <span className="ml-1.5 truncate max-w-[140px]">{links.length > 1 ? `${label} ${idx + 1}` : '이동'}</span>
                                        </a>
                                        {!readOnly && (
                                            <button
                                                onClick={() => handleEditLinkItem(key, idx, linkStr)}
                                                className={`px-3 rounded-lg border text-xs font-medium bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 shadow-sm transition-colors flex items-center justify-center shrink-0`}
                                                title="수정 또는 삭제"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    {regDate && (
                                        <div className="text-[9px] text-gray-400 flex items-center gap-1 px-1">
                                            <Calendar className="w-2.5 h-2.5" />
                                            {regDate} {type === 'edit' ? '수정됨' : '등록됨'}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center text-[11px] font-bold py-3 text-gray-400 bg-white rounded-lg border border-dashed border-gray-200">
                             등록된 링크가 없습니다
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-start sm:items-center bg-black/60 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-gray-100 sm:rounded-xl shadow-2xl w-full max-w-7xl h-full sm:h-[90vh] flex flex-col overflow-hidden font-sans my-auto">

                {/* 1. Header Area */}
                <div className="bg-[#1e293b] text-white px-4 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row justify-between items-start gap-4 shrink-0">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1 min-h-[32px]">
                            {isHeaderEditing ? (
                                <input
                                    type="text"
                                    className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1 font-bold text-lg sm:text-xl outline-none focus:ring-1 w-full sm:w-48"
                                    value={formData['고객명'] || ''}
                                    onChange={(e) => setFormData({ ...formData, '고객명': e.target.value })}
                                />
                            ) : (
                                <h2 className="text-lg sm:text-2xl font-bold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{formData['고객명']}</h2>
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

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[15px] text-white font-semibold mt-1 sm:mt-2">
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Phone className="w-4 h-4 shrink-0 opacity-90" />
                                {isHeaderEditing ? (
                                    <input
                                        type="text"
                                        className="bg-slate-700 border-slate-600 text-white rounded px-2 py-0.5 text-sm font-normal outline-none focus:ring-1 w-32"
                                        value={formData['연락처'] || ''}
                                        onChange={(e) => setFormData({ ...formData, '연락처': e.target.value })}
                                        placeholder="연락처"
                                    />
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <span className="whitespace-nowrap">{formData['연락처']}</span>
                                        {formData['연락처'] && (
                                            <button 
                                                onClick={() => {
                                                    const today = new Date();
                                                    const yy = String(today.getFullYear()).slice(-2);
                                                    const mm = String(today.getMonth() + 1).padStart(2, '0');
                                                    const dd = String(today.getDate()).padStart(2, '0');
                                                    const dateStr = `${yy}${mm}${dd}`;
                                                    const copyText = `${formData['고객명'] || '이름없음'}_${formData['연락처']}_${dateStr}`;
                                                    navigator.clipboard.writeText(copyText);
                                                    alert('연락처가 복사되었습니다.');
                                                }}
                                                className="text-slate-300 hover:text-white transition-colors p-0.5 rounded hover:bg-slate-600"
                                                title="연락처 복사"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="hidden sm:block w-px h-3.5 bg-slate-500 shrink-0"></div>
                            <div className="flex items-center gap-1.5 min-w-0">
                                <MapPin className="w-4 h-4 shrink-0 opacity-90" />
                                {isHeaderEditing ? (
                                    <input
                                        type="text"
                                        className="bg-slate-700 border-slate-600 text-white rounded px-2 py-0.5 text-sm font-normal outline-none focus:ring-1 w-full"
                                        value={formData['주소'] || ''}
                                        onChange={(e) => setFormData({ ...formData, '주소': e.target.value })}
                                        placeholder="주소"
                                    />
                                ) : (
                                    <div className="flex items-center gap-1 min-w-0">
                                        <span className="truncate">{formData['주소']}</span>
                                        {formData['주소'] && (
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(String(formData['주소']));
                                                    alert('주소가 복사되었습니다.');
                                                }}
                                                className="text-slate-300 hover:text-white transition-colors p-0.5 rounded hover:bg-slate-600 shrink-0"
                                                title="주소 복사"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
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

                {/* 2. Main Content Area */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-gray-50/30">
                    {/* Left & Center: Info + Logs */}
                    <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden shrink-0 lg:shrink">
                        {/* 2-1. Info Panel (Left) */}
                        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white/50 backdrop-blur-sm shrink-0 flex flex-col lg:overflow-y-auto">
                            <div className="p-4 sm:p-6 space-y-6">

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
                            <div className="flex flex-col gap-3">
                                {renderLinkButtons('가견적', '가견적 링크', 'bg-blue-50 text-blue-600 border-blue-100')}
                                {renderLinkButtons('최종견적', '최종 견적 링크', 'bg-indigo-50 text-indigo-600 border-indigo-100')}
                                {renderLinkButtons('내관도', '고객견적서(최종)', 'bg-green-50 text-green-600 border-green-100')}
                            </div>
                        </div>



                        {!readOnly && (
                            <button
                                onClick={handleSaveLeftPanel}
                                disabled={loading}
                                className="hidden lg:flex w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 items-center justify-center gap-2 mt-auto shadow-md transition-all"
                            >
                                {loading ? '저장 중...' : <><Save className="w-4 h-4" /> 변경사항 저장</>}
                            </button>
                        )}
                    </div>
                </div>

                {/* Logs Area (Center) */}
                <div className="flex-1 bg-[#F8FAFC] flex flex-col min-w-0 min-h-[500px] lg:min-h-0 border-b lg:border-b-0">
                        {/* Tabs */}
                        <div className="flex bg-white border-b border-gray-200 px-6">
                            {[
                                { id: 'progress', label: '진행현황' },
                                { id: 'feedback', label: '피드백' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold transition-all relative ${activeTab === tab.id
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
                                currentLogs.map((log, idx) => {
                                    const parsed = parseLog(log);
                                    return (
                                        <div key={idx} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex gap-3 group">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                                                        <span>{parsed.dateStr}</span>
                                                        {parsed.authorStr && <span className="font-medium text-gray-600">[{parsed.authorStr}]</span>}
                                                    </div>
                                                    {!readOnly && (
                                                        <button onClick={() => handleDeleteLog(idx)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-800 leading-relaxed w-full flex gap-1.5 items-start mt-0.5">
                                                    {parsed.isImportant && (
                                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />
                                                    )}
                                                    <p className="flex-1 min-w-0 whitespace-pre-wrap">{parsed.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
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

                    {/* Right: History Panel (Automatic) */}
                    <div className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white flex flex-col shrink-0 min-h-[300px] lg:min-h-0">
                        <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                            <History className="w-4 h-4 text-blue-600" />
                            <h3 className="text-sm font-black text-gray-900 tracking-tight">변경 히스토리</h3>
                        </div>
                        <div className="flex-1 lg:overflow-y-auto p-4 space-y-3">
                            {customer.history ? (
                                customer.history.split('\n').map((line, idx) => {
                                    const match = line.match(/^\[(.*?)\] \[(.*?)\] (.*)$/);
                                    if (match) {
                                        const [, time, admin, content] = match;
                                        return (
                                            <div key={idx} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">{time}</span>
                                                    <span className="text-[10px] font-bold text-gray-400">[{admin}]</span>
                                                </div>
                                                <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                                                    {content}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={idx} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                            <p className="text-[11px] text-gray-600 font-medium leading-relaxed">{line}</p>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-40 py-20">
                                    <History className="w-8 h-8 text-gray-300" />
                                    <p className="text-xs font-bold text-gray-400">기록된 변경사항이 없습니다.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Mobile Sticky Footer Save Button */}
                {!readOnly && (
                    <div className="lg:hidden p-4 bg-white border-t border-gray-200 shrink-0">
                        <button
                            onClick={handleSaveLeftPanel}
                            disabled={loading}
                            className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
                        >
                            {loading ? '저장 중...' : <><Save className="w-5 h-5" /> 변경사항 저장</>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
