"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import { Menu, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, _hasHydrated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (_hasHydrated && !user) {
            router.push("/login");
        }
    }, [_hasHydrated, user, router]);

    if (!_hasHydrated) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    if (!user) return null; // Avoid flicker while redirecting

    return (
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--background)" }}>
            {/* Sidebar drawer for mobile */}
            <div
                className={cn(
                    "fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity",
                    isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsSidebarOpen(false)}
            />

            <div className={cn(
                "fixed inset-y-0 left-0 z-50 lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Top Header */}
                <header className="lg:hidden h-14 shrink-0 flex items-center justify-between px-4 border-b border-slate-200 bg-white">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="h-9 w-9 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">LeadGen</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    </div>
                    <div className="w-9" /> {/* Spacer */}
                </header>

                {/* ── Main content well ── */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 md:px-8 py-7 scrollbar-hide flex flex-col">
                    <div className="min-h-0 flex-1 flex flex-col">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
