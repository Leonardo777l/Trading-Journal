"use client";

import { Card } from "@/components/ui/Card";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";
import { useTradeStore } from "@/store/useTradeStore";
import { useMemo } from "react";

export function StatsCards() {
  const trades = useTradeStore((state) => state.trades);

  const stats = useMemo(() => {
    if (trades.length === 0) return [
      { label: "Net PnL", value: "$0.00", change: "0%", isPositive: true, icon: Activity },
      { label: "Win Rate", value: "0%", change: "0%", isPositive: true, icon: Target },
      { label: "Profit Factor", value: "0", change: "0", isPositive: true, icon: TrendingUp },
      { label: "Avg R:R", value: "0", change: "0", isPositive: true, icon: TrendingDown },
    ];

    const totalPnL = trades.reduce((acc, t) => acc + t.pnl, 0);
    const wins = trades.filter(t => t.result === 'Win').length;
    const losses = trades.filter(t => t.result === 'Loss').length;
    const winRate = (wins / trades.length) * 100;

    const grossProfit = trades.filter(t => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0);
    const grossLoss = Math.abs(trades.filter(t => t.pnl < 0).reduce((acc, t) => acc + t.pnl, 0));
    const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

    const avgRR = trades.reduce((acc, t) => acc + t.rr, 0) / trades.length;

    return [
      { label: "PnL Neto", value: `$${totalPnL.toFixed(2)}`, change: "+0%", isPositive: totalPnL >= 0, icon: Activity },
      { label: "Tasa de Acierto", value: `${winRate.toFixed(1)}%`, change: "+0%", isPositive: winRate >= 50, icon: Target },
      { label: "Factor de Beneficio", value: profitFactor.toFixed(2), change: "0", isPositive: profitFactor >= 1.5, icon: TrendingUp },
      { label: "R:R Promedio", value: `1:${avgRR.toFixed(1)}`, change: "0", isPositive: avgRR >= 2, icon: TrendingDown },
    ];
  }, [trades]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden group hover:border-neon-blue/30 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-white/50 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
              <h3 className={`text-2xl font-bold font-mono mt-1 ${stat.isPositive ? 'text-neon-green' : 'text-neon-red'}`}>
                {stat.value}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${stat.isPositive ? 'bg-neon-green/10 text-neon-green' : 'bg-neon-red/10 text-neon-red'}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
          <div className={`absolute bottom-0 left-0 h-1 w-full ${stat.isPositive ? 'bg-neon-green/50' : 'bg-neon-red/50'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        </Card>
      ))}
    </div>
  );
}
