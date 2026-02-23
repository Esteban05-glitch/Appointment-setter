export interface Appointment {
    id: string;
    user_id: string;
    prospect_id: string | null;
    title: string;
    description: string | null;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    duration_minutes: number;
    status: 'scheduled' | 'completed' | 'cancelled';
    agency_id?: string | null;
    created_at?: string;
}
