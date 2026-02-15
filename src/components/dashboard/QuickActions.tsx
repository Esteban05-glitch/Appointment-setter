"use client";

import { useState, useRef, useEffect } from "react";
import { Phone, CheckCircle2, UserPlus, Zap } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

export function QuickActions() {
    const { logCall, totalCalls } = useApp();
    const [isPressing, setIsPressing] = useState(false);
    const [progress, setProgress] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startPress = () => {
        setIsPressing(true);
        setProgress(0);
        const startTime = Date.now();
        const initialDuration = 500; // Faster initial hold

        timerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / initialDuration) * 100, 100);
            setProgress(newProgress);

            if (newProgress >= 100) {
                // Register the first call and start rapid repeat
                logCall();

                // Clear the progress interval
                if (timerRef.current) clearInterval(timerRef.current);

                // Start rapid repeat interval (every 150ms)
                timerRef.current = setInterval(() => {
                    logCall();
                    // Pulse progress bar or keep it at 100%
                }, 150);
            }
        }, 10);
    };

    const cancelPress = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsPressing(false);
        setProgress(0);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-6">
                <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                    <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-medium text-slate-200">Acciones Rápidas</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* Log Call Button with Long Press */}
                <div className="relative">
                    <button
                        onMouseDown={startPress}
                        onMouseUp={cancelPress}
                        onMouseLeave={cancelPress}
                        onTouchStart={startPress}
                        onTouchEnd={cancelPress}
                        className={cn(
                            "relative flex w-full items-center justify-between overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50 p-4 transition-all active:scale-[0.98]",
                            isPressing ? "border-indigo-500/50 ring-2 ring-indigo-500/20" : "hover:border-slate-600 hover:bg-slate-800"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "rounded-lg p-2.5 transition-colors",
                                isPressing ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-300"
                            )}>
                                <Phone className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-slate-100">Registrar Llamada</p>
                                <p className="text-[11px] text-slate-400">Mantén presionado para sumar</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-indigo-400">{totalCalls}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Hoy</p>
                        </div>

                        {/* Progress Bar Background */}
                        {isPressing && (
                            <div
                                className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-75"
                                style={{ width: `${progress}%` }}
                            />
                        )}
                    </button>

                    {/* Success indicator (mini pulse) */}
                    {progress === 100 && (
                        <div className="absolute -right-1 -top-1 animate-ping">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => window.location.href = '/pipeline?openAdd=true'}
                        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-800/30 p-4 transition-all hover:border-slate-700 hover:bg-slate-800/50"
                    >
                        <UserPlus className="h-5 w-5 text-emerald-400" />
                        <span className="text-xs font-medium text-slate-300">Nuevo Lead</span>
                    </button>
                    <button
                        onClick={() => window.location.href = '/pipeline'}
                        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-800/30 p-4 transition-all hover:border-slate-700 hover:bg-slate-800/50"
                    >
                        <Zap className="h-5 w-5 text-cyan-400" />
                        <span className="text-xs font-medium text-slate-300">Ver Pipeline</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
