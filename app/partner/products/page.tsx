'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Search, Package, ShieldCheck, Loader2, Image as ImageIcon, MessageSquare, Share2, Copy, Check, ExternalLink, X, Save, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Cookies from 'js-cookie';

interface Product {
    id: string;
    category: string;
    name: string;
    description: string;
    specs: string[];
    price: string;
    status: string;
    image: string;
    link?: string;
}


export default function PartnerCombinedProductsPage() {
    const [sessionPartnerId, setSessionPartnerId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [allBenefits, setAllBenefits] = useState<Record<string, string>>({});
    const [baseUrl, setBaseUrl] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [tempBenefit, setTempBenefit] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [consultCopied, setConsultCopied] = useState(false);

    useEffect(() => {
        const session = Cookies.get('partner_session');
        if (session) {
            try {
                const parsed = JSON.parse(session);
                setSessionPartnerId(parsed.id);
            } catch (e) {
                console.error("Session parse error", e);
            }
        }
    }, []);

    const convexProducts = useQuery(api.products.listProducts);
    const convexPartner = useQuery(api.partners.getPartnerByUid, sessionPartnerId ? { uid: sessionPartnerId } : "skip");
    const updatePartnerMutation = useMutation(api.partners.updatePartnerByUid);

    const products = useMemo(() => {
        if (!convexProducts) return [];
        return convexProducts.map(p => ({
            id: p.code,
            category: p.category || '',
            name: p.name || '',
            description: p.description || '',
            specs: typeof p.specs === 'string' ? JSON.parse(p.specs) : (p.specs || []),
            price: p.price || '',
            status: p.status || '',
            image: p.image || '',
            link: p.link || ''
        })).filter(p => p.status !== '판매중단');
    }, [convexProducts]);

    const partnerInfo = useMemo(() => {
        if (!convexPartner) return null;
        return {
            '아이디': convexPartner.uid,
            '업체명': convexPartner.name,
            '상품별혜택': convexPartner.special_benefits
        };
    }, [convexPartner]);

    useEffect(() => {
        if (convexPartner?.special_benefits) {
            try {
                const parsed = JSON.parse(convexPartner.special_benefits);
                setAllBenefits(typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, string>) : {});
            } catch { setAllBenefits({}); }
        }
    }, [convexPartner]);

    useEffect(() => {
        if (typeof window !== 'undefined') setBaseUrl(window.origin);
    }, []);

    const loading = convexProducts === undefined || (sessionPartnerId && convexPartner === undefined);

    const handleOpenSettings = (product: Product) => {
        setSelectedProduct(product);
        setTempBenefit(allBenefits[product.id] || '');
        setIsModalOpen(true);
    };

    const handleSaveBenefits = async () => {
        if (!partnerInfo || !selectedProduct) return;
        setIsSaving(true);
        try {
            const updatedBenefits = { ...allBenefits, [selectedProduct.id]: tempBenefit };

            await updatePartnerMutation({
                uid: partnerInfo['아이디'],
                updates: {
                    special_benefits: JSON.stringify(updatedBenefits)
                }
            });

            setAllBenefits(updatedBenefits);
            alert('혜택 정보가 저장되었습니다.');
        } catch (err: unknown) {
            console.error('Save error:', err);
            alert('오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    const landingUrl = partnerInfo && selectedProduct ? `${baseUrl}${selectedProduct.link || '/products/onev'}?p=${partnerInfo['아이디']}` : '';

    const handleCopy = () => {
        if (!landingUrl) return;
        navigator.clipboard.writeText(landingUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Synchronizing Catalog & Config...</p>
        </div>
    );

    return (
        <div className="py-8 px-4 lg:px-6 space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 italic uppercase tracking-tighter">
                        <Package className="w-8 h-8 text-indigo-600" />
                        상품 검색 & 랜딩페이지 최적화
                    </h1>
                    <p className="text-gray-500 font-bold">KCC 마스터 상품을 조회하고, 업체 전용 혜택을 설정하여 홍보용 링크를 생성하세요.</p>
                </div>

                <div className="relative group max-w-md w-full">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="이름 또는 카테고리로 찾기..."
                        className="w-full pl-12 pr-6 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="group bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full hover:-translate-y-3">
                        <div className="relative h-64 bg-gray-50">
                            {product.image ? (
                                <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <ImageIcon className="w-16 h-16" />
                                </div>
                            )}
                            <div className="absolute top-6 left-6 bg-indigo-600/90 backdrop-blur-md text-white px-4 py-1.5 rounded-xl text-[10px] font-black shadow-lg uppercase tracking-widest">
                                {product.category}
                            </div>

                            {/* Has Benefit Badge */}
                            {allBenefits[product.id] && (
                                <div className="absolute top-6 right-6 bg-emerald-500 text-white p-2 rounded-xl shadow-lg flex items-center gap-2">
                                    <MessageSquare size={14} />
                                    <span className="text-[10px] font-black">혜택 설정됨</span>
                                </div>
                            )}
                        </div>

                        <div className="p-8 flex-1 flex flex-col">
                            <h3 className="font-black text-2xl text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors italic tracking-tight uppercase">
                                {product.name}
                            </h3>
                            <p className="text-gray-400 text-sm font-bold line-clamp-2 min-h-[40px] leading-relaxed mb-6">
                                {product.description}
                            </p>

                            <div className="bg-gray-50/80 rounded-[24px] p-5 space-y-3 mb-8 flex-1 border border-gray-100/50">
                                {product.specs.slice(0, 3).map((spec: string, i: number) => (
                                    <div key={i} className="flex items-center gap-3 text-xs text-gray-600 font-bold">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span className="truncate">{spec}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleOpenSettings(product)}
                                className="w-full py-5 bg-gray-900 text-white rounded-[20px] font-black text-sm flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-gray-200 active:scale-95 italic uppercase tracking-tighter"
                            >
                                <Share2 className="w-4 h-4" />
                                홍보 & 혜택 설정
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Settings Modal */}
            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white rounded-[50px] w-full max-w-4xl max-h-[90vh] relative z-10 overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="p-8 border-b bg-gray-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <Share2 size={28} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 italic tracking-tighter uppercase leading-none">{selectedProduct.name}</h2>
                                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Landing Page & Customer Benefit Configuration</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white rounded-xl hover:bg-red-50 hover:text-red-500 transition-all shadow-md">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-10">
                            {/* URL Link Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-xl font-black text-gray-900 italic uppercase">
                                    <ArrowUpRight className="text-indigo-600" /> 홍보용 전용 링크 (Landing URL)
                                </div>
                                <div className="p-6 bg-indigo-50/50 rounded-3xl border-2 border-dashed border-indigo-200 flex flex-col sm:flex-row items-center gap-6">
                                    <p className="flex-1 font-mono text-sm text-indigo-700 font-black break-all select-all">
                                        {landingUrl || `${baseUrl}${selectedProduct.link || '/products/onev'}?p=${partnerInfo?.['아이디'] || 'loading...'}`}
                                    </p>
                                    <div className="flex gap-3 shrink-0">
                                        <button onClick={handleCopy} className={`px-6 py-3 rounded-xl font-black text-xs transition-all uppercase ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50'}`}>
                                            {copied ? <Check size={16} /> : <Copy size={16} />}
                                            <span className="ml-2">{copied ? '복사됨' : '복사하기'}</span>
                                        </button>
                                        <button onClick={() => window.open(landingUrl, '_blank')} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-xs hover:bg-black transition-all uppercase flex items-center gap-2">
                                            <ExternalLink size={16} /> 미리보기
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Consultation Only Link Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-xl font-black text-gray-900 italic uppercase">
                                    <MessageSquare className="text-pink-600" /> 상담신청 페이지만 (Consultation Only)
                                </div>
                                <div className="p-6 bg-pink-50/50 rounded-3xl border-2 border-dashed border-pink-200 flex flex-col sm:flex-row items-center gap-6">
                                    <p className="flex-1 font-mono text-sm text-pink-700 font-black break-all select-all">
                                        {baseUrl}/products/onev/consult?p={partnerInfo?.['아이디'] || '...'}
                                    </p>
                                    <div className="flex gap-3 shrink-0">
                                        <button
                                            onClick={() => {
                                                if (!baseUrl || !partnerInfo) return;
                                                const url = `${baseUrl}/products/onev/consult?p=${partnerInfo['아이디']}`;
                                                navigator.clipboard.writeText(url);
                                                setConsultCopied(true);
                                                setTimeout(() => setConsultCopied(false), 2000);
                                            }}
                                            className={`px-6 py-3 rounded-xl font-black text-xs transition-all uppercase ${consultCopied ? 'bg-emerald-500 text-white' : 'bg-white text-pink-600 border border-pink-100 hover:bg-pink-50'}`}
                                        >
                                            {consultCopied ? <Check size={16} /> : <Copy size={16} />}
                                            <span className="ml-2">{consultCopied ? '복사됨' : '복사하기'}</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!baseUrl || !partnerInfo) return;
                                                window.open(`${baseUrl}/products/onev/consult?p=${partnerInfo['아이디']}`, '_blank');
                                            }}
                                            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-xs hover:bg-black transition-all uppercase flex items-center gap-2"
                                        >
                                            <ExternalLink size={16} /> 미리보기
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Benefit Editor */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-xl font-black text-gray-900 italic uppercase">
                                    <MessageSquare className="text-indigo-600" /> 업체 전용 특별 혜택 설정
                                </div>
                                <div className="relative">
                                    <textarea
                                        value={tempBenefit}
                                        onChange={(e) => setTempBenefit(e.target.value)}
                                        className="w-full h-48 p-8 bg-gray-50 border-2 border-transparent rounded-[32px] font-bold text-lg focus:bg-white focus:ring-8 focus:ring-indigo-50 focus:border-indigo-400 outline-none resize-none transition-all shadow-inner"
                                        placeholder="이 상품을 신청하는 고객에게 제공할 특별한 혜택을 입력하세요. (예: 10인치 태블릿 증정, 무료 철거 등)"
                                    />
                                    <div className="absolute top-6 right-6 opacity-10">
                                        <MessageSquare size={64} />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 font-bold px-4">* 입력하신 내용은 업체 전용 랜딩페이지 최상단에 강조되어 노출됩니다.</p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t bg-gray-50 flex justify-end">
                            <button
                                onClick={handleSaveBenefits}
                                disabled={isSaving}
                                className="px-12 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 italic uppercase tracking-tighter"
                            >
                                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                                혜택 정보 저장하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
