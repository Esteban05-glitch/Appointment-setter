"use client";

import Link from "next/link";
import {
    LayoutDashboard,
    KanbanSquare,
    BarChart3,
    CalendarDays,
    ChevronRight,
    ArrowRight,
    CheckCircle2,
    Shield
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function LandingPage() {
    const { user } = useApp();

    return (
        <div className="flex min-h-screen flex-col bg-slate-950">
            {/* Navigation */}
            <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500">
                            <LayoutDashboard className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">SetterHQ</span>
                    </div>

                    <div className="flex items-center gap-6">
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-400"
                            >
                                Entrar al Panel
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-white/20"
                            >
                                Iniciar Sesión
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative flex flex-1 flex-col items-center justify-center px-6 pt-32 pb-20 text-center lg:px-8">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[120px]"></div>

                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400 mb-8">
                    <Shield className="h-3 w-3" />
                    El CRM #1 para Appointment Setters de High-Ticket
                </div>

                <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-8xl">
                    Domina tu Pipeline con <br />
                    <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">Precisión Absoluta</span>
                </h1>

                <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">
                    SetterHQ es la central de operaciones diseñada específicamente para setters que buscan escalar su rendimiento. Gestión visual, analíticas en tiempo real y colaboración de agencia en un solo lugar.
                </p>

                <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link
                        href="/login"
                        className="group relative inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-base font-bold text-white transition-all hover:bg-indigo-500 hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
                    >
                        Empieza Gratis Ahora
                        <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                        href="#features"
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/50 px-8 py-4 text-base font-bold text-white transition-all hover:bg-slate-800"
                    >
                        Ver Características
                    </Link>
                </div>

                {/* Dashboard Preview Mockup */}
                <div className="mt-20 w-full max-w-5xl px-4 lg:px-0">
                    <div className="relative rounded-2xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur shadow-2xl overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                            <div className="flex gap-1.5">
                                <div className="h-3 w-3 rounded-full bg-red-500/50"></div>
                                <div className="h-3 w-3 rounded-full bg-yellow-500/50"></div>
                                <div className="h-3 w-3 rounded-full bg-green-500/50"></div>
                            </div>
                            <div className="mx-auto h-4 w-64 rounded-full bg-white/5"></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 space-y-4">
                                <div className="h-40 rounded-xl bg-white/5 animate-pulse"></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-24 rounded-xl bg-white/5 animate-pulse"></div>
                                    <div className="h-24 rounded-xl bg-white/5 animate-pulse" style={{ animationDelay: '200ms' }}></div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-full rounded-xl bg-white/5 animate-pulse" style={{ animationDelay: '400ms' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative py-24 lg:py-32 px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Todo lo que necesitas para <span className="text-indigo-400">romper récords</span>
                        </h2>
                        <p className="mt-4 text-slate-400">Herramientas profesionales diseñadas por setters, para setters.</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {/* Feature 1 */}
                        <div className="group relative rounded-3xl border border-slate-800 bg-slate-900/50 p-8 transition-all hover:border-indigo-500/50 hover:bg-slate-900">
                            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 transition-transform group-hover:scale-110">
                                <KanbanSquare className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">Pipeline Visual</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Gestiona tus prospectos con un sistema Kanban intuitivo. Nunca pierdas el hilo de una conversación ganadora.
                            </p>
                            <div className="mt-6 flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Arrastra y suelta
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Prioridades claras
                                </div>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="group relative rounded-3xl border border-slate-800 bg-slate-900/50 p-8 transition-all hover:border-cyan-500/50 hover:bg-slate-900">
                            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 transition-transform group-hover:scale-110">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">Analíticas Avanzadas</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Mide tu rendimiento con precisión. Visualiza conversiones, ROI por plataforma y actividad del equipo.
                            </p>
                            <div className="mt-6 flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Gráficos interactivos
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Reportes de agencia
                                </div>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="group relative rounded-3xl border border-slate-800 bg-slate-900/50 p-8 transition-all hover:border-purple-500/50 hover:bg-slate-900">
                            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 transition-transform group-hover:scale-110">
                                <CalendarDays className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">Calendario Integrado</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Sincroniza tus citas y seguimientos sin salir de la plataforma. El tiempo es dinero, gestiónalo bien.
                            </p>
                            <div className="mt-6 flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Vista mensual/semanal
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Recordatorios rápidos
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto border-t border-white/5 py-12 px-6 lg:px-8">
                <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500">
                            <LayoutDashboard className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white">SetterHQ</span>
                    </div>
                    <p className="text-sm text-slate-500">
                        &copy; 2026 SetterHQ. Diseñado para la excelencia en el Appointment Setting.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/login" className="text-sm text-slate-500 hover:text-white transition-colors">Login</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
