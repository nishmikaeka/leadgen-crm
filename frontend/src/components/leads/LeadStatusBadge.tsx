import { cn } from "@/lib/utils";

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL_SENT" | "WON" | "LOST";

const STATUS_STYLES: Record<LeadStatus, string> = {
    NEW: "bg-blue-50 text-blue-700 ring-blue-200",
    CONTACTED: "bg-orange-50 text-orange-700 ring-orange-200",
    QUALIFIED: "bg-green-50 text-green-700 ring-green-200",
    PROPOSAL_SENT: "bg-yellow-50 text-yellow-700 ring-yellow-200",
    WON: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    LOST: "bg-red-50 text-red-600 ring-red-200",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
    return (
        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1", STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600")}>
            {status}
        </span>
    );
}
