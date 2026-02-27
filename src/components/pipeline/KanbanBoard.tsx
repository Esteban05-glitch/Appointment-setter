"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { KANBAN_COLUMNS, Prospect } from "./types";
import { KanbanColumn } from "./KanbanColumn";
import { AddProspectModal } from "./AddProspectModal";
import { EditProspectModal } from "./EditProspectModal";
import { ProspectNotesModal } from "./ProspectNotesModal";
import { Plus, Search, Filter, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function KanbanBoard() {
    const { prospects, addProspect, updateProspectStatus, updateProspect, agencyMembers, userRole, user } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [activeProspect, setActiveProspect] = useState<Prospect | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        if (searchParams.get("openAdd") === "true") {
            setIsModalOpen(true);
            // Remove the query param so it doesn't reopen on refresh
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete("openAdd");
            const newPath = newParams.toString() ? `/pipeline?${newParams.toString()}` : "/pipeline";
            router.replace(newPath);
        }
    }, [searchParams, router]);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [platformFilter, setPlatformFilter] = useState<string>("all");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [minValue, setMinValue] = useState<string>("");
    const [maxValue, setMaxValue] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("newest");
    const [creatorFilter, setCreatorFilter] = useState<string>("all");

    const handleAddProspect = (newProspectData: Omit<Prospect, "id" | "lastContact" | "status" | "userId"> & { userId: string }) => {
        if (!user) return;

        const newProspect: Prospect = {
            id: Math.random().toString(36).substr(2, 9),
            ...newProspectData,
            status: "new_lead",
            lastContact: new Date().toISOString()
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

    const clearFilters = () => {
        setSearchQuery("");
        setPlatformFilter("all");
        setPriorityFilter("all");
        setMinValue("");
        setMaxValue("");
        setSortBy("newest");
        setCreatorFilter("all");
    };

    // Apply filters and sorting
    const filteredProspects = useMemo(() => {
        let filtered = [...prospects];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.handle.toLowerCase().includes(query)
            );
        }

        // Platform filter
        if (platformFilter !== "all") {
            filtered = filtered.filter(p => p.platform === platformFilter);
        }

        // Priority filter
        if (priorityFilter !== "all") {
            filtered = filtered.filter(p => p.priority === priorityFilter);
        }

        // Value range filter
        if (minValue) {
            filtered = filtered.filter(p => (p.value || 0) >= Number(minValue));
        }
        if (maxValue) {
            filtered = filtered.filter(p => (p.value || 0) <= Number(maxValue));
        }

        // Creator filter
        if (creatorFilter !== "all") {
            filtered = filtered.filter(p => p.userId === creatorFilter);
        }

        // Sorting
        switch (sortBy) {
            case "newest":
                // Already in order from database
                break;
            case "oldest":
                filtered.reverse();
                break;
            case "highest":
                filtered.sort((a, b) => (b.value || 0) - (a.value || 0));
                break;
            case "lowest":
                filtered.sort((a, b) => (a.value || 0) - (b.value || 0));
                break;
            case "priority":
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
                break;
        }

        return filtered;
    }, [prospects, searchQuery, platformFilter, priorityFilter, minValue, maxValue, sortBy, creatorFilter]);

    const activeFilterCount = [
        searchQuery,
        platformFilter !== "all",
        priorityFilter !== "all",
        minValue,
        maxValue,
        sortBy !== "newest",
        creatorFilter !== "all"
    ].filter(Boolean).length;

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

            {/* Filter Bar */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-4 w-4 text-indigo-400" />
                    <h3 className="text-sm font-medium text-slate-200">Filtros y Búsqueda</h3>
                    {activeFilterCount > 0 && (
                        <>
                            <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-400">
                                {activeFilterCount}
                            </span>
                            <button
                                onClick={clearFilters}
                                className="ml-auto flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
                            >
                                <X className="h-3 w-3" />
                                Limpiar
                            </button>
                        </>
                    )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o handle..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Platform Filter */}
                    <div>
                        <select
                            value={platformFilter}
                            onChange={(e) => setPlatformFilter(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="all">Todas las plataformas</option>
                            <option value="instagram">Instagram</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="facebook">Facebook</option>
                            <option value="twitter">Twitter</option>
                        </select>
                    </div>

                    {/* Priority Filter */}
                    <div>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="all">Todas las prioridades</option>
                            <option value="high">Alta</option>
                            <option value="medium">Media</option>
                            <option value="low">Baja</option>
                        </select>
                    </div>

                    {/* Value Range */}
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Valor mín"
                            value={minValue}
                            onChange={(e) => setMinValue(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <input
                            type="number"
                            placeholder="Valor máx"
                            value={maxValue}
                            onChange={(e) => setMaxValue(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Sort By */}
                    <div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="newest">Más reciente</option>
                            <option value="oldest">Más antiguo</option>
                            <option value="highest">Mayor valor</option>
                            <option value="lowest">Menor valor</option>
                            <option value="priority">Por prioridad</option>
                        </select>
                    </div>

                    {/* Creator Filter - Only for Admins/Owners */}
                    {(userRole === 'owner' || userRole === 'admin') && (
                        <div>
                            <select
                                value={creatorFilter}
                                onChange={(e) => setCreatorFilter(e.target.value)}
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="all">Todos los creadores</option>
                                {agencyMembers.map(member => (
                                    <option key={member.user_id} value={member.user_id}>
                                        {member.profiles?.full_name || 'Miembro sin nombre'} ({member.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid min-w-[1000px] grid-cols-5 gap-4">
                {KANBAN_COLUMNS.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        column={column}
                        prospects={filteredProspects.filter(p => p.status === column.id)}
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
                agencyMembers={agencyMembers}
                userRole={userRole}
                currentUserId={user?.id || ''}
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
