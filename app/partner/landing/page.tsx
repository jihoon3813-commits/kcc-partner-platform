'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, Copy, Check, MessageSquare, Info, LayoutGrid, Share2, ArrowUpRight, Loader2, ExternalLink } from 'lucide-react';
import Cookies from 'js-cookie';

interface Product {
    id: string;
    name: string;
    link?: string;
}

interface RawProductData {
    id: string;
    name: string;
    status: string;
    link?: string;
}

interface PartnerInfo {
    '아이디': string;
    '업체명': string;
    '특별혜택'?: string;
    [key: string]: unknown;
}

export default function PartnerLandingPage() {
    const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [allBenefits, setAllBenefits] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [baseUrl, setBaseUrl] = useState('');

    const fetchMasterData = useCallback(async () => {
        try {
            setLoading(true);

            // 1. 세션 확인 먼저
            const session = Cookies.get('partner_session');
            if (!session) {
                console.error('No partner session found');
                setLoading(false);
                return;
            }
            const mySession = JSON.parse(session);

            // 세션 정보 기반 우선 설정 (API 응답 전 링크 생성 보장)
            setPartnerInfo(prev => prev || {
                '아이디': mySession.id,
                '업체명': mySession.name
            });

            // 2. 통합 데이터 페칭 (통신 횟수 1회로 단축)
            const res = await fetch(`/api/data?action=read_partner_config&partnerId=${mySession.id}`);
            const json = await res.json();

            if (json.success) {
                // 3. 상품 데이터 처리
                let masterProducts: Product[] = [];
                if (Array.isArray(json.products) && json.products.length > 0) {
                    masterProducts = json.products
                        .filter((p: RawProductData) => p.status !== '판매중단')
                        .map((p: RawProductData) => ({
                            id: p.id,
                            name: p.name,
                            link: p.link || `/products/${p.id.toLowerCase()}`
                        }));
                }

                // 검색 결과가 없거나 API 결과가 비어있으면 기본값 제공
                if (masterProducts.length === 0) {
                    masterProducts = [{ id: 'P001', name: 'KCC홈씨씨 윈도우ONE 구독 서비스', link: '/products/onev' }];
                }

                setProducts(masterProducts);
                setSelectedProductId(masterProducts[0].id);

                // 4. 파트너 데이터 처리
                if (json.partner) {
                    const me = json.partner;
                    setPartnerInfo(me);
                    try {
                        const benefitsRaw = (me['특별혜택'] as string) || '{}';
                        const parsed = JSON.parse(benefitsRaw);
                        setAllBenefits(typeof parsed === 'object' ? parsed : {});
                    } catch {
                        setAllBenefits({});
                    }
                }
            } else {
                throw new Error(json.message || 'Fetch failed');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            // 에러 시에도 기본 모델 제공
            setProducts([{ id: 'P001', name: 'KCC홈씨씨 윈도우ONE 구독 서비스', link: '/products/onev' }]);
            setSelectedProductId('P001');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setBaseUrl(window.origin);
        }
        fetchMasterData();
    }, [fetchMasterData]);

    const handleSave = async () => {
        if (!partnerInfo) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/partners/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: partnerInfo['아이디'],
                    name: partnerInfo['업체명'],
                    specialBenefits: JSON.stringify(allBenefits),
                    productsInfo: products.map(p => ({
                        id: p.id,
                        name: p.name,
                        link: `${baseUrl}${p.link}?p=${partnerInfo['아이디']}`
                    }))
                })
            });

            const json = await res.json();
            if (json.success) {
                alert('모든 상품의 혜택 정보가 저장되었습니다.');
                fetchMasterData(); // 최신 데이터로 다시 불러오기
            } else {
                alert('저장 실패: ' + json.message);
            }
        } catch (err) {
            console.error('Save error:', err);
            alert('오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    const currentProduct = products.find(p => p.id === selectedProductId);
    const landingUrl = partnerInfo && currentProduct ? `${baseUrl}${currentProduct.link?.startsWith('/') ? currentProduct.link : '/products/onev'}?p=${partnerInfo['아이디']}` : '';

    const handleCopy = () => {
        if (!landingUrl) return;
        navigator.clipboard.writeText(landingUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (!landingUrl) return;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `[KCC창호] ${partnerInfo?.업체명} 전용 혜택`,
                    text: `${partnerInfo?.업체명}에서 드리는 특별한 혜택을 확인해보세요!`,
                    url: landingUrl,
                });
            } catch (err) {
                console.log('Error sharing', err);
            }
        } else {
            handleCopy();
            alert('주소가 복사되었습니다. 카카오톡이나 SNS에 붙여넣어 공유해주세요!');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-gray-500 font-black animate-pulse uppercase tracking-[0.2em]">Syncing Master Data...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 py-10 px-6 font-sans">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="px-3 py-1 bg-blue-600 text-[10px] font-black text-white rounded-full uppercase tracking-widest italic shadow-lg shadow-blue-100">Live Sync</div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase">랜딩페이지 관리</h1>
                    </div>
                    <p className="text-gray-500 font-bold text-lg tracking-tight">본사 마스터 상품별 맞춤 혜택을 설정하고 업체 전용 홍보 URL을 생성하세요.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full lg:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-gray-900 text-white rounded-[24px] text-lg font-black hover:bg-blue-600 transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] active:scale-95 disabled:opacity-50 italic uppercase tracking-tighter"
                >
                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-6 h-6 italic" /> SAVE ALL CONFIG</>}
                </button>
            </div>

            {/* Product Selector */}
            <div className="flex flex-wrap gap-3 p-2 bg-gray-100 rounded-[28px] w-fit shadow-inner">
                {products.map((prod) => (
                    <button
                        key={prod.id}
                        onClick={() => setSelectedProductId(prod.id)}
                        className={`px-8 py-3.5 rounded-[22px] text-sm font-black transition-all uppercase tracking-tight ${selectedProductId === prod.id ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}`}
                    >
                        {prod.name}
                    </button>
                ))}
            </div>

            <div className="grid gap-10 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-10">
                    {/* Benefits Editor */}
                    <div className="bg-white p-10 rounded-[45px] border border-gray-100 shadow-sm space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-10 transition-all group-hover:bg-blue-100"></div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-2xl font-black tracking-tighter text-gray-900 italic uppercase">
                                <MessageSquare className="w-8 h-8 text-blue-600" />
                                <span className="text-blue-600 mr-2">[{currentProduct?.name}]</span> Special Benefit
                            </div>
                            <span className="text-[10px] font-black px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-100 uppercase italic">Active Editing</span>
                        </div>
                        <textarea
                            className="w-full h-56 p-8 bg-gray-50 border-2 border-transparent rounded-[32px] text-lg focus:bg-white focus:ring-8 focus:ring-blue-50 focus:border-blue-400 outline-none resize-none transition-all font-bold leading-relaxed shadow-inner"
                            placeholder="고객님께 드리는 업체만의 특별한 혜택(사은품, 업그레이드 등)을 입력하세요. 이 내용은 상품 페이지 상단에 노출됩니다."
                            value={allBenefits[selectedProductId] || ''}
                            onChange={(e) => setAllBenefits({ ...allBenefits, [selectedProductId]: e.target.value })}
                        />
                    </div>

                    {/* URL Card Enhanced */}
                    <div className="bg-white p-10 rounded-[45px] border border-gray-100 shadow-sm space-y-8 border-l-[12px] border-l-orange-500 overflow-hidden relative">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-50 rounded-full blur-[60px] opacity-50"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4 text-2xl font-black tracking-tighter text-gray-900 italic uppercase">
                                <Share2 className="w-8 h-8 text-orange-500" /> Smart Share & Link
                            </div>
                        </div>

                        <div className="p-6 bg-orange-50/50 rounded-[28px] border-2 border-dashed border-orange-200 relative z-10">
                            <p className="text-base font-black text-orange-700 break-all select-all font-mono tracking-tighter">{landingUrl}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                            <button
                                onClick={handleCopy}
                                className={`flex items-center justify-center gap-3 py-6 rounded-[24px] text-base font-black transition-all shadow-sm uppercase tracking-tighter ${copied ? 'bg-emerald-500 text-white scale-95 shadow-lg' : 'bg-gray-50 text-gray-900 hover:bg-gray-100'}`}
                            >
                                {copied ? <><Check className="w-5 h-5" /> Copied!</> : <><Copy className="w-5 h-5" /> Copy Link</>}
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center justify-center gap-3 py-6 bg-orange-500 text-white rounded-[24px] text-base font-black hover:bg-orange-600 transition-all shadow-[0_20px_40px_-10px_rgba(249,115,22,0.3)] active:scale-95 uppercase tracking-tighter italic"
                            >
                                <Share2 className="w-5 h-5" /> Share SNS
                            </button>
                            <button
                                onClick={() => window.open(landingUrl, '_blank')}
                                className="flex items-center justify-center gap-3 py-6 bg-gray-900 text-white rounded-[24px] text-base font-black hover:bg-black transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] active:scale-95 uppercase tracking-tighter flex items-center"
                            >
                                <ExternalLink className="w-5 h-5" /> Preview
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-gray-900 p-10 rounded-[50px] text-white shadow-2xl space-y-8 relative overflow-hidden group">
                        <LayoutGrid className="absolute -right-8 -bottom-8 w-48 h-48 opacity-5 group-hover:rotate-12 transition-transform duration-700" />
                        <div className="flex items-center gap-4 text-2xl font-black relative z-10 text-orange-400 italic uppercase tracking-tighter">
                            <Info className="w-8 h-8" /> Best Practices
                        </div>
                        <ul className="space-y-8 font-bold leading-relaxed relative z-10">
                            <li className="flex gap-5 group/item">
                                <div className="w-10 h-10 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 shrink-0 group-hover/item:bg-orange-500 group-hover/item:text-white transition-all">
                                    <Check className="w-6 h-6" />
                                </div>
                                <p className="text-gray-300 text-sm group-hover/item:text-white transition-colors"><b>공유하기</b> 버튼으로 스마트폰에서 바로 카카오톡 친구에게 업체 전용 혜택 페이지를 전송하세요.</p>
                            </li>
                            <li className="flex gap-5 group/item">
                                <div className="w-10 h-10 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 shrink-0 group-hover/item:bg-orange-500 group-hover/item:text-white transition-all">
                                    <Check className="w-6 h-6" />
                                </div>
                                <p className="text-gray-300 text-sm group-hover/item:text-white transition-colors">블로그나 인스타그램 홍보 시 <b>링크 복사</b> 기능을 활용하여 프로필 링크에 등록하세요.</p>
                            </li>
                            <li className="flex gap-5 group/item">
                                <div className="w-10 h-10 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 shrink-0 group-hover/item:bg-orange-500 group-hover/item:text-white transition-all">
                                    <Check className="w-6 h-6" />
                                </div>
                                <p className="text-gray-300 text-sm group-hover/item:text-white transition-colors">본사에서 등록한 <b>모든 마스터 상품</b>에 대해 각각 별도의 혜택을 설정할 수 있습니다.</p>
                            </li>
                        </ul>
                    </div>

                    <div className="p-8 bg-blue-50 rounded-[40px] border-2 border-dashed border-blue-100 flex flex-col items-center text-center gap-4">
                        <ArrowUpRight className="w-10 h-10 text-blue-600" />
                        <p className="text-blue-900 font-black text-lg italic uppercase tracking-tighter">Always Synced</p>
                        <p className="text-blue-600/60 text-xs font-bold leading-relaxed">본사에서 상품 정보가 변경되면 이곳의 랜딩페이지 설정도 실시간으로 연동되어 안전합니다.</p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                ::selection {
                    background: #2563eb;
                    color: white;
                }
            `}</style>
        </div>
    );
}
