export type ProspectStatus = "new_lead" | "contacted" | "conversation" | "booked" | "closed";
export type ProspectPriority = "low" | "medium" | "high";

export interface ProspectNote {
    id: string;
    prospectId: string;
    content: string;
    createdAt: string;
}

export interface Prospect {
    id: string;
    name: string;
    platform: "instagram" | "linkedin" | "facebook" | "twitter";
    handle: string;
    status: ProspectStatus;
    priority: ProspectPriority;
    lastContact: string;
    value?: number;
    notesCount?: number;
    tags?: string[];
    qualBudget?: boolean;
    qualAuthority?: boolean;
    qualNeed?: boolean;
    qualTiming?: boolean;
}

export type ColumnType = {
    id: ProspectStatus;
    title: string;
    color: string;
};

export const KANBAN_COLUMNS: ColumnType[] = [
    { id: "new_lead", title: "New Leads", color: "bg-slate-500" },
    { id: "contacted", title: "Contacted", color: "bg-blue-500" },
    { id: "conversation", title: "In Conversation", color: "bg-indigo-500" },
    { id: "booked", title: "Call Booked", color: "bg-cyan-500" },
    { id: "closed", title: "Closed/Won", color: "bg-emerald-500" },
];
