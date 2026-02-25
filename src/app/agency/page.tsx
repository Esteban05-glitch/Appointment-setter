"use client";

import { useApp } from "@/context/AppContext";
import { useState, useEffect } from "react";
import { Users, Plus, Shield, Mail, UserPlus, Building2, Bell, X, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Role display names
const roleLabels = {
    owner: "Dueño",
    admin: "Administrador",
    setter: "Setter"
};

export default function AgencyPage() {
    const { agency, agencyMembers, user, fetchAgencyData } = useApp();
    const [isCreating, setIsCreating] = useState(false);
    const [newAgencyName, setNewAgencyName] = useState("");
    const [loading, setLoading] = useState(false);
    const [invites, setInvites] = useState<any[]>([]);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<'admin' | 'setter'>('setter');
    const [showInvites, setShowInvites] = useState(false);
    const supabase = createClient();

    // Get current user's role in the agency
    const currentUserMember = agencyMembers.find(m => m.user_id === user?.id);
    const isAdmin = currentUserMember?.role === 'owner' || currentUserMember?.role === 'admin' || (agency && user && agency.owner_id === user.id);
    const isOwner = currentUserMember?.role === 'owner' || (agency && user && agency.owner_id === user.id);

    // Fetch pending invites
    useEffect(() => {
        const fetchInvites = async () => {
            if (!user?.email) return;

            const { data } = await supabase
                .from('agency_invitations')
                .select('*, agencies(name)')
                .eq('email', user.email)
                .eq('status', 'pending');

            if (data) setInvites(data);
        };

        fetchInvites();

        // Refresh every 30 seconds or when user changes
        const interval = setInterval(fetchInvites, 30000);
        return () => clearInterval(interval);
    }, [user?.email, supabase]);

    const handleAcceptInvite = async (inviteId: string, agencyId: string, role: 'admin' | 'setter') => {
        if (!user) return;
        setLoading(true);
        try {
            // 1. Add to agency_members
            const { error: memberError } = await supabase
                .from('agency_members')
                .insert({
                    agency_id: agencyId,
                    user_id: user.id,
                    role: role
                });

            if (memberError && !memberError.message.includes('duplicate key')) {
                throw memberError;
            }

            // 2. Mark invite as accepted (always do this if we reached here)
            const { error: inviteError } = await supabase
                .from('agency_invitations')
                .update({ status: 'accepted' })
                .eq('id', inviteId);

            if (inviteError) throw inviteError;

            // Update local state immediately for better UX
            setInvites(prev => prev.filter(inv => inv.id !== inviteId));

            await fetchAgencyData();
            setShowInvites(false);

            if (memberError?.message.includes('duplicate key')) {
                alert("Ya eres miembro de esta agencia. Se ha actualizado el estado de tu invitación.");
            } else {
                alert("¡Bienvenido! Te has unido a la agencia correctamente.");
            }
        } catch (error: any) {
            console.error("Error accepting invite:", error);
            const msg = error.message || error.details || "Por favor intente de nuevo.";
            alert(`Error al aceptar la invitación: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAgency = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newAgencyName) return;

        setLoading(true);
        try {
            // 1. Create the agency
            const { data: agencyData, error: agencyError } = await supabase
                .from('agencies')
                .insert({
                    name: newAgencyName,
                    owner_id: user.id
                })
                .select()
                .single();

            if (agencyError) throw agencyError;

            // 2. Add the owner as the first member
            const { error: memberError } = await supabase
                .from('agency_members')
                .insert({
                    agency_id: agencyData.id,
                    user_id: user.id,
                    role: 'owner'
                });

            if (memberError) throw memberError;

            await fetchAgencyData();
            setIsCreating(false);
        } catch (error: any) {
            console.error("Error creating agency:", error.message || error);
            alert(`Error al crear la agencia: ${error.message || "Por favor intente de nuevo."}`);
        } finally {
            setLoading(false);
        }
    };

    if (!agency) {
        return (
            <div className="p-8 max-w-4xl mx-auto uppercase-none">
                <div className="flex justify-end mb-6">
                    {/* Notifications Bell for No-Agency State */}
                    <div className="relative">
                        <button
                            onClick={() => setShowInvites(!showInvites)}
                            className={`p-2.5 rounded-xl border transition-all relative ${invites.length > 0
                                ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <Bell className="w-5 h-5" />
                            {invites.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-slate-950">
                                    {invites.length}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showInvites && (
                            <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-left">
                                <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-100">Invitaciones</h3>
                                    <button onClick={() => setShowInvites(false)}>
                                        <X className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                                    </button>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {invites.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <Mail className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                                            <p className="text-sm text-slate-500">No tienes invitaciones pendientes</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-800">
                                            {invites.map((invite: any) => (
                                                <div key={invite.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                                                    <p className="text-sm text-slate-200 font-medium mb-1">
                                                        Invitación de <span className="text-indigo-400">{invite.agencies?.name || "Agencia"}</span>
                                                    </p>
                                                    <p className="text-xs text-slate-500 mb-3">Rol: {roleLabels[invite.role as keyof typeof roleLabels] || invite.role}</p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAcceptInvite(invite.id, invite.agency_id, invite.role)}
                                                            disabled={loading}
                                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1"
                                                        >
                                                            <Check className="w-3 h-3" /> Aceptar
                                                        </button>
                                                        <button
                                                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                                        >
                                                            Ignorar
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center backdrop-blur-sm relative">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Building2 className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-100 mb-4">Potencia tu equipo con una Agencia</h1>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                        Crea una agencia para centralizar tus prospectos, compartir recursos con tu equipo y escalar tus resultados.
                    </p>

                    {!isCreating ? (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Crear Nueva Agencia
                        </button>
                    ) : (
                        <form onSubmit={handleCreateAgency} className="max-w-sm mx-auto text-left">
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Nombre de la Agencia
                                </label>
                                <input
                                    type="text"
                                    value={newAgencyName}
                                    onChange={(e) => setNewAgencyName(e.target.value)}
                                    placeholder="Ej. Nova Sales Agency"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
                                >
                                    {loading ? "Creando..." : "Confirmar"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Pending Invites Section (Simplified since we have the bell) */}
                    {invites.length > 0 && !showInvites && (
                        <div className="mt-8 text-center">
                            <p className="text-xs text-indigo-400 animate-pulse font-medium">
                                Tienes {invites.length} {invites.length === 1 ? 'invitación pendiente' : 'invitaciones pendientes'}. Haz clic en la campana para revisar.
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-slate-900/30 border border-slate-800/50 rounded-xl">
                        <Shield className="w-8 h-8 text-cyan-400 mb-4" />
                        <h3 className="text-slate-100 font-semibold mb-2">Control Total</h3>
                        <p className="text-sm text-slate-400">Gestiona roles y permisos para cada miembro de tu equipo.</p>
                    </div>
                    <div className="p-6 bg-slate-900/30 border border-slate-800/50 rounded-xl">
                        <Users className="w-8 h-8 text-indigo-400 mb-4" />
                        <h3 className="text-slate-100 font-semibold mb-2">Colaboración</h3>
                        <p className="text-sm text-slate-400">Comparte prospectos y notas en tiempo real con todo el equipo.</p>
                    </div>
                    <div className="p-6 bg-slate-900/30 border border-slate-800/50 rounded-xl">
                        <BarChart3 className="w-8 h-8 text-emerald-400 mb-4" />
                        <h3 className="text-slate-100 font-semibold mb-2">Métricas de Equipo</h3>
                        <p className="text-sm text-slate-400">Visualiza el rendimiento individual y colectivo de tu agencia.</p>
                    </div>
                </div>
            </div>
        );
    }


    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agency || !inviteEmail) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('agency_invitations')
                .insert({
                    agency_id: agency.id,
                    email: inviteEmail,
                    role: inviteRole,
                    invited_by: user?.id,
                    status: 'pending'
                });

            if (error) throw error;

            alert(`Invitación enviada a ${inviteEmail}`);
            setIsInviting(false);
            setInviteEmail("");
        } catch (error) {
            console.error("Error sending invite:", error);
            alert("Error al enviar la invitación.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto uppercase-none">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-indigo-400" />
                        {agency.name}
                    </h1>
                    <p className="text-slate-400 mt-1">Configuración y gestión de equipo</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Notifications Bell */}
                    <div className="relative">
                        <button
                            onClick={() => setShowInvites(!showInvites)}
                            className={`p-2.5 rounded-xl border transition-all relative ${invites.length > 0
                                ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <Bell className="w-5 h-5" />
                            {invites.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-slate-950">
                                    {invites.length}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showInvites && (
                            <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-100">Invitaciones</h3>
                                    <button onClick={() => setShowInvites(false)}>
                                        <X className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                                    </button>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {invites.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <Mail className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                                            <p className="text-sm text-slate-500">No tienes invitaciones pendientes</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-800">
                                            {invites.map((invite) => (
                                                <div key={invite.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                                                    <p className="text-sm text-slate-200 font-medium mb-1">
                                                        Invitación de <span className="text-indigo-400">{invite.agencies.name}</span>
                                                    </p>
                                                    <p className="text-xs text-slate-500 mb-3">Rol: {roleLabels[invite.role as keyof typeof roleLabels]}</p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAcceptInvite(invite.id, invite.agency_id, invite.role)}
                                                            disabled={loading}
                                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1"
                                                        >
                                                            <Check className="w-3 h-3" /> Aceptar
                                                        </button>
                                                        <button
                                                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                                        >
                                                            Ignorar
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    {isOwner && (
                        <button
                            onClick={() => setIsInviting(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            Invitar Miembro
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Team Members List */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80">
                            <h2 className="text-slate-100 font-semibold flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-400" />
                                Miembros del Equipo
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-800">
                            {agencyMembers.map((member) => (
                                <div key={member.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-100 font-medium">
                                            {member.profiles?.full_name?.substring(0, 2).toUpperCase() || "??"}
                                        </div>
                                        <div>
                                            <p className="text-slate-100 font-medium">{member.profiles?.full_name || "Usuario Desconocido"}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${member.role === 'owner' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' :
                                                    member.role === 'admin' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' :
                                                        'bg-slate-500/10 border-slate-500/30 text-slate-400'
                                                    }`}>
                                                    {roleLabels[member.role]}
                                                </span>
                                                <span className="text-[10px] text-slate-500">{member.profiles?.job_title}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Se unió: {new Date(member.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats/Settings */}
                <div className="space-y-6">
                    {isAdmin && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                            <h3 className="text-slate-100 font-semibold mb-4">Resumen de Agencia</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                    <span className="text-slate-400 text-sm">Total Miembros</span>
                                    <span className="text-slate-100 font-medium">{agencyMembers.length}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                    <span className="text-slate-400 text-sm">Prospectos Totales</span>
                                    <span className="text-slate-100 font-medium">--</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-slate-400 text-sm">Plan Actual</span>
                                    <span className="text-indigo-400 font-medium text-xs bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">Agency Pro</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                        <h3 className="text-slate-100 font-semibold mb-4 text-sm">Soporte y Ayuda</h3>
                        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                            ¿Necesitas ayuda para configurar los roles de tu equipo o invitar nuevos miembros?
                        </p>
                        <button className="w-full py-2.5 rounded-xl border border-slate-800 text-slate-300 text-sm hover:bg-slate-800 transition-all">
                            Ver Documentación
                        </button>
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            {isInviting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                                <UserPlus className="w-6 h-6 text-indigo-400" />
                                Invitar al Equipo
                            </h2>
                            <button onClick={() => setIsInviting(false)} className="text-slate-500 hover:text-slate-300">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleSendInvite}>
                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="ejemplo@correo.com"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Rol</label>
                                    <select
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value as any)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    >
                                        <option value="setter">Setter (Gestiona prospectos)</option>
                                        <option value="admin">Administrador (Gestión total)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsInviting(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
                                >
                                    {loading ? "Enviando..." : "Enviar Invitación"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Simple BarChart icon for the empty state
function BarChart3(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
        </svg>
    )
}
