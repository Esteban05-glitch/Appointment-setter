import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    label: string;
    value: string;
    trend?: string;
    trendUp?: boolean;
    icon: LucideIcon;
    color?: "indigo" | "cyan" | "emerald" | "purple";
}

export function StatCard({ label, value, trend, trendUp, icon: Icon, color = "indigo" }: StatCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-slate-700 hover:bg-slate-900/80">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-400">{label}</p>
                    <h3 className="mt-2 text-3xl font-bold text-slate-100">{value}</h3>
                </div>
                <div className={cn("rounded-lg p-3 bg-slate-800/50",
                    color === "indigo" && "text-indigo-400 group-hover:bg-indigo-500/10",
                    color === "cyan" && "text-cyan-400 group-hover:bg-cyan-500/10",
                    color === "emerald" && "text-emerald-400 group-hover:bg-emerald-500/10",
                    color === "purple" && "text-purple-400 group-hover:bg-purple-500/10",
                )}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>

            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={cn("font-medium", trendUp ? "text-emerald-400" : "text-red-400")}>
                        {trend}
                    </span>
                    <span className="ml-2 text-slate-500">vs last month</span>
                </div>
            )}
        </div>
    );
}
