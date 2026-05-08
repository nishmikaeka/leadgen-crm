"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    KanbanSquare,
    PlusCircle,
    LogOut,
    Zap,
    UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "All Leads", href: "/leads", icon: Users },
    { label: "Pipeline", href: "/pipeline", icon: KanbanSquare },
    { label: "Add Lead", href: "/leads/new", icon: PlusCircle },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const logout = useAuthStore((s) => s.logout);
    const user = useAuthStore((s) => s.user);

    const filteredNavItems = [
        ...navItems,
        ...(user?.role === "ADMIN" ? [{ label: "Add User", href: "/users/new", icon: UserPlus }] : []),
    ];

    const handleLinkClick = () => {
        if (onClose) onClose();
    };

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <aside
            className="flex flex-col w-60 min-h-screen shrink-0"
            style={{ backgroundColor: "var(--sidebar-bg)" }}
        >
            {/* ── Brand ───────────────────────────────────── */}
            <div className="flex items-center gap-2.5 px-5 py-[22px] border-b border-white/8">
                <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "var(--sidebar-active)" }}
                >
                    <Zap size={14} className="text-white" fill="white" />
                </div>
                <div className="leading-none">
                    <span
                        className="text-base font-bold tracking-tight text-white"
                        style={{ fontFamily: "var(--font-heading)" }}
                    >
                        LeadGen
                    </span>
                    <span style={{ color: "var(--sidebar-active)" }} className="text-base font-bold">.</span>
                </div>
            </div>

            {/* ── Navigation ──────────────────────────────── */}
            <nav className="flex-1 px-3 py-5 space-y-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 px-3 mb-2">
                    Main Menu
                </p>
                {filteredNavItems.map(({ label, href, icon: Icon }) => {
                    const active = href === "/leads"
                        ? pathname === "/leads"
                        : pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={handleLinkClick}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                                active
                                    ? "text-white"
                                    : "text-slate-400 hover:text-white hover:bg-white/6"
                            )}
                            style={
                                active
                                    ? { backgroundColor: "var(--sidebar-active)" }
                                    : undefined
                            }
                        >
                            <Icon
                                size={16}
                                className={active ? "text-white" : "text-slate-500"}
                            />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* ── User + Logout ────────────────────────────── */}
            <div className="px-3 py-4 border-t border-white/8 space-y-1">
                {/* Avatar row */}
                <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase text-white shrink-0"
                        style={{ backgroundColor: "var(--sidebar-active)" }}
                    >
                        {user?.name?.charAt(0) ?? "U"}
                    </div>
                    <div className="overflow-hidden min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                            {user?.name ?? "User"}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate capitalize">
                            {user?.role?.toLowerCase() ?? ""}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
                >
                    <LogOut size={15} />
                    Sign out
                </button>
            </div>
        </aside>
    );
}
