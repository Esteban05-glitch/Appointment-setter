"use client";

import { useApp } from "@/context/AppContext";
import { useEffect } from "react";
import { Archive, RotateCcw, Trash2, Phone, TrendingUp, ChevronDown } from "lucide-react";
import { Prospect, AgencyMember } from "@/components/pipeline/types";
import { useState, useMemo } from "react";

export default function ArchivePage() {
    const {
        archivedProspects,
        callHistory,
        fetchArchivedProspects,
        restoreProspect,
        deleteArchivedProspect,
        userRole,
        agency,
        agencyMembers,
        teamCallHistories
    } = useApp();
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const isAgencyAdmin = userRole === 'owner' || userRole === 'admin';

    useEffect(() => {
        fetchArchivedProspects();
    }, [fetchArchivedProspects]);

    const displayProspects = useMemo(() => {
        if (!selectedUserId) return archivedProspects;
        return archivedProspects.filter(p => p.userId === selectedUserId);
    }, [selectedUserId, archivedProspects]);

    const displayCallHistory = useMemo(() => {
        if (!selectedUserId) return callHistory;
        return teamCallHistories[selectedUserId] || [];
    }, [selectedUserId, callHistory, teamCallHistories]);

    const formatMonth = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    };

    const getPlatformColor = (platform: Prospect["platform"]) => {
        const colors = {
            instagram: "bg-pink-500/10 text-pink-400",
            linkedin: "bg-blue-500/10 text-blue-400",
            facebook: "bg-indigo-500/10 text-indigo-400",
            twitter: "bg-cyan-500/10 text-cyan-400"
        };
        return colors[platform];
    };

    return (
        <div className="space-y-8 max-w-7xl">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">
                    {isAgencyAdmin ? `Archivo: ${agency?.name}` : "Mi Archivo"}
                </h2>
                <p className="mt-2 text-slate-400">
                    {isAgencyAdmin ? "Resumen e historial detallado de todo tu equipo." : "Historial de prospectos ganados y llamadas mensuales."}
                </p>
            </div>

            {/* Filter Controls - Only for Admins/Owners */}
            {isAgencyAdmin && agencyMembers.length > 0 && (
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <select
                            value={selectedUserId || ""}
                            onChange={(e) => setSelectedUserId(e.target.value || null)}
                            className="appearance-none bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all hover:bg-slate-800 cursor-pointer"
                        >
                            <option value="">Todo el Equipo</option>
                            {agencyMembers.map((member) => (
                                <option key={member.user_id} value={member.user_id}>
                                    {member.profiles?.full_name || "Miembro sin nombre"}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                            <ChevronDown className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            )}

            {/* Call History Section */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-200">
                        {selectedUserId
                            ? `Historial de: ${agencyMembers.find(m => m.user_id === selectedUserId)?.profiles?.full_name || "Miembro"}`
                            : (isAgencyAdmin ? "Historial de Llamadas del Equipo" : "Mi Historial de Llamadas")}
                    </h3>
                </div>

                {displayCallHistory.length === 0 ? (
                    <p className="text-sm text-slate-500">No hay historial de llamadas para mostrar.</p>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {displayCallHistory.map((record, idx) => (
                            <div key={idx} className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Phone className="h-4 w-4 text-indigo-400" />
                                    <p className="text-xs font-medium text-slate-400 capitalize">{formatMonth(record.month)}</p>
                                </div>
                                <p className="text-2xl font-bold text-white">{record.total}</p>
                                <p className="text-xs text-slate-500">llamadas realizadas</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Archived Prospects Section */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                        <Archive className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-200">
                        {selectedUserId
                            ? `Prospectos de: ${agencyMembers.find(m => m.user_id === selectedUserId)?.profiles?.full_name || "Miembro"}`
                            : (isAgencyAdmin ? "Prospectos Archivados del Equipo" : "Mis Prospectos Archivados")}
                    </h3>
                </div>

                {displayProspects.length === 0 ? (
                    <p className="text-sm text-slate-500">No hay prospectos archivados para mostrar.</p>
                ) : (
                    <div className="space-y-3">
                        {displayProspects.map((prospect) => (
                            <div key={prospect.id} className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`rounded-lg px-3 py-1 text-xs font-medium ${getPlatformColor(prospect.platform)}`}>
                                        {prospect.platform}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-200">{prospect.name}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm text-slate-500">@{prospect.handle}</p>
                                            {isAgencyAdmin && prospect.creatorName && (
                                                <>
                                                    <span className="text-slate-700 text-xs">•</span>
                                                    <span className="text-xs font-medium text-indigo-400/80">{prospect.creatorName}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {prospect.value && (
                                        <div className="text-sm text-emerald-400 font-medium">
                                            ${prospect.value.toLocaleString()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => restoreProspect(prospect.id)}
                                        className="rounded-lg bg-indigo-600 p-2 text-white transition-colors hover:bg-indigo-500"
                                        title="Restaurar"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteArchivedProspect(prospect.id)}
                                        className="rounded-lg bg-red-600 p-2 text-white transition-colors hover:bg-red-500"
                                        title="Eliminar permanentemente"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
