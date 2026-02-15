"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Trash2, MessageSquare } from "lucide-react";
import { Prospect, ProspectNote } from "./types";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

interface ProspectNotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    prospect: Prospect | null;
}

export function ProspectNotesModal({ isOpen, onClose, prospect }: ProspectNotesModalProps) {
    const { addNote, getNotes, deleteNote } = useApp();
    const [notes, setNotes] = useState<ProspectNote[]>([]);
    const [newNote, setNewNote] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && prospect) {
            loadNotes();
        }
    }, [isOpen, prospect]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [notes]);

    const loadNotes = async () => {
        if (!prospect) return;
        setLoading(true);
        const fetchedNotes = await getNotes(prospect.id);
        setNotes(fetchedNotes);
        setLoading(false);
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim() || !prospect) return;

        const noteContent = newNote.trim();
        setNewNote("");
        await addNote(prospect.id, noteContent);
        await loadNotes();
    };

    const handleDeleteNote = async (noteId: string) => {
        if (confirm("¿Borrar esta nota?")) {
            await deleteNote(noteId);
            setNotes(prev => prev.filter(n => n.id !== noteId));
        }
    };

    if (!isOpen || !prospect) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="flex h-[600px] w-full max-w-lg flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-800/50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Historial: {prospect.name}</h3>
                            <p className="text-xs text-slate-400">@{prospect.handle}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Notes List */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-slate-950/20"
                >
                    {loading ? (
                        <div className="flex h-full items-center justify-center text-slate-500 text-sm">
                            Cargando historial...
                        </div>
                    ) : notes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                            <MessageSquare className="h-8 w-8 opacity-20" />
                            <p className="text-sm">No hay notas todavía para este prospecto.</p>
                        </div>
                    ) : (
                        notes.map((note) => (
                            <div key={note.id} className="group flex flex-col items-start gap-1">
                                <div className="flex max-w-[85%] flex-col rounded-2xl rounded-tl-sm bg-slate-800/80 p-3 text-sm text-slate-200 shadow-sm border border-slate-700/50">
                                    <p className="whitespace-pre-wrap leading-relaxed">{note.content}</p>
                                    <div className="mt-2 flex items-center justify-between gap-4">
                                        <span className="text-[10px] text-slate-500">
                                            {new Date(note.createdAt).toLocaleString([], {
                                                day: '2-digit',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteNote(note.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleAddNote} className="border-t border-slate-800 bg-slate-900 p-4">
                    <div className="flex items-end gap-2">
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Escribe una nota sobre la conversación..."
                            className="flex-1 max-h-32 min-h-[44px] rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddNote(e);
                                }
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!newNote.trim()}
                            className="flex h-[44px] w-[44px] items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                    <p className="mt-2 text-[10px] text-slate-600 text-center uppercase tracking-widest font-bold">
                        Shift + Enter para nueva línea
                    </p>
                </form>
            </div>
        </div>
    );
}
