"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";

export default function NewUserPage() {
    const router = useRouter();
    const currentUser = useAuthStore((s) => s.user);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "SALESPERSON",
    });

    const isAdmin = (currentUser?.role || (currentUser as any)?.user?.role || "").toUpperCase().trim() === "ADMIN";

    // Protect client-side
    if (!isAdmin) {
        if (typeof window !== "undefined") {
            router.push("/dashboard");
        }
        return null;
    }

    const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.password.length < 6) {
            return toast.error("Password must be at least 6 characters long");
        }

        setLoading(true);
        try {
            await api.post("/users", form);
            toast.success("User created successfully!");
            router.push("/dashboard");
        } catch (err: any) {
            toast.error(err.message || "Failed to create user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/dashboard" className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-heading)" }}>Add New User</h1>
                    <p className="text-sm text-slate-500">Create a new team member or administrator</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-sm">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                            id="name"
                            required
                            value={form.name}
                            onChange={e => set("name", e.target.value)}
                            placeholder="John Doe"
                            className="border-slate-200 focus-visible:ring-orange-300"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            value={form.email}
                            onChange={e => set("email", e.target.value)}
                            placeholder="john@example.com"
                            className="border-slate-200 focus-visible:ring-orange-300"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={form.password}
                            onChange={e => set("password", e.target.value)}
                            placeholder="••••••••"
                            className="border-slate-200 focus-visible:ring-orange-300"
                        />
                        <p className="text-[10px] text-slate-400">Minimum 6 characters recommended.</p>
                    </div>

                    <div className="space-y-1.5">
                        <Label>System Role *</Label>
                        <Select value={form.role} onValueChange={v => set("role", v || "SALESPERSON")}>
                            <SelectTrigger className="w-full border-slate-200 focus:ring-orange-300">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SALESPERSON">Salesperson (Restricted Access)</SelectItem>
                                <SelectItem value="ADMIN">Administrator (Full Access)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-[10px] text-slate-400">Salespersons can only see leads assigned to them.</p>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-10 px-8 shadow-md">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                        {loading ? "Creating…" : "Create User"}
                    </Button>
                    <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }), "flex items-center justify-center px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium")}>
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
