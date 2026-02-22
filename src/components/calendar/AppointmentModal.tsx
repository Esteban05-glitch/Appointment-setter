"use client";

import { useApp } from "@/context/AppContext";
import { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Clock, User, AlignLeft } from "lucide-react";
import { Appointment } from "./types";
import { cn } from "@/lib/utils";

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment?: Appointment | null;
}

export function AppointmentModal({ isOpen, onClose, appointment }: AppointmentModalProps) {
    const { prospects, addAppointment, updateAppointment, deleteAppointment } = useApp();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        prospect_id: "",
        date: new Date().toISOString().split('T')[0],
        time: "10:00",
        duration_minutes: 30,
        status: "scheduled" as Appointment["status"]
    });

    useEffect(() => {
        if (appointment) {
            setFormData({
                title: appointment.title,
                description: appointment.description || "",
                prospect_id: appointment.prospect_id || "",
                date: appointment.date,
                time: appointment.time,
                duration_minutes: appointment.duration_minutes,
                status: appointment.status
            });
        } else {
            setFormData({
                title: "",
                description: "",
                prospect_id: "",
                date: new Date().toISOString().split('T')[0],
                time: "10:00",
                duration_minutes: 30,
                status: "scheduled"
            });
        }
    }, [appointment, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (appointment) {
            await updateAppointment(appointment.id, {
                ...formData,
                prospect_id: formData.prospect_id || null
            } as Partial<Appointment>);
        } else {
            await addAppointment({
                ...formData,
                prospect_id: formData.prospect_id || null
            } as any);
        }
        onClose();
    };

    const handleDelete = async () => {
        if (appointment && confirm("¿Estás seguro de eliminar esta cita?")) {
            await deleteAppointment(appointment.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">
                        {appointment ? "Editar Cita" : "Nueva Cita"}
                    </h2>
                    <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Título</label>
                        <div className="relative">
                            <AlignLeft className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 pr-3 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Ej: Llamada de descubrimiento"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Prospecto (Opcional)</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <select
                                value={formData.prospect_id}
                                onChange={(e) => setFormData({ ...formData, prospect_id: e.target.value })}
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 pr-3 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
                            >
                                <option value="">Sin vincular</option>
                                {prospects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} (@{p.handle})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Fecha</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 pr-3 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Hora</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                <input
                                    type="time"
                                    required
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 pr-3 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Duración (min)</label>
                            <input
                                type="number"
                                value={formData.duration_minutes}
                                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Estado</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="scheduled">Agendada</option>
                                <option value="completed">Completada</option>
                                <option value="cancelled">Cancelada</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Descripción</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-20 resize-none"
                            placeholder="Detalles de la reunión..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        {appointment && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex-1 rounded-lg border border-red-500/50 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
                            >
                                Eliminar
                            </button>
                        )}
                        <button
                            type="submit"
                            className="flex-[2] rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
                        >
                            {appointment ? "Guardar Cambios" : "Crear Cita"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
