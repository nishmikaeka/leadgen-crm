import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface Props {
    search: string; setSearch: (v: string) => void;
    status: string; setStatus: (v: string) => void;
    source: string; setSource: (v: string) => void;
}

export function LeadFilters({ search, setSearch, status, setStatus, source, setSource }: Props) {
    return (
        <div className="flex flex-wrap items-end gap-3 bg-white rounded-xl shadow-sm border border-slate-100 p-2.5">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
                <Search
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    size={14}
                />
                <Input
                    placeholder="Search name, company, email…"
                    className="pl-8.5 h-8 text-sm border-slate-200 focus-visible:ring-orange-300"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Status filter */}
            <div className="space-y-0.5">
                <p className="text-[9px] font-bold uppercase text-slate-400 ml-1">Status</p>
                <Select value={status} onValueChange={(v) => setStatus(v ?? "ALL")}>
                    <SelectTrigger className="w-[140px] h-8 text-[13px] border-slate-200 focus:ring-orange-300">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="CONTACTED">Contacted</SelectItem>
                        <SelectItem value="QUALIFIED">Qualified</SelectItem>
                        <SelectItem value="PROPOSAL_SENT">Proposal</SelectItem>
                        <SelectItem value="WON">Won</SelectItem>
                        <SelectItem value="LOST">Lost</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Source filter */}
            <div className="space-y-0.5">
                <p className="text-[9px] font-bold uppercase text-slate-400 ml-1">Source</p>
                <Select value={source} onValueChange={(v) => setSource(v ?? "ALL")}>
                    <SelectTrigger className="w-[140px] h-8 text-[13px] border-slate-200 focus:ring-orange-300">
                        <SelectValue placeholder="All Sources" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Sources</SelectItem>
                        <SelectItem value="WEBSITE">Website</SelectItem>
                        <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                        <SelectItem value="REFERRAL">Referral</SelectItem>
                        <SelectItem value="COLD_EMAIL">Cold Email</SelectItem>
                        <SelectItem value="EVENT">Event</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
