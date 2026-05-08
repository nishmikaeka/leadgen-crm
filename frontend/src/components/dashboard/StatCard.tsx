import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    accentColor?: string;   /* Tailwind border-l color, e.g. "border-orange-400" */
    iconBg?: string;
    iconColor?: string;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    description,
    accentColor = "border-orange-400",
    iconBg = "bg-orange-50",
    iconColor = "text-orange-500",
}: StatCardProps) {
    return (
        <div
            className={cn(
                "relative bg-white rounded-xl shadow-sm border-l-4 p-5 flex items-start gap-4 overflow-hidden",
                accentColor,
            )}
        >
            {/* Subtle bg pattern swatch */}
            <div className="absolute right-3 top-3 opacity-[0.04]">
                <Icon size={52} />
            </div>

            <div className={cn("p-2.5 rounded-lg shrink-0", iconBg)}>
                <Icon size={19} className={iconColor} />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest truncate">
                    {title}
                </p>
                <p
                    className="text-2xl font-bold text-slate-900 mt-0.5 leading-none"
                    style={{ fontFamily: "var(--font-heading)" }}
                >
                    {value}
                </p>
                {description && (
                    <p className="text-xs text-slate-400 mt-1">{description}</p>
                )}
            </div>
        </div>
    );
}
