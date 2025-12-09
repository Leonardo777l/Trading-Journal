"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { useTradeStore } from "@/store/useTradeStore";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function TradingCalendar() {
    const trades = useTradeStore((state) => state.trades);
    const [currentDate, setCurrentDate] = useState(new Date());

    const { days, monthLabel } = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

        // Adjust for Monday start if desired, but standard is usually Sunday 0
        // Let's stick to Sunday start for simplicity or adjust for Monday (1)

        const daysArray = [];

        // Padding for previous month
        for (let i = 0; i < startDayOfWeek; i++) {
            daysArray.push({ day: null, pnl: 0, hasTrades: false });
        }

        // Days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            const currentDayDate = new Date(year, month, i);
            const dateStr = currentDayDate.toDateString();

            // Calculate PnL for this day
            const dayTrades = trades.filter(t => {
                if (!t.date) return false;
                const tradeDate = new Date(t.date);
                return !isNaN(tradeDate.getTime()) && tradeDate.toDateString() === dateStr;
            });

            const pnl = dayTrades.reduce((acc, t) => acc + (Number(t.pnl) || 0), 0);

            daysArray.push({
                day: i,
                pnl,
                hasTrades: dayTrades.length > 0,
                trades: dayTrades.length
            });
        }

        return {
            days: daysArray,
            monthLabel: firstDay.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        };
    }, [currentDate, trades]);

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    return (
        <Card className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-neon-blue"></span>
                    Calendario de Operativa
                </h3>
                <div className="flex items-center gap-2">
                    <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-mono font-bold text-white capitalize min-w-[120px] text-center">
                        {monthLabel}
                    </span>
                    <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                    <div key={d} className="text-center text-xs text-white/30 font-medium uppercase">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2 flex-1">
                {days.map((d, i) => (
                    <div
                        key={i}
                        className={`
              aspect-square rounded-lg border flex flex-col items-center justify-center relative group transition-all
              ${d.day === null ? 'border-transparent' : 'border-white/5 bg-black/20'}
              ${d.hasTrades && d.pnl > 0 ? 'bg-neon-green/5 border-neon-green/30 shadow-[0_0_10px_rgba(0,255,65,0.05)]' : ''}
              ${d.hasTrades && d.pnl < 0 ? 'bg-neon-red/5 border-neon-red/30 shadow-[0_0_10px_rgba(255,0,60,0.05)]' : ''}
              ${d.hasTrades && d.pnl === 0 ? 'bg-white/5' : ''}
            `}
                    >
                        {d.day && (
                            <>
                                <span className={`text-xs font-mono mb-1 ${d.hasTrades ? 'text-white' : 'text-white/30'}`}>
                                    {d.day}
                                </span>
                                {d.hasTrades && (
                                    <span className={`text-[10px] font-bold ${d.pnl >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                                        {d.pnl >= 0 ? '+' : ''}{d.pnl}
                                    </span>
                                )}
                                {d.hasTrades && (
                                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity pointer-events-none border border-white/10 z-10">
                                        <div className="text-center">
                                            <p className="text-xs text-white/50 mb-0.5">{d.trades} Trades</p>
                                            <p className={`text-sm font-bold ${d.pnl >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                                                {d.pnl >= 0 ? '+' : ''}{d.pnl}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
}
