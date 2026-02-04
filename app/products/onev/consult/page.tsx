'use client';

import React, { useState, useEffect } from 'react';
import { Home, ClipboardCheck, X, MessageCircle, MapPin } from 'lucide-react';
import DaumPostcode from 'react-daum-postcode';
import Image from 'next/image';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

const koreaDistrictData: { [key: string]: string[] } = {
    "서울특별시": ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
    "경기도": ["수원시", "고양시", "용인시", "성남시", "부천시", "화성시", "안산시", "남양주시", "안양시", "평택시", "시흥시", "파주시", "의정부시", "김포시", "광주시", "광명시", "군포시", "하남시", "오산시", "양주시", "이천시", "구리시", "의왕시", "포천시", "양평군", "여주시", "동두천시", "가평군", "과천시", "연천군"],
    "인천광역시": ["계양구", "미추홀구", "남동구", "동구", "부평구", "서구", "연수구", "중구", "강화군", "옹진군"],
    "부산광역시": ["강서구", "금정구", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구", "기장군"],
    "대구광역시": ["남구", "달서구", "동구", "북구", "서구", "수성구", "중구", "달성군"],
    "광주광역시": ["광산구", "남구", "동구", "북구", "서구"],
    "대전광역시": ["대덕구", "동구", "서구", "유성구", "중구"],
    "울산광역시": ["남구", "동구", "북구", "중구", "울주군"],
    "세종특별자치시": ["세종시"],
    "강원특별자치도": ["춘천시", "원주시", "강릉시", "동해시", "태백시", "속초시", "삼척시", "홍천군", "횡성군", "영월군", "평창군", "정선군", "철원군", "화천군", "양구군", "인제군", "고성군", "양양군"],
    "충청북도": ["청주시", "충주시", "제천시", "보은군", "옥천군", "영동군", "증평군", "진천군", "괴산군", "음성군", "단양군"],
    "충청남도": ["천안시", "공주시", "보령시", "아산시", "서산시", "논산시", "계룡시", "당진시", "금산군", "부여군", "서천군", "청양군", "홍성군", "예산군", "태안군"],
    "전북특별자치도": ["전주시", "군산시", "익산시", "정읍시", "남원시", "김제시", "완주군", "진안군", "무주군", "장수군", "임실군", "순창군", "고창군", "부안군"],
    "전라남도": ["목포시", "여수시", "순천시", "나주시", "광양시", "담양군", "곡성군", "구례군", "고흥군", "보성군", "화순군", "장흥군", "강진군", "해남군", "영암군", "무안군", "함평군", "영광군", "장성군", "완도군", "진도군", "신안군"],
    "경상북도": ["포항시", "경주시", "김천시", "안동시", "구미시", "영주시", "영천시", "상주시", "문경시", "경산시", "군위군", "의성군", "청송군", "영양군", "영덕군", "청도군", "고령군", "성주군", "칠곡군", "예천군", "봉화군", "울진군", "울릉군"],
    "경상남도": ["창원시", "진주시", "통영시", "사천시", "김해시", "밀양시", "거제시", "양산시", "의령군", "함안군", "창녕군", "고성군", "남해군", "하동군", "산청군", "함양군", "거창군", "합천군"],
    "제주특별자치도": ["제주시", "서귀포시"]
};

interface PartnerData {
    '아이디': string;
    '업체명': string;
    '특별혜택'?: string;
    [key: string]: unknown;
}

interface PostcodeData {
    address: string;
    addressType: string;
    bname: string;
    buildingName: string;
    zonecode: string;
}

export default function ConsultPage() {
    const [partnerId, setPartnerId] = useState<string | null>(null);
    const [partnerData, setPartnerData] = useState<PartnerData | null>(null);

    // Consultation States
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [selectedSido, setSelectedSido] = useState('');
    const [selectedGungu, setSelectedGungu] = useState('');
    const [isAgreed, setIsAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [consultType, setConsultType] = useState<'quick' | 'accurate'>('quick');
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [address, setAddress] = useState('');
    const [detailAddress, setDetailAddress] = useState('');
    const [zonecode, setZonecode] = useState('');
    const [pyeong, setPyeong] = useState('');
    const [expansion, setExpansion] = useState('');
    const [residence, setResidence] = useState('');
    const [schedule, setSchedule] = useState('');
    const [remarks, setRemarks] = useState('');

    const createCustomerMutation = useMutation(api.customers.createCustomer);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const pId = params.get('p');
            setPartnerId(pId);

            if (pId) {
                // Fetch partner data
                fetch(`/api/data?action=read_partner_config&partnerId=${pId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success && data.partner) {
                            setPartnerData(data.partner);
                        }
                    })
                    .catch(err => console.error(err));
            }
        }
    }, []);

    const handleSidoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSido(e.target.value);
        setSelectedGungu('');
    };

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
        setZonecode(data.zonecode);
        setShowAddressModal(false);
    };

    const handleConsultSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAgreed) return alert('개인정보 수집 및 이용에 동의해주세요.');
        if (consultType === 'accurate' && !address) return alert('주소를 입력해주세요.');

        setIsSubmitting(true);
        try {
            const progressDetail = [
                pyeong ? `평형: ${pyeong}` : '',
                expansion ? `확장: ${expansion}` : '',
                residence ? `거주: ${residence}` : '',
                schedule ? `희망일: ${schedule}` : '',
                remarks ? `특이사항: ${remarks}` : ''
            ].filter(Boolean).join(' / ');

            await createCustomerMutation({
                name,
                contact,
                address: consultType === 'quick' ? `${selectedSido} ${selectedGungu}` : `${address} ${detailAddress} [${zonecode}]`,
                channel: partnerData ? partnerData['업체명'] : '본사(직접)',
                label: '일반',
                status: '접수',
                progress_detail: progressDetail,
                created_at: new Date().toISOString().split('T')[0]
            });

            alert('상담 신청이 정상적으로 접수되었습니다. 곧 연락드리겠습니다.');
            window.close(); // Try to close if it's a popup
        } catch (err: any) {
            console.error(err);
            alert('상담 신청 중 오류가 발생했습니다: ' + (err.message || '통신 오류'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[40px] w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl">
                <div className="bg-[#D4AF37] p-8 text-black relative">
                    <h2 className="text-3xl font-black">무료 견적 상담 신청</h2>
                    {partnerData && (
                        <p className="text-black/70 font-bold mt-2">{partnerData['업체명']} 파트너</p>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button onClick={() => setConsultType('quick')} className={`flex-1 py-6 font-black text-xl transition-colors ${consultType === 'quick' ? 'bg-white text-[#D4AF37] border-b-4 border-[#D4AF37]' : 'bg-gray-50 text-gray-400'}`}>빠른 상담</button>
                    <button onClick={() => setConsultType('accurate')} className={`flex-1 py-6 font-black text-xl transition-colors ${consultType === 'accurate' ? 'bg-white text-[#D4AF37] border-b-4 border-[#D4AF37]' : 'bg-gray-50 text-gray-400'}`}>정확한 상담</button>
                </div>

                <form className="p-8 space-y-6" onSubmit={handleConsultSubmit}>
                    <div className="space-y-4">
                        <label className="block text-gray-500 font-bold mb-1">성함</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl font-bold border border-transparent focus:border-[#D4AF37] outline-none" required placeholder="성함 입력" />
                    </div>
                    <div className="space-y-4">
                        <label className="block text-gray-500 font-bold mb-1">연락처</label>
                        <input type="tel" value={contact} onChange={handleAutoHyphen} className="w-full p-4 bg-gray-50 rounded-xl font-bold border border-transparent focus:border-[#D4AF37] outline-none" required placeholder="010-0000-0000" pattern="[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}" />
                    </div>

                    {consultType === 'quick' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <select className="p-4 bg-gray-50 rounded-xl font-bold outline-none" value={selectedSido} onChange={handleSidoChange} required>
                                <option value="">시/도 선택</option>
                                {Object.keys(koreaDistrictData).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select className="p-4 bg-gray-50 rounded-xl font-bold outline-none" value={selectedGungu} onChange={(e) => setSelectedGungu(e.target.value)} required>
                                <option value="">시/구/군</option>
                                {selectedSido && koreaDistrictData[selectedSido].map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <label className="block text-gray-500 font-bold mb-1">주소</label>
                                <div className="flex gap-2">
                                    <input type="text" value={address} readOnly className="flex-1 p-4 bg-gray-100 rounded-xl font-bold" placeholder="주소 검색" onClick={() => setShowAddressModal(true)} />
                                    <button type="button" onClick={() => setShowAddressModal(true)} className="px-6 bg-black text-white rounded-xl font-bold"><MapPin size={20} /></button>
                                </div>
                                <input type="text" value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl font-bold border border-transparent focus:border-[#D4AF37] outline-none" placeholder="상세주소 입력" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">평형</label>
                                    <input type="text" value={pyeong} onChange={(e) => setPyeong(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none" placeholder="30평" />
                                </div>
                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">확장 여부</label>
                                    <select value={expansion} onChange={(e) => setExpansion(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none">
                                        <option value="">선택</option>
                                        <option value="확장됨">확장됨</option>
                                        <option value="안됨">안됨</option>
                                        <option value="모름">모름</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">거주 상태</label>
                                    <select value={residence} onChange={(e) => setResidence(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none">
                                        <option value="">선택</option>
                                        <option value="거주중">거주중</option>
                                        <option value="비거주(공실)">비거주(공실)</option>
                                        <option value="이사예정">이사예정</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">시공 희망일</label>
                                    <input type="date" value={schedule} onChange={(e) => setSchedule(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="block text-gray-500 font-bold mb-1">특이사항</label>
                                <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none h-32 resize-none" placeholder="문의사항을 적어주세요." />
                            </div>
                        </>
                    )}

                    <div className="flex items-center gap-3 py-2 cursor-pointer" onClick={() => setIsAgreed(!isAgreed)}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isAgreed ? 'bg-[#D4AF37] border-[#D4AF37] text-white' : 'border-gray-300'}`}>
                            {isAgreed && <ClipboardCheck size={14} />}
                        </div>
                        <span className="text-gray-500 font-bold text-sm">개인정보 수집 및 이용에 동의합니다.</span>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-black text-white rounded-2xl font-black text-xl hover:bg-gray-900 transition-all shadow-xl disabled:opacity-50">
                        {isSubmitting ? '접수 중...' : '상담 신청하기'}
                    </button>
                </form>

                {/* Address Modal */}
                {showAddressModal && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddressModal(false)}></div>
                        <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 overflow-hidden shadow-2xl">
                            <DaumPostcode onComplete={handleAddressComplete} />
                            <button onClick={() => setShowAddressModal(false)} className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md"><X size={20} /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
