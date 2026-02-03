'use client';

import { useState, useEffect } from 'react';
import { X, Save, Lock, User, Building2, Phone, MapPin, Eye, EyeOff, FileText, CreditCard, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DaumPostcode from 'react-daum-postcode';

interface PartnerInfo {
    id: string;
    name: string;
    ceoName: string;
    contact: string;
    address: string;
    businessNumber?: string;
    accountNumber?: string;
    email?: string;
}

interface PartnerInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentInfo: PartnerInfo | null;
    onUpdate: () => void;
}

export default function PartnerInfoModal({ isOpen, onClose, currentInfo, onUpdate }: PartnerInfoModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        ceoName: '',
        contact: '',
        address: '',
        detailAddress: '',
        businessNumber: '',
        accountNumber: '',
        email: '',
        password: '',
    });

    useEffect(() => {
        if (currentInfo) {
            setFormData({
                name: currentInfo.name || '',
                ceoName: currentInfo.ceoName || '',
                contact: currentInfo.contact || '',
                address: currentInfo.address || '',
                detailAddress: '',
                businessNumber: currentInfo.businessNumber || '',
                accountNumber: currentInfo.accountNumber || '',
                email: currentInfo.email || '',
                password: '',
            });
        }
    }, [currentInfo, isOpen]);

    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    interface AddressData {
        address: string;
        addressType: string;
        bname: string;
        buildingName: string;
    }

    const handleAddressComplete = (data: AddressData) => {
        let fullAddress = data.address;
        if (data.addressType === 'R') {
            let extraAddress = '';
            if (data.bname !== '') extraAddress += data.bname;
            if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }
        setFormData(prev => ({ ...prev, address: fullAddress, detailAddress: '' }));
        setShowAddressModal(false);
    };

    const handleContactHyphen = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        let formatted = raw;
        if (raw.length > 3 && raw.length <= 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
        else if (raw.length > 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
        setFormData(prev => ({ ...prev, contact: formatted }));
    };

    const handleBusinessNumberHyphen = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        let formatted = raw;
        if (raw.length <= 3) formatted = raw;
        else if (raw.length <= 5) formatted = `${raw.slice(0, 3)}-${raw.slice(3, 5)}-${raw.slice(5, 10)}`;
        else if (raw.length <= 10) formatted = `${raw.slice(0, 3)}-${raw.slice(3, 5)}-${raw.slice(5, 10)}`;
        setFormData(prev => ({ ...prev, businessNumber: formatted }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (!currentInfo) return;

            const updateData: any = {
                id: currentInfo.id,
                name: formData.name,
                ceoName: formData.ceoName,
                contact: formData.contact,
                address: `${formData.address} ${formData.detailAddress}`.trim(),
                businessNumber: formData.businessNumber,
                accountNumber: formData.accountNumber,
                email: formData.email,
            };

            if (formData.password) {
                updateData.password = formData.password;
            }

            const res = await fetch('/api/data?action=update_partner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            const json = await res.json();
            if (json.success) {
                alert('정보가 수정되었습니다. 다시 로그인해주세요.');
                onUpdate();
                onClose();
            } else {
                alert('수정 실패: ' + json.message);
            }
        } catch (e) {
            console.error(e);
            alert('오류 발생');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto z-50 w-full max-w-2xl h-fit max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl flex flex-col"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-20">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <SettingsIcon className="w-5 h-5 text-blue-600" />
                                정보 수정
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto">
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-sm font-bold text-blue-800 mb-1">계정 아이디</h3>
                                        <p className="text-lg font-black text-blue-600">{currentInfo?.id}</p>
                                    </div>
                                    <User className="w-8 h-8 text-blue-200" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup
                                        label="업체명"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        icon={<Building2 className="w-4 h-4" />}
                                        placeholder="업체명을 입력하세요"
                                        required
                                    />
                                    <InputGroup
                                        label="대표자명"
                                        name="ceoName"
                                        value={formData.ceoName}
                                        onChange={handleChange}
                                        icon={<User className="w-4 h-4" />}
                                        placeholder="대표자명을 입력하세요"
                                        required
                                    />
                                    <InputGroup
                                        label="연락처"
                                        name="contact"
                                        value={formData.contact}
                                        onChange={handleContactHyphen}
                                        icon={<Phone className="w-4 h-4" />}
                                        placeholder="연락처를 입력하세요"
                                        required
                                    />
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                                            새 비밀번호
                                            <span className="text-xs text-gray-400 font-normal ml-2">(변경시에만 입력)</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="변경할 비밀번호를 입력하세요"
                                                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium placeholder:font-normal placeholder:text-gray-400"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">주소 <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2 mb-2">
                                        <div className="relative flex-1">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="text"
                                                readOnly
                                                value={formData.address}
                                                placeholder="도로명 주소 검색"
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium outline-none cursor-not-allowed placeholder:font-normal placeholder:text-gray-400"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddressModal(true)}
                                            className="px-5 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-900 transition-all text-sm shrink-0"
                                        >
                                            주소 검색
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        name="detailAddress"
                                        value={formData.detailAddress}
                                        onChange={handleChange}
                                        placeholder="상세 주소를 입력하세요"
                                        autoComplete="off"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium placeholder:font-normal placeholder:text-gray-400"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup
                                        label="사업자번호 (선택)"
                                        name="businessNumber"
                                        value={formData.businessNumber}
                                        onChange={handleBusinessNumberHyphen}
                                        icon={<FileText className="w-4 h-4" />}
                                        placeholder="000-00-00000"
                                    />
                                    <InputGroup
                                        label="계좌번호 (선택)"
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleChange}
                                        icon={<CreditCard className="w-4 h-4" />}
                                        placeholder="은행명 계좌번호"
                                    />
                                </div>
                                <InputGroup
                                    label="이메일 (선택)"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    icon={<Mail className="w-4 h-4" />}
                                    placeholder="example@email.com"
                                />

                                <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white pb-0">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-3 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors"
                                    >
                                        취소
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {isSaving ? '저장 중...' : '변경사항 저장'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>

                    {showAddressModal && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddressModal(false)}></div>
                            <div className="bg-white rounded-2xl w-full max-w-lg relative z-20 overflow-hidden shadow-2xl">
                                <div className="p-4 flex justify-between items-center border-b">
                                    <h3 className="font-bold text-lg">주소 검색</h3>
                                    <button onClick={() => setShowAddressModal(false)}><X size={24} /></button>
                                </div>
                                <div className="h-[500px]">
                                    <DaumPostcode onComplete={handleAddressComplete} style={{ height: '100%' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </AnimatePresence>
    );
}

interface InputGroupProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon: React.ReactNode;
    placeholder: string;
    type?: string;
    required?: boolean;
}

function InputGroup({ label, name, value, onChange, icon, placeholder, type = "text", required = false }: InputGroupProps) {
    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {icon}
                </div>
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium placeholder:font-normal placeholder:text-gray-400"
                />
            </div>
        </div>
    );
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.35a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}
