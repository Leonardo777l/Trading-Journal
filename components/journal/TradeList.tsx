"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useAuthStore } from "@/store/useAuthStore"
import { useJournalStore } from "@/store/useJournalStore"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { AddTradeDialog } from "./AddTradeDialog"
import { ImportTradesDialog } from "./ImportTradesDialog"

export function TradeList() {
    const { user } = useAuthStore()
    const { activeAccountId, trades, setTrades } = useJournalStore()
    const supabase = createClient()

    useEffect(() => {
        if (!user || !activeAccountId) {
            setTrades([])
            return
        }

        async function fetchTrades() {
            const { data } = await supabase
                .from("trades")
                .select("*")
                .eq("account_id", activeAccountId!)
                .order("entry_date", { ascending: false })

            if (data) setTrades(data)
        }

        fetchTrades()
    }, [user, activeAccountId, setTrades, supabase])

    if (!activeAccountId) {
        return (
            <div className="text-center py-10 text-gray-500">
                Select an account to view and log trades.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Journal</h3>
                <AddTradeDialog />
            </div>

            <div className="rounded-md border border-[#27272a] bg-[#121212]">
                <Table>
                    <TableHeader className="bg-[#0a0a0a]">
                        <TableRow className="border-[#27272a] hover:bg-[#0a0a0a]">
                            <TableHead className="text-gray-400">Date</TableHead>
                            <TableHead className="text-gray-400">Symbol</TableHead>
                            <TableHead className="text-gray-400">Direction</TableHead>
                            <TableHead className="text-gray-400">Status</TableHead>
                            <TableHead className="text-gray-400">Lot</TableHead>
                            <TableHead className="text-gray-400">Net PnL ($)</TableHead>
                            <TableHead className="text-right text-gray-400">Comm ($)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {trades.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                                    No trades logged yet. Start journaling!
                                </TableCell>
                            </TableRow>
                        ) : (
                            trades.map((trade) => (
                                <TableRow key={trade.id} className="border-[#27272a] hover:bg-[#1e1e1e]">
                                    <TableCell className="font-mono text-xs text-gray-400">
                                        {new Date(trade.entry_date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="font-bold text-white">{trade.symbol}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-0.5 rounded text-xs ${trade.direction === 'Long' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                            }`}>
                                            {trade.direction}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`font-medium ${trade.status === 'Win' ? 'text-green-500' :
                                            trade.status === 'Loss' ? 'text-red-500' :
                                                'text-blue-500'
                                            }`}>
                                            {trade.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-gray-400 font-mono">
                                        {trade.lot_size?.toFixed(2) || '-'}
                                    </TableCell>
                                    <TableCell className={`text-left font-mono ${trade.net_pnl > 0 ? 'text-green-500' : trade.net_pnl < 0 ? 'text-red-500' : 'text-gray-400'
                                        }`}>
                                        {trade.net_pnl > 0 ? '+' : ''}{trade.net_pnl.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right text-gray-500 font-mono">
                                        {trade.commission ? `-${trade.commission.toFixed(2)}` : '0.00'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
