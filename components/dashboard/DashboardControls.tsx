"use client";

import { useTradeStore } from "@/store/useTradeStore";
import { Input } from "@/components/ui/Input";
import { Settings, Wallet } from "lucide-react";

export function DashboardControls() {
    const accounts = useTradeStore((state) => state.accounts);
    const selectedAccountId = useTradeStore((state) => state.selectedAccountId);
    const setSelectedAccountId = useTradeStore((state) => state.setSelectedAccountId);
    const baseAccountSize = useTradeStore((state) => state.baseAccountSize);
    const setBaseAccountSize = useTradeStore((state) => state.setBaseAccountSize);

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="p-2 bg-neon-blue/10 rounded-lg text-neon-blue">
                    <Wallet className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                    <label className="text-xs text-white/50 uppercase font-mono mb-1">Cuenta Activa</label>
                    <div className="relative">
                        <select
                            value={selectedAccountId}
                            onChange={(e) => setSelectedAccountId(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-lg px-4 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-neon-blue/50 min-w-[200px]"
                        >
                            <option value="ALL">Todas las Cuentas</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="p-2 bg-neon-green/10 rounded-lg text-neon-green">
                    <Settings className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                    <label className="text-xs text-white/50 uppercase font-mono mb-1">Base % Cálculo ($)</label>
                    <input
                        type="number"
                        value={baseAccountSize}
                        onChange={(e) => setBaseAccountSize(Number(e.target.value))}
                        className="bg-black/40 border border-white/10 rounded-lg px-4 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-neon-green/50 w-[150px]"
                    />
                </div>
            </div>
        </div>
    );
}
