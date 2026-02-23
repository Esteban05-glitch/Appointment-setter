export type ProspectStatus = "new_lead" | "contacted" | "conversation" | "booked" | "closed";
export type ProspectPriority = "low" | "medium" | "high";

export interface ProspectNote {
    id: string;
    prospectId: string;
    content: string;
    createdAt: string;
    agencyId?: string | null;
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
    commissionRate?: number;
    isArchived?: boolean;
    agency_id?: string | null;
    creatorName?: string;
}

export interface Agency {
    id: string;
    name: string;
    logo_url: string | null;
    owner_id: string;
    created_at: string;
}

export interface AgencyMember {
    id: string;
    agency_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'setter';
    created_at: string;
    profiles?: {
        full_name: string;
        job_title: string;
    };
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
    { id: "booked", title: "Citas", color: "bg-cyan-500" },
    { id: "closed", title: "Closed/Won", color: "bg-emerald-500" },
];
