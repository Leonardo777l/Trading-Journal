"use client"

import { useMemo } from "react"
import { useJournalStore } from "@/store/useJournalStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Target, Activity, DollarSign, Percent } from "lucide-react"

export function StatsGrid() {
    const { trades } = useJournalStore()

    const stats = useMemo(() => {
        if (!trades.length) return null

        let wins = 0
        let losses = 0
        let grossWin = 0
        let grossLoss = 0
        let maxWinStreak = 0
        let maxLossStreak = 0
        let currentWinStreak = 0
        let currentLossStreak = 0
        let maxLoss = 0
        let netPnl = 0
        let totalComm = 0

        // Sort trades by date ascending for streak calcs
        const sortedTrades = [...trades].sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime())

        sortedTrades.forEach((t) => {
            const pnl = t.gross_pnl
            const net = t.net_pnl
            const comm = t.commission

            netPnl += net
            totalComm += comm

            if (pnl > 0) {
                wins++
                grossWin += pnl
                currentWinStreak++
                currentLossStreak = 0
                maxWinStreak = Math.max(maxWinStreak, currentWinStreak)
            } else if (pnl < 0) {
                losses++
                grossLoss += Math.abs(pnl)
                currentLossStreak++
                currentWinStreak = 0
                maxLossStreak = Math.max(maxLossStreak, currentLossStreak)
                maxLoss = Math.min(maxLoss, pnl) // pnl is negative, so min is "largest" loss
            } else {
                // Break Even
                currentWinStreak = 0
                currentLossStreak = 0
            }
        })

        const totalTrades = trades.length
        const avgWin = wins > 0 ? grossWin / wins : 0
        const avgLoss = losses > 0 ? grossLoss / losses : 0
        const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 100 : 0
        const avgRR = avgLoss > 0 ? avgWin / avgLoss : 0
        const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0

        return {
            winRate,
            profitFactor,
            maxWinStreak,
            maxLossStreak,
            avgRR,
            avgWin,
            maxLoss, // Negative number
            netPnl,
            totalComm
        }
    }, [trades])

    if (!stats) return null

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
                title="Net PnL"
                value={`$${stats.netPnl.toFixed(2)}`}
                icon={<DollarSign className="h-4 w-4 text-green-500" />}
                className={stats.netPnl >= 0 ? "text-green-500" : "text-red-500"}
            />
            <StatCard
                title="Profit Factor"
                value={stats.profitFactor.toFixed(2)}
                icon={<Activity className="h-4 w-4 text-blue-500" />}
            />
            <StatCard
                title="Win Rate"
                value={`${stats.winRate.toFixed(1)}%`}
                icon={<Percent className="h-4 w-4 text-purple-500" />}
            />
            <StatCard
                title="Avg R:R"
                value={stats.avgRR.toFixed(2)}
                icon={<Target className="h-4 w-4 text-orange-500" />}
            />
            <StatCard
                title="Max Win Streak"
                value={stats.maxWinStreak.toString()}
                icon={<TrendingUp className="h-4 w-4 text-green-500" />}
            />
            <StatCard
                title="Max Loss Streak"
                value={stats.maxLossStreak.toString()}
                icon={<TrendingDown className="h-4 w-4 text-red-500" />}
            />
            <StatCard
                title="Avg Win"
                value={`$${stats.avgWin.toFixed(2)}`}
                icon={<TrendingUp className="h-4 w-4 text-green-500" />}
            />
            <StatCard
                title="Max Loss"
                value={`$${stats.maxLoss.toFixed(2)}`}
                icon={<TrendingDown className="h-4 w-4 text-red-500" />}
                className="text-red-500"
            />
        </div>
    )
}

function StatCard({ title, value, icon, className = "" }: { title: string, value: string, icon: React.ReactNode, className?: string }) {
    return (
        <Card className="bg-[#121212] border-[#27272a]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                    {title}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold text-white ${className}`}>{value}</div>
            </CardContent>
        </Card>
    )
}
