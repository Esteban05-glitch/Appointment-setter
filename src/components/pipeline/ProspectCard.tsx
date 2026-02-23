import { Instagram, Linkedin, Facebook, Twitter, MoreHorizontal, Clock, Edit2, Trash2, MessageSquare } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Prospect } from "./types";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

const PlatformIcon = {
    instagram: Instagram,
    linkedin: Linkedin,
    facebook: Facebook,
    twitter: Twitter,
};

interface ProspectCardProps {
    prospect: Prospect;
    onEdit: (prospect: Prospect) => void;
    onOpenNotes: (prospect: Prospect) => void;
}

export function ProspectCard({ prospect, onEdit, onOpenNotes }: ProspectCardProps) {
    const { updateProspectPriority, deleteProspect } = useApp();
    const [showMenu, setShowMenu] = useState(false);
    const estCommission = prospect.value ? (prospect.value * (prospect.commissionRate || 10) / 100) : 0;
    const menuRef = useRef<HTMLDivElement>(null);
    const Icon = PlatformIcon[prospect.platform];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        if (showMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMenu]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("prospectId", prospect.id);
        e.dataTransfer.effectAllowed = "move";
    };

    const cyclePriority = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const priorities: Prospect["priority"][] = ["low", "medium", "high"];
        const currentIndex = priorities.indexOf(prospect.priority);
        const nextIndex = (currentIndex + 1) % priorities.length;
        updateProspectPriority(prospect.id, priorities[nextIndex]);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm(`¿Estás seguro de que quieres eliminar a ${prospect.name}?`)) {
            await deleteProspect(prospect.id);
        }
        setShowMenu(false);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onEdit(prospect);
        setShowMenu(false);
    };

    const getProfileUrl = () => {
        const handle = prospect.handle.replace("@", "");
        switch (prospect.platform) {
            case "instagram": return `https://instagram.com/${handle}`;
            case "linkedin": return `https://linkedin.com/in/${handle}`;
            case "twitter": return `https://x.com/${handle}`;
            case "facebook": return `https://facebook.com/${handle}`;
            default: return "#";
        }
    };

    const formatLastContact = (dateStr: string) => {
        if (!dateStr || dateStr === "Just now") return "Hace poco";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "Hace poco";

            const now = new Date();
            const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

            if (diffInHours < 1) return "Hace poco";
            if (diffInHours < 24) return `Hace ${Math.floor(diffInHours)}h`;
            if (diffInHours < 48) return "Ayer";
            return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
        } catch (e) {
            return "Hace poco";
        }
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="group relative cursor-grab rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 transition-all hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 active:cursor-grabbing overflow-hidden"
        >
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-lg font-bold text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200">
                    {prospect.name.charAt(0)}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-bold text-slate-100 leading-none">{prospect.name}</h4>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <button
                                    onClick={cyclePriority}
                                    className={cn(
                                        "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter transition-all hover:scale-105 active:scale-95 border",
                                        prospect.priority === "high" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                            prospect.priority === "medium" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                                "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                    )}
                                >
                                    {prospect.priority === "high" ? "Caliente" :
                                        prospect.priority === "medium" ? "Templado" : "Frío"}
                                </button>
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <a
                                        href={getProfileUrl()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-[11px] text-slate-500 hover:text-indigo-400 transition-colors truncate max-w-[90px]"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Icon className="mr-1 h-3 w-3 shrink-0" />
                                        @{prospect.handle}
                                    </a>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onOpenNotes(prospect);
                                        }}
                                        className="flex items-center gap-1 shrink-0 rounded-md bg-slate-800/40 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 transition-all hover:bg-slate-700 hover:text-indigo-300 border border-slate-700/30"
                                    >
                                        <MessageSquare className="h-2.5 w-2.5" />
                                        {prospect.notesCount || 0}
                                    </button>
                                </div>
                            </div>

                            {/* QualCheck (BANT) Indicator */}
                            <div className="mt-2.5 flex items-center gap-1">
                                {[
                                    { char: 'B', label: 'Budget', state: prospect.qualBudget },
                                    { char: 'A', label: 'Authority', state: prospect.qualAuthority },
                                    { char: 'N', label: 'Need', state: prospect.qualNeed },
                                    { char: 'T', label: 'Timing', state: prospect.qualTiming },
                                ].map((item) => (
                                    <div
                                        key={item.char}
                                        title={item.label}
                                        className={cn(
                                            "flex h-4.5 w-4.5 items-center justify-center rounded-md text-[9px] font-black transition-all border",
                                            item.state
                                                ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                                                : "border-slate-800 bg-slate-950/50 text-slate-700 font-bold"
                                        )}
                                    >
                                        {item.char}
                                    </div>
                                ))}
                                <div className="ml-1 h-1 flex-1 rounded-full bg-slate-800 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                        style={{
                                            width: `${(([prospect.qualBudget, prospect.qualAuthority, prospect.qualNeed, prospect.qualTiming].filter(Boolean).length) / 4) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions Menu */}
                        <div className="relative shrink-0" ref={menuRef}>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 z-20 mt-1 w-32 rounded-lg border border-slate-700 bg-slate-800 p-1 shadow-xl">
                                    <button
                                        onClick={handleEdit}
                                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-700"
                                    >
                                        <Edit2 className="h-3.5 w-3.5" />
                                        Editar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Eliminar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-slate-800/60 pt-2.5">
                        <div className="flex min-w-0 flex-col gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <Clock className="h-2.5 w-2.5 shrink-0 text-slate-600" />
                                <span className="truncate text-[10px] text-slate-500">
                                    {formatLastContact(prospect.lastContact)}
                                </span>
                            </div>
                            {prospect.creatorName && (
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <div className="h-3 w-3 rounded-full bg-slate-800 flex items-center justify-center">
                                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                    </div>
                                    <span className="truncate text-[9px] text-slate-400 font-medium">
                                        Por: {prospect.creatorName}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-0.5">
                            {typeof prospect.value === 'number' && (
                                <span className="shrink-0 text-[10px] font-medium text-slate-500 line-through decoration-slate-700">
                                    ${prospect.value.toLocaleString()}
                                </span>
                            )}
                            <div className="flex items-center gap-1.5 leading-none">
                                <span className="text-[9px] font-bold text-slate-600">Cmsn ({prospect.commissionRate || 10}%)</span>
                                <span className="text-xs font-black text-indigo-400">
                                    ${estCommission.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hover overlay hint */}
            <div className="absolute inset-0 z-0 pointer-events-none group-hover:bg-indigo-500/[0.02] transition-colors rounded-xl" />
        </div>
    );
}
