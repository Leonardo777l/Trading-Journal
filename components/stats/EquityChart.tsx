"use client"

import { useMemo } from "react"
import { useJournalStore } from "@/store/useJournalStore"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function EquityChart() {
    const { trades } = useJournalStore()

    const data = useMemo(() => {
        if (!trades.length) return []

        const sorted = [...trades].sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime())

        let cumulative = 0
        return sorted.map(t => {
            cumulative += t.net_pnl
            return {
                date: new Date(t.entry_date).toLocaleDateString(),
                value: cumulative,
                commission: t.commission
            }
        })
    }, [trades])

    if (!data.length) return null

    return (
        <Card className="bg-[#121212] border-[#27272a] col-span-2">
            <CardHeader>
                <CardTitle className="text-white">Equity Curve (Net PnL)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis
                                dataKey="date"
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
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#a1a1aa' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, fill: '#3b82f6' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
