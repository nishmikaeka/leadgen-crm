"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Clock, MessageSquarePlus } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

interface Note {
  id: string;
  content: string;
  createdAt: string;
  createdBy: { name: string };
}

interface Props {
  leadId: string;
  leadName: string;
  trigger?: React.ReactElement;
  currentUser?: { role?: string };
}

export function LeadNotesModal({
  leadId,
  leadName,
  trigger,
  currentUser,
}: Props) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [adding, setAdding] = useState(false);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/notes/lead/${leadId}`);
      setNotes(r.data.data || []);
    } catch (e: any) {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadNotes();
  }, [open, leadId]);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setAdding(true);
    try {
      await api.post("/notes", { content: noteText, leadId });
      setNoteText("");
      toast.success("Note added");
      loadNotes();
    } catch (e: any) {
      toast.error("Failed to add note");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger || (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[10px] gap-1 text-slate-500 hover:text-blue-600"
            >
              <MessageSquarePlus size={12} /> Notes
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[425px] flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Notes for <span className="text-orange-600">{leadName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 py-2 scrollbar-hide">
          <div className="space-y-2">
            <Textarea
              placeholder="Type a new note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="text-sm border-slate-200 focus:ring-orange-300 resize-none"
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleAddNote}
                disabled={adding || !noteText.trim()}
                className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5 h-8 font-bold shadow-md active:scale-95 transition-all"
              >
                {adding ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Send size={12} />
                )}
                Add Note
              </Button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              History
            </h3>
            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin text-slate-300" />
              </div>
            )}
            {!loading && notes.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">
                No notes found for this lead.
              </p>
            )}
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-slate-50 rounded-lg p-3 space-y-1 border border-slate-100"
              >
                <p className="text-sm text-slate-700 leading-relaxed">
                  {note.content}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span className="font-semibold text-slate-500">
                    {note.createdBy.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} />{" "}
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
