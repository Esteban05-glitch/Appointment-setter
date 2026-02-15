"use client";

import { useState, useRef, useEffect } from "react";
import { Copy, Check, MessageSquare, Globe, Send, Sparkles, User, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Language = "en" | "es";

const SCRIPTS_DATA = {
    en: [
        {
            category: "Outbound",
            title: "Cold DM Opener",
            content: "Hey [Name], just saw your content on [Topic] and loved your take on X. Connect?",
        },
        {
            category: "Outbound",
            title: "Value Proposition",
            content: "We help coaches scale to $50k/mo without paid ads. Is that something you're focusing on right now?",
        },
        {
            category: "Objection Handling",
            title: "Price Objection",
            content: "Completely understand. If money wasn't an issue, do you feel like this would be the right solution for you?",
        },
        {
            category: "Follow Up",
            title: "Bumping the conversation",
            content: "Hey [Name], just floating this to the top of your inbox. Let me know if you're still interested.",
        },
    ],
    es: [
        {
            category: "Prospección",
            title: "Apertura DM en Frío",
            content: "Hola [Nombre], acabo de ver tu contenido sobre [Tema] y me encantó tu enfoque en X. ¿Conectamos?",
        },
        {
            category: "Prospección",
            title: "Propuesta de Valor",
            content: "Ayudamos a coaches a escalar a $50k/mes sin publicidad pagada. ¿Es algo en lo que te estás enfocando ahora?",
        },
        {
            category: "Manejo de Objeciones",
            title: "Objeción de Precio",
            content: "Te entiendo perfectamente. Si el dinero no fuera un problema, ¿sientes que esta sería la solución correcta para ti?",
        },
        {
            category: "Seguimiento",
            title: "Reviviendo la conversación",
            content: "Hola [Nombre], paso por aquí para que no se pierda el mensaje. Avísame si sigues interesado.",
        },
    ]
};

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function ScriptsPage() {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [lang, setLang] = useState<Language>("en");

    // AI Chat State
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const copyToClipboard = (text: string, index: number | string) => {
        navigator.clipboard.writeText(text);
        if (typeof index === 'number') {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const newUserMessage: Message = { role: "user", content: inputValue };
        setChatMessages(prev => [...prev, newUserMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...chatMessages, newUserMessage]
                })
            });

            const data = await response.json();
            if (data.content) {
                setChatMessages(prev => [...prev, { role: "assistant", content: data.content }]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-full flex-col lg:flex-row gap-8 max-w-[1400px] mx-auto">
            {/* Left: Scripts List */}
            <div className="flex-1 min-w-0">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Scripts & Templates</h2>
                        <p className="text-slate-400">Quick copy-paste responses to speed up your workflow.</p>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-slate-900 p-1 border border-slate-800">
                        <button
                            onClick={() => setLang("en")}
                            className={cn("px-3 py-1.5 text-sm font-medium rounded-md transition-all", lang === "en" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200")}
                        >
                            EN
                        </button>
                        <button
                            onClick={() => setLang("es")}
                            className={cn("px-3 py-1.5 text-sm font-medium rounded-md transition-all", lang === "es" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200")}
                        >
                            ES
                        </button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                    {SCRIPTS_DATA[lang].map((script, index) => (
                        <div key={index} className="group relative rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-all hover:border-slate-700 hover:bg-slate-900">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400">
                                    {script.category}
                                </span>
                                <button
                                    onClick={() => copyToClipboard(script.content, index)}
                                    className="rounded-lg p-2 text-slate-400 opacity-0 bg-slate-800 transition-all hover:text-white group-hover:opacity-100"
                                    title="Copy to clipboard"
                                >
                                    {copiedIndex === index ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>

                            <h3 className="mb-2 font-semibold text-slate-200 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-slate-500" />
                                {script.title}
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed font-mono bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                                "{script.content}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: AI Objection Assistant */}
            <div className="w-full lg:w-[450px] flex flex-col rounded-2xl border border-slate-800 bg-slate-900/30 overflow-hidden h-[600px] lg:h-[calc(100vh-12rem)] sticky top-8">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-500/20 p-2 rounded-lg">
                            <Sparkles className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white leading-none">AI Assistant</h3>
                            <p className="text-[10px] text-indigo-400 mt-1 uppercase font-bold tracking-wider">Objection Specialist</p>
                        </div>
                    </div>
                </div>

                {/* Chat Display */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800"
                >
                    {chatMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6">
                            <div className="bg-slate-800/50 p-4 rounded-full mb-4">
                                <Bot className="h-8 w-8 text-slate-500" />
                            </div>
                            <p className="text-slate-300 font-medium">¿Te pusieron una objeción?</p>
                            <p className="text-slate-500 text-sm mt-2">Dime qué te dijeron y te daré la respuesta perfecta para cerrar la cita.</p>
                        </div>
                    ) : (
                        chatMessages.map((msg, idx) => (
                            <div key={idx} className={cn(
                                "flex flex-col max-w-[85%]",
                                msg.role === "user" ? "ml-auto items-end" : "items-start"
                            )}>
                                <div className={cn(
                                    "px-4 py-2 rounded-2xl text-sm leading-relaxed",
                                    msg.role === "user"
                                        ? "bg-indigo-600 text-white rounded-br-none"
                                        : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700"
                                )}>
                                    {msg.role === "assistant" && (
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-bold text-indigo-400 uppercase">Respuesta sugerida</span>
                                            <button
                                                onClick={() => copyToClipboard(msg.content, `chat-${idx}`)}
                                                className="hover:text-white transition-colors"
                                            >
                                                <Copy className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-slate-500 mt-1 px-1">
                                    {msg.role === "user" ? "Tú" : "Asistente AI"}
                                </span>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-700">
                                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 bg-slate-900/80 border-t border-slate-800">
                    <div className="relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ej: 'Me dicen que es muy caro'..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-500 transition-colors"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 text-center">IA impulsada por llama-3.3-70b-versatile</p>
                </form>
            </div>
        </div>
    );
}
