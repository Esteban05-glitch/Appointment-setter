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

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="group relative cursor-grab rounded-lg border border-slate-800 bg-slate-900/80 p-4 transition-all hover:border-slate-700 hover:shadow-lg hover:shadow-indigo-500/10 active:cursor-grabbing"
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200">
                        <span className="font-bold">{prospect.name.charAt(0)}</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-slate-200">{prospect.name}</h4>
                            <button
                                onClick={cyclePriority}
                                className={cn(
                                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-110 active:scale-95",
                                    prospect.priority === "high" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                        prospect.priority === "medium" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                                            "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                )}
                            >
                                {prospect.priority === "high" ? "Caliente" :
                                    prospect.priority === "medium" ? "Templado" : "Frío"}
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <a
                                href={getProfileUrl()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-xs text-slate-500 hover:text-indigo-400 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Icon className="mr-1 h-3 w-3" />
                                @{prospect.handle}
                            </a>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onOpenNotes(prospect);
                                }}
                                className="flex items-center gap-1 rounded-full bg-slate-800/50 px-2 py-0.5 text-[10px] font-medium text-slate-400 transition-colors hover:bg-slate-700 hover:text-indigo-300"
                            >
                                <MessageSquare className="h-3 w-3" />
                                {prospect.notesCount || 0}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="relative" ref={menuRef}>
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
                        <div className="absolute right-0 z-20 mt-1 w-36 rounded-lg border border-slate-700 bg-slate-800 p-1 shadow-xl">
                            <button
                                onClick={handleEdit}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-700 hover:text-white"
                            >
                                <Edit2 className="h-3.5 w-3.5" />
                                Editar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Eliminar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{prospect.lastContact}</span>
                </div>
                {prospect.value && (
                    <span className="font-medium text-emerald-400">
                        ${prospect.value.toLocaleString()}
                    </span>
                )}
            </div>

            {/* Drag handle overlay */}
            <div className="absolute inset-0 z-10 hidden group-hover:block pointer-events-none" />
        </div>
    );
}
