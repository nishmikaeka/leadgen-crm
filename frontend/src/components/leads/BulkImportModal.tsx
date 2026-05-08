import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, UploadCloud } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

interface User {
  id: string;
  name: string;
  role: string;
}

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkImportModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkImportModalProps) {
  const { user } = useAuthStore();
  const [salesReps, setSalesReps] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSalesReps = async () => {
    setFetchingUsers(true);
    try {
      const res = await api.get("/users");
      // The backend ResponseInterceptor wraps the array in a .data property
      const users = res.data?.data || [];
      const reps = users.filter((u: User) => u.role === "SALESPERSON");
      setSalesReps(reps);
      // Pre-select all by default
      setSelectedUserIds(reps.map((r: User) => r.id));
    } catch (error) {
      toast.error("Failed to fetch salespersons");
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    if (isOpen && user?.role === "ADMIN") {
      fetchSalesReps();
    } else {
      setSalesReps([]);
      setSelectedUserIds([]);
    }
    setFile(null);
  }, [isOpen, user]);

  const handleDownloadTemplate = () => {
    const csvContent =
      "Name,Email,Phone,Company,Deal Value\nJohn Doe,john@example.com,+1234567890,Acme Corp,50000";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" }); //create a csv file using the content given
    const url = URL.createObjectURL(blob); //create a fake link so can be download
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Lead_Upload_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUserToggle = (id: string) => {
    setSelectedUserIds(
      (prev) =>
        prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id], //if the clicked user's id was previously on the selectedUserIds list then its removed from the list by filtering it, if its not add it to the list
    );
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file to import");
      return;
    }

    if (user?.role === "ADMIN" && selectedUserIds.length === 0) {
      toast.error("Please select at least one salesperson");
      return;
    }

    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    if (user?.role === "ADMIN") {
      formData.append("assignedToIds", JSON.stringify(selectedUserIds));
    }

    try {
      await api.post("/leads/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Bulk import successful!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to import leads");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Import Leads</DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV file to import multiple leads at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template download */}
          <div className="flex flex-col gap-2 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              Need the correct column format?
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="bg-white border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 self-start gap-2"
            >
              <Download size={16} />
              Download Template
            </Button>
          </div>

          {/* File upload zone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Select File
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${file ? "border-orange-500 bg-orange-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file ? (
                <>
                  <UploadCloud className="h-8 w-8 text-orange-500 mb-2" />
                  <p className="text-sm font-medium text-orange-700">
                    {file.name}
                  </p>
                  <p className="text-xs text-orange-500/80 mt-1">
                    Click to select a different file
                  </p>
                </>
              ) : (
                <>
                  <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    .xlsx, .xls, or .csv up to 10MB
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Admin selective round-robin */}
          {user?.role === "ADMIN" && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">
                Distribute Leads To (Round-Robin)
              </label>
              {fetchingUsers ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Fetching
                  salespersons...
                </div>
              ) : salesReps.length > 0 ? (
                <div className="max-h-[160px] overflow-y-auto pr-2 space-y-2 rounded-md border border-slate-200 p-3 bg-white">
                  {salesReps.map((rep) => (
                    <label
                      key={rep.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-600"
                        checked={selectedUserIds.includes(rep.id)}
                        onChange={() => handleUserToggle(rep.id)}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">
                          {rep.name}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic p-3 bg-slate-50 rounded-md">
                  No salespersons found in the system.
                </p>
              )}
              <p className="text-xs text-slate-500">
                Leads will be distributed evenly among selected salespersons.
              </p>
            </div>
          )}

          {user?.role === "SALESPERSON" && (
            <div className="p-3 bg-orange-50 rounded-md border border-orange-100">
              <p className="text-sm text-orange-800">
                <strong>Note:</strong> Since you are a Salesperson, all imported
                leads will be automatically assigned to you.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={onClose} disabled={importing}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={
              importing ||
              !file ||
              (user?.role === "ADMIN" && selectedUserIds.length === 0)
            }
            className="bg-orange-600 hover:bg-orange-700 text-white min-w-[120px]"
          >
            {importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...
              </>
            ) : (
              "Start Import"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
