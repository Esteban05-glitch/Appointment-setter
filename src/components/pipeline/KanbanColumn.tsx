import { Prospect, ColumnType } from "./types";
import { ProspectCard } from "./ProspectCard";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
    column: ColumnType;
    prospects: Prospect[];
    onDrop: (prospectId: string, status: ColumnType["id"]) => void;
    onEdit: (prospect: Prospect) => void;
    onOpenNotes: (prospect: Prospect) => void;
}

export function KanbanColumn({ column, prospects, onDrop, onEdit, onOpenNotes }: KanbanColumnProps) {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const prospectId = e.dataTransfer.getData("prospectId");
        if (prospectId) {
            onDrop(prospectId, column.id);
        }
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-colors hover:bg-slate-900/60"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={cn("h-3 w-3 rounded-full", column.color)} />
                    <h3 className="font-semibold text-slate-200">{column.title}</h3>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                        {prospects.length}
                    </span>
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 min-h-[500px]">
                {prospects.map((prospect) => (
                    <ProspectCard
                        key={prospect.id}
                        prospect={prospect}
                        onEdit={onEdit}
                        onOpenNotes={onOpenNotes}
                    />
                ))}

                {prospects.length === 0 && (
                    <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-900/20 text-sm text-slate-600">
                        No prospects
                    </div>
                )}
            </div>
        </div>
    );
}
