'use client';

import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, Trash2, GripVertical, Save, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { Reorder } from "framer-motion";
import { useEffect } from 'react';

export default function SettingsPage() {
    const labels = useQuery(api.settings.getLabels) || [];
    const statuses = useQuery(api.settings.getStatuses) || [];

    const addLabel = useMutation(api.settings.addLabel);
    const updateLabel = useMutation(api.settings.updateLabel);
    const deleteLabel = useMutation(api.settings.deleteLabel);
    const updateLabelOrders = useMutation(api.settings.updateLabelOrders);

    const addStatus = useMutation(api.settings.addStatus);
    const updateStatus = useMutation(api.settings.updateStatus);
    const deleteStatus = useMutation(api.settings.deleteStatus);
    const updateStatusOrders = useMutation(api.settings.updateStatusOrders);

    const authors = useQuery(api.settings.getAuthors) || [];
    const addAuthor = useMutation(api.settings.addAuthor);
    const updateAuthor = useMutation(api.settings.updateAuthor);
    const deleteAuthor = useMutation(api.settings.deleteAuthor);
    const updateAuthorOrders = useMutation(api.settings.updateAuthorOrders);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const syncFromCustomers = useMutation((api as any).settings.syncFromCustomers);

    const [newLabelName, setNewLabelName] = useState('');
    const [newLabelColor, setNewLabelColor] = useState('#3B82F6');

    const [newStatusName, setNewStatusName] = useState('');
    const [newStatusColor, setNewStatusColor] = useState('#10B981');

    const [newAuthorName, setNewAuthorName] = useState('');
    const [newAuthorType, setNewAuthorType] = useState<'progress' | 'feedback'>('progress');

    // Local states for smooth reordering
    const [localLabels, setLocalLabels] = useState<any[]>([]);
    const [localStatuses, setLocalStatuses] = useState<any[]>([]);
    const [localAuthors, setLocalAuthors] = useState<any[]>([]);

    useEffect(() => { if (labels.length > 0) setLocalLabels(labels); }, [labels]);
    useEffect(() => { if (statuses.length > 0) setLocalStatuses(statuses); }, [statuses]);
    useEffect(() => { if (authors.length > 0) setLocalAuthors(authors); }, [authors]);

    const handleAddLabel = async () => {
        if (!newLabelName.trim()) return;
        await addLabel({ name: newLabelName, color: newLabelColor });
        setNewLabelName('');
    };

    const handleAddStatus = async () => {
        if (!newStatusName.trim()) return;
        await addStatus({ name: newStatusName, color: newStatusColor });
        setNewStatusName('');
    };

    const handleAddAuthor = async () => {
        if (!newAuthorName.trim()) return;
        await addAuthor({ name: newAuthorName, type: newAuthorType });
        setNewAuthorName('');
    };

    const handleSync = async () => {
        if (confirm('현재 고객 데이터에서 라벨과 진행구분 목록을 불러오시겠습니까? 기존 목록에 없는 항목만 새로 추가됩니다.')) {
            await syncFromCustomers();
            alert('목록을 업데이트했습니다.');
        }
    };

    const reorderLabels = async (newOrder: any[]) => {
        setLocalLabels(newOrder);
        await updateLabelOrders({ orders: newOrder.map((l, i) => ({ id: l._id, order: i })) });
    };

    const reorderStatuses = async (newOrder: any[]) => {
        setLocalStatuses(newOrder);
        await updateStatusOrders({ orders: newOrder.map((s, i) => ({ id: s._id, order: i })) });
    };

    const reorderAuthors = async (newOrder: any[]) => {
        setLocalAuthors(newOrder);
        await updateAuthorOrders({ orders: newOrder.map((a, i) => ({ id: a._id, order: i })) });
    };

    const moveItem = async (type: 'label' | 'status' | 'author', index: number, direction: -1 | 1) => {
        if (type === 'label') {
            if (index + direction < 0 || index + direction >= localLabels.length) return;
            const newOrder = [...localLabels];
            const temp = newOrder[index];
            newOrder[index] = newOrder[index + direction];
            newOrder[index + direction] = temp;
            reorderLabels(newOrder);
        } else if (type === 'status') {
            if (index + direction < 0 || index + direction >= localStatuses.length) return;
            const newOrder = [...localStatuses];
            const temp = newOrder[index];
            newOrder[index] = newOrder[index + direction];
            newOrder[index + direction] = temp;
            reorderStatuses(newOrder);
        } else {
            if (index + direction < 0 || index + direction >= localAuthors.length) return;
            const newOrder = [...localAuthors];
            const temp = newOrder[index];
            newOrder[index] = newOrder[index + direction];
            newOrder[index + direction] = temp;
            reorderAuthors(newOrder);
        }
    };

    return (
        <div className="lg:px-4 lg:py-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">시스템 설정</h1>
                    <p className="text-sm text-gray-500 font-medium">고객 관리에 사용되는 진행구분 및 라벨의 종류와 색상을 설정할 수 있습니다.</p>
                </div>
                <button
                    onClick={handleSync}
                    className="shrink-0 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    현재 목록 데이터 불러오기
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Labels Card */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-1">라벨 설정</h2>
                        <p className="text-xs text-gray-500">고객 리스트에서 표시되는 상태 라벨입니다.</p>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="새 라벨 이름"
                            className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                            value={newLabelName}
                            onChange={(e) => setNewLabelName(e.target.value)}
                        />
                        <input
                            type="color"
                            className="w-10 h-10 border rounded-lg p-1 cursor-pointer"
                            value={newLabelColor}
                            onChange={(e) => setNewLabelColor(e.target.value)}
                        />
                        <button
                            onClick={handleAddLabel}
                            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> 추가
                        </button>
                    </div>

                    <div className="space-y-2">
                        <Reorder.Group axis="y" values={localLabels} onReorder={reorderLabels} className="space-y-2">
                            {localLabels.map((label: any, index: number) => (
                                <Reorder.Item
                                    key={label._id}
                                    value={label}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-grab active:cursor-grabbing hover:border-blue-200 transition-colors shadow-sm"
                                >
                                    <div className="flex flex-col gap-0.5 shrink-0">
                                        <button onClick={() => moveItem('label', index, -1)} className="text-gray-300 hover:text-blue-600 transition-colors"><ChevronUp className="w-3.5 h-3.5" /></button>
                                        <GripVertical className="w-4 h-4 text-gray-400 mx-auto" />
                                        <button onClick={() => moveItem('label', index, 1)} className="text-gray-300 hover:text-blue-600 transition-colors"><ChevronDown className="w-3.5 h-3.5" /></button>
                                    </div>
                                    <div className="w-4 h-4 rounded-full flex-shrink-0 border border-black/10" style={{ backgroundColor: label.color }}></div>
                                    <input
                                        type="text"
                                        className="flex-1 bg-transparent border-none text-sm font-bold text-gray-900 outline-none cursor-text"
                                        defaultValue={label.name}
                                        onClick={(e) => e.stopPropagation()}
                                        onBlur={(e) => {
                                            if (e.target.value !== label.name) {
                                                updateLabel({ id: label._id, name: e.target.value, color: label.color });
                                            }
                                        }}
                                    />
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="color"
                                            className="w-8 h-8 rounded shrink-0 p-0 cursor-pointer border-none bg-transparent"
                                            defaultValue={label.color}
                                            onBlur={(e) => {
                                                if (e.target.value !== label.color) updateLabel({ id: label._id, name: label.name, color: e.target.value });
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('이 라벨을 삭제하시겠습니까?')) deleteLabel({ id: label._id });
                                        }}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </div>
                </div>

                {/* Statuses Card */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-1">진행구분 설정</h2>
                        <p className="text-xs text-gray-500">고객 리스트에서 진행 단계를 나타냅니다.</p>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="새 진행구분 이름"
                            className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                            value={newStatusName}
                            onChange={(e) => setNewStatusName(e.target.value)}
                        />
                        <input
                            type="color"
                            className="w-10 h-10 border rounded-lg p-1 cursor-pointer"
                            value={newStatusColor}
                            onChange={(e) => setNewStatusColor(e.target.value)}
                        />
                        <button
                            onClick={handleAddStatus}
                            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> 추가
                        </button>
                    </div>

                    <div className="space-y-2">
                        <Reorder.Group axis="y" values={localStatuses} onReorder={reorderStatuses} className="space-y-2">
                            {localStatuses.map((status: any, index: number) => (
                                <Reorder.Item
                                    key={status._id}
                                    value={status}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-grab active:cursor-grabbing hover:border-blue-200 transition-colors shadow-sm"
                                >
                                    <div className="flex flex-col gap-0.5 shrink-0">
                                        <button onClick={() => moveItem('status', index, -1)} className="text-gray-300 hover:text-blue-600 transition-colors"><ChevronUp className="w-3.5 h-3.5" /></button>
                                        <GripVertical className="w-4 h-4 text-gray-400 mx-auto" />
                                        <button onClick={() => moveItem('status', index, 1)} className="text-gray-300 hover:text-blue-600 transition-colors"><ChevronDown className="w-3.5 h-3.5" /></button>
                                    </div>
                                    <div className="w-4 h-4 rounded-full flex-shrink-0 border border-black/10" style={{ backgroundColor: status.color }}></div>
                                    <input
                                        type="text"
                                        className="flex-1 bg-transparent border-none text-sm font-bold text-gray-900 outline-none cursor-text"
                                        defaultValue={status.name}
                                        onClick={(e) => e.stopPropagation()}
                                        onBlur={(e) => {
                                            if (e.target.value !== status.name) {
                                                updateStatus({ id: status._id, name: e.target.value, color: status.color });
                                            }
                                        }}
                                    />
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="color"
                                            className="w-8 h-8 rounded shrink-0 p-0 cursor-pointer border-none bg-transparent"
                                            defaultValue={status.color}
                                            onBlur={(e) => {
                                                if (e.target.value !== status.color) updateStatus({ id: status._id, name: status.name, color: e.target.value });
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('이 진행구분을 삭제하시겠습니까?')) deleteStatus({ id: status._id });
                                        }}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </div>
                </div>
            </div>

            {/* Authors Management */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">작성자/담당자 설정</h2>
                    <p className="text-xs text-gray-500">진행현황 및 피드백 로그를 남기는 담당자 목록을 관리합니다.</p>
                </div>

                <div className="flex gap-2 max-w-2xl">
                    <input
                        type="text"
                        placeholder="새 담당자 이름"
                        className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                        value={newAuthorName}
                        onChange={(e) => setNewAuthorName(e.target.value)}
                    />
                    <select
                        className="w-32 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                        value={newAuthorType}
                        onChange={(e) => setNewAuthorType(e.target.value as any)}
                    >
                        <option value="progress">진행현황</option>
                        <option value="feedback">피드백</option>
                    </select>
                    <button
                        onClick={handleAddAuthor}
                        className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-1 shrink-0"
                    >
                        <Plus className="w-4 h-4" /> 담당자 추가
                    </button>
                </div>

                <Reorder.Group axis="y" values={localAuthors} onReorder={reorderAuthors} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {localAuthors.map((author: any, index: number) => (
                        <Reorder.Item
                            key={author._id}
                            value={author}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 transition-all hover:border-blue-200 cursor-grab active:cursor-grabbing shadow-sm"
                        >
                            <div className="flex flex-col gap-0.5 shrink-0">
                                <button onClick={() => moveItem('author', index, -1)} className="text-gray-300 hover:text-blue-600 transition-colors"><ChevronUp className="w-3.5 h-3.5" /></button>
                                <GripVertical className="w-4 h-4 text-gray-400 mx-auto" />
                                <button onClick={() => moveItem('author', index, 1)} className="text-gray-300 hover:text-blue-600 transition-colors"><ChevronDown className="w-3.5 h-3.5" /></button>
                            </div>
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${author.type === 'progress' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                {author.type === 'progress' ? '진행' : '피드백'}
                            </div>
                            <input
                                type="text"
                                className="flex-1 bg-transparent border-none text-sm font-bold text-gray-900 outline-none cursor-text"
                                defaultValue={author.name}
                                onClick={(e) => e.stopPropagation()}
                                onBlur={(e) => {
                                    if (e.target.value !== author.name) {
                                        updateAuthor({ id: author._id, name: e.target.value, type: author.type });
                                    }
                                }}
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`${author.name} 담당자를 삭제하시겠습니까?`)) deleteAuthor({ id: author._id });
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </div>
        </div>
    );
}
