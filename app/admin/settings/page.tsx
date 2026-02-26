'use client';

import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, Trash2, GripVertical, Save, RefreshCw } from 'lucide-react';

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const syncFromCustomers = useMutation((api as any).settings.syncFromCustomers);

    const [newLabelName, setNewLabelName] = useState('');
    const [newLabelColor, setNewLabelColor] = useState('#3B82F6');

    const [newStatusName, setNewStatusName] = useState('');
    const [newStatusColor, setNewStatusColor] = useState('#10B981');

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

    const handleSync = async () => {
        if (confirm('현재 고객 데이터에서 라벨과 진행구분 목록을 불러오시겠습니까? 기존 목록에 없는 항목만 새로 추가됩니다.')) {
            await syncFromCustomers();
            alert('목록을 업데이트했습니다.');
        }
    };

    const moveItem = async (type: 'label' | 'status', index: number, direction: -1 | 1) => {
        if (type === 'label') {
            if (index + direction < 0 || index + direction >= labels.length) return;
            const newOrder = [...labels];
            const temp = newOrder[index];
            newOrder[index] = newOrder[index + direction];
            newOrder[index + direction] = temp;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await updateLabelOrders({ orders: newOrder.map((l, i) => ({ id: l._id as any, order: i })) });
        } else {
            if (index + direction < 0 || index + direction >= statuses.length) return;
            const newOrder = [...statuses];
            const temp = newOrder[index];
            newOrder[index] = newOrder[index + direction];
            newOrder[index + direction] = temp;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await updateStatusOrders({ orders: newOrder.map((s, i) => ({ id: s._id as any, order: i })) });
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
                        {labels.map((label: any, index: number) => (
                            <div key={label._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => moveItem('label', index, -1)} className="text-gray-400 hover:text-gray-900"><GripVertical className="w-4 h-4" /></button>
                                </div>
                                <div className="w-4 h-4 rounded-full flex-shrink-0 border border-black/10" style={{ backgroundColor: label.color }}></div>
                                <input
                                    type="text"
                                    className="flex-1 bg-transparent border-none text-sm font-bold text-gray-900 outline-none"
                                    defaultValue={label.name}
                                    onBlur={(e) => {
                                        if (e.target.value !== label.name) {
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            updateLabel({ id: label._id as any, name: e.target.value, color: label.color });
                                        }
                                    }}
                                />
                                <input
                                    type="color"
                                    className="w-8 h-8 rounded shrink-0 p-0 cursor-pointer border-none"
                                    defaultValue={label.color}
                                    onBlur={(e) => {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        if (e.target.value !== label.color) updateLabel({ id: label._id as any, name: label.name, color: e.target.value });
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        if (confirm('이 라벨을 삭제하시겠습니까?')) deleteLabel({ id: label._id as any });
                                    }}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
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
                        {statuses.map((status: any, index: number) => (
                            <div key={status._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => moveItem('status', index, -1)} className="text-gray-400 hover:text-gray-900"><GripVertical className="w-4 h-4" /></button>
                                </div>
                                <div className="w-4 h-4 rounded-full flex-shrink-0 border border-black/10" style={{ backgroundColor: status.color }}></div>
                                <input
                                    type="text"
                                    className="flex-1 bg-transparent border-none text-sm font-bold text-gray-900 outline-none"
                                    defaultValue={status.name}
                                    onBlur={(e) => {
                                        if (e.target.value !== status.name) {
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            updateStatus({ id: status._id as any, name: e.target.value, color: status.color });
                                        }
                                    }}
                                />
                                <input
                                    type="color"
                                    className="w-8 h-8 rounded shrink-0 p-0 cursor-pointer border-none"
                                    defaultValue={status.color}
                                    onBlur={(e) => {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        if (e.target.value !== status.color) updateStatus({ id: status._id as any, name: status.name, color: e.target.value });
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        if (confirm('이 진행구분을 삭제하시겠습니까?')) deleteStatus({ id: status._id as any });
                                    }}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
