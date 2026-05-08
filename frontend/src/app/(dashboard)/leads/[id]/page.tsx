"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import {
  LeadStatusBadge,
  LeadStatus,
} from "@/components/leads/LeadStatusBadge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  DollarSign,
  Clock,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface SimpleUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user); //loads the user from authStore
  const [lead, setLead] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [noteText, setNoteText] = useState("");
  const [status, setStatus] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    dealValue: "",
  });

  //gather the users from the db to help with the assigning to populate in the selectors
  const selectableUsers = useMemo(() => {
    const list = [...users];
    if (lead?.assignedTo && !list.some((u) => u.id === lead.assignedTo.id)) {
      list.push(lead.assignedTo);
    }
    return list;
  }, [users, lead]);

  //loading the lead from db with notes relevant to that lead
  const loadLead = async () => {
    try {
      const [leadRes, notesRes] = await Promise.all([
        api.get(`/leads/${id}`),
        api.get(`/notes/lead/${id}`),
      ]);
      const leadData = leadRes.data.data;
      setLead(leadData);
      setStatus(leadData.status);
      setAssignedToId(leadData.assignedToId);
      setNotes(notesRes.data.data || []);
      setFormData({
        name: leadData.name,
        company: leadData.company,
        email: leadData.email,
        phone: leadData.phone,
        dealValue: String(leadData.dealValue || ""),
      });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLead();
  }, [id]);

  const isAdmin =
    (currentUser?.role || (currentUser as any)?.user?.role || "")
      .toUpperCase()
      .trim() === "ADMIN";

  //fetch the users to assign if hes an admin
  useEffect(() => {
    const loadUsers = async () => {
      if (!isAdmin) return;

      setFetchingUsers(true);
      try {
        const r = await api.get("/users");
        setUsers(r.data.data || []);
      } catch (err) {
        toast.error("Failed to load users list");
      } finally {
        setFetchingUsers(false);
      }
    };

    loadUsers();
  }, [isAdmin]);

  //validate the phone number format from the frontend
  const validatePhone = (p: string) => {
    const regex =
      /^(?:\+94|0)?(?:7[01245678]|11|2[134567]|3[1234578]|4[157]|5[12457]|6[3567]|81|91)[0-9]{7}$/;
    return regex.test(p);
  };

  //function that fires when a user updates the fields in a specific lead
  const handleUpdate = async () => {
    if (editMode && !validatePhone(formData.phone)) {
      return toast.error("Invalid Sri Lankan phone number");
    }

    setSaving(true);
    try {
      const payload: any = {
        status,
        ...(editMode
          ? { ...formData, dealValue: Number(formData.dealValue) || 0 }
          : {}),
      };

      //current user is a ADMIN and also the assingned person is different from the previous time then payload also attach the updated ID
      if (currentUser?.role === "ADMIN" && assignedToId !== lead.assignedToId) {
        payload.assignedToId = assignedToId;
      }

      //patch request fires to update the data thats updated from the frontend
      await api.patch(`/leads/${id}`, payload);
      toast.success("Lead updated successfully");
      setEditMode(false);
      loadLead();
    } catch (e: any) {
      // Check if the backend sent a specific error message in the response body
      const errorMessage =
        e.response?.data?.message || e.message || "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  //function ot add a note to specific lead
  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      await api.post("/notes", { content: noteText, leadId: id });
      setNoteText("");
      toast.success("Note added");
      loadLead();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAddingNote(false);
    }
  };

  if (loading)
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-orange-500 rounded-full border-t-transparent" />
      </div>
    );
  if (!lead) return null;

  //chacking if the user have changed anything to reduce unneccesory api calls
  //this only fires if the user have really change something because the button is hidden
  const hasChanges =
    status !== lead.status ||
    (isAdmin && assignedToId !== lead.assignedToId) ||
    editMode;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/leads"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1
                className="text-2xl font-bold text-slate-900"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {editMode ? "Edit Lead" : lead.name}
              </h1>
              {!editMode && (
                <LeadStatusBadge status={lead.status as LeadStatus} />
              )}
            </div>
            {!editMode && (
              <p className="text-sm text-slate-500">{lead.company}</p>
            )}
          </div>
        </div>
        <Button
          variant={editMode ? "ghost" : "outline"}
          size="sm"
          onClick={() => setEditMode(!editMode)}
          className={cn(
            editMode
              ? "text-slate-500"
              : "text-orange-600 border-orange-200 hover:bg-orange-50",
          )}
        >
          {editMode ? "Cancel" : "Edit Details"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Lead details / edit form */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">
              Lead Information
            </h2>

            {editMode ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">
                    Name
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, name: e.target.value }))
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">
                    Company
                  </Label>
                  <Input
                    value={formData.company}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, company: e.target.value }))
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, email: e.target.value }))
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">
                    Phone
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, phone: e.target.value }))
                    }
                    className="h-8 text-sm"
                    placeholder="07XXXXXXXX"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">
                    Deal Value ($)
                  </Label>
                  <Input
                    type="number"
                    value={formData.dealValue}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, dealValue: e.target.value }))
                    }
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  {lead.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  {lead.phone || "—"}
                </div>
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-slate-400" />
                  {lead.company}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-slate-400" />$
                  {(lead.dealValue || 0).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Management Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">
              Lead Management
            </h2>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                Status
              </Label>
              <Select value={status} onValueChange={(v) => setStatus(v || "")}>
                <SelectTrigger className="h-9 text-sm border-slate-200 focus:ring-orange-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "NEW",
                    "CONTACTED",
                    "QUALIFIED",
                    "PROPOSAL_SENT",
                    "WON",
                    "LOST",
                  ].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/*Assign another person section which only visible to admin users*/}
            {isAdmin && (
              <div className="space-y-1.5 pt-1">
                <Label className="text-[11px] font-bold text-orange-600 uppercase tracking-widest">
                  Assign Personnel / Supervisor
                </Label>
                <Select
                  key={selectableUsers.length}
                  value={assignedToId}
                  onValueChange={(v) => setAssignedToId(v || "")}
                  disabled={fetchingUsers}
                >
                  <SelectTrigger className="h-9 text-sm border-slate-200 focus:ring-orange-300">
                    <SelectValue placeholder={fetchingUsers ? "Loading..." : "Select user"}>
                      {selectableUsers.find(u => u.id === assignedToId)?.name || (assignedToId === lead.assignedToId ? lead.assignedTo?.name : "")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {selectableUsers.map((u: any) => (
                      <SelectItem key={u.id} value={u.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                            {u.name.charAt(0)}
                          </div>
                          <span>{u.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button
              onClick={handleUpdate}
              disabled={saving || (!hasChanges && !editMode)}
              size="sm"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold h-9 shadow-md mt-2 transition-all active:scale-[0.98]"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin mr-2" />
              ) : null}
              {editMode ? "Confirm Update" : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Notes */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700">
              Notes & Activity
            </h2>

            {/* Add note */}
            <div className="space-y-2">
              <Textarea
                placeholder="Add a note or interaction log…"
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="text-sm resize-none"
              />
              <Button
                onClick={handleAddNote}
                disabled={addingNote || !noteText.trim()}
                size="sm"
                className="gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 shadow-md"
              >
                {addingNote ? "Adding…" : "Add Note"}
              </Button>
            </div>

            {/* Notes list */}
            <div className="space-y-3 mt-2">
              {notes.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">
                  No notes yet.
                </p>
              )}
              {notes.map((note: any) => (
                <div key={note.id} className="flex gap-3">
                  <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Clock size={12} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{note.content}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {note.createdBy?.name ?? "System"} ·{" "}
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
