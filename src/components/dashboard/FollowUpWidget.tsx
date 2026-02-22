"use client";

import { useApp } from "@/context/AppContext";
import { MessageSquare, Bell, ArrowRight } from "lucide-react";
import { Prospect } from "@/components/pipeline/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function FollowUpWidget() {
    const { prospects } = useApp();

    // Logic: Follow-up is required if lastContact > 48 hours ago
    // AND status is not "closed" or "booked"
    const followUpNeeded = prospects.filter(p => {
        if (p.status === "closed" || p.status === "booked") return false;

        // Skip if lastContact is not a valid date
        const lastContactDate = new Date(p.lastContact);
        if (isNaN(lastContactDate.getTime())) return false;

        const now = new Date();
        const diffInHours = (now.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60);

        return diffInHours >= 48;
    });

    const count = followUpNeeded.length;

    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-200">Recordatorios de Follow-up</h3>
                <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                    count > 0 ? "bg-orange-500/10 text-orange-400" : "bg-slate-800 text-slate-500"
                )}>
                    <Bell className={cn("h-4 w-4", count > 0 && "animate-pulse")} />
                </div>
            </div>

            <div className="mt-4">
                {count > 0 ? (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-400">
                            Hoy te toca hacer follow-up a <span className="font-bold text-orange-400">{count}</span> {count === 1 ? 'persona' : 'personas'}. No dejes que la conversación se enfríe.
                        </p>

                        <div className="space-y-2">
                            {followUpNeeded.slice(0, 3).map((p) => (
                                <div key={p.id} className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3 border border-slate-700/30">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-orange-400" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">{p.name}</p>
                                            <p className="text-[10px] text-slate-500">Última vez: {new Date(p.lastContact).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/pipeline"
                                        className="text-slate-500 hover:text-indigo-400 transition-colors"
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            ))}
                            {count > 3 && (
                                <p className="text-center text-[10px] text-slate-500 italic">
                                    + {count - 3} más pendientes
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                            <ArrowRight className="h-6 w-6 rotate-[-45deg]" />
                        </div>
                        <p className="text-sm text-slate-400">¡Todo al día! No tienes follow-ups urgentes por ahora.</p>
                    </div>
                )}
            </div>

            {count > 0 && (
                <Link
                    href="/pipeline"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                >
                    Ver en el Pipeline
                </Link>
            )}
        </div>
    );
}
