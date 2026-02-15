"use client";

import { useState } from "react";
import { DollarSign, Calculator } from "lucide-react";

export function CommissionCalc() {
    const [dealValue, setDealValue] = useState<number | string>(3000);
    const [commissionRate, setCommissionRate] = useState<number | string>(10);
    const [dealsCount, setDealsCount] = useState<number | string>(5);

    const totalCommission = (Number(dealValue || 0) * (Number(commissionRate || 0) / 100)) * Number(dealsCount || 0);

    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center gap-2 mb-6">
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                    <Calculator className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-medium text-slate-200">Commission Calculator</h3>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-400">Avg. Deal Value ($)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <input
                            type="number"
                            value={dealValue}
                            onChange={(e) => setDealValue(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-400">Commission (%)</label>
                        <input
                            type="number"
                            value={commissionRate}
                            onChange={(e) => setCommissionRate(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-400">Deals / Month</label>
                        <input
                            type="number"
                            value={dealsCount}
                            onChange={(e) => setDealsCount(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="mt-6 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 p-4 border border-emerald-500/20">
                    <p className="text-xs font-medium text-emerald-400">Estimated Earnings</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-300">
                        ${totalCommission.toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
