"use client";

import { Card } from "@/components/ui/Card";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";
import { useTradeStore } from "@/store/useTradeStore";
import { useMemo } from "react";

export function StatsCards() {
  const trades = useTradeStore((state) => state.trades);
  const baseAccountSize = useTradeStore((state) => state.baseAccountSize);
  const selectedAccountId = useTradeStore((state) => state.selectedAccountId);

  const stats = useMemo(() => {
    const filteredTrades = selectedAccountId === "ALL"
      ? trades
      : trades.filter(t => t.accountId === selectedAccountId);

    if (filteredTrades.length === 0) return [
      { label: "Net PnL %", value: "0.00%", change: "0%", isPositive: true, icon: Activity },
      { label: "Max Win", value: "0.00%", change: "0%", isPositive: true, icon: TrendingUp },
      { label: "Max Loss", value: "0.00%", change: "0%", isPositive: true, icon: TrendingDown },
      { label: "Cons. Wins", value: "0", change: "0", isPositive: true, icon: Target },
      { label: "Cons. Losses", value: "0", change: "0", isPositive: true, icon: Activity },
    ];

    const totalPnL = filteredTrades.reduce((acc, t) => acc + t.pnl, 0);
    const totalPnLPercent = (totalPnL / baseAccountSize) * 100;

    // Max Win / Max Loss
    const maxWin = Math.max(...filteredTrades.map(t => t.pnl), 0);
    const maxLoss = Math.min(...filteredTrades.map(t => t.pnl), 0);
    const maxWinPercent = (maxWin / baseAccountSize) * 100;
    const maxLossPercent = (maxLoss / baseAccountSize) * 100;

    // Consecutive Wins/Losses
    let maxConsWins = 0;
    let maxConsLosses = 0;
    let currentWins = 0;
    let currentLosses = 0;

    // Sort by date ascending to calculate streaks correctly
    const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedTrades.forEach(t => {
      if (t.pnl > 0) {
        currentWins++;
        currentLosses = 0;
        if (currentWins > maxConsWins) maxConsWins = currentWins;
      } else if (t.pnl < 0) {
        currentLosses++;
        currentWins = 0;
        if (currentLosses > maxConsLosses) maxConsLosses = currentLosses;
      }
    });

    return [
      {
        label: "Net PnL %",
        value: `${totalPnLPercent > 0 ? '+' : ''}${totalPnLPercent.toFixed(2)}%`,
        change: "Total",
        isPositive: totalPnL >= 0,
        icon: Activity
      },
      {
        label: "Max Win %",
        value: `+${maxWinPercent.toFixed(2)}%`,
        change: "Best Trade",
        isPositive: true,
        icon: TrendingUp
      },
      {
        label: "Max Loss %",
        value: `${maxLossPercent.toFixed(2)}%`,
        change: "Worst Trade",
        isPositive: false,
        icon: TrendingDown
      },
      {
        label: "Max Cons. Wins",
        value: maxConsWins.toString(),
        change: "Streak",
        isPositive: true,
        icon: Target
      },
      {
        label: "Max Cons. Losses",
        value: maxConsLosses.toString(),
        change: "Streak",
        isPositive: false,
        icon: Activity
      }
    ];
  }, [trades, baseAccountSize]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden group hover:shadow-2xl hover:shadow-neon-blue/10 transition-all duration-500 border-opacity-50">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 group-hover:scale-110" />

          <div className="flex justify-between items-start mb-2 relative z-10">
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <h3 className={`text-2xl font-bold font-mono tracking-tight ${stat.isPositive ? 'text-neon-green/90 drop-shadow-[0_0_8px_rgba(41,255,166,0.3)]' : 'text-neon-red/90 drop-shadow-[0_0_8px_rgba(255,46,99,0.3)]'}`}>
                {stat.value}
              </h3>
            </div>
            <div className={`p-2.5 rounded-xl backdrop-blur-md border border-white/5 ${stat.isPositive ? 'bg-neon-green/10 text-neon-green shadow-[0_0_10px_rgba(41,255,166,0.1)]' : 'bg-neon-red/10 text-neon-red shadow-[0_0_10px_rgba(255,46,99,0.1)]'}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 mt-4">
            <div className={`h-1.5 w-1.5 rounded-full ${stat.isPositive ? 'bg-neon-green animate-pulse' : 'bg-neon-red animate-pulse'}`} />
            <span className="text-xs text-white/30 font-medium">{stat.change}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
