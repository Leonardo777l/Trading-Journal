"use client";

import { Card } from "@/components/ui/Card";
import { useTradeStore } from "@/store/useTradeStore";
import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";

export function JournalTable() {
    const trades = useTradeStore((state) => state.trades);

    if (trades.length === 0) {
        return (
            <Card className="p-12 text-center">
                <p className="text-white/50">No hay operaciones registradas. Comienza añadiendo una nueva entrada.</p>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th className="p-4 font-medium text-white/50 uppercase tracking-wider">Fecha</th>
                            <th className="p-4 font-medium text-white/50 uppercase tracking-wider">Cuenta</th>
                            <th className="p-4 font-medium text-white/50 uppercase tracking-wider">Par</th>
                            <th className="p-4 font-medium text-white/50 uppercase tracking-wider">Dir</th>
                            <th className="p-4 font-medium text-white/50 uppercase tracking-wider text-right">RR</th>
                            <th className="p-4 font-medium text-white/50 uppercase tracking-wider text-right">Tamaño ($)</th>
                            <th className="p-4 font-medium text-white/50 uppercase tracking-wider text-right">PnL</th>
                            <th className="p-4 font-medium text-white/50 uppercase tracking-wider text-right">Riesgo</th>
                            <th className="p-4 font-medium text-white/50 uppercase tracking-wider text-right">% ROI</th>
                            <th className="p-4 font-medium text-white/50 uppercase tracking-wider">Comentarios</th>
                            <th className="p-4 font-medium text-white/50 uppercase tracking-wider text-center">Img</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {trades.map((trade) => (
                            <tr
                                key={trade.id}
                                className="group hover:bg-white/5 transition-colors"
                            >
                                <td className="p-4 font-mono text-white/70">
                                    {new Date(trade.date).toLocaleDateString()}
                                </td>
                                <td className="p-4 font-mono text-xs">
                                    <span className="px-2 py-1 rounded bg-white/10 text-white/70 border border-white/5">
                                        {trade.account || "TESTING"}
                                    </span>
                                </td>
                                <td className="p-4 font-bold text-white">{trade.pair}</td>
                                <td className="p-4">
                                    <span className={`flex items-center gap-1 font-bold text-xs ${trade.direction === 'Long' ? 'text-neon-green' : 'text-neon-red'}`}>
                                        {trade.direction === 'Long' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {trade.direction.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4 font-mono text-right text-neon-blue">{trade.rr}R</td>
                                <td className="p-4 font-mono text-right text-white/70">
                                    ${trade.entrySizeUSD?.toLocaleString() || "0"}
                                </td>
                                <td className={`p-4 font-mono font-bold text-right ${trade.pnl > 0 ? 'text-neon-green' : trade.pnl < 0 ? 'text-neon-red' : 'text-white/50'}`}>
                                    {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                                </td>
                                <td className="p-4 font-mono text-right text-neon-red/80">
                                    -${trade.risk?.toFixed(2) || "0.00"}
                                </td>
                                <td className={`p-4 font-mono text-right ${trade.roi > 0 ? 'text-neon-green' : trade.roi < 0 ? 'text-neon-red' : 'text-white/50'}`}>
                                    {trade.roi > 0 ? '+' : ''}{trade.roi?.toFixed(2) || "0.00"}%
                                </td>
                                <td className="p-4 max-w-[200px] truncate text-white/60 text-xs">
                                    {trade.tags.join(", ")} {trade.notes ? `- ${trade.notes}` : ""}
                                </td>
                                <td className="p-4 text-center">
                                    {trade.screenshotUrl ? (
                                        <a
                                            href={trade.screenshotUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex p-2 rounded-lg hover:bg-neon-blue/20 text-neon-blue transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    ) : (
                                        <span className="text-white/20"><Minus className="w-4 h-4 mx-auto" /></span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
