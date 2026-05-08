"use client";

import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import api from "@/lib/axios";
import { LeadStatus } from "@/components/leads/LeadStatusBadge";
import { toast } from "sonner";
import { Building2, DollarSign, Phone } from "lucide-react";
import Link from "next/link";

const COLUMNS: { key: LeadStatus; label: string; color: string }[] = [
  { key: "NEW", label: "New", color: "bg-blue-50 border-blue-200" },
  {
    key: "CONTACTED",
    label: "Contacted",
    color: "bg-orange-50 border-orange-200",
  },
  {
    key: "QUALIFIED",
    label: "Qualified",
    color: "bg-green-50 border-green-200",
  },
  {
    key: "PROPOSAL_SENT",
    label: "Proposal",
    color: "bg-yellow-50 border-yellow-200",
  },
  { key: "WON", label: "Won", color: "bg-emerald-50 border-emerald-200" },
  { key: "LOST", label: "Lost", color: "bg-red-50 border-red-200" },
];

type Lead = {
  id: string;
  name: string;
  company: string;
  dealValue: number;
  status: LeadStatus;
  phone?: string;
};
type Board = Record<LeadStatus, Lead[]>;

export default function PipelinePage() {
  const [board, setBoard] = useState<Board>(
    () =>
      Object.fromEntries(COLUMNS.map((c) => [c.key, []])) as unknown as Board,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/leads", { params: { limit: 100 } })
      .then((r) => {
        const leads: Lead[] = r.data.data.data;
        const grouped = Object.fromEntries(
          COLUMNS.map((c) => [c.key, []]),
        ) as unknown as Board;
        leads.forEach((l) => {
          if (grouped[l.status]) grouped[l.status].push(l);
        });
        setBoard(grouped);
      })
      .catch(() => toast.error("Failed to load pipeline"))
      .finally(() => setLoading(false));
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const srcKey = source.droppableId as LeadStatus;
    const destKey = destination.droppableId as LeadStatus;

    // Optimistic update
    const srcLeads = [...board[srcKey]];
    const destLeads = [...board[destKey]];
    const [moved] = srcLeads.splice(source.index, 1);
    moved.status = destKey;
    destLeads.splice(destination.index, 0, moved);
    setBoard((prev) => ({ ...prev, [srcKey]: srcLeads, [destKey]: destLeads }));

    try {
      await api.patch(`/leads/${draggableId}`, { status: destKey });
    } catch (e: any) {
      toast.error("Could not update status");
      // Revert on failure
      setBoard((prev) => {
        const rs = [...prev[destKey].filter((l) => l.id !== moved.id)];
        const rd = [...prev[srcKey]];
        moved.status = srcKey;
        rd.splice(source.index, 0, moved);
        return { ...prev, [srcKey]: rd, [destKey]: rs };
      });
    }
  };

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((c) => (
          <div
            key={c.key}
            className="min-w-[200px] h-48 bg-slate-100 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1
          className="text-2xl font-bold text-slate-900"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Pipeline
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Drag and drop leads between stages
        </p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <div key={col.key} className="min-w-[220px] flex flex-col gap-3">
              {/* Column header */}
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-lg border ${col.color}`}
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {col.label}
                </span>
                <span className="bg-white text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200">
                  {board[col.key].length}
                </span>
              </div>

              {/* Droppable area */}
              <Droppable droppableId={col.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col gap-2 min-h-screen p-1 rounded-xl transition-colors ${snapshot.isDraggingOver ? "bg-orange-50/60" : ""}`}
                  >
                    {board[col.key].map((lead, index) => (
                      <Draggable
                        key={lead.id}
                        draggableId={lead.id}
                        index={index}
                      >
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={`bg-white border border-slate-200 rounded-lg p-3 space-y-2.5 cursor-grab active:cursor-grabbing ${
                              snap.isDragging
                                ? "shadow-lg ring-2 ring-orange-300"
                                : "hover:shadow-sm"
                            }`}
                          >
                            {/* Header: Name and Notes Modal */}
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                href={`/leads/${lead.id}`}
                                className="block flex-1 min-w-0"
                              >
                                <p className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors leading-snug truncate">
                                  {lead.name}
                                </p>
                              </Link>
                              <LeadNotesModal
                                leadId={lead.id}
                                leadName={lead.name}
                                trigger={
                                  <button className="h-6 w-6 shrink-0 rounded-md flex items-center justify-center text-slate-300 hover:text-orange-500 hover:bg-orange-50 transition-colors">
                                    <MessageSquarePlus size={14} />
                                  </button>
                                }
                              />
                            </div>

                            {/* Details Section */}
                            <div className="space-y-1.5">
                              {/* Company Name */}
                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <Building2
                                  size={12}
                                  className="text-slate-400"
                                />
                                <span className="truncate">{lead.company}</span>
                              </div>

                              {/* Phone Number */}
                              {lead.phone && (
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                  <Phone size={12} className="text-slate-400" />
                                  <span>{lead.phone}</span>
                                </div>
                              )}
                            </div>

                            {/* Footer: Deal Value */}
                            {lead.dealValue > 0 && (
                              <div className="pt-1 border-t border-slate-50">
                                <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                                  <DollarSign size={12} />
                                  {Number(lead.dealValue).toLocaleString()}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {board[col.key].length === 0 && (
                      <div className="text-xs text-slate-300 text-center py-4">
                        Drop here
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

import { MessageSquarePlus } from "lucide-react";
import { LeadNotesModal } from "@/components/leads/LeadNotesModal";
