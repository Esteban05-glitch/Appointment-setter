"use client";

import { useApp } from "@/context/AppContext";
import { useState } from "react";
import { format, isAfter, startOfToday } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, Plus, Clock, User, ArrowRight } from "lucide-react";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { AppointmentModal } from "@/components/calendar/AppointmentModal";
import { Appointment } from "@/components/calendar/types";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
    const { appointments, prospects } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const handleDateClick = (date: Date) => {
        setSelectedAppointment(null);
        setIsModalOpen(true);
    };

    const handleAppointmentClick = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
    };

    const upcomingAppointments = appointments
        .filter(apt => apt.status === 'scheduled' && (isAfter(new Date(apt.date), startOfToday()) || apt.date === format(new Date(), 'yyyy-MM-dd')))
        .slice(0, 5);

    return (
        <div className="flex h-full gap-6">
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Calendario</h1>
                        <p className="mt-2 text-slate-400">Gestiona tus citas y llamadas con prospectos.</p>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedAppointment(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="h-4 w-4" />
                        Nueva Cita
                    </button>
                </div>

                <div className="flex-1 min-h-0">
                    <CalendarGrid
                        appointments={appointments}
                        onDateClick={handleDateClick}
                        onAppointmentClick={handleAppointmentClick}
                    />
                </div>
            </div>

            {/* Right Sidebar - Upcoming */}
            <div className="w-80 flex flex-col gap-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                    <div className="flex items-center gap-2 mb-6 text-indigo-400">
                        <Clock className="h-5 w-5" />
                        <h3 className="font-bold text-slate-200">Próximas Citas</h3>
                    </div>

                    <div className="space-y-4">
                        {upcomingAppointments.length === 0 ? (
                            <p className="text-sm text-slate-500 italic text-center py-4">No tienes citas próximas.</p>
                        ) : (
                            upcomingAppointments.map(apt => {
                                const prospect = prospects.find(p => p.id === apt.prospect_id);
                                return (
                                    <div
                                        key={apt.id}
                                        onClick={() => handleAppointmentClick(apt)}
                                        className="group p-4 rounded-xl border border-slate-800 bg-slate-800/30 hover:bg-slate-800/50 hover:border-slate-700 transition-all cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                                {apt.time}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-medium">
                                                {format(new Date(apt.date), 'd MMM', { locale: es })}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors truncate">
                                            {apt.title}
                                        </h4>
                                        {prospect && (
                                            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 bg-slate-900/50 p-2 rounded-lg">
                                                <User className="h-3 w-3 text-slate-500" />
                                                <span className="truncate">{prospect.name}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Legend or Stats could go here */}
                <div className="rounded-2xl border border-slate-800 bg-indigo-600/5 p-6 border-dashed">
                    <div className="flex items-center gap-2 text-indigo-400 mb-2">
                        <CalendarDays className="h-5 w-5" />
                        <h4 className="font-bold text-sm">Resumen de Citas</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Vincula tus citas a los prospectos para tener un historial completo de interacciones.
                    </p>
                </div>
            </div>

            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                appointment={selectedAppointment}
            />
        </div>
    );
}
