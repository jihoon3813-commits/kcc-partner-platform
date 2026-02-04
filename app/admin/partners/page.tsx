'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, MoreHorizontal, RefreshCcw, X, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import DaumPostcode from 'react-daum-postcode';
import Cookies from 'js-cookie';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface Partner {
    '아이디': string;
    '업체명': string;
    '대표명': string;
    '연락처': string;
    '주소': string;
    '상태': string;
    '등록일'?: string | number | Date;
    '사업자번호'?: string;
    '이메일'?: string;
    '계좌번호'?: string;
    '비밀번호'?: string;
    [key: string]: string | number | Date | undefined | null;
}

export default function PartnersPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 폼 상태
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        id: '', // 아이디 필드 추가
        address: '',
        businessNumber: '', // 사업자번호
        ceoName: '', // 대표명
        status: '승인대기', // 기본값
        password: '',
        passwordConfirm: '',
        email: '',
        accountNumber: '' // 계좌번호
    });

    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    // Convex Mutations
    const createPartnerMutation = useMutation(api.partners.createPartner);
    const updatePartnerMutation = useMutation(api.partners.updatePartner);
    const deletePartnerMutation = useMutation(api.partners.deletePartnerByUid);

    // Convex Data Fetching
    const convexPartners = useQuery(api.partners.listPartners);

    useEffect(() => {
        if (convexPartners) {
            const mapped = convexPartners.map(p => ({
                '아이디': p.uid,
                '업체명': p.name,
                '대표명': p.ceo_name || '',
                '연락처': p.contact || '',
                '주소': p.address || '',
                '상태': p.status || '승인대기',
                '등록일': p._creationTime,
                '사업자번호': p.business_number || '',
                '이메일': p.email || '',
                '계좌번호': p.account_number || '',
                '비밀번호': p.password || '',
                '_id': p._id
            }));
            setPartners(mapped);
            setLoading(false);
        }
    }, [convexPartners]);

    const fetchData = useCallback(async () => {
        // Handled by useQuery
    }, []);

    useEffect(() => {
        // fetchData();
    }, [fetchData]);

    // 입력 핸들러 (자동 하이픈 등)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // 연락처 자동 하이픈
        if (name === 'contact') {
            formattedValue = value
                .replace(/[^0-9]/g, '')
                .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
        }
        // 사업자번호 자동 하이픈 (000-00-00000)
        else if (name === 'businessNumber') {
            formattedValue = value
                .replace(/[^0-9]/g, '')
                .replace(/^(\d{3})(\d{2})(\d{5})$/, `$1-$2-$3`);
        }

        setFormData(prev => ({ ...prev, [name]: formattedValue }));

        // 비밀번호 확인 실시간 체크
        if (name === 'password' || name === 'passwordConfirm') {
            const pw = name === 'password' ? value : formData.password;
            const pwConfirm = name === 'passwordConfirm' ? value : formData.passwordConfirm;

            if (pw && pwConfirm && pw !== pwConfirm) {
                setPasswordError('비밀번호가 일치하지 않습니다.');
            } else {
                setPasswordError('');
            }
        }
    };

    // 주소 검색 완료 핸들러
    const handleCompleteAddress = (data: { address: string; addressType: string; bname: string; buildingName: string }) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        setFormData(prev => ({ ...prev, address: fullAddress }));
        setIsAddressModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (!formData.name || !formData.contact || !formData.id) {
            alert('업체명, 연락처, 아이디는 필수입니다.');
            return;
        }

        try {
            await createPartnerMutation({
                uid: formData.id,
                name: formData.name,
                ceo_name: formData.ceoName,
                contact: formData.contact,
                address: formData.address,
                password: formData.password,
                business_number: formData.businessNumber,
                account_number: formData.accountNumber,
                email: formData.email,
                status: '승인대기'
            });

            alert('파트너가 추가되었습니다.');
            setIsModalOpen(false);
            setFormData({
                name: '', contact: '', id: '', address: '', businessNumber: '', ceoName: '',
                status: '승인대기', password: '', passwordConfirm: '', email: '', accountNumber: ''
            });
        } catch (err: any) {
            alert('추가 실패: ' + (err.message || '알 수 없는 오류'));
        }
    };

    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // 상세 모달 열기
    const openDetailModal = (partner: Partner) => {
        // 상세 모달용 데이터 초기화 (기존 필드 매핑)
        setFormData({
            name: partner['업체명'],
            contact: partner['연락처'],
            id: partner['아이디'],
            address: partner['주소'],
            businessNumber: partner['사업자번호'] || '',
            ceoName: partner['대표명'],
            status: partner['상태'],
            password: partner['비밀번호'] || '',
            passwordConfirm: partner['비밀번호'] || '',
            email: partner['이메일'] || '',
            accountNumber: partner['계좌번호'] || ''
        });
        setSelectedPartner(partner);
        setIsDetailModalOpen(true);
    };

    const handleUpdate = async () => {
        if (!confirm('수정하시겠습니까?')) return;

        try {
            const partnerToUpdate = partners.find(p => p['아이디'] === formData.id);
            if (!partnerToUpdate || !partnerToUpdate._id) throw new Error('파트너를 찾을 수 없습니다.');

            const updates: any = {};
            if (formData.name) updates.name = formData.name;
            if (formData.ceoName) updates.ceo_name = formData.ceoName;
            if (formData.contact) updates.contact = formData.contact;
            if (formData.address) updates.address = formData.address;
            if (formData.status) updates.status = formData.status;
            if (formData.businessNumber) updates.business_number = formData.businessNumber;
            if (formData.accountNumber) updates.account_number = formData.accountNumber;
            if (formData.email) updates.email = formData.email;
            if (formData.password) updates.password = formData.password;

            await updatePartnerMutation({
                id: (partnerToUpdate as any)._id,
                updates
            });

            alert('수정되었습니다.');
            setIsDetailModalOpen(false);
        } catch (err: any) {
            console.error(err);
            alert('수정 실패: ' + err.message);
        }
    };

    const handleDelete = async () => {
        if (!selectedPartner) return;
        if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

        try {
            await deletePartnerMutation({ uid: selectedPartner['아이디'] });
            alert('삭제되었습니다.');
            setIsDetailModalOpen(false);
        } catch (err: any) {
            console.error(err);
            alert('삭제 실패: ' + err.message);
        }
    };

    const handleQuickApprove = async () => {
        if (!selectedPartner) return;
        if (!confirm('이 파트너를 승인하시겠습니까?')) return;
        // 승인 처리도 update 로 통합 가능하지만, 명시적으로 승인 API 사용해도 됨.
        // 여기서는 데이터 update로 '상태'를 '승인'으로 변경하는 방식으로 통일하거나,
        // 기존 approve API 재사용 가능. 여기선 update 로 '승인' 상태 변경해보자.

        try {
            const partnerToUpdate = partners.find(p => p['아이디'] === selectedPartner['아이디']);
            if (!partnerToUpdate || !partnerToUpdate._id) throw new Error('파트너를 찾을 수 없습니다.');

            await updatePartnerMutation({
                id: (partnerToUpdate as any)._id,
                updates: { status: '승인' }
            });

            alert('승인되었습니다.');
            setIsDetailModalOpen(false);
        } catch (err: any) {
            console.error(err);
            alert('승인 실패: ' + err.message);
        }
    };

    const loginAsPartner = (partner: Partner) => {
        const session = {
            name: partner['업체명'],
            id: partner['아이디']
        };
        // 본사 세션은 유지하되, 파트너 세션 쿠키를 설정하여 파트너 페이지 접근 허용
        Cookies.set('partner_session', JSON.stringify(session), { expires: 1 });
        window.open('/partner', '_blank');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">파트너 관리</h1>
                    <p className="text-gray-500">등록된 파트너 정보를 조회하고 관리합니다.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchData}
                        className="bg-white border px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                    >
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> 새로고침
                    </button>
                    <button
                        onClick={() => {
                            setFormData({
                                name: '', contact: '', id: '', address: '', businessNumber: '', ceoName: '',
                                status: '승인대기', password: '', passwordConfirm: '', email: '', accountNumber: ''
                            });
                            setSelectedPartner(null);
                            setIsModalOpen(true);
                        }}
                        className="bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 flex items-center gap-2"
                    >
                        + 파트너 추가
                    </button>
                </div>
            </div>

            {/* 파트너 리스트 테이블 */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="파트너명, 대표명 검색"
                            className="w-full pl-9 pr-4 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                            <tr>
                                <th className="px-6 py-3">업체명</th>
                                <th className="px-6 py-3">대표자</th>
                                <th className="px-6 py-3">연락처</th>
                                <th className="px-6 py-3">아이디</th>
                                <th className="px-6 py-3">주소</th>
                                <th className="px-6 py-3">등록일</th>
                                <th className="px-6 py-3">상태</th>
                                <th className="px-6 py-3 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y relative">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                                        데이터를 불러오는 중입니다...
                                    </td>
                                </tr>
                            ) : partners.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                                        등록된 파트너가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                partners.map((partner, index) => (
                                    <tr key={index} className="hover:bg-gray-50 group">
                                        <td className="px-6 py-4 font-medium text-gray-900">{partner['업체명']}</td>
                                        <td className="px-6 py-4 text-gray-500">{partner['대표명']}</td>
                                        <td className="px-6 py-4 text-gray-500">{partner['연락처']}</td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{partner['아이디']}</td>
                                        <td className="px-6 py-4 text-gray-500 truncate max-w-[200px]">{partner['주소']}</td>
                                        <td className="px-6 py-4 text-gray-500">{partner['등록일'] ? partner['등록일'].toString().substring(0, 10) : '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${partner['상태'] === '승인' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {partner['상태'] || '대기'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openDetailModal(partner)}
                                                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                                            >
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                )))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 파트너 추가 모달 (기존) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-5 border-b">
                            <h2 className="text-lg font-bold">신규 파트너 등록</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            {/* 기존 폼 내용 재사용 (생략 없이 넣어줘야 함, replace_file_content 특성상) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">업체명 <span className="text-red-500">*</span></label>
                                    <input name="name" required value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="예: KCC 수원점" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">대표자명</label>
                                    <input name="ceoName" value={formData.ceoName} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="대표자 성함" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">아이디 <span className="text-red-500">*</span></label>
                                    <input
                                        name="id"
                                        required
                                        value={formData.id}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        placeholder="사용할 아이디 입력"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">연락처 <span className="text-red-500">*</span></label>
                                    <input
                                        name="contact"
                                        type="tel"
                                        inputMode="numeric"
                                        required
                                        value={formData.contact}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        placeholder="010-0000-0000"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">사업자번호</label>
                                    <input
                                        name="businessNumber"
                                        type="tel"
                                        inputMode="numeric"
                                        value={formData.businessNumber}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        placeholder="000-00-00000"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">주소</label>
                                <div className="flex gap-2">
                                    <input name="address" value={formData.address} readOnly placeholder="주소 검색을 이용해주세요" className="flex-1 p-2 border rounded-md bg-gray-50" />
                                    <button type="button" onClick={() => setIsAddressModalOpen(true)} className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 whitespace-nowrap">주소 검색</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1 relative">
                                    <label className="text-sm font-medium text-gray-700">비밀번호</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded-md pr-10"
                                            placeholder="비밀번호 입력"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1 relative">
                                    <label className="text-sm font-medium text-gray-700">비밀번호 확인</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswordConfirm ? "text" : "password"}
                                            name="passwordConfirm"
                                            value={formData.passwordConfirm}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded-md pr-10"
                                            placeholder="비밀번호 재입력"
                                        />
                                        <button type="button" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">이메일</label>
                                <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="example@email.com" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">계좌번호</label>
                                <input name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="은행명 계좌번호" />
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md hover:bg-gray-50">취소</button>
                                <button type="submit" className="px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-md hover:opacity-90">등록하기</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 파트너 상세/수정 모달 (NEW) */}
            {isDetailModalOpen && selectedPartner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-5 border-b">
                            <h2 className="text-lg font-bold">파트너 정보 수정</h2>
                            <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* 상태 표시 및 승인 버튼 */}
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-4">
                                    {selectedPartner && (
                                        <div>
                                            <span className="text-sm text-gray-500">현재 상태</span>
                                            <div className="font-bold text-lg">{selectedPartner['상태']}</div>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => selectedPartner && loginAsPartner(selectedPartner)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-bold rounded-md hover:bg-blue-100 transition-colors border border-blue-200"
                                    >
                                        <ShieldCheck className="w-4 h-4" /> 파트너 어드민 접속
                                    </button>
                                </div>
                                {selectedPartner?.['상태'] !== '승인' && (
                                    <button
                                        onClick={handleQuickApprove}
                                        className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-md hover:bg-green-700"
                                    >
                                        승인 처리하기
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">아이디 (수정불가)</label>
                                    <input value={formData.id} disabled className="w-full p-2 border rounded-md bg-gray-100" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">업체명</label>
                                    <input name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-md" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">대표자명</label>
                                    <input name="ceoName" value={formData.ceoName} onChange={handleChange} className="w-full p-2 border rounded-md" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">연락처</label>
                                    <input name="contact" value={formData.contact} onChange={handleChange} className="w-full p-2 border rounded-md" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">사업자번호</label>
                                    <input name="businessNumber" value={formData.businessNumber} onChange={handleChange} className="w-full p-2 border rounded-md" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">주소</label>
                                <div className="flex gap-2">
                                    <input name="address" value={formData.address} readOnly className="flex-1 p-2 border rounded-md bg-gray-50" />
                                    <button type="button" onClick={() => setIsAddressModalOpen(true)} className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 whitespace-nowrap">주소 검색</button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">비밀번호 변경 (비워두면 유지)</label>
                                <input type="text" name="password" value={formData.password} onChange={handleChange} placeholder="새 비밀번호 입력" className="w-full p-2 border rounded-md" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">이메일</label>
                                <input name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded-md" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">계좌번호</label>
                                <input name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="w-full p-2 border rounded-md" />
                            </div>

                            <div className="flex justify-between pt-4 border-t mt-4">
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                                >
                                    파트너 삭제
                                </button>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsDetailModalOpen(false)} className="px-4 py-2 border rounded-md hover:bg-gray-50">취소</button>
                                    <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">수정 내용 저장</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 주소 검색 모달 (Daum Postcode) */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden relative">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="font-bold">주소 검색</h3>
                            <button onClick={() => setIsAddressModalOpen(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="h-[400px]">
                            <DaumPostcode onComplete={handleCompleteAddress} className="h-full" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
