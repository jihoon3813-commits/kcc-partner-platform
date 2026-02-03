'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { User, Lock, Loader2, ArrowRight } from 'lucide-react';
import Cookies from 'js-cookie';

export default function PartnerLoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ id: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const json = await res.json();

            if (json.success) {
                Cookies.set('partner_session', JSON.stringify(json.partner), { expires: 7 });
                router.push('/partner');
            } else {
                setError(json.message || '로그인 실패');
            }
        } catch {
            setError('로그인 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px] -z-10"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px] -z-10"></div>

            <div className="w-full max-w-[440px] bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-500">
                <div className="p-10 md:p-12">
                    {/* Logo Section */}
                    <div className="flex flex-col items-center mb-10">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="h-10 w-40 relative">
                                <Image
                                    src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/5b115594e9a66.png"
                                    alt="KCC HomeCC Logo"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                        </Link>
                        <h1 className="text-3xl font-black text-[#122649] tracking-tight mb-2">파트너 어드민</h1>
                        <p className="text-gray-400 font-bold">서비스 관리를 위해 로그인하세요.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <User size={20} />
                                </div>
                                <input
                                    id="id"
                                    name="id"
                                    type="text"
                                    required
                                    value={formData.id}
                                    onChange={handleChange}
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-transparent rounded-[24px] font-bold text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                                    placeholder="파트너 아이디"
                                />
                            </div>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-transparent rounded-[24px] font-bold text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                                    placeholder="비밀번호"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-500 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-[#122649] text-white font-black text-xl rounded-[24px] shadow-xl hover:translate-y-[-2px] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    로그인
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>

                        <div className="pt-6 text-center">
                            <p className="text-gray-400 font-bold text-sm">
                                아직 파트너가 아니신가요?
                                <Link href="/" className="ml-2 text-blue-600 hover:underline">회원가입/신청</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-gray-400 text-sm font-medium">
                © 2026 KCC HomeCC. All rights reserved.
            </div>
        </div>
    );
}
