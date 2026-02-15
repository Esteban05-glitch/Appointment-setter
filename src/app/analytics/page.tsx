"use client";

import { useApp } from "@/context/AppContext";
import { ConversionRateChart, PlatformPerformanceChart, GoalProgressChart } from "@/components/analytics/PerformanceCharts";
import { BarChart3, TrendingUp, Target, Share2 } from "lucide-react";

export default function AnalyticsPage() {
    const { prospects, goals } = useApp();

    const totalLeads = prospects.length;
    const bookedLeads = prospects.filter(p => p.status === "booked").length;
    const conversionRate = totalLeads > 0 ? ((bookedLeads / totalLeads) * 100).toFixed(1) : "0";

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Performance Analytics</h2>
                <p className="mt-2 text-slate-400">Deep dive into your conversion and platform data.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Global conversion</p>
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
                            <p className="text-sm font-medium text-slate-500">Monthly Goal</p>
                            <p className="text-2xl font-bold text-white">${goals.monthlyCommission.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                            <Share2 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Active Platforms</p>
                            <p className="text-2xl font-bold text-white">4</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Funnel Distribution</h3>
                        <BarChart3 className="h-4 w-4 text-slate-500" />
                    </div>
                    <ConversionRateChart prospects={prospects} />
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Platform ROI</h3>
                        <Share2 className="h-4 w-4 text-slate-500" />
                    </div>
                    <PlatformPerformanceChart prospects={prospects} />
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 lg:col-span-2">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Commission Progress</h3>
                        <Target className="h-4 w-4 text-slate-500" />
                    </div>
                    <GoalProgressChart prospects={prospects} goals={goals} />
                </div>
            </div>
        </div>
    );
}
