'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from 'next/image';
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Settings, LogOut, Menu, ShoppingBag, UserPlus, FolderDown, FileText } from "lucide-react";
import Cookies from 'js-cookie';
import PartnerInfoModal from "../components/PartnerInfoModal";

export default function PartnerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    interface PartnerInfo {
        id: string;
        name: string;
        ceoName: string;
        contact: string;
        address: string;
        businessNumber?: string;
        accountNumber?: string;
        email?: string;
        status?: string;
    }

    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const hasFetched = useRef(false);

    useEffect(() => {
        if (pathname === '/partner/login') return;

        // 세션 체크
        const session = Cookies.get('partner_session');
        if (!session) {
            router.replace('/partner/login');
            return;
        }

        const fetchDeepInfo = async (basicInfo: PartnerInfo) => {
            // 더 상세한 정보를 가져오기 위해 API 호출 (필요시)
            try {
                const res = await fetch(`/api/data?action=read_partner_config&partnerId=${basicInfo.id}`);
                const json = await res.json();
                if (json.success && json.partner) {
                    const p = json.partner;
                    setPartnerInfo({
                        id: String(p['아이디'] || ''),
                        name: String(p['업체명'] || ''),
                        ceoName: String(p['대표명'] || ''),
                        contact: String(p['연락처'] || ''),
                        address: String(p['주소'] || ''),
                        businessNumber: p['사업자번호'],
                        accountNumber: p['계좌번호'],
                        email: p['이메일'],
                        status: p['상태']
                    });
                } else {
                    setPartnerInfo(basicInfo);
                }
            } catch {
                setPartnerInfo(basicInfo);
            }
        };

        try {
            const parsed = JSON.parse(session);
            if (!hasFetched.current) {
                hasFetched.current = true;
                fetchDeepInfo(parsed);
            }
        } catch {
            Cookies.remove('partner_session');
            router.replace('/partner/login');
        }
    }, [router, pathname]);

    const handleLogout = () => {
        Cookies.remove('partner_session');
        router.push('/partner/login');
    };

    const navItems = [
        { name: "대시보드", href: "/partner", icon: LayoutDashboard },
        { name: "고객 관리", href: "/partner/customers", icon: Users },
        { name: "계약 관리", href: "/partner/contracts", icon: FileText },
        { name: "고객 직접 등록", href: "/partner/customers/create", icon: UserPlus }, // Added
        { name: "상품 관리 & 홍보", href: "/partner/products", icon: ShoppingBag },
        { name: "자료실", href: "/partner/resources", icon: FolderDown },
    ];

    if (!mounted || (!partnerInfo && pathname !== '/partner/login')) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (pathname === '/partner/login') return <>{children}</>;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-white border-r transition-all duration-300 flex flex-col
        ${sidebarOpen ? "w-64" : "w-20"}`}
            >
                <div className="h-16 flex items-center justify-between px-4 border-b">
                    {sidebarOpen ? (
                        <div className="relative h-8 w-32">
                            <Image
                                src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/5b115594e9a66.png"
                                alt="Partner Logo"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                    ) : (
                        <div className="relative h-6 w-10 mx-auto">
                            <Image
                                src="https://cdn.imweb.me/upload/S20250904697320f4fd9ed/5b115594e9a66.png"
                                alt="Partner LogoSmall"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-100 rounded-md lg:hidden">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 py-6 flex flex-col gap-1 px-3">
                    {sidebarOpen && <div className="px-3 mb-4 text-xs font-semibold text-gray-400">업무</div>}

                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                    ${isActive
                                        ? "bg-[hsl(var(--primary))] text-white shadow-sm"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${!sidebarOpen && "mx-auto"}`} />
                                {sidebarOpen && <span>{item.name}</span>}
                            </Link>
                        );
                    })}

                    <div className="mt-8">
                        {sidebarOpen && <div className="px-3 mb-4 text-xs font-semibold text-gray-400">계정</div>}

                        <button
                            onClick={() => setIsInfoModalOpen(true)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors`}
                        >
                            <Settings className={`w-5 h-5 ${!sidebarOpen && "mx-auto"}`} />
                            {sidebarOpen && <span>정보 수정</span>}
                        </button>
                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors`}
                        >
                            <LogOut className={`w-5 h-5 ${!sidebarOpen && "mx-auto"}`} />
                            {sidebarOpen && <span>로그아웃</span>}
                        </button>
                    </div>
                </div>

                {/* User Profile */}
                <div className="p-4 border-t bg-gray-50/50">
                    <div className={`flex items-center gap-3 ${!sidebarOpen && "justify-center"}`}>
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {partnerInfo?.name ? partnerInfo.name.substring(0, 1) : '?'}
                        </div>
                        {sidebarOpen && partnerInfo && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{partnerInfo.name}</p>
                                <p className="text-xs text-gray-500 truncate">{partnerInfo.id}</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside >

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
                <header className="h-16 bg-white border-b shadow-sm sticky top-0 z-40 flex items-center justify-between px-6">
                    <h2 className="font-semibold text-lg text-gray-800">파트너 전용 페이지</h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium">{partnerInfo?.name}</p>
                            <p className="text-xs text-gray-500">인증된 파트너</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                            {partnerInfo?.name ? partnerInfo.name.substring(0, 2) : '?'}
                        </div>
                    </div>
                </header>

                <div className="py-2 px-4">
                    {children}
                </div>
            </main>

            <PartnerInfoModal
                isOpen={isInfoModalOpen}
                onClose={() => setIsInfoModalOpen(false)}
                currentInfo={partnerInfo}
                onUpdate={handleLogout} // 정보 수정 후 재로그인 유도
            />
        </div>
    );
}
