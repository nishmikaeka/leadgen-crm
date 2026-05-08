"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LeadStatusBadge, LeadStatus } from "./LeadStatusBadge";
import { MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Lead {
    id: string; name: string; company: string; email: string;
    status: LeadStatus; source: string; dealValue: number;
    assignedTo?: { id: string; name: string; };
}

interface Props { leads: Lead[]; onDelete: (id: string) => void; }

export function LeadTable({ leads, onDelete }: Props) {
    const router = useRouter();
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow
                        className="hover:bg-transparent"
                        style={{ backgroundColor: "#F8FAFC" }}
                    >
                        {["Name", "Company", "Email", "Status", "Assigned To", "Source"].map(h => (
                            <TableHead
                                key={h}
                                className="text-[11px] font-semibold uppercase tracking-widest text-slate-500"
                            >
                                {h}
                            </TableHead>
                        ))}
                        <TableHead
                            className="text-right text-[11px] font-semibold uppercase tracking-widest text-slate-500"
                        >
                            Value
                        </TableHead>
                        <TableHead className="w-12" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leads.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-40 text-center text-slate-400 text-sm">
                                No leads found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        leads.map((lead) => (
                            <TableRow
                                key={lead.id}
                                className="transition-colors hover:bg-orange-50/40 cursor-pointer group h-10"
                                onClick={() => router.push(`/leads/${lead.id}`)}
                            >
                                <TableCell className="py-1 px-3 font-semibold text-slate-900 group-hover:text-orange-600 transition-colors text-[13px]">
                                    {lead.name}
                                </TableCell>
                                <TableCell className="py-1 px-3 text-slate-500 text-[13px]">{lead.company}</TableCell>
                                <TableCell className="py-1 px-3 text-slate-400 text-[13px]">{lead.email}</TableCell>
                                <TableCell className="py-1 px-3"><LeadStatusBadge status={lead.status} /></TableCell>
                                <TableCell className="py-1 px-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500 uppercase shrink-0">
                                            {lead.assignedTo?.name?.charAt(0) ?? "?"}
                                        </div>
                                        <span className="text-[13px] text-slate-600 truncate max-w-[100px]">
                                            {lead.assignedTo?.name ?? "Unassigned"}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-1 px-3 text-slate-500 text-[13px]">{lead.source}</TableCell>
                                <TableCell className="py-1 px-3 text-right font-semibold text-slate-800 text-[13px]">
                                    ${Number(lead.dealValue || 0).toLocaleString()}
                                </TableCell>
                                <TableCell className="py-1 px-3" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-slate-200 transition-colors">
                                            <MoreHorizontal size={14} />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="text-sm">
                                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer p-0">
                                                <Link href={`/leads/${lead.id}`} className="flex items-center gap-2 w-full px-2 py-1">
                                                    <Eye size={13} /> View
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600 flex items-center gap-2 cursor-pointer py-1"
                                                onClick={() => onDelete(lead.id)}
                                            >
                                                <Trash2 size={13} /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
