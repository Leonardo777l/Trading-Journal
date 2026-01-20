"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button"; // Check if Button exists or use standard button
import { X, Calculator } from "lucide-react";

export function LotSizeCalculator({ onClose, onApply }: { onClose: () => void, onApply?: (lots: number) => void }) {
    const [balance, setBalance] = useState("10000");
    const [riskPercent, setRiskPercent] = useState("1.0");
    const [stopLoss, setStopLoss] = useState("10");
    const [pair, setPair] = useState("EURUSD");
    const [result, setResult] = useState<number | null>(null);

    const calculate = () => {
        const bal = parseFloat(balance);
        const risk = parseFloat(riskPercent);
        const sl = parseFloat(stopLoss);

        if (!bal || !risk || !sl) return;

        const riskAmount = bal * (risk / 100);

        // Simplified Logic for USD pairs (Standard Lot = $10/pip)
        // For JPY pairs, calculation differs slightly roughly $7-9/pip depending on rate.
        // We will stick to a standard estimation for now.
        let pipValue = 10;
        if (pair.includes("JPY")) pipValue = 7; // Approx
        if (pair.includes("CHF")) pipValue = 11; // Approx

        const lots = riskAmount / (sl * pipValue);
        setResult(lots);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0A0A0B] border border-white/10 rounded-xl w-full max-w-md p-6 relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-6 text-neon-blue">
                    <Calculator className="w-6 h-6" />
                    <h3 className="text-xl font-bold font-mono">Lot Size Calculator</h3>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-white/50 font-mono uppercase">Balance ($)</label>
                            <Input value={balance} onChange={(e) => setBalance(e.target.value)} type="number" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-white/50 font-mono uppercase">Risk (%)</label>
                            <Input value={riskPercent} onChange={(e) => setRiskPercent(e.target.value)} type="number" step="0.1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-white/50 font-mono uppercase">Stop Loss (Pips)</label>
                            <Input value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} type="number" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-white/50 font-mono uppercase">Pair</label>
                            <select
                                value={pair}
                                onChange={(e) => setPair(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-neon-blue/50"
                            >
                                <option value="EURUSD">EURUSD</option>
                                <option value="GBPUSD">GBPUSD</option>
                                <option value="USDJPY">USDJPY</option>
                                <option value="AUDUSD">AUDUSD</option>
                                <option value="USDCAD">USDCAD</option>
                                <option value="GlOBAL">Other (USD Base)</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={calculate}
                        className="w-full bg-neon-blue/10 border border-neon-blue/50 text-neon-blue font-bold py-3 rounded-lg hover:bg-neon-blue/20 transition-all font-mono uppercase tracking-wider"
                    >
                        Calculate
                    </button>

                    {result !== null && (
                        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/5 text-center transition-all animate-in fade-in slide-in-from-bottom-4">
                            <p className="text-sm text-white/50 uppercase mb-1">Standard Lots</p>
                            <p className="text-3xl font-bold text-neon-green font-mono">{result.toFixed(2)}</p>

                            {onApply && (
                                <button
                                    onClick={() => onApply(parseFloat(result.toFixed(2)))}
                                    className="mt-4 text-xs bg-neon-green text-black font-bold py-2 px-4 rounded hover:bg-neon-green/90 transition-colors uppercase"
                                >
                                    Apply to Trade
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
