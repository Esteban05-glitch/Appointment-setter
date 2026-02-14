"use client";

import { useApp } from "@/context/AppContext";
import { Save, RefreshCw, Trash2, Target, User, BarChart } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const { goals, updateGoals, userProfile, updateUserProfile, resetData } = useApp();
    const [localGoals, setLocalGoals] = useState(goals);
    const [localProfile, setLocalProfile] = useState(userProfile);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        updateGoals(localGoals);
        updateUserProfile(localProfile);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleReset = () => {
        resetData();
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Settings</h2>
                <p className="mt-2 text-slate-400">Manage your preferences and application data.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Sidebar Navigation (Mock) */}
                <div className="hidden md:block">
                    <nav className="flex flex-col space-y-1">
                        <button className="flex items-center gap-3 rounded-lg bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400">
                            <User className="h-4 w-4" />
                            Profile
                        </button>
                        <button className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
                            <BarChart className="h-4 w-4" />
                            Integrations
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">

                    {/* Profile Section */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <h3 className="flex items-center gap-2 text-lg font-medium text-slate-200">
                            <User className="h-5 w-5 text-indigo-400" />
                            Personal Profile
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">Update your personal details.</p>

                        <div className="mt-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Display Name</label>
                                <input
                                    type="text"
                                    value={localProfile.name}
                                    onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="e.g. Sebastian"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Job Title</label>
                                <input
                                    type="text"
                                    value={localProfile.title}
                                    onChange={(e) => setLocalProfile({ ...localProfile, title: e.target.value })}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="e.g. Appointment Setter"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Goals Section */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <h3 className="flex items-center gap-2 text-lg font-medium text-slate-200">
                            <Target className="h-5 w-5 text-indigo-400" />
                            Performance Goals
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">Set your targets to track your progress.</p>

                        <div className="mt-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Monthly Commission Goal ($)</label>
                                <input
                                    type="number"
                                    value={localGoals.monthlyCommission}
                                    onChange={(e) => setLocalGoals({ ...localGoals, monthlyCommission: Number(e.target.value) })}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Daily Calls Goal</label>
                                <input
                                    type="number"
                                    value={localGoals.dailyCalls}
                                    onChange={(e) => setLocalGoals({ ...localGoals, dailyCalls: Number(e.target.value) })}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                className="mt-2 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
                            >
                                {isSaved ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Saved!
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Data Section */}
                    <div className="rounded-xl border border-red-900/20 bg-red-950/10 p-6">
                        <h3 className="flex items-center gap-2 text-lg font-medium text-red-400">
                            <Trash2 className="h-5 w-5" />
                            Danger Zone
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">Irreversible actions for your account data.</p>

                        <div className="mt-6">
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 rounded-lg border border-red-800 bg-red-950/30 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/50"
                            >
                                <Trash2 className="h-4 w-4" />
                                Reset Application Data
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
