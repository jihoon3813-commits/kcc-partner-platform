'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserCheck, LogOut, ShoppingBag, Home, FolderDown, Menu, X } from 'lucide-react';
import Cookies from 'js-cookie';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [adminInfo, setAdminInfo] = useState<{ name: string, id: string } | null>(null);
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (pathname === '/admin/login') return;

        const session = Cookies.get('admin_session');
        if (!session) {
            router.replace('/admin/login');
            return;
        }

        try {
            const parsed = JSON.parse(session);
            setAdminInfo(parsed);
        } catch {
            Cookies.remove('admin_session');
            router.replace('/admin/login');
        }
    }, [router, pathname]);

    // Close mobile menu on route change
    useEffect(() => {
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        Cookies.remove('admin_session');
        router.push('/admin/login');
    };

    if (!mounted) return null;
    if (pathname === '/admin/login') return <>{children}</>;
    if (!adminInfo) return null;

    return (
        <div className="min-h-screen flex bg-gray-50/50">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 bg-white border-r fixed h-full z-40 transition-transform duration-300 ease-in-out
                md:translate-x-0 md:static
                ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="h-16 flex items-center justify-between px-6 border-b shrink-0">
                    <Link href="/admin" className="relative h-8 w-32">
                        <Image
                            src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/5b115594e9a66.png"
                            alt="KCC Admin Logo"
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-1 text-gray-400 hover:text-gray-600 md:hidden"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
                    <Link
                        href="/admin"
                        className={`flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-xl transition-all ${pathname === '/admin' ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        대시보드
                    </Link>
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                        <Home className="w-4 h-4" />
                        메인페이지
                    </Link>
                    <div className="pt-6 pb-2 px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        관리 업무
                    </div>
                    {[
                        { href: '/admin/partners', icon: Users, label: '파트너 관리' },
                        { href: '/admin/customers', icon: UserCheck, label: '고객 관리' },
                        { href: '/admin/products', icon: ShoppingBag, label: '상품 관리' },
                        { href: '/admin/resources', icon: FolderDown, label: '자료실 관리' },
                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-xl transition-all ${pathname === item.href ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    ))}

                    <div className="pt-6 pb-2 px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        ACCOUNT
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-xl text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        시스템 로그아웃
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen min-w-0">
                <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-xl md:hidden transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="font-black text-gray-900 tracking-tight">관리자 페이지</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="font-black text-gray-900 text-sm">{adminInfo.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Super Admin</p>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-blue-500/20 ring-4 ring-blue-50">
                            {adminInfo.name.substring(0, 1)}
                        </div>
                    </div>
                </header>
                <main className="flex-1 lg:py-4 lg:px-6 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
