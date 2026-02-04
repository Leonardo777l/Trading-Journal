"use client"

import { useMemo } from "react"
import { useJournalStore } from "@/store/useJournalStore"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MonthlyAnalysis() {
    const { trades } = useJournalStore()

    const data = useMemo(() => {
        if (!trades.length) return []

        const monthly: { [key: string]: number } = {}

        trades.forEach(t => {
            const date = new Date(t.entry_date)
            const key = date.toLocaleString('default', { month: 'short', year: '2-digit' }) // e.g. "Jan 26"

            if (!monthly[key]) monthly[key] = 0
            monthly[key] += t.net_pnl
        })

        // Sort keys chronologically? 'Jan 26' is hard to sort string-wise.
        // Better to use YYYY-MM for sorting then format for display.
        const sortedKeys = Object.keys(monthly).sort((a, b) => {
            // Quick hack sort: assume format "Mon YY"
            // Actually, let's just rely on insertion order if we iterate chronologically, 
            // but trades might not be sorted.
            // Let's re-aggregate with better keys
            return 0
        })

        // Robust Re-Aggregation
        const map = new Map<string, number>()
        const sortedTrades = [...trades].sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime())

        sortedTrades.forEach(t => {
            const d = new Date(t.entry_date)
            const label = d.toLocaleString('default', { month: 'short', year: '2-digit' })
            const current = map.get(label) || 0
            map.set(label, current + t.net_pnl)
        })

        return Array.from(map.entries()).map(([name, value]) => ({ name, value }))

    }, [trades])

    if (!data.length) return null

    return (
        <Card className="bg-[#121212] border-[#27272a] col-span-1">
            <CardHeader>
                <CardTitle className="text-white">Monthly Returns</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#52525b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#52525b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: '#27272a', opacity: 0.5 }}
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#22c55e' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
