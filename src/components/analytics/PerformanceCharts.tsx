"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line,
} from "recharts";
import { Prospect } from "../pipeline/types";

interface PerformanceChartsProps {
    prospects: Prospect[];
    goals: { monthlyCommission: number; dailyCalls: number };
}

const COLORS = ["#6366f1", "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b"];

export function ConversionRateChart({ prospects }: { prospects: Prospect[] }) {
    const data = [
        { name: "New Leads", value: prospects.filter((p) => p.status === "new_lead").length },
        { name: "Contacted", value: prospects.filter((p) => p.status === "contacted").length },
        { name: "In Conversation", value: prospects.filter((p) => p.status === "conversation").length },
        { name: "Booked", value: prospects.filter((p) => p.status === "booked").length },
        { name: "Closed", value: prospects.filter((p) => p.status === "closed").length },
    ].filter(d => d.value > 0);

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                        itemStyle={{ color: '#f1f5f9' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export function PlatformPerformanceChart({ prospects }: { prospects: Prospect[] }) {
    const platforms = ["instagram", "linkedin", "facebook", "twitter"];
    const data = platforms.map(platform => ({
        name: platform.charAt(0).toUpperCase() + platform.slice(1),
        prospects: prospects.filter(p => p.platform === platform).length,
        booked: prospects.filter(p => p.platform === platform && p.status === "booked").length
    }));

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                        itemStyle={{ color: '#f1f5f9' }}
                    />
                    <Bar dataKey="prospects" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total Leads" />
                    <Bar dataKey="booked" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Booked" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function GoalProgressChart({ prospects, goals }: PerformanceChartsProps) {
    const closedDeals = prospects.filter(p => p.status === "closed");
    const currentCommission = closedDeals.reduce((acc, p) => acc + (p.value || 0), 0) * 0.10;

    const data = [
        { name: "Progress", current: currentCommission, goal: goals.monthlyCommission }
    ];

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data} margin={{ left: 20, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                        itemStyle={{ color: '#f1f5f9' }}
                        formatter={(value) => `$${Number(value).toLocaleString()}`}
                    />
                    <Bar dataKey="goal" fill="#1e293b" radius={[4, 4, 4, 4]} barSize={40} name="Monthly Goal" />
                    <Bar dataKey="current" fill="#10b981" radius={[4, 4, 4, 4]} barSize={40} name="Realized Commission" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
