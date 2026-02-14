"use client";

import { Sidebar } from "./Sidebar";
import { useApp } from "@/context/AppContext";

interface AppShellProps {
    children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    const { loading } = useApp();

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                    <p className="text-slate-400 animate-pulse">Cargando tu pipeline...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-slate-950 text-slate-200 antialiased selection:bg-indigo-500/30">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-slate-950">
                <div className="container mx-auto max-w-7xl p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
