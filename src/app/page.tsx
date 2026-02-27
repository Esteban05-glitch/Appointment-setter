"use client";

import { useApp } from "@/context/AppContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { FollowUpWidget } from "@/components/dashboard/FollowUpWidget";
import { CommissionCalc } from "@/components/dashboard/CommissionCalc";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Users, DollarSign, Target, Calendar } from "lucide-react";

export default function DashboardPage() {
    const { prospects, totalCalls, logCall, user } = useApp();

    // Only show personal stats on the dashboard
    const personalProspects = prospects.filter(p => p.userId === user?.id);

    // Stats calculations using personal data
    const totalLeads = personalProspects.length;
    const activeLeads = personalProspects.filter(p => !["booked", "closed"].includes(p.status)).length;

    // Comisión total realizada (Closed) - Usando personalProspects
    const realizedCommission = personalProspects
        .filter(p => p.status === "closed")
        .reduce((acc, p) => acc + ((p.value || 0) * (p.commissionRate || 10) / 100), 0);

    // Comisión potencial (Pipeline activo) - Usando personalProspects
    const pipelineCommission = personalProspects
        .filter(p => !["booked", "closed"].includes(p.status))
        .reduce((acc, p) => acc + ((p.value || 0) * (p.commissionRate || 10) / 100), 0);

    const bookedThisMonth = personalProspects.filter(p => p.status === "booked").length;

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                    Dashboard <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">General</span>
                </h2>
                <p className="text-slate-400">Bienvenido de nuevo. Aquí tienes un resumen de tu actividad.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Prospectos Totales"
                    value={totalLeads.toString()}
                    icon={Users}
                    color="indigo"
                />
                <StatCard
                    label="Pipeline Activo ($)"
                    value={`$${pipelineCommission.toLocaleString()}`}
                    icon={DollarSign}
                    color="cyan"
                />
                <StatCard
                    label="Comisión Realizada"
                    value={`$${realizedCommission.toLocaleString()}`}
                    icon={Target}
                    color="emerald"
                />
                <StatCard
                    label="Citas Agendadas"
                    value={bookedThisMonth.toString()}
                    icon={Calendar}
                    color="purple"
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <QuickActions />
                </div>
                <div className="lg:col-span-1">
                    <FollowUpWidget />
                </div>
                <div className="lg:col-span-1">
                    <CommissionCalc />
                </div>
            </div>
        </div>
    );
}
