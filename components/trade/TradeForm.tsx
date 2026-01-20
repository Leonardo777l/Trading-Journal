"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTradeStore } from "@/store/useTradeStore";
import { Save, Calculator } from "lucide-react";
import { LotSizeCalculator } from "@/components/tools/LotSizeCalculator";

export function TradeForm() {
    const [showCalculator, setShowCalculator] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().slice(0, 16),
        pair: "",
        direction: "Long" as "Long" | "Short",

        // New Fields as Strings for Input
        entryPrice: "",
        exitPrice: "",
        lotSize: "",
        pips: "",
        commission: "",
        exitReason: "Manual", // TP, SL, BE, Manual

        entrySizeUSD: "",
        riskUSD: "",
        pnlUSD: "",
        account: "TESTING",
        tags: "",
        screenshotUrl: "",
        notes: "",
    });

    const [calculations, setCalculations] = useState({
        rr: 0,
        roi: 0,
        result: "Breakeven",
    });

    const addTrade = useTradeStore((state) => state.addTrade);
    const { accounts, baseAccountSize } = useTradeStore();

    // Auto-calculate Pips if prices change
    useEffect(() => {
        const entry = parseFloat(formData.entryPrice);
        const exit = parseFloat(formData.exitPrice);

        if (!isNaN(entry) && !isNaN(exit) && formData.pair) {
            let multiplier = 10000; // Standard pairs
            if (formData.pair.toUpperCase().includes("JPY")) multiplier = 100;

            let pips = 0;
            if (formData.direction === "Long") {
                pips = (exit - entry) * multiplier;
            } else {
                pips = (entry - exit) * multiplier;
            }
            setFormData(prev => ({ ...prev, pips: pips.toFixed(1) }));
        }
    }, [formData.entryPrice, formData.exitPrice, formData.pair, formData.direction]);

    // Auto-calculate Commission ($7 per lot standard)
    useEffect(() => {
        const lots = parseFloat(formData.lotSize);
        if (!isNaN(lots)) {
            const calculatedCommission = (lots * 7).toFixed(2);
            setFormData(prev => ({ ...prev, commission: calculatedCommission }));
        }
    }, [formData.lotSize]);

    // Financial calculations
    useEffect(() => {
        const risk = parseFloat(formData.riskUSD);
        const pnl = parseFloat(formData.pnlUSD);

        if (isNaN(risk) || isNaN(pnl)) return;

        const rr = risk === 0 ? 0 : Math.abs(pnl) / risk;
        const realizedRR = pnl >= 0 ? rr : -rr;

        // Use selected account balance or base
        const selectedAccount = accounts.find(a => a.name === formData.account);
        const balance = selectedAccount ? selectedAccount.balance : baseAccountSize;
        const roi = (pnl / balance) * 100;

        let result = "Breakeven";
        if (pnl > 0) result = "Win";
        if (pnl < 0) result = "Loss";

        setCalculations({
            rr: parseFloat(realizedRR.toFixed(2)),
            roi: parseFloat(roi.toFixed(2)),
            result,
        });
    }, [formData.riskUSD, formData.pnlUSD, formData.account, accounts, baseAccountSize]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleApplyLots = (lots: number) => {
        setFormData(prev => ({ ...prev, lotSize: lots.toString() }));
        setShowCalculator(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newTrade = {
            id: crypto.randomUUID(),
            ...formData,

            // Numeric conversions
            entryPrice: formData.entryPrice ? parseFloat(formData.entryPrice) : null,
            exitPrice: formData.exitPrice ? parseFloat(formData.exitPrice) : null,
            lotSize: formData.lotSize ? parseFloat(formData.lotSize) : null,
            pips: formData.pips ? parseFloat(formData.pips) : null,
            commission: formData.commission ? parseFloat(formData.commission) : null,

            entrySizeUSD: parseFloat(formData.entrySizeUSD) || 0,
            risk: parseFloat(formData.riskUSD) || 0,
            pnl: parseFloat(formData.pnlUSD) || 0,

            tags: formData.tags.split(",").map(t => t.trim()),
            ...calculations,
            // Ensure result matches explicitly if provided, else calc
            result: calculations.result as "Win" | "Loss" | "Breakeven",
        };

        addTrade(newTrade);
        // Reset form optional?
        alert("¡Operación registrada con éxito!");
    };

    return (
        <Card className="w-full max-w-4xl mx-auto relative overflow-hidden border-t border-white/10 shadow-[0_0_50px_rgba(0,224,255,0.05)]">
            {showCalculator && <LotSizeCalculator onClose={() => setShowCalculator(false)} onApply={handleApplyLots} />}

            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-50" />

            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3 pl-2">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-green"></span>
                </span>
                <span className="tracking-wide font-mono">NEW TRADE ENTRY</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Row 1: Core Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Input label="Fecha" type="datetime-local" name="date" value={formData.date} onChange={handleChange} />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white/50 font-bold uppercase tracking-widest pl-1">Cuenta</label>
                        <div className="relative">
                            <select
                                name="account"
                                value={formData.account}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm font-medium text-white focus:outline-none focus:border-neon-blue/50 focus:shadow-[0_0_15px_rgba(0,224,255,0.15)] appearance-none transition-all"
                            >
                                {accounts.length > 0 ? (
                                    accounts.map(acc => (
                                        <option key={acc.id} value={acc.name} className="bg-[#050505]">{acc.name}</option>
                                    ))
                                ) : (
                                    <option value="DEFAULT" className="bg-[#050505]">Default Account</option>
                                )}
                            </select>
                        </div>
                    </div>

                    <Input label="Par (Forex)" placeholder="EURUSD" name="pair" value={formData.pair} onChange={handleChange} className="uppercase font-bold tracking-widest" />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white/50 font-bold uppercase tracking-widest pl-1">Dirección</label>
                        <div className="flex gap-2 h-[46px]">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, direction: "Long" })}
                                className={`flex-1 rounded-full font-bold text-xs tracking-wider transition-all duration-300 ${formData.direction === "Long" ? "bg-neon-green text-black shadow-[0_0_15px_rgba(41,255,166,0.4)]" : "bg-white/5 text-white/30 hover:bg-white/10"}`}
                            >
                                BUY
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, direction: "Short" })}
                                className={`flex-1 rounded-full font-bold text-xs tracking-wider transition-all duration-300 ${formData.direction === "Short" ? "bg-neon-red text-white shadow-[0_0_15px_rgba(255,46,99,0.4)]" : "bg-white/5 text-white/30 hover:bg-white/10"}`}
                            >
                                SELL
                            </button>
                        </div>
                    </div>
                </div>

                {/* Row 2: Price Action */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Input label="Precio Entrada" type="number" step="0.00001" name="entryPrice" value={formData.entryPrice} onChange={handleChange} placeholder="1.0500" />
                    <Input label="Precio Salida" type="number" step="0.00001" name="exitPrice" value={formData.exitPrice} onChange={handleChange} placeholder="1.0550" />
                    <Input label="Pips (Auto)" type="number" step="0.1" name="pips" value={formData.pips} onChange={handleChange} className="text-neon-blue font-bold" />

                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <Input label="Lotaje" type="number" step="0.01" name="lotSize" value={formData.lotSize} onChange={handleChange} placeholder="1.00" />
                        </div>
                        <Button type="button" variant="secondary" className="mb-[2px] h-[46px] w-[46px] rounded-full bg-white/5 border border-white/10 hover:bg-neon-blue/20 hover:text-neon-blue hover:border-neon-blue/50 transition-all" onClick={() => setShowCalculator(true)}>
                            <Calculator className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Row 3: Financials & Outcome */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Input label="Comisión ($)" type="number" step="0.01" name="commission" value={formData.commission} onChange={handleChange} />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white/50 font-bold uppercase tracking-widest pl-1">Exit Reason</label>
                        <select
                            name="exitReason"
                            value={formData.exitReason}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm font-medium text-white focus:outline-none focus:border-neon-blue/50 focus:shadow-[0_0_15px_rgba(0,224,255,0.15)] appearance-none transition-all"
                        >
                            <option value="TP" className="bg-[#050505]">Take Profit (TP)</option>
                            <option value="SL" className="bg-[#050505]">Stop Loss (SL)</option>
                            <option value="BE" className="bg-[#050505]">Break Even (BE)</option>
                            <option value="Manual" className="bg-[#050505]">Manual Close</option>
                        </select>
                    </div>

                    <Input label="Riesgo ($)" type="number" name="riskUSD" value={formData.riskUSD} onChange={handleChange} />
                    <Input label="PnL ($)" type="number" name="pnlUSD" value={formData.pnlUSD} onChange={handleChange} className={Number(formData.pnlUSD) >= 0 ? "text-neon-green font-bold" : "text-neon-red font-bold"} />
                </div>

                {/* Results Preview */}
                <div className="grid grid-cols-2 gap-6 bg-black/20 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <div className="flex flex-col items-center justify-center border-r border-white/5">
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2">Risk : Reward</p>
                        <p className={`text-3xl font-mono font-bold ${calculations.rr >= 0 ? "text-neon-blue drop-shadow-[0_0_10px_rgba(0,224,255,0.3)]" : "text-neon-red"}`}>
                            {calculations.rr}R
                        </p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2">Growth</p>
                        <p className={`text-3xl font-mono font-bold ${calculations.roi >= 0 ? "text-neon-green drop-shadow-[0_0_10px_rgba(41,255,166,0.3)]" : "text-neon-red"}`}>
                            {calculations.roi >= 0 ? "+" : ""}{calculations.roi}%
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                    <Button variant="ghost" type="button" className="text-white/50 hover:text-white hover:bg-white/5 rounded-full px-6">Cancelar</Button>
                    <Button variant="primary" type="submit" className="bg-neon-blue/10 border border-neon-blue/50 text-neon-blue hover:bg-neon-blue hover:text-black hover:shadow-[0_0_20px_rgba(0,224,255,0.5)] transition-all duration-300 rounded-full px-8 py-6 font-bold tracking-wide">
                        <Save className="w-4 h-4 mr-2" />
                        GUARDAR TRADE
                    </Button>
                </div>
            </form>
        </Card>
    );
}

