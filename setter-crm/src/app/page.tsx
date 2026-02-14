"use client";

import { useState, useRef, useEffect } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { CommissionCalc } from "@/components/dashboard/CommissionCalc";
import { Phone, CalendarCheck, DollarSign, TrendingUp } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { AddProspectModal } from "@/components/pipeline/AddProspectModal";
import { Prospect } from "@/components/pipeline/types";
import { useRouter } from "next/navigation";

import { FollowUpWidget } from "@/components/dashboard/FollowUpWidget";

export default function Dashboard() {
  const { prospects, totalCalls, logCall, addProspect, goals, userProfile } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startLogging = () => {
    logCall();
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        logCall();
      }, 100);
    }, 500);
  };

  const stopLogging = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopLogging();
  }, []);

  // Calculate metrics
  const appointmentsSet = prospects.filter(p => p.status === "booked").length;
  const closedDeals = prospects.filter(p => p.status === "closed");
  const closedCount = closedDeals.length;

  // Close Rate = (Closed / Total Calls) * 100
  const closeRate = totalCalls > 0 ? Math.round((closedCount / totalCalls) * 100) : 0;

  // Est. Commission (Assuming 10% of deal value for closed + booked? Or just closed?)
  // Let's use Closed (pipeline value) for realized.
  const pipelineValue = closedDeals.reduce((acc, p) => acc + (p.value || 0), 0);
  const estCommission = pipelineValue * 0.10; // 10% commission rate assumption

  const handleAddProspect = (newProspectData: Omit<Prospect, "id" | "lastContact" | "status">) => {
    const newProspect: Prospect = {
      id: Math.random().toString(36).substr(2, 9),
      ...newProspectData,
      status: "new_lead",
      lastContact: new Date().toISOString(),
    };
    addProspect(newProspect);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white capitalize">Welcome back, {userProfile.name}</h2>
        <p className="mt-2 text-slate-400">Here's what's happening with your pipeline today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Calls"
          value={totalCalls.toString()}
          trend={`vs Goal: ${goals.dailyCalls}`}
          trendUp={totalCalls >= goals.dailyCalls}
          icon={Phone}
          color="indigo"
        />
        <StatCard
          label="Appointments Set"
          value={appointmentsSet.toString()}
          trend="+8%"
          trendUp={true}
          icon={CalendarCheck}
          color="cyan"
        />
        <StatCard
          label="Close Rate"
          value={`${closeRate}%`}
          trend={closeRate > 30 ? "+2%" : "-5%"}
          trendUp={closeRate > 30}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          label="Est. Commission"
          value={`$${estCommission.toLocaleString()}`}
          trend={`Goal: $${goals.monthlyCommission.toLocaleString()}`}
          trendUp={estCommission >= goals.monthlyCommission}
          icon={DollarSign}
          color="emerald"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <CommissionCalc />
        </div>

        <div className="space-y-6 lg:col-span-3">
          <FollowUpWidget />

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="text-lg font-medium text-slate-200">Quick Actions</h3>
            <div className="mt-4 space-y-4">
              <button
                onMouseDown={startLogging}
                onMouseUp={stopLogging}
                onMouseLeave={stopLogging}
                onTouchStart={startLogging}
                onTouchEnd={stopLogging}
                className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-4 transition-colors hover:bg-slate-700 active:bg-slate-600 select-none"
              >
                <span className="font-medium text-slate-300">Log New Call</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">+1 Call</span>
                  <Phone className="h-5 w-5 text-indigo-400" />
                </div>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-4 transition-colors hover:bg-slate-700"
              >
                <span className="font-medium text-slate-300">Add Prospect</span>
                <CalendarCheck className="h-5 w-5 text-cyan-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddProspectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddProspect}
      />
    </div>
  );
}
