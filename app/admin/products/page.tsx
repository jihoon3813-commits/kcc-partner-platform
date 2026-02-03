'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Package, ShieldCheck, ChevronRight, X, Image as ImageIcon, Link as LinkIcon, Trash2, Save, Loader2, Edit3, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        id: '',
        category: '창호/샷시',
        name: '',
        description: '',
        specs: ['', '', ''],
        price: '별도문의',
        status: '판매중',
        image: '',
        link: ''
    });

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/data?action=read_products');
            const json = await res.json();

            if (json.success && Array.isArray(json.data)) {
                // Parse products with key normalization
                const parsedData = json.data.map((p: Record<string, string | string[] | null | undefined>) => {
                    const getVal = (keys: string[]) => {
                        for (const k of keys) {
                            if (p[k] !== undefined && p[k] !== null) return p[k];
                            const lowerK = k.toLowerCase();
                            const foundKey = Object.keys(p).find(key => key.toLowerCase() === lowerK);
                            if (foundKey) return p[foundKey];
                        }
                        return '';
                    };

                    const rawSpecs = getVal(['specs', '사양']);
                    let parsedSpecs: string[] = [];
                    try {
                        if (typeof rawSpecs === 'string' && rawSpecs.trim()) {
                            parsedSpecs = JSON.parse(rawSpecs);
                        } else if (Array.isArray(rawSpecs)) {
                            parsedSpecs = rawSpecs;
                        }
                    } catch {
                        parsedSpecs = [];
                    }

                    return {
                        id: String(getVal(['id']) || ''),
                        category: String(getVal(['category', '카테고리']) || '기타'),
                        name: String(getVal(['name', '상품명', '이름']) || '이름 없음'),
                        description: String(getVal(['description', '설명']) || ''),
                        specs: parsedSpecs,
                        price: String(getVal(['price', '가격']) || '별도문의'),
                        status: String(getVal(['status', '상태']) || '판매중'),
                        image: String(getVal(['image', '이미지_URL', '이미지']) || ''),
                        link: String(getVal(['link', '링크', '경로']) || ''),
                    };
                });

                if (parsedData.length === 0) {
                    setProducts([
                        {
                            id: 'P001',
                            category: '창호/샷시',
                            name: 'KCC홈씨씨 윈도우ONE 구독 서비스',
                            description: '국내 최고 수준의 단열 성능과 기밀성을 자랑하는 프리미엄 창호 브랜드',
                            specs: ['단열등급: 1~3등급', '유리두께: 24~28mm', '프레임폭: 140~251mm'],
                            price: '별도문의',
                            status: '판매중',
                            image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=400',
                            link: '/products/onev',
                        }
                    ]);
                } else {
                    setProducts(parsedData);
                }
            }
        } catch (error: unknown) {
            console.error('Fetch products error:', error);
            setProducts([
                {
                    id: 'P001',
                    category: '창호/샷시',
                    name: 'KCC홈씨씨 윈도우ONE 구독 서비스',
                    description: '국내 최고 수준의 단열 성능과 기밀성을 자랑하는 프리미엄 창호 브랜드',
                    specs: ['단열등급: 1~3등급', '유리두께: 24~28mm', '프레임폭: 140~251mm'],
                    price: '별도문의',
                    status: '판매중',
                    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=400',
                    link: '/products/onev',
                }
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleOpenAddModal = () => {
        setEditMode(false);
        setFormData({
            id: '',
            category: '창호/샷시',
            name: '',
            description: '',
            specs: ['', '', ''],
            price: '별도문의',
            status: '판매중',
            image: '',
            link: ''
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (product: Product) => {
        if (product.id === 'P001') {
            setEditMode(false);
            setFormData({
                id: '',
                category: product.category,
                name: product.name,
                description: product.description,
                specs: [...product.specs],
                price: product.price,
                status: product.status,
                image: product.image,
                link: product.link || ''
            });
        } else {
            setEditMode(true);
            setFormData({
                id: product.id,
                category: product.category,
                name: product.name,
                description: product.description,
                specs: product.specs.length > 0 ? [...product.specs] : ['', '', ''],
                price: product.price,
                status: product.status,
                image: product.image,
                link: product.link || ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const action = editMode ? 'update_product' : 'create_product';
            const payload = {
                ...formData,
                specs: JSON.stringify(formData.specs.filter(s => s.trim() !== ''))
            };

            const res = await fetch(`/api/data?action=${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (result.success) {
                alert(editMode ? '상품 정보가 수정되었습니다.' : '상품이 성공적으로 등록되었습니다.');
                setIsModalOpen(false);
                fetchProducts();
            } else {
                if (result.message?.includes('찾을 수 없습니다')) {
                    alert('요청 실패: 해당 상품 정보가 데이터베이스에 존재하지 않습니다. (임시 표시된 기본 상품이거나 삭제된 항목일 수 있습니다. 새 상품 등록 버튼을 이용해 주세요.)');
                } else {
                    alert('요청 실패: ' + result.message);
                }
            }
        } catch {
            alert('서버 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProduct = async (id: string, name: string) => {
        if (!confirm(`[${name}] 상품을 정말 삭제하시겠습니까?`)) return;

        try {
            const res = await fetch('/api/data?action=delete_product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            const result = await res.json();
            if (result.success) {
                alert('상품이 삭제되었습니다.');
                fetchProducts();
            } else {
                alert('삭제 실패: ' + result.message);
            }
        } catch {
            alert('서버 오류가 발생했습니다.');
        }
    };

    const handleSpecChange = (index: number, value: string) => {
        const newSpecs = [...formData.specs];
        newSpecs[index] = value;
        setFormData({ ...formData, specs: newSpecs });
    };

    const addSpecField = () => {
        setFormData({ ...formData, specs: [...formData.specs, ''] });
    };

    const filteredProducts = products.filter(p =>
        (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (p.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 lg:p-6 max-w-[1400px] mx-auto min-h-screen bg-gray-50/30 pb-32">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                        <Package className="w-8 h-8 text-blue-600" />
                        상품 마스터 관리
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight">서비스 전반에 노출되는 공급 상품의 통합 제어 센터입니다.</p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-[20px] hover:bg-blue-700 transition-all font-black shadow-xl shadow-blue-200"
                >
                    <Plus className="w-6 h-6" />
                    새 상품 등록
                </button>
            </div>

            {/* Filter & Search */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm mb-10 flex flex-col md:flex-row gap-6">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="찾으시는 상품명이나 카테고리를 입력하세요..."
                        className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-[22px] text-lg focus:ring-4 focus:ring-blue-50 transition-all font-bold outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <select
                        className="px-8 py-5 bg-gray-50 border-none rounded-[22px] text-lg font-black text-gray-600 outline-none focus:ring-4 focus:ring-blue-50 cursor-pointer appearance-none"
                        defaultValue=""
                    >
                        <option value="">전체 카테고리</option>
                        <option value="창호/샷시">창호/샷시</option>
                        <option value="유리/글라스">유리/글라스</option>
                        <option value="인테리어">인테리어</option>
                    </select>
                </div>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-6">
                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                    <p className="text-gray-400 font-black text-xl">데이터베이스와 동기화 중...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-10">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="group bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] hover:-translate-y-4 transition-all duration-700 flex flex-col h-full">
                            <div className="relative h-64 overflow-hidden bg-gray-100 p-4">
                                <div className="absolute inset-4 rounded-[30px] overflow-hidden z-10">
                                    {product.image ? (
                                        <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" unoptimized />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <ImageIcon className="w-20 h-20" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute top-8 left-8 bg-black/60 backdrop-blur px-4 py-2 rounded-2xl text-[11px] font-black text-white shadow-xl uppercase tracking-widest z-20">
                                    {product.category}
                                </div>
                                <div className="absolute top-8 right-8 z-20 flex gap-2">
                                    <button
                                        onClick={() => handleOpenEditModal(product)}
                                        className="p-3 bg-white/95 backdrop-blur rounded-2xl text-blue-600 shadow-xl hover:bg-blue-600 hover:text-white transition-all scale-0 group-hover:scale-100 duration-300"
                                    >
                                        <Edit3 size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(product.id, product.name)}
                                        className="p-3 bg-white/95 backdrop-blur rounded-2xl text-red-600 shadow-xl hover:bg-red-600 hover:text-white transition-all scale-0 group-hover:scale-100 duration-300 delay-75"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 pt-0 flex-1 flex flex-col">
                                <div className="mb-4">
                                    <span className="text-[10px] font-mono text-gray-300 mb-1 block uppercase">{product.id}</span>
                                    <h3 className="font-black text-2xl text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">{product.name}</h3>
                                </div>
                                <p className="text-gray-400 text-base font-bold line-clamp-2 mb-8 h-12 leading-relaxed">
                                    {product.description}
                                </p>

                                <div className="space-y-3 mb-10 flex-1">
                                    {product.specs.map((spec, i) => (
                                        <div key={i} className="flex items-center gap-4 text-[13px] text-gray-500 font-black bg-gray-50/80 p-4 rounded-[20px] border border-gray-100/50">
                                            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                                            <span className="truncate">{spec}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-8 border-t-2 border-dashed border-gray-50">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">Standard Price</p>
                                        <span className="text-gray-900 font-black text-2xl italic tracking-tighter">{product.price}</span>
                                    </div>
                                    {product.link ? (
                                        <Link
                                            href={product.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-16 h-16 bg-gray-900 rounded-3xl hover:bg-blue-600 hover:scale-110 transition-all text-white flex items-center justify-center shadow-xl group/link"
                                        >
                                            <ExternalLink className="w-8 h-8 group-hover/link:rotate-12 transition-transform" />
                                        </Link>
                                    ) : (
                                        <button className="w-16 h-16 bg-gray-100 rounded-3xl text-gray-300 flex items-center justify-center cursor-not-allowed">
                                            <ChevronRight className="w-8 h-8" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add Placeholder Card */}
                    <div
                        onClick={handleOpenAddModal}
                        className="bg-white rounded-[40px] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center p-12 text-gray-300 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-500 transition-all cursor-pointer group min-h-[500px]"
                    >
                        <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-180 transition-all shadow-inner">
                            <Plus className="w-12 h-12" />
                        </div>
                        <p className="text-3xl font-black">새 상품 등록</p>
                        <p className="text-lg font-bold mt-3 opacity-40">Add New Master Item</p>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white rounded-[60px] w-full max-w-5xl max-h-[92vh] relative z-10 overflow-hidden shadow-[0_100px_200px_-50px_rgba(0,0,0,0.5)] flex flex-col animate-in fade-in zoom-in duration-500">
                        {/* Modal Header */}
                        <div className="p-10 border-b flex justify-between items-center bg-gray-50/80">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                                    {editMode ? <Edit3 size={32} /> : <Package size={32} />}
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic">
                                        {editMode ? '상품 사양 업데이트' : '신규 마스터 상품 등록'}
                                    </h2>
                                    <p className="text-gray-400 font-bold mt-1 text-sm uppercase tracking-[0.2em]">{editMode ? 'Modify Existing Database Record' : 'Initialize New Product Lifecycle'}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-4 bg-white rounded-3xl hover:bg-red-50 hover:text-red-500 transition-all shadow-xl hover:rotate-90">
                                <X className="w-10 h-10" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-12">
                            <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                <div className="space-y-10">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-400 ml-4 uppercase tracking-widest">Master Category</label>
                                        <select
                                            className="w-full p-6 bg-gray-50 rounded-[28px] font-black text-xl outline-none focus:ring-8 focus:ring-blue-50 transition-all border-2 border-transparent focus:border-blue-100 appearance-none cursor-pointer"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="창호/샷시">창호/샷시</option>
                                            <option value="유리/글라스">유리/글라스</option>
                                            <option value="인테리어">인테리어</option>
                                            <option value="기타">기타 상품</option>
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-400 ml-4 uppercase tracking-widest">Public Product Name</label>
                                        <input
                                            type="text"
                                            placeholder="BRAND + MODEL NAME"
                                            className="w-full p-6 bg-gray-50 rounded-[28px] font-black text-xl outline-none focus:ring-8 focus:ring-blue-50 transition-all border-2 border-transparent focus:border-blue-100"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-400 ml-4 uppercase tracking-widest">Detailed Context</label>
                                        <textarea
                                            rows={3}
                                            placeholder="상품을 한 문장으로 정의하는 강력한 배경 설명을 입력하세요."
                                            className="w-full p-6 bg-gray-50 rounded-[28px] font-black text-xl outline-none focus:ring-8 focus:ring-blue-50 transition-all border-2 border-transparent focus:border-blue-100 resize-none h-44 leading-relaxed"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-gray-400 ml-4 uppercase tracking-widest">System Unique ID</label>
                                            <input
                                                type="text"
                                                placeholder="P_####"
                                                className="w-full p-6 bg-gray-50 rounded-[28px] font-black text-xl outline-none focus:ring-8 focus:ring-blue-50 transition-all border-2 border-transparent focus:border-blue-100 disabled:opacity-50"
                                                value={formData.id}
                                                disabled={editMode}
                                                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-gray-400 ml-4 uppercase tracking-widest">Unit Price Tag</label>
                                            <input
                                                type="text"
                                                placeholder="Amount or Message"
                                                className="w-full p-6 bg-gray-50 rounded-[28px] font-black text-xl outline-none focus:ring-8 focus:ring-blue-50 transition-all border-2 border-transparent focus:border-blue-100"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-400 ml-4 uppercase tracking-widest flex justify-between items-center">
                                            Technical Specifications
                                            <button type="button" onClick={addSpecField} className="bg-blue-600 text-white px-4 py-1.5 rounded-full font-black text-[10px] hover:bg-black transition-all">+ ADD FIELD</button>
                                        </label>
                                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {formData.specs.map((spec, i) => (
                                                <div key={i} className="relative">
                                                    <ShieldCheck className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" />
                                                    <input
                                                        type="text"
                                                        placeholder={`Point ${i + 1}`}
                                                        className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-[22px] font-black text-lg outline-none focus:ring-8 focus:ring-blue-50 transition-all border-2 border-transparent focus:border-blue-100"
                                                        value={spec}
                                                        onChange={(e) => handleSpecChange(i, e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-400 ml-4 uppercase tracking-widest">Visual Assets URL</label>
                                        <div className="relative">
                                            <ImageIcon className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Paste High-Resolution Image Link"
                                                className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-[22px] font-black text-lg outline-none focus:ring-8 focus:ring-blue-50 transition-all border-2 border-transparent focus:border-blue-100"
                                                value={formData.image}
                                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-400 ml-4 uppercase tracking-widest">Navigation End-Point</label>
                                        <div className="relative">
                                            <LinkIcon className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="/products/target-path"
                                                className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-[22px] font-black text-lg outline-none focus:ring-8 focus:ring-blue-50 transition-all border-2 border-transparent focus:border-blue-100"
                                                value={formData.link}
                                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-8 bg-blue-50 rounded-[40px] border-2 border-blue-100/50">
                                        <div className="flex items-center gap-4 text-blue-600 font-black">
                                            <Package className="w-8 h-8" />
                                            <span className="text-xl italic uppercase tracking-tighter">Pro Preview</span>
                                        </div>
                                        <p className="text-gray-400 text-sm mt-3 font-bold leading-relaxed italic">본 정보는 저장 즉시 고객용 상품 페이지와 대시보드에 반영됩니다. 내용을 다시 한번 검토해 주십시오.</p>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-12 border-t bg-gray-50/80 flex gap-6">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-10 bg-white border-2 border-gray-100 rounded-[35px] font-black text-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all active:scale-95"
                            >
                                DISCARD
                            </button>
                            <button
                                type="submit"
                                form="product-form"
                                disabled={isSubmitting}
                                className="flex-[2.5] py-10 bg-gray-900 text-white rounded-[35px] font-black text-3xl hover:bg-blue-600 transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex items-center justify-center gap-6 disabled:bg-gray-400 active:scale-95 italic uppercase tracking-tighter"
                            >
                                {isSubmitting ? <Loader2 className="w-10 h-10 animate-spin" /> : <Save className="w-10 h-10" />}
                                {editMode ? 'Update Database' : 'Execute Registration'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d1d5db;
                }
            `}</style>
        </div>
    );
}
