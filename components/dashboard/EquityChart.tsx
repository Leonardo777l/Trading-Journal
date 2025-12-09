"use client";

import { Card } from "@/components/ui/Card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { name: 'Jan', value: 10000 },
    { name: 'Feb', value: 12500 },
    { name: 'Mar', value: 11000 },
    { name: 'Apr', value: 15000 },
    { name: 'May', value: 14500 },
    { name: 'Jun', value: 18000 },
    { name: 'Jul', value: 22000 },
];

export function EquityChart() {
    return (
        <Card className="h-[400px] flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-blue"></span>
                Curva de Equidad
            </h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="name"
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
                            contentStyle={{ backgroundColor: '#050505', borderColor: '#ffffff10', borderRadius: '8px' }}
                            itemStyle={{ color: '#00F0FF' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#00F0FF"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
