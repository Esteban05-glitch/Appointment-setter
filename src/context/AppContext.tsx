"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from "react";
import { Prospect, ProspectNote, Agency, AgencyMember } from "@/components/pipeline/types";
import { Appointment } from "@/components/calendar/types";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

interface UserGoals {
    monthlyCommission: number;
    dailyCalls: number;
}

interface UserProfile {
    name: string;
    title: string;
}

interface AppContextType {
    prospects: Prospect[];
    setProspects: (prospects: Prospect[]) => void;
    addProspect: (prospect: Prospect) => void;
    updateProspectStatus: (id: string, status: Prospect["status"]) => void;
    updateProspectPriority: (id: string, priority: Prospect["priority"]) => void;
    deleteProspect: (id: string) => Promise<void>;
    updateProspect: (id: string, updates: Partial<Prospect>) => Promise<void>;
    addNote: (prospectId: string, content: string) => Promise<void>;
    getNotes: (prospectId: string) => Promise<ProspectNote[]>;
    deleteNote: (noteId: string) => Promise<void>;
    totalCalls: number;
    logCall: () => void;
    resetCalls: () => Promise<void>;
    goals: UserGoals;
    updateGoals: (goals: Partial<UserGoals>) => void;
    userProfile: UserProfile;
    updateUserProfile: (profile: Partial<UserProfile>) => void;
    resetData: () => void;
    signOut: () => Promise<void>;
    loading: boolean;
    user: User | null;
    archivedProspects: Prospect[];
    callHistory: { month: string; total: number }[];
    fetchArchivedProspects: () => Promise<void>;
    restoreProspect: (id: string) => Promise<void>;
    deleteArchivedProspect: (id: string) => Promise<void>;
    appointments: Appointment[];
    addAppointment: (appointment: Omit<Appointment, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
    updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
    deleteAppointment: (id: string) => Promise<void>;
    fetchAppointments: () => Promise<void>;
    agency: Agency | null;
    agencyMembers: AgencyMember[];
    fetchAgencyData: () => Promise<void>;
    fetchProspects: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [archivedProspects, setArchivedProspects] = useState<Prospect[]>([]);
    const [callHistory, setCallHistory] = useState<{ month: string; total: number }[]>([]);
    const [totalCalls, setTotalCalls] = useState(0);
    const [goals, setGoals] = useState<UserGoals>({
        monthlyCommission: 5000,
        dailyCalls: 50,
    });
    const [userProfile, setUserProfile] = useState<UserProfile>({
        name: "Setter",
        title: "Appointment Setter",
    });
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [agency, setAgency] = useState<Agency | null>(null);
    const [agencyMembers, setAgencyMembers] = useState<AgencyMember[]>([]);

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // --- DATA FETCHING FUNCTIONS ---

    const fetchAgencyData = useCallback(async () => {
        if (!user) return;

        // 1. Try to find membership
        let { data: memberData } = await supabase
            .from('agency_members')
            .select('*, agencies(*)')
            .eq('user_id', user.id)
            .maybeSingle();

        let currentAgency = memberData?.agencies;
        let agencyId = memberData?.agency_id;

        // 2. Fallback: If not found in members, check if they OWN an agency
        if (!currentAgency) {
            const { data: ownedAgency } = await supabase
                .from('agencies')
                .select('*')
                .eq('owner_id', user.id)
                .maybeSingle();

            if (ownedAgency) {
                currentAgency = ownedAgency;
                agencyId = ownedAgency.id;
            }
        }

        if (currentAgency && agencyId) {
            setAgency(currentAgency);

            // Fetch members with profiles (Joins require explicit foreign keys in Supabase)
            const { data: allMembers, error: fetchError } = await supabase
                .from('agency_members')
                .select('*, profiles:user_id(full_name, job_title)')
                .eq('agency_id', agencyId);

            if (fetchError) {
                // Fallback: Fetch members without profiles if join fails
                const { data: membersOnly } = await supabase
                    .from('agency_members')
                    .select('*')
                    .eq('agency_id', agencyId);

                if (membersOnly) {
                    setAgencyMembers(membersOnly as unknown as AgencyMember[]);
                }
                console.warn("Agency members loaded without profile details due to relationship cache delay.");
            } else if (allMembers) {
                setAgencyMembers(allMembers as unknown as AgencyMember[]);
            }
        }
    }, [user, supabase]);

    const fetchProspects = useCallback(async () => {
        if (!user) return;

        // Check for agency membership
        const { data: memberData } = await supabase
            .from('agency_members')
            .select('agency_id')
            .eq('user_id', user.id)
            .single();

        let query = supabase
            .from('prospects')
            .select(`
                *,
                prospect_notes:prospect_notes(count)
            `)
            .eq('is_archived', false);

        if (memberData?.agency_id) {
            // Include both agency prospects AND any orphaned prospects created by this user
            query = query.or(`agency_id.eq.${memberData.agency_id},and(agency_id.is.null,user_id.eq.${user.id})`);
        } else {
            query = query.eq('user_id', user.id);
        }

        const { data: prospectsData, error: prospectsError } = await query
            .select(`
                *,
                profiles:user_id(full_name),
                prospect_notes:prospect_notes(count)
            `)
            .order('created_at', { ascending: false });

        if (prospectsError) {
            console.warn("Prospects loaded without creator names due to schema relationship sync.");
            return;
        }

        if (prospectsData) {
            setProspects(prospectsData.map(p => ({
                id: p.id,
                name: p.name,
                platform: p.platform,
                handle: p.handle,
                status: p.status as Prospect["status"],
                priority: (p.priority || "medium") as Prospect["priority"],
                value: p.value,
                lastContact: p.last_contact || new Date().toISOString(),
                notesCount: p.prospect_notes?.[0]?.count || 0,
                qualBudget: p.qual_budget,
                qualAuthority: p.qual_authority,
                qualNeed: p.qual_need,
                qualTiming: p.qual_timing,
                commissionRate: p.commission_rate,
                agency_id: p.agency_id,
                creatorName: (p.profiles as any)?.full_name || "Unknown"
            })));
        }
    }, [user, supabase]);

    const fetchAppointments = useCallback(async () => {
        if (!user) return;

        const { data: memberData } = await supabase
            .from('agency_members')
            .select('agency_id')
            .eq('user_id', user.id)
            .single();

        let query = supabase.from('appointments').select('*');

        if (memberData?.agency_id) {
            query = query.eq('agency_id', memberData.agency_id);
        } else {
            query = query.eq('user_id', user.id);
        }

        const { data, error } = await query
            .order('date', { ascending: true })
            .order('time', { ascending: true });

        if (!error && data) {
            setAppointments(data);
        }
    }, [user, supabase]);

    const fetchArchivedProspects = useCallback(async () => {
        if (!user) return;

        const { data } = await supabase
            .from('prospects')
            .select(`
                *,
                prospect_notes:prospect_notes(count)
            `)
            .eq('user_id', user.id)
            .eq('is_archived', true)
            .order('created_at', { ascending: false });

        if (data) {
            setArchivedProspects(data.map(p => ({
                id: p.id,
                name: p.name,
                platform: p.platform,
                handle: p.handle,
                status: p.status as Prospect["status"],
                priority: (p.priority || "medium") as Prospect["priority"],
                value: p.value,
                lastContact: p.last_contact || new Date().toISOString(),
                notesCount: p.prospect_notes?.[0]?.count || 0,
                qualBudget: p.qual_budget,
                qualAuthority: p.qual_authority,
                qualNeed: p.qual_need,
                qualTiming: p.qual_timing,
                commissionRate: p.commission_rate,
                agency_id: p.agency_id
            })));
        }
    }, [user, supabase]);

    // --- EFFECTS ---

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (!session) {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);

            // 1. Fetch profile & goals
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileData) {
                setUserProfile({
                    name: profileData.full_name || "Setter",
                    title: profileData.job_title || "Appointment Setter",
                });
                if (profileData.goals) setGoals(profileData.goals);
                if (profileData.total_calls !== undefined) setTotalCalls(profileData.total_calls);
                if (profileData.call_history) setCallHistory(profileData.call_history);

                // 2. Check for monthly reset
                const currentMonth = new Date().toISOString().slice(0, 7);
                const lastResetMonth = profileData.last_reset_month;

                if (lastResetMonth && lastResetMonth !== currentMonth) {
                    const archiveCalls = profileData.total_calls || 0;
                    const history = profileData.call_history || [];
                    const newHistory = [...history, { month: lastResetMonth, total: archiveCalls }];

                    await supabase.from('prospects')
                        .update({ is_archived: true })
                        .eq('user_id', user.id)
                        .eq('status', 'closed');

                    await supabase.from('profiles')
                        .update({
                            total_calls: 0,
                            last_reset_month: currentMonth,
                            call_history: newHistory
                        })
                        .eq('id', user.id);

                    setTotalCalls(0);
                } else if (!lastResetMonth) {
                    await supabase.from('profiles')
                        .update({ last_reset_month: currentMonth })
                        .eq('id', user.id);
                }

                // 3. Load actual tracker data
                await fetchAgencyData();
                await fetchProspects();
                await fetchAppointments();
            }

