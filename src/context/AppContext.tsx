"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Prospect, ProspectNote } from "@/components/pipeline/types";
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
    goals: UserGoals;
    updateGoals: (goals: Partial<UserGoals>) => void;
    userProfile: UserProfile;
    updateUserProfile: (profile: Partial<UserProfile>) => void;
    resetData: () => void;
    signOut: () => Promise<void>;
    loading: boolean;
    user: User | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [totalCalls, setTotalCalls] = useState(0);
    const [goals, setGoals] = useState<UserGoals>({
        monthlyCommission: 5000,
        dailyCalls: 50,
    });
    const [userProfile, setUserProfile] = useState<UserProfile>({
        name: "Setter",
        title: "Appointment Setter",
    });

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Listen for auth changes
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (!session) {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Load data from Supabase when user is authenticated
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);

            // Fetch profile & goals from Supabase
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileData) {
                setUserProfile({
                    name: profileData.full_name || "Setter",
                    title: profileData.job_title || "Appointment Setter"
                });
                if (profileData.goals) {
                    setGoals(profileData.goals);
                }
            }

            // Fetch prospects from Supabase with notes count
            const { data: prospectsData } = await supabase
                .from('prospects')
                .select(`
                    *,
                    prospect_notes:prospect_notes(count)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

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
                    notesCount: p.prospect_notes ? (p.prospect_notes[0] as any).count : 0,
                    qualBudget: p.qual_budget,
                    qualAuthority: p.qual_authority,
                    qualNeed: p.qual_need,
                    qualTiming: p.qual_timing,
                    commissionRate: p.commission_rate
                })));
            }

            setLoading(false);
        };

        fetchData();
    }, [user]);

    const addProspect = async (prospect: Prospect) => {
        if (!user) return;

        const { data, error } = await supabase
            .from('prospects')
            .insert({
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
                user_id: user.id
            })
            .select()
            .single();

        if (!error && data) {
            setProspects((prev) => [{
                ...prospect,
                id: data.id
            }, ...prev]);
        }
    };

    const updateProspectStatus = async (id: string, status: Prospect["status"]) => {
        if (!user) return;

        const { error } = await supabase
            .from('prospects')
            .update({ status })
            .eq('id', id);

        if (!error) {
            setProspects((prev) => prev.map(p => p.id === id ? { ...p, status } : p));
        }
    };

    const updateProspectPriority = async (id: string, priority: Prospect["priority"]) => {
        if (!user) return;

        const { error } = await supabase
            .from('prospects')
            .update({ priority })
            .eq('id', id);

        if (!error) {
            setProspects((prev) => prev.map(p => p.id === id ? { ...p, priority } : p));
        }
    };

    const deleteProspect = async (id: string) => {
        if (!user) return;

        const { error } = await supabase
            .from('prospects')
            .delete()
            .eq('id', id);

        if (!error) {
            setProspects((prev) => prev.filter(p => p.id !== id));
        }
    };

    const updateProspect = async (id: string, updates: Partial<Prospect>) => {
        if (!user) return;

        // Map camelCase to snake_case for Supabase
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

        const { error } = await supabase
            .from('prospects')
            .update(dbUpdates)
            .eq('id', id);

        if (!error) {
            setProspects((prev) => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        }
    };

    const addNote = async (prospectId: string, content: string) => {
        if (!user) return;

        const { error } = await supabase
            .from('prospect_notes')
            .insert({
                prospect_id: prospectId,
                user_id: user.id,
                content
            });

        if (!error) {
            // Increment notes count locally
            setProspects(prev => prev.map(p =>
                p.id === prospectId
                    ? { ...p, notesCount: (p.notesCount || 0) + 1 }
                    : p
            ));
        }
    };

    const getNotes = async (prospectId: string): Promise<ProspectNote[]> => {
        if (!user) return [];

        const { data, error } = await supabase
            .from('prospect_notes')
            .select('*')
            .eq('prospect_id', prospectId)
            .order('created_at', { ascending: true });

        if (error || !data) return [];

        return data.map(n => ({
            id: n.id,
            prospectId: n.prospect_id,
            content: n.content,
            createdAt: n.created_at
        }));
    };

    const deleteNote = async (noteId: string) => {
        if (!user) return;

        // Find the prospectId first to update count
        const { data: noteData } = await supabase
            .from('prospect_notes')
            .select('prospect_id')
            .eq('id', noteId)
            .single();

        const { error } = await supabase
            .from('prospect_notes')
            .delete()
            .eq('id', noteId);

        if (!error && noteData) {
            setProspects(prev => prev.map(p =>
                p.id === noteData.prospect_id
                    ? { ...p, notesCount: Math.max(0, (p.notesCount || 0) - 1) }
                    : p
            ));
        }
    };

    const logCall = () => {
        setTotalCalls((prev) => prev + 1);
    };

    const updateGoals = async (newGoals: Partial<UserGoals>) => {
        if (!user) return;
        const updatedGoals = { ...goals, ...newGoals };

        const { error } = await supabase
            .from('profiles')
            .update({ goals: updatedGoals })
            .eq('id', user.id);

        if (!error) {
            setGoals(updatedGoals);
        }
    };

    const updateUserProfile = async (newProfile: Partial<UserProfile>) => {
        if (!user) return;
        const updatedProfile = { ...userProfile, ...newProfile };

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: updatedProfile.name,
                job_title: updatedProfile.title
            })
            .eq('id', user.id);

        if (!error) {
            setUserProfile(updatedProfile);
        }
    };

    const resetData = async () => {
        if (!user) return;
        if (confirm("¿Estás seguro? Se borrarán todos tus prospectos de la base de datos.")) {
            const { error } = await supabase
                .from('prospects')
                .delete()
                .eq('user_id', user.id);

            if (!error) {
                setProspects([]);
                setTotalCalls(0);
            }
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    return (
        <AppContext.Provider value={{
            prospects, setProspects, addProspect, updateProspectStatus, updateProspectPriority,
            deleteProspect, updateProspect,
            addNote, getNotes, deleteNote,
            totalCalls, logCall,
            goals, updateGoals,
            userProfile, updateUserProfile,
            resetData,
            signOut,
            loading,
            user
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
