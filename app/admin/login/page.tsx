'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Shield, Lock, Loader2, ArrowRight, User } from 'lucide-react';
import Cookies from 'js-cookie';

export default function AdminLoginPage() {
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

        // For demo/simplicity, using a simple check or an API if exists.
        // Usually admin login might hit a different endpoint.
        try {
            // Placeholder: Replace with actual admin login API if available
            // Note: If you have a specific admin table in GAS, use that.
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, isAdmin: true }) // Hinting admin login
            });
            const json = await res.json();

            // TEMPORARY: If admin login API is not yet separate, 
            // we'll simulate success for specific admin credentials or standard partner check for now
            // In a real scenario, this would be a strict check.
            if (json.success) {
                const adminRole = json.admin?.role || 'admin';
                Cookies.set('admin_session', JSON.stringify({
                    name: json.admin?.name || '관리자',
                    id: formData.id,
                    role: adminRole
                }), { expires: 1 });

                if (adminRole === 'tm') {
                    router.push('/admin/customers');
                } else {
                    router.push('/admin');
                }
            } else {
                setError(json.message || '로그인 실패 (권한 없음)');
            }
        } catch {
            setError('로그인 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center p-4 relative overflow-hidden">
            {/* Dark Mode Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] -z-10"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] -z-10"></div>

            <div className="w-full max-w-[460px] bg-white/5 backdrop-blur-2xl rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden animate-in fade-in zoom-in duration-500">
                <div className="p-10 md:p-14">
                    {/* Logo Section */}
                    <div className="flex flex-col items-center mb-12">
                        <div className="h-10 w-48 relative mb-8 opacity-90">
                            <Image
                                src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/e840c9a46f66a.png"
                                alt="KCC HomeCC Logo"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-black uppercase tracking-widest mb-4">
                            <Shield size={14} />
                            HQ Administrator
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-2">본사 시스템</h1>
                        <p className="text-gray-400 font-bold">인증된 관리자만 접속이 가능합니다.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                                    <User size={22} />
                                </div>
                                <input
                                    id="id"
                                    name="id"
                                    type="text"
                                    required
                                    value={formData.id}
                                    onChange={handleChange}
                                    className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/5 rounded-[24px] font-bold text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-400/30 focus:ring-4 focus:ring-blue-400/5 transition-all outline-none"
                                    placeholder="관리자 아이디"
                                />
                            </div>
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                                    <Lock size={22} />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/5 rounded-[24px] font-bold text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-400/30 focus:ring-4 focus:ring-blue-400/5 transition-all outline-none"
                                    placeholder="비밀번호"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 text-red-400 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2 border border-red-500/20">
                                <span className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xl rounded-[24px] shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:translate-y-[-2px] hover:shadow-[0_25px_50px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={28} />
                            ) : (
                                <>
                                    시스템 접속하기
                                    <ArrowRight size={22} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 flex flex-col items-center gap-4">
                <div className="flex gap-8 text-gray-500 text-sm font-bold">
                    <Link href="/" className="hover:text-white transition-colors">홈페이지</Link>
                    <Link href="/partner/login" className="hover:text-white transition-colors">파트너 센터</Link>
                </div>
                <div className="text-gray-600 text-xs font-medium">
                    © 2026 KCC HomeCC HQ. Security Protocol Activated.
                </div>
            </div>
        </div>
    );
}