            setLoading(false);
        };

        fetchData();
    }, [user, supabase, fetchAgencyData, fetchProspects, fetchAppointments]);

    // Debounced sync for total_calls
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (!user || totalCalls === 0) return;
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(async () => {
            await supabase.from('profiles').update({ total_calls: totalCalls }).eq('id', user.id);
        }, 1000);
        return () => { if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current); };
    }, [totalCalls, user, supabase]);

    // --- PROSPECT CRUD ---

    const addProspect = async (prospect: Prospect) => {
        if (!user) return;

        let targetAgencyId = agency?.id || null;

        // Robustness: If agency state is not yet loaded, try a quick DB check
        if (!targetAgencyId) {
            const { data: member } = await supabase
                .from('agency_members')
                .select('agency_id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (member?.agency_id) {
                targetAgencyId = member.agency_id;
            } else {
                // Check if they own an agency directly
                const { data: owned } = await supabase
                    .from('agencies')
                    .select('id')
                    .eq('owner_id', user.id)
                    .maybeSingle();
                if (owned) targetAgencyId = owned.id;
            }
        }

        const { data, error } = await supabase.from('prospects').insert({
            name: prospect.name,
            platform: prospect.platform,
            handle: prospect.handle,
            status: prospect.status,
            priority: prospect.priority,
            value: prospect.value,
            last_contact: prospect.lastContact || new Date().toISOString(),
            qual_budget: prospect.qualBudget || false,
            qual_authority: prospect.qualAuthority || false,
            qual_need: prospect.qualNeed || false,
            qual_timing: prospect.qualTiming || false,
            commission_rate: prospect.commissionRate || 10,
            user_id: user.id,
            agency_id: targetAgencyId
        }).select().single();

        if (error) {
            console.error("Error adding prospect to database:", error);
            alert("Error al guardar el prospecto: " + error.message);
            return;
        }

        if (data) {
            setProspects(prev => [{ ...prospect, id: data.id, agency_id: data.agency_id }, ...prev]);
        }
    };

    const updateProspectStatus = async (id: string, status: Prospect["status"]) => {
        if (!user) return;
        const { error } = await supabase.from('prospects').update({ status }).eq('id', id);
        if (!error) setProspects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    };

    const updateProspectPriority = async (id: string, priority: Prospect["priority"]) => {
        if (!user) return;
        const { error } = await supabase.from('prospects').update({ priority }).eq('id', id);
        if (!error) setProspects(prev => prev.map(p => p.id === id ? { ...p, priority } : p));
    };

    const updateProspect = async (id: string, updates: Partial<Prospect>) => {
        if (!user) return;
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.handle) dbUpdates.handle = updates.handle;
        if (updates.platform) dbUpdates.platform = updates.platform;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.priority) dbUpdates.priority = updates.priority;
        if (updates.value !== undefined) dbUpdates.value = updates.value;
        if (updates.lastContact) dbUpdates.last_contact = updates.lastContact;
        if (updates.qualBudget !== undefined) dbUpdates.qual_budget = updates.qualBudget;
        if (updates.qualAuthority !== undefined) dbUpdates.qual_authority = updates.qualAuthority;
        if (updates.qualNeed !== undefined) dbUpdates.qual_need = updates.qualNeed;
        if (updates.qualTiming !== undefined) dbUpdates.qual_timing = updates.qualTiming;
        if (updates.commissionRate !== undefined) dbUpdates.commission_rate = updates.commissionRate;

        const { error } = await supabase.from('prospects').update(dbUpdates).eq('id', id);
        if (!error) setProspects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const deleteProspect = async (id: string) => {
        if (!user) return;
        const { error } = await supabase.from('prospects').delete().eq('id', id);
        if (!error) setProspects(prev => prev.filter(p => p.id !== id));
    };

    // --- NOTES ---

    const addNote = async (prospectId: string, content: string) => {
        if (!user) return;
        const { error } = await supabase.from('prospect_notes').insert({
            prospect_id: prospectId,
            user_id: user.id,
            content,
            agency_id: agency?.id || null
        });
        if (!error) {
            setProspects(prev => prev.map(p => p.id === prospectId ? { ...p, notesCount: (p.notesCount || 0) + 1 } : p));
        }
    };

    const getNotes = async (prospectId: string): Promise<ProspectNote[]> => {
        if (!user) return [];
        const { data, error } = await supabase.from('prospect_notes').select('*').eq('prospect_id', prospectId).order('created_at', { ascending: true });
        if (error || !data) return [];
        return data.map(n => ({ id: n.id, prospectId: n.prospect_id, content: n.content, createdAt: n.created_at, agencyId: n.agency_id }));
    };

    const deleteNote = async (noteId: string) => {
        if (!user) return;
        const { data: noteData } = await supabase.from('prospect_notes').select('prospect_id').eq('id', noteId).single();
        const { error } = await supabase.from('prospect_notes').delete().eq('id', noteId);
        if (!error && noteData) {
            setProspects(prev => prev.map(p => p.id === noteData.prospect_id ? { ...p, notesCount: Math.max(0, (p.notesCount || 0) - 1) } : p));
        }
    };

    // --- ARCHIVE ---

    const restoreProspect = async (id: string) => {
        if (!user) return;
        const { error } = await supabase.from('prospects').update({ is_archived: false }).eq('id', id);
        if (!error) {
            await Promise.all([fetchProspects(), fetchArchivedProspects()]);
        }
    };

    const deleteArchivedProspect = async (id: string) => {
        if (!user || !confirm("¿Eliminar permanentemente?")) return;
        const { error } = await supabase.from('prospects').delete().eq('id', id);
        if (!error) await fetchArchivedProspects();
    };

    // --- APPOINTMENTS ---

    const addAppointment = async (appointment: Omit<Appointment, 'id' | 'user_id' | 'created_at'>) => {
        if (!user) return;
        const { error } = await supabase.from('appointments').insert({
            ...appointment,
            user_id: user.id,
            agency_id: agency?.id || null
        });
        if (!error) await fetchAppointments();
    };

    const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
        if (!user) return;
        const { error } = await supabase.from('appointments').update(updates).eq('id', id);
        if (!error) await fetchAppointments();
    };

    const deleteAppointment = async (id: string) => {
        if (!user) return;
        const { error } = await supabase.from('appointments').delete().eq('id', id);
        if (!error) await fetchAppointments();
    };

    // --- OTHER ---

    const logCall = () => setTotalCalls(prev => prev + 1);
    const resetCalls = async () => {
        if (!user || !confirm("¿Reiniciar contador?")) return;
        setTotalCalls(0);
        await supabase.from('profiles').update({ total_calls: 0 }).eq('id', user.id);
    };

    const updateGoals = async (newGoals: Partial<UserGoals>) => {
        if (!user) return;
        const updated = { ...goals, ...newGoals };
        const { error } = await supabase.from('profiles').update({ goals: updated }).eq('id', user.id);
        if (!error) setGoals(updated);
    };

    const updateUserProfile = async (newProfile: Partial<UserProfile>) => {
        if (!user) return;
        const updated = { ...userProfile, ...newProfile };
        const { error } = await supabase.from('profiles').update({ full_name: updated.name, job_title: updated.title }).eq('id', user.id);
        if (!error) setUserProfile(updated);
    };

    const resetData = async () => {
        if (!user || !confirm("¿Borrar todos los prospectos?")) return;
        const { error } = await supabase.from('prospects').delete().eq('user_id', user.id);
        if (!error) { setProspects([]); setTotalCalls(0); }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    return (
        <AppContext.Provider value={{
            prospects, setProspects, addProspect, updateProspectStatus, updateProspectPriority, deleteProspect, updateProspect,
            addNote, getNotes, deleteNote,
            totalCalls, logCall, resetCalls,
            goals, updateGoals,
            userProfile, updateUserProfile,
            resetData, signOut, loading, user,
            archivedProspects, callHistory, fetchArchivedProspects, restoreProspect, deleteArchivedProspect,
            appointments, addAppointment, updateAppointment, deleteAppointment, fetchAppointments,
            agency, agencyMembers, fetchAgencyData, fetchProspects
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}
