"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTradeStore } from "@/store/useTradeStore";
import { Save } from "lucide-react";

export function TradeForm() {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().slice(0, 16),
        pair: "",
        direction: "Long" as "Long" | "Short",
        entrySizeUSD: "", // Nuevo
        riskUSD: "",      // Nuevo
        pnlUSD: "",       // Nuevo
        account: "TESTING", // Valor por defecto
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
    const { accounts } = useTradeStore();

    // Auto-calculate logic
    useEffect(() => {
        const risk = parseFloat(formData.riskUSD);
        const pnl = parseFloat(formData.pnlUSD);

        if (isNaN(risk) || isNaN(pnl)) return;

        // RR = PnL / Risk (Absolute values for calculation context)
        // If PnL is positive, RR is Reward/Risk. If negative, it shows loss ratio.
        // Standard convention: RR is usually Reward:Risk potential. 
        // Here we calculate Realized RR.
        const rr = risk === 0 ? 0 : Math.abs(pnl) / risk;
        const realizedRR = pnl >= 0 ? rr : -rr;

        // ROI Calculation
        const selectedAccount = accounts.find(a => a.name === formData.account);
        const accountBalance = selectedAccount ? selectedAccount.balance : 100000;
        const roi = (pnl / accountBalance) * 100;

        let result = "Breakeven";
        if (pnl > 0) result = "Win";
        if (pnl < 0) result = "Loss";

        setCalculations({
            rr: parseFloat(realizedRR.toFixed(2)),
            roi: parseFloat(roi.toFixed(2)),
            result,
        });
    }, [formData, accounts]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newTrade = {
            id: crypto.randomUUID(),
            ...formData,
            entrySizeUSD: parseFloat(formData.entrySizeUSD),
            risk: parseFloat(formData.riskUSD),
            pnl: parseFloat(formData.pnlUSD),
            tags: formData.tags.split(",").map(t => t.trim()),
            ...calculations,
            result: calculations.result as "Win" | "Loss" | "Breakeven",
        };

        addTrade(newTrade);
        console.log("Trade submitted", newTrade);
        alert("¡Operación registrada con éxito!");
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-green"></span>
                Nueva Operación
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Fila 1: Fecha, Cuenta, Par, Dirección */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Input label="Fecha" type="datetime-local" name="date" value={formData.date} onChange={handleChange} />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-foreground/60 font-mono uppercase tracking-wider">Cuenta</label>
                        <div className="relative">
                            <select
                                name="account"
                                value={formData.account}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-neon-blue/50 appearance-none"
                            >
                                {accounts.length > 0 ? (
                                    accounts.map(acc => (
                                        <option key={acc.id} value={acc.name}>{acc.name}</option>
                                    ))
                                ) : (
                                    <option value="DEFAULT">Default Account</option>
                                )}
                            </select>
                            <div className="absolute right-3 top-3 pointer-events-none">
                                <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <Input label="Par" placeholder="EURUSD" name="pair" value={formData.pair} onChange={handleChange} className="uppercase" />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-foreground/60 font-mono uppercase tracking-wider">Dirección</label>
                        <div className="flex gap-2 h-[42px]">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, direction: "Long" })}
                                className={`flex-1 rounded-lg font-bold text-xs transition-all ${formData.direction === "Long" ? "bg-neon-green text-black" : "bg-white/5 text-white/50"}`}
                            >
                                LARGO
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, direction: "Short" })}
                                className={`flex-1 rounded-lg font-bold text-xs transition-all ${formData.direction === "Short" ? "bg-neon-red text-white" : "bg-white/5 text-white/50"}`}
                            >
                                CORTO
                            </button>
                        </div>
                    </div>
                </div>

                {/* Fila 2: Valores Monetarios (NUEVO) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                        label="Tamaño Entrada ($)"
                        type="number"
                        name="entrySizeUSD"
                        value={formData.entrySizeUSD}
                        onChange={handleChange}
                        placeholder="Ej. 1000"
                    />
                    <Input
                        label="Riesgo ($)"
                        type="number"
                        name="riskUSD"
                        value={formData.riskUSD}
                        onChange={handleChange}
                        placeholder="Ej. 100"
                    />
                    <Input
                        label="Ganancia/Pérdida Final ($)"
                        type="number"
                        name="pnlUSD"
                        value={formData.pnlUSD}
                        onChange={handleChange}
                        placeholder="Ej. 200 o -100"
                    />
                </div>

                {/* Fila 3: Resultados Calculados */}
                <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div>
                        <p className="text-xs text-white/50 uppercase mb-1">R:R Realizado</p>
                        <p className={`text-lg font-mono ${calculations.rr >= 0 ? "text-neon-blue" : "text-neon-red"}`}>
                            {calculations.rr}R
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-white/50 uppercase mb-1">% Cuenta (ROI)</p>
                        <p className={`text-lg font-mono ${calculations.roi >= 0 ? "text-neon-green" : "text-neon-red"}`}>
                            {calculations.roi >= 0 ? "+" : ""}{calculations.roi}%
                        </p>
                    </div>
                </div>

                {/* Fila 4: Detalles Adicionales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Comentarios / Estrategia" placeholder="FIBONACCI, Reversal..." name="tags" value={formData.tags} onChange={handleChange} />
                    <Input label="Enlace de la Operación (Imagen)" placeholder="https://..." name="screenshotUrl" value={formData.screenshotUrl} onChange={handleChange} />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-foreground/60 font-mono uppercase tracking-wider">Notas Adicionales</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-white/20 focus:outline-none focus:border-neon-blue/50 focus:shadow-[0_0_10px_rgba(0,240,255,0.1)] transition-all h-24 resize-none"
                        placeholder="Detalles técnicos, psicología..."
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                    <Button variant="ghost" type="button">Cancelar</Button>
                    <Button variant="primary" type="submit">
                        <Save className="w-4 h-4" />
                        Guardar Operación
                    </Button>
                </div>
            </form>
        </Card>
    );
}

