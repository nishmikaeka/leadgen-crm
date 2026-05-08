"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import api from "@/lib/axios";
import { LeadTable } from "@/components/leads/LeadTable";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight, FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BulkImportModal } from "@/components/leads/BulkImportModal";
import { useAuthStore } from "@/store/authStore";

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [source, setSource] = useState("ALL");
  const [page, setPage] = useState(1);
  const [deleteId, setDel] = useState<string | null>(null);
  const [deleting, setDeling] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const fetchLeads = useCallback(
    async (p: number) => {
      setLoad(true);
      try {
        const params: any = { page: p, limit: 10 };
        if (search) params.search = search;
        if (status !== "ALL") params.status = status;
        if (source !== "ALL") params.source = source;
        const r = await api.get("/leads", { params }); //api call to fetch leads with search params
        setLeads(r.data.data.data);
        setMeta(r.data.data.meta);
      } catch {
        toast.error("Failed to load leads");
      } finally {
        setLoad(false);
      }
    },
    [search, status, source],
  );

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, status, source]);

  const { _hasHydrated, user } = useAuthStore();

  // Consolidated fetching logic (debounced)
  useEffect(() => {
    if (!_hasHydrated || !user) return;

    const timer = setTimeout(() => {
      fetchLeads(page);
    }, 300);
    return () => clearTimeout(timer);
  }, [page, fetchLeads, _hasHydrated, user]);

  const handleImportClick = () => setImportModalOpen(true);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeling(true);
    try {
      await api.delete(`/leads/${deleteId}`);
      toast.success("Lead deleted");
      setDel(null);
      fetchLeads(page);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeling(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-slate-900"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            All Leads
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {meta.total} lead{meta.total !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleImportClick}
            className="gap-1.5 h-8 border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold"
          >
            <FileUp size={16} />
            Import Bulk
          </Button>
          <Link
            href="/leads/new"
            className={cn(
              buttonVariants({ variant: "default" }),
              "gap-1.5 px-4 h-8 flex items-center rounded-lg font-semibold text-white",
            )}
            style={{ backgroundColor: "var(--sidebar-active)" }}
          >
            <Plus size={16} /> Add Lead
          </Link>
        </div>
      </div>

      {/* Filters */}
      <LeadFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        source={source}
        setSource={setSource}
      />

      {/* Table / skeleton with fixed height container to prevent layout shifts */}
      <div className="min-h-[460px] flex flex-col">
        {loading ? (
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="h-[40px] bg-slate-50 border border-slate-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="flex-1">
            <LeadTable leads={leads} onDelete={setDel} />
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={14} /> Prev
          </button>

          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="w-8 h-8 text-sm rounded-lg font-medium transition-colors"
              style={
                p === page
                  ? { backgroundColor: "var(--sidebar-bg)", color: "#fff" }
                  : { border: "1px solid #E2E8F0" }
              }
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDel(null)}
        onConfirm={handleDelete}
        title="Delete Lead?"
        description="This will permanently delete the lead and all its notes and status history."
        isLoading={deleting}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => fetchLeads(1)}
      />
    </div>
  );
}
