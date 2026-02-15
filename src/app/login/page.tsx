"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Phone, Mail, Lock, User, RefreshCw } from "lucide-react";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;

                if (data.session) {
                    // Si el email de confirmación está desactivado, entramos directo
                    router.push("/");
                    router.refresh();
                } else {
                    alert("¡Cuenta creada con éxito! Supabase aún requiere verificación por email.\n\nPor favor, revisa la sección 'Settings' (no Providers) en Supabase para desactivar 'Confirm email'.");
                }
            }

            // Si es login exitoso, redirigimos (esto ya estaba para isLogin=true)
            if (isLogin) {
                router.push("/");
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
                <div className="text-center">
                    <h1 className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-4xl font-extrabold text-transparent">
                        SetterHQ
                    </h1>
                    <h2 className="mt-4 text-2xl font-bold text-white">
                        {isLogin ? "Welcome back" : "Create your account"}
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        {isLogin
                            ? "Sign in to manage your high-ticket pipeline"
                            : "Start tracking your appointments with ease"}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleAuth}>
                    {error && (
                        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4 rounded-md shadow-sm">
                        {!isLogin && (
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <User className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="block w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-10 pr-3 text-white placeholder-slate-500 ring-indigo-500 focus:border-indigo-500 focus:outline-none focus:ring-2 sm:text-sm"
                                    placeholder="Full Name"
                                />
                            </div>
                        )}

                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Mail className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-10 pr-3 text-white placeholder-slate-500 ring-indigo-500 focus:border-indigo-500 focus:outline-none focus:ring-2 sm:text-sm"
                                placeholder="Email address"
                            />
                        </div>

                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Lock className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-10 pr-3 text-white placeholder-slate-500 ring-indigo-500 focus:border-indigo-500 focus:outline-none focus:ring-2 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
                        >
                            {loading ? (
                                <RefreshCw className="h-5 w-5 animate-spin" />
                            ) : (
                                isLogin ? "Sign in" : "Sign up"
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        {isLogin
                            ? "Don't have an account? Sign up"
                            : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
}
