'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, X, MapPin, Loader2, ArrowLeft } from 'lucide-react';
import DaumPostcode from 'react-daum-postcode';
import Cookies from 'js-cookie';

interface PostcodeData {
    address: string;
    addressType: string;
    bname: string;
    buildingName: string;
    zonecode: string;
}

export default function PartnerCustomerCreatePage() {
    const router = useRouter();
    const [partnerName, setPartnerName] = useState('');

    // Form States
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [address, setAddress] = useState('');
    const [detailAddress, setDetailAddress] = useState('');
    const [pyeong, setPyeong] = useState('');
    const [expansion, setExpansion] = useState('');
    const [residence, setResidence] = useState('');
    const [schedule, setSchedule] = useState('');
    const [remarks, setRemarks] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const session = Cookies.get('partner_session');
        if (session) {
            try {
                const parsed = JSON.parse(session);
                setPartnerName(parsed.name || '');
            } catch (e) {
                console.error("Session parse error", e);
            }
        }
    }, []);

    const handleAutoHyphen = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        let formatted = raw;
        if (raw.length > 3 && raw.length <= 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
        else if (raw.length > 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
        setContact(formatted);
    };

    const handleAddressComplete = (data: PostcodeData) => {
        let fullAddress = data.address;
        let extraAddress = '';
        if (data.addressType === 'R') {
            if (data.bname !== '') extraAddress += data.bname;
            if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }
        setAddress(fullAddress);
        setShowAddressModal(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return alert('성함을 입력해주세요.');
        if (!contact) return alert('연락처를 입력해주세요.');
        if (!address) return alert('주소를 입력해주세요.');

        setIsSubmitting(true);
        try {
            const body = {
                consultType: '정확한상담', // Default for manual entry
                name, contact,
                address: `${address} ${detailAddress}`.trim(),
                channel: partnerName || '직접등록',
                label: '일반', status: '접수',
                pyeong, expansion, residence, schedule, remarks
            };

            const res = await fetch('/api/data?action=create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const json = await res.json();
            if (json.success) {
                alert('고객 정보가 성공적으로 등록되었습니다.');
                router.push('/partner/customers');
            } else {
                alert('등록 중 오류가 발생했습니다: ' + json.message);
            }
        } catch {
            alert('통신 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    <UserPlus className="w-7 h-7 text-indigo-600" />
                    고객 직접 등록
                </h1>
            </div>

            <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 p-8">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <label className="block text-gray-600 font-bold mb-1">성함 <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-4 bg-gray-50 rounded-xl font-bold border border-transparent focus:border-indigo-500 outline-none transition-all"
                            required
                            placeholder="고객 성함 입력"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="block text-gray-600 font-bold mb-1">연락처 <span className="text-red-500">*</span></label>
                        <input
                            type="tel"
                            value={contact}
                            onChange={handleAutoHyphen}
                            className="w-full p-4 bg-gray-50 rounded-xl font-bold border border-transparent focus:border-indigo-500 outline-none transition-all"
                            required
                            placeholder="010-0000-0000"
                            pattern="[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}"
                            inputMode="numeric"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="block text-gray-600 font-bold mb-1">주소 <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={address}
                                readOnly
                                className="flex-1 p-4 bg-gray-100 rounded-xl font-bold text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors"
                                placeholder="주소 검색"
                                onClick={() => setShowAddressModal(true)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowAddressModal(true)}
                                className="px-5 bg-gray-800 text-white rounded-xl font-bold hover:bg-black transition-all"
                            >
                                <MapPin size={20} />
                            </button>
                        </div>
                        <input
                            type="text"
                            value={detailAddress}
                            onChange={(e) => setDetailAddress(e.target.value)}
                            className="w-full p-4 bg-gray-50 rounded-xl font-bold border border-transparent focus:border-indigo-500 outline-none transition-all"
                            placeholder="상세주소 입력"
                        />
                    </div>

                    {/* Detailed Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-600 font-bold mb-1.5 text-sm">평형</label>
                            <input
                                type="text"
                                value={pyeong}
                                onChange={(e) => setPyeong(e.target.value)}
                                className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none border border-transparent focus:border-indigo-500"
                                placeholder="예: 32평"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 font-bold mb-1.5 text-sm">확장 여부</label>
                            <select
                                value={expansion}
                                onChange={(e) => setExpansion(e.target.value)}
                                className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none border border-transparent focus:border-indigo-500 cursor-pointer"
                            >
                                <option value="">선택</option>
                                <option value="확장됨">확장됨</option>
                                <option value="안됨">안됨</option>
                                <option value="모름">모름</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-600 font-bold mb-1.5 text-sm">거주 상태</label>
                            <select
                                value={residence}
                                onChange={(e) => setResidence(e.target.value)}
                                className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none border border-transparent focus:border-indigo-500 cursor-pointer"
                            >
                                <option value="">선택</option>
                                <option value="거주중">거주중</option>
                                <option value="비거주(공실)">비거주(공실)</option>
                                <option value="이사예정">이사예정</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-600 font-bold mb-1.5 text-sm">시공 희망일</label>
                            <input
                                type="date"
                                value={schedule}
                                onChange={(e) => setSchedule(e.target.value)}
                                className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none border border-transparent focus:border-indigo-500 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-gray-600 font-bold mb-1">특이사항</label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none h-32 resize-none border border-transparent focus:border-indigo-500"
                            placeholder="고객 요청사항이나 특이사항을 적어주세요."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-8"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <UserPlus size={24} />}
                        {isSubmitting ? '등록 중...' : '고객 등록하기'}
                    </button>
                </form>
            </div>

            {/* Address Modal */}
            {showAddressModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddressModal(false)}></div>
                    <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 overflow-hidden shadow-2xl">
                        <DaumPostcode onComplete={handleAddressComplete} style={{ height: '450px' }} />
                        <button onClick={() => setShowAddressModal(false)} className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"><X size={20} /></button>
                    </div>
                </div>
            )}
        </div>
    );
}
