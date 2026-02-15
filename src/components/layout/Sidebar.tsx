"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, KanbanSquare, MessageSquareText, Settings, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Pipeline", href: "/pipeline", icon: KanbanSquare },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Scripts", href: "/scripts", icon: MessageSquareText },
    { name: "Settings", href: "/settings", icon: Settings },
];

import { useApp } from "@/context/AppContext";
import { LogOut } from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();
    const { signOut } = useApp();

    return (
        <div className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-950/50 backdrop-blur-xl">
            <div className="flex h-16 items-center px-6">
                <h1 className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-xl font-bold text-transparent">
                    SetterHQ
                </h1>
            </div>

            <div className="flex flex-1 flex-col justify-between px-3 py-4">
                <nav className="flex flex-col gap-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-indigo-500/10 text-indigo-400"
                                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <button
                    onClick={signOut}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
