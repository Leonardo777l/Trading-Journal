"use client";

import { Card } from "@/components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useTradeStore } from "@/store/useTradeStore";
import { useMemo } from "react";

export function DailyPnLChart() {
    const trades = useTradeStore((state) => state.trades);

    const data = useMemo(() => {
        if (trades.length === 0) return [
            { day: 'Lun', pnl: 0 },
            { day: 'Mar', pnl: 0 },
            { day: 'Mié', pnl: 0 },
            { day: 'Jue', pnl: 0 },
            { day: 'Vie', pnl: 0 },
        ];

        // Group by day of week
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const pnlByDay = { 'Lun': 0, 'Mar': 0, 'Mié': 0, 'Jue': 0, 'Vie': 0 }; // Focus on weekdays

        trades.forEach(t => {
            const date = new Date(t.date);
            const dayName = days[date.getDay()];
            if (pnlByDay.hasOwnProperty(dayName)) {
                pnlByDay[dayName as keyof typeof pnlByDay] += t.pnl;
            }
        });

        return Object.entries(pnlByDay).map(([day, pnl]) => ({ day, pnl }));
    }, [trades]);

    return (
        <Card className="h-[400px] flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-purple"></span>
                PnL por Día
            </h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis
                            dataKey="day"
                            stroke="#ffffff30"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#ffffff30"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ backgroundColor: '#050505', borderColor: '#ffffff10', borderRadius: '8px' }}
                        />
                        <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#00FF41' : '#FF003C'} fillOpacity={0.8} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
