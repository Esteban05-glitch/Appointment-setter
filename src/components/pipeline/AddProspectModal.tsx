"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { Prospect } from "./types";
import { cn } from "@/lib/utils";

interface AddProspectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (prospect: Omit<Prospect, "id" | "lastContact" | "status">) => void;
}

export function AddProspectModal({ isOpen, onClose, onAdd }: AddProspectModalProps) {
    const [name, setName] = useState("");
    const [handle, setHandle] = useState("");
    const [platform, setPlatform] = useState<Prospect["platform"]>("instagram");
    const [value, setValue] = useState("");
    const [commissionRate, setCommissionRate] = useState("10");
    const [priority, setPriority] = useState<Prospect["priority"]>("medium");
    const [qualBudget, setQualBudget] = useState(false);
    const [qualAuthority, setQualAuthority] = useState(false);
    const [qualNeed, setQualNeed] = useState(false);
    const [qualTiming, setQualTiming] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            name,
            handle,
            platform,
            priority,
            value: value ? Number(value) : undefined,
            commissionRate: commissionRate ? Number(commissionRate) : 10,
            qualBudget,
            qualAuthority,
            qualNeed,
            qualTiming,
        });
        // Reset form
        setName("");
        setHandle("");
        setPlatform("instagram");
        setValue("");
        setCommissionRate("10");
        setPriority("medium");
        setQualBudget(false);
        setQualAuthority(false);
        setQualNeed(false);
        setQualTiming(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Add New Prospect</h3>
                    <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-400">Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="e.g. Alex Hormozi"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-400">Platform</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(["instagram", "linkedin", "twitter", "facebook"] as const).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPlatform(p)}
                                        className={cn(
                                            "rounded-lg border px-2 py-2 text-[10px] font-medium capitalize transition-colors",
                                            platform === p
                                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                                : "border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                                        )}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-400">Prioridad</label>
                            <div className="flex flex-col gap-2">
                                {[
                                    { id: "high", label: "🔥 Caliente", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
                                    { id: "medium", label: "⚡ Templado", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
                                    { id: "low", label: "❄️ Frío", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                                ].map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setPriority(p.id as any)}
                                        className={cn(
                                            "flex items-center justify-center rounded-lg border py-1.5 text-[10px] font-bold uppercase transition-all",
                                            priority === p.id
                                                ? `${p.bg} ${p.color} ${p.border} scale-[1.02]`
                                                : "border-slate-700 bg-slate-800 text-slate-500 hover:bg-slate-750"
                                        )}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-400">Handle / Username</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-slate-500">@</span>
                                <input
                                    type="text"
                                    required
                                    value={handle}
                                    onChange={(e) => setHandle(e.target.value)}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-7 pr-3 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="username"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-400">Est. Value ($)</label>
                            <input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-400">Comisión (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={commissionRate}
                                    onChange={(e) => setCommissionRate(e.target.value)}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 pr-8 text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="10"
                                />
                                <span className="absolute right-3 top-2 text-slate-500">%</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400">QualCheck (BANT)</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: "budget", label: "Budget", state: qualBudget, setter: setQualBudget },
                                { id: "authority", label: "Authority", state: qualAuthority, setter: setQualAuthority },
                                { id: "need", label: "Need", state: qualNeed, setter: setQualNeed },
                                { id: "timing", label: "Timing", state: qualTiming, setter: setQualTiming },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => item.setter(!item.state)}
                                    className={cn(
                                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                                        item.state
                                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                                            : "border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-600 hover:bg-slate-750"
                                    )}
                                >
                                    <div className={cn(
                                        "flex h-4 w-4 items-center justify-center rounded border transition-all",
                                        item.state ? "border-emerald-500 bg-emerald-500 text-slate-900" : "border-slate-600 bg-slate-900"
                                    )}>
                                        {item.state && <Check className="h-3 w-3 stroke-[3]" />}
                                    </div>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 font-semibold text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20"
                    >
                        <Check className="h-4 w-4" />
                        Add to Pipeline
                    </button>
                </form>
            </div>
        </div>
    );
}
