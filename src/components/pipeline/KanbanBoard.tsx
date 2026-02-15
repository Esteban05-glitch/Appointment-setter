"use client";

import { useState } from "react";
import { KANBAN_COLUMNS, Prospect } from "./types";
import { KanbanColumn } from "./KanbanColumn";
import { AddProspectModal } from "./AddProspectModal";
import { EditProspectModal } from "./EditProspectModal";
import { ProspectNotesModal } from "./ProspectNotesModal";
import { Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function KanbanBoard() {
    const { prospects, addProspect, updateProspectStatus, updateProspect } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [activeProspect, setActiveProspect] = useState<Prospect | null>(null);

    const handleAddProspect = (newProspectData: Omit<Prospect, "id" | "lastContact" | "status">) => {
        const newProspect: Prospect = {
            id: Math.random().toString(36).substr(2, 9),
            ...newProspectData,
            status: "new_lead",
            lastContact: "Just now",
        };
        addProspect(newProspect);
        setIsModalOpen(false);
    };

    const handleEditClick = (prospect: Prospect) => {
        setActiveProspect(prospect);
        setIsEditModalOpen(true);
    };

    const handleNotesClick = (prospect: Prospect) => {
        setActiveProspect(prospect);
        setIsNotesModalOpen(true);
    };

    const handleUpdateProspect = async (id: string, updates: Partial<Prospect>) => {
        await updateProspect(id, updates);
        setIsEditModalOpen(false);
        setActiveProspect(null);
    };

    const handleDrop = (prospectId: string, newStatus: Prospect["status"]) => {
        updateProspectStatus(prospectId, newStatus);
    };

    return (
        <div className="flex flex-col gap-6 overflow-x-auto pb-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-foreground">Pipeline</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
                >
                    <Plus className="h-4 w-4" />
                    Add Prospect
                </button>
            </div>

            <div className="grid min-w-[1000px] grid-cols-5 gap-4">
                {KANBAN_COLUMNS.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        column={column}
                        prospects={prospects.filter(p => p.status === column.id)}
                        onDrop={handleDrop}
                        onEdit={handleEditClick}
                        onOpenNotes={handleNotesClick}
                    />
                ))}
            </div>

            <AddProspectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddProspect}
            />

            <EditProspectModal
                isOpen={isEditModalOpen}
                prospect={activeProspect}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setActiveProspect(null);
                }}
                onUpdate={handleUpdateProspect}
            />

            <ProspectNotesModal
                isOpen={isNotesModalOpen}
                prospect={activeProspect}
                onClose={() => {
                    setIsNotesModalOpen(false);
                    setActiveProspect(null);
                }}
            />
        </div>
    );
}
