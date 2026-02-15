"use client";

import { useApp } from "@/context/AppContext";
import { useEffect } from "react";
import { Archive, RotateCcw, Trash2, Phone, TrendingUp } from "lucide-react";
import { Prospect } from "@/components/pipeline/types";

export default function ArchivePage() {
    const { archivedProspects, callHistory, fetchArchivedProspects, restoreProspect, deleteArchivedProspect } = useApp();

    useEffect(() => {
        fetchArchivedProspects();
    }, []);

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
                <h2 className="text-3xl font-bold tracking-tight text-white">Archivo</h2>
                <p className="mt-2 text-slate-400">Historial de prospectos ganados y llamadas mensuales.</p>
            </div>

            {/* Call History Section */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-200">Historial de Llamadas</h3>
                </div>

                {callHistory.length === 0 ? (
                    <p className="text-sm text-slate-500">No hay historial de llamadas aún.</p>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {callHistory.map((record, idx) => (
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
                    <h3 className="text-lg font-medium text-slate-200">Prospectos Archivados</h3>
                </div>

                {archivedProspects.length === 0 ? (
                    <p className="text-sm text-slate-500">No hay prospectos archivados.</p>
                ) : (
                    <div className="space-y-3">
                        {archivedProspects.map((prospect) => (
                            <div key={prospect.id} className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`rounded-lg px-3 py-1 text-xs font-medium ${getPlatformColor(prospect.platform)}`}>
                                        {prospect.platform}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-200">{prospect.name}</p>
                                        <p className="text-sm text-slate-500">@{prospect.handle}</p>
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
