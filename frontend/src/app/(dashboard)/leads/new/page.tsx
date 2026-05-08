"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2, User as UserIcon } from "lucide-react";
import Link from "next/link";

interface Props {
    leadId: string;
    leadName: string;
    trigger?: React.ReactElement;
}

interface SimpleUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

export default function NewLeadPage() {
    const router = useRouter();
    const currentUser = useAuthStore((s) => s.user);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<SimpleUser[]>([]);
    const [fetchingUsers, setFetchingUsers] = useState(false);
    const [form, setForm] = useState({
        name: "", company: "", email: "", phone: "",
        source: "WEBSITE", status: "NEW",
        dealValue: "", assignedToId: "",
    });

    const isAdmin = (currentUser?.role || (currentUser as any)?.user?.role || "").toUpperCase().trim() === "ADMIN";

    useEffect(() => {
        if (isAdmin) {
            const fetchUsers = async () => {
                setFetchingUsers(true);
                try {
                    const r = await api.get("/users");
                    setUsers(r.data.data || []);
                } catch (e) {
                    console.error("Failed to load users:", e);
                    toast.error("Failed to load users list");
                } finally {
                    setFetchingUsers(false);
                }
            };
            fetchUsers();
        }
    }, [currentUser, isAdmin]);

    const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

    const validatePhone = (p: string) => {
        const regex = /^(?:\+94|0)?(?:7[01245678]|11|2[134567]|3[1234578]|4[157]|5[12457]|6[3567]|81|91)[0-9]{7}$/;
        return regex.test(p);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePhone(form.phone)) {
            return toast.error("Invalid Sri Lankan phone number format. Use 07XXXXXXXX or +947XXXXXXXX");
        }

        setLoading(true);
        try {
            const payload: any = { ...form, dealValue: Number(form.dealValue) || 0 };
            if (!payload.assignedToId || payload.assignedToId === "SKIP") delete payload.assignedToId;
            await api.post("/leads", payload);
            toast.success("Lead created!");
            router.push("/leads");
        } catch (err: any) {
            toast.error(err.message || "Failed to create lead");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/leads" className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-heading)" }}>Add Lead</h1>
                    <p className="text-sm text-slate-500">Create a new lead in the pipeline</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" required value={form.name} onChange={e => set("name", e.target.value)} placeholder="Jane Doe" className="border-slate-200 focus-visible:ring-orange-300" />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="company">Company *</Label>
                        <Input id="company" required value={form.company} onChange={e => set("company", e.target.value)} placeholder="Acme Inc." className="border-slate-200 focus-visible:ring-orange-300" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" required value={form.email} onChange={e => set("email", e.target.value)} placeholder="jane@acme.com" className="border-slate-200 focus-visible:ring-orange-300" />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 555 000 0000" className="border-slate-200 focus-visible:ring-orange-300" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Source *</Label>
                        <Select value={form.source} onValueChange={v => set("source", v || "WEBSITE")}>
                            <SelectTrigger className="border-slate-200 focus:ring-orange-300"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="WEBSITE">Website</SelectItem>
                                <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                                <SelectItem value="REFERRAL">Referral</SelectItem>
                                <SelectItem value="COLD_EMAIL">Cold Email</SelectItem>
                                <SelectItem value="EVENT">Event</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Status</Label>
                        <Select value={form.status} onValueChange={v => set("status", v || "NEW")}>
                            <SelectTrigger className="border-slate-200 focus:ring-orange-300"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NEW">New</SelectItem>
                                <SelectItem value="CONTACTED">Contacted</SelectItem>
                                <SelectItem value="QUALIFIED">Qualified</SelectItem>
                                <SelectItem value="PROPOSAL_SENT">Proposal</SelectItem>
                                <SelectItem value="WON">Won</SelectItem>
                                <SelectItem value="LOST">Lost</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="dealValue">Estimated Deal Value ($)</Label>
                    <Input id="dealValue" type="number" min="0" value={form.dealValue} onChange={e => set("dealValue", e.target.value)} placeholder="10000" className="border-slate-200 focus-visible:ring-orange-300" />
                </div>

                {isAdmin && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-50 mt-2">
                        <Label htmlFor="assignedToId" className="text-orange-600 font-bold text-xs uppercase tracking-wider">Assign Personnel / Supervisor</Label>
                        <Select
                            key={users.length}
                            value={form.assignedToId}
                            onValueChange={v => set("assignedToId", v || "")}
                            disabled={fetchingUsers}
                        >
                            <SelectTrigger id="assignedToId" className="w-full border-slate-200 focus:ring-orange-300 bg-slate-50/50">
                                <SelectValue placeholder={fetchingUsers ? "Loading users..." : "Select supervisor to manage this lead"}>
                                    {users.find(u => u.id === form.assignedToId)?.name || (form.assignedToId === "SKIP" ? "Self (Default)" : "")}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                <SelectItem value="SKIP">Self (Default)</SelectItem>
                                {users.map(u => (
                                    <SelectItem key={u.id} value={u.id}>
                                        <div className="flex items-center gap-2 py-0.5">
                                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{u.name}</span>
                                                <span className="text-[10px] text-slate-400 uppercase leading-none">{u.role}</span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-[10px] text-slate-400 italic">Administrators can assign leads to any salesperson or themselves.</p>
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-10 px-8 shadow-md">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {loading ? "Creating…" : "Create Lead"}
                    </Button>
                    <Link href="/leads" className={cn(buttonVariants({ variant: "outline" }), "flex items-center justify-center px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium")}>
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
