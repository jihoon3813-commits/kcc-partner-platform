'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserCheck, LogOut, ShoppingBag, Home, FolderDown } from 'lucide-react';
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

    useEffect(() => {
        setMounted(true);
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

    const handleLogout = () => {
        Cookies.remove('admin_session');
        router.push('/admin/login');
    };

    if (!mounted) return null;
    if (pathname === '/admin/login') return <>{children}</>;
    if (!adminInfo) return null;

    return (
        <div className="min-h-screen flex bg-gray-50/50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r fixed h-full z-20 hidden md:block">
                <div className="h-16 flex items-center px-6 border-b">
                    <Link href="/admin" className="relative h-8 w-32">
                        <Image
                            src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/5b115594e9a66.png"
                            alt="KCC Admin Logo"
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    </Link>
                </div>
                <nav className="p-4 space-y-1">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        대시보드
                    </Link>
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                        <Home className="w-4 h-4" />
                        메인페이지
                    </Link>
                    <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        관리
                    </div>
                    <Link
                        href="/admin/partners"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                        <Users className="w-4 h-4" />
                        파트너 관리
                    </Link>
                    <Link
                        href="/admin/customers"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                        <UserCheck className="w-4 h-4" />
                        고객 관리
                    </Link>
                    <Link
                        href="/admin/products"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        상품 관리
                    </Link>
                    <Link
                        href="/admin/resources"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                        <FolderDown className="w-4 h-4" />
                        자료실 관리
                    </Link>

                    <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        설정
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
                    >
                        <LogOut className="w-4 h-4" />
                        로그아웃
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-10">
                    <h2 className="font-semibold text-gray-800">관리자 페이지</h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block text-xs">
                            <p className="font-bold text-gray-900">{adminInfo.name}</p>
                            <p className="text-gray-400">본사 권한</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                            {adminInfo.name.substring(0, 1)}
                        </div>
                    </div>
                </header>
                <main className="flex-1 py-2 px-4 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
