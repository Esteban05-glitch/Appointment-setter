"use client";

import { useApp } from "@/context/AppContext";
import { useState, useMemo } from "react";
import { ConversionRateChart, PlatformPerformanceChart, GoalProgressChart, MemberPerformanceChart } from "@/components/analytics/PerformanceCharts";
import { BarChart3, TrendingUp, Target, Share2, Users, User as UserIcon, ChevronDown } from "lucide-react";

export default function AnalyticsPage() {
    const { prospects, goals, totalCalls, agency, user, userRole, agencyMembers } = useApp();
    const [viewMode, setViewMode] = useState<'personal' | 'agency'>(userRole === 'setter' ? 'personal' : 'agency');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    // Personal vs Agency vs Filtered prospects
    const personalProspects = useMemo(() => prospects.filter(p => p.userId === user?.id), [prospects, user]);

    const displayProspects = useMemo(() => {
        if (viewMode === 'personal') return personalProspects;
        if (selectedUserId) {
            return prospects.filter(p => p.userId === selectedUserId);
        }
        return prospects;
    }, [viewMode, selectedUserId, prospects, personalProspects]);

    const totalLeads = displayProspects.length;
    const bookedLeads = displayProspects.filter(p => p.status === "booked").length;
    const conversionRate = totalLeads > 0 ? ((bookedLeads / totalLeads) * 100).toFixed(1) : "0";

    const earnedCommissions = useMemo(() => {
        return displayProspects
            .filter(p => p.status === "closed")
            .reduce((sum, p) => sum + ((p.value || 0) * (p.commissionRate || 10) / 100), 0);
    }, [displayProspects]);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">
                        {agency ? `Analíticas: ${agency.name}` : "Analíticas de Rendimiento"}
                    </h2>
                    <p className="mt-2 text-slate-400">
                        {viewMode === 'agency' ? "Métricas agregadas de todo tu equipo." : "Tus métricas personales de conversión."}
                    </p>
                </div>

                {/* Filter Controls - Only for Admins/Owners */}
                {(userRole === 'owner' || userRole === 'admin') && (
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Member Selector - Only in Agency View */}
                        {viewMode === 'agency' && agencyMembers.length > 0 && (
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
                        )}

                        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
                            <button
                                onClick={() => {
                                    setViewMode('personal');
                                    setSelectedUserId(null); // Reset member filter when going personal
                                }}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === 'personal'
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                Mi Rendimiento
                            </button>
                            <button
                                onClick={() => setViewMode('agency')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === 'agency'
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                Vista de Agencia
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{agency ? "Conversión de Agencia" : "Conversión Global"}</p>
                            <p className="text-2xl font-bold text-white">{conversionRate}%</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                            <Target className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Meta de Ingresos Mensual</p>
                            <p className="text-2xl font-bold text-white">${earnedCommissions.toLocaleString()} / ${goals.monthlyCommission.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Llamadas Mensuales (Mías)</p>
                            <p className="text-2xl font-bold text-white">{totalCalls} / {goals.monthlyCalls}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                            <Share2 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Prospectos Totales</p>
                            <p className="text-2xl font-bold text-white">{totalLeads}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Distribución del Embudo</h3>
                        <BarChart3 className="h-4 w-4 text-slate-500" />
                    </div>
                    <ConversionRateChart prospects={displayProspects} />
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">ROI por Plataforma</h3>
                        <Share2 className="h-4 w-4 text-slate-500" />
                    </div>
                    <PlatformPerformanceChart prospects={displayProspects} />
                </div>

                {agency && (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 lg:col-span-2">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Rendimiento por Miembro</h3>
                            <Users className="h-4 w-4 text-slate-500" />
                        </div>
                        <MemberPerformanceChart prospects={displayProspects} />
                    </div>
                )}

                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 lg:col-span-2">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Progreso de Metas Personales</h3>
                        <Target className="h-4 w-4 text-slate-500" />
                    </div>
                    <GoalProgressChart prospects={personalProspects} goals={goals} totalCalls={totalCalls} />
                </div>
            </div>
        </div>
    );
}
