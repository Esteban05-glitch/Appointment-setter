"use client";

import { X, Shield, UserPlus, BarChart3, Users, BookOpen } from "lucide-react";

interface DocumentationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DocumentationModal({ isOpen, onClose }: DocumentationModalProps) {
    if (!isOpen) return null;

    const sections = [
        {
            title: "Roles y Permisos",
            icon: Shield,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
            content: [
                { label: "Dueño", desc: "Control total de la agencia. Puede invitar miembros, gestionar facturación y ver todas las métricas." },
                { label: "Administrador", desc: "Gestión completa de prospectos y equipo. Puede invitar miembros y ver analíticas globales." },
                { label: "Setter", desc: "Enfocado en la ejecución. Gestiona sus propios prospectos y ve sus métricas personales." }
            ]
        },
        {
            title: "Asignación de Leads",
            icon: UserPlus,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
            items: [
                "Los Dueños/Admins pueden asignar prospectos a cualquier Setter usando el selector 'Asignar lead a' al crear uno nuevo.",
                "Los prospectos asignados aparecen automáticamente en la columna 'Nuevo Lead' del Setter correspondiente.",
                "Un prospecto solo es visible para el Setter asignado y para los administradores de la agencia."
            ]
        },
        {
            title: "Analíticas y Vistas",
            icon: BarChart3,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            items: [
                "Mi Rendimiento: Muestra tus estadísticas personales (solo los prospectos que tú gestionas).",
                "Vista de Agencia: Muestra el rendimiento global de todo el equipo (disponible para Admins/Owners).",
                "Rendimiento por Miembro: Tabla comparativa para supervisar la efectividad de cada Setter."
            ]
        },
        {
            title: "Colaboración en Equipo",
            icon: Users,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            items: [
                "Notas Compartidas: Cualquier actualización o nota en un prospecto es visible para los administradores en tiempo real.",
                "Citas: Las citas agendadas por los Setters se sincronizan en el calendario global de la agencia.",
                "Filtros: Usa el filtro 'Por Creador' en el tablero Kanban para revisar el trabajo de un miembro específico."
            ]
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <BookOpen className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Guía de la Agencia</h2>
                            <p className="text-sm text-slate-400">Todo lo que necesitas saber para gestionar tu equipo</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    {sections.map((section, idx) => (
                        <section key={idx} className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 ${section.bg} rounded-lg ${section.color}`}>
                                    <section.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-100">{section.title}</h3>
                            </div>

                            <div className="grid gap-3 ml-11">
                                {section.content ? (
                                    <div className="space-y-4">
                                        {section.content.map((item, i) => (
                                            <div key={i} className="flex flex-col gap-1">
                                                <span className="text-sm font-bold text-slate-200">{item.label}</span>
                                                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <ul className="list-disc space-y-3">
                                        {section.items?.map((item, i) => (
                                            <li key={i} className="text-sm text-slate-400 leading-relaxed marker:text-slate-600">
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}
