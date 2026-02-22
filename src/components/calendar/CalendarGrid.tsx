"use client";

import { useMemo, useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Appointment } from "./types";
import { cn } from "@/lib/utils";

interface CalendarGridProps {
    appointments: Appointment[];
    onDateClick: (date: Date) => void;
    onAppointmentClick: (appointment: Appointment) => void;
}

export function CalendarGrid({ appointments, onDateClick, onAppointmentClick }: CalendarGridProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const days = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const goToToday = () => setCurrentMonth(new Date());

    return (
        <div className="flex flex-col h-full bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-white capitalize">
                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                    </h2>
                    <button
                        onClick={goToToday}
                        className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full hover:bg-indigo-500/20 transition-colors"
                    >
                        Hoy
                    </button>
                </div>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={nextMonth} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-800">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                    <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 flex-1">
                {days.map((day: Date, idx: number) => {
                    const dayAppointments = appointments.filter(apt => isSameDay(new Date(apt.date), day));
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = isSameMonth(day, currentMonth);

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => onDateClick(day)}
                            className={cn(
                                "min-h-[120px] p-2 border-slate-800/50 transition-colors cursor-pointer hover:bg-slate-800/30",
                                idx % 7 !== 6 && "border-r",
                                idx < (days.length - 7) && "border-b",
                                !isCurrentMonth && "bg-slate-950/20"
                            )}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className={cn(
                                    "flex items-center justify-center h-7 w-7 text-sm font-medium rounded-full",
                                    isToday ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" :
                                        isCurrentMonth ? "text-slate-300" : "text-slate-600"
                                )}>
                                    {format(day, 'd')}
                                </span>
                            </div>

                            <div className="space-y-1">
                                {dayAppointments.slice(0, 3).map(apt => (
                                    <div
                                        key={apt.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAppointmentClick(apt);
                                        }}
                                        className={cn(
                                            "px-2 py-1 rounded text-[10px] font-medium truncate flex items-center gap-1 border",
                                            apt.status === 'completed'
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : apt.status === 'cancelled'
                                                    ? "bg-slate-800 text-slate-500 border-slate-700/50 line-through"
                                                    : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                        )}
                                    >
                                        <span className="opacity-70">{apt.time}</span>
                                        {apt.title}
                                    </div>
                                ))}
                                {dayAppointments.length > 3 && (
                                    <div className="text-[9px] text-slate-500 px-1 italic">
                                        + {dayAppointments.length - 3} más
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
