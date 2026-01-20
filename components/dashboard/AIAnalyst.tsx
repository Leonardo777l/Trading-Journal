"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Bot, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useTradeStore } from "@/store/useTradeStore";
import { generateTradingAnalysis } from "@/actions/ai-actions";

export function AIAnalyst() {
    const { trades, selectedAccountId, accounts } = useTradeStore();
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setLoading(true);
        setError(null);
        setAnalysis(null);

        // Filter trades based on selection
        const filteredTrades = selectedAccountId === "ALL"
            ? trades
            : trades.filter(t => t.accountId === selectedAccountId);

        const accountName = selectedAccountId === "ALL"
            ? "All Accounts"
            : accounts.find(a => a.id === selectedAccountId)?.name || "Unknown Account";

        try {
            const result = await generateTradingAnalysis(filteredTrades, accountName);

            if (result.success && result.analysis) {
                setAnalysis(result.analysis);
            } else {
                setError(result.error || "Something went wrong.");
            }
        } catch (err) {
            setError("Failed to connect to AI service.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full relative overflow-hidden border-neon-blue/20 bg-gradient-to-br from-black/80 to-[#1a1f35] shadow-[0_0_40px_rgba(0,224,255,0.05)]">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-neon-blue/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-8 p-6 relative z-10">
                {/* Header / Action Area */}
                <div className="flex-shrink-0 flex flex-col items-start gap-4 min-w-[240px] border-r border-white/5 pr-6">
                    <div className="flex items-center gap-3 text-neon-blue mb-2">
                        <div className="p-2.5 bg-neon-blue/10 rounded-xl shadow-[0_0_15px_rgba(0,224,255,0.2)]">
                            <Bot className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold font-mono tracking-tight text-white">AI Mentor</h3>
                    </div>

                    <p className="text-sm text-white/60 leading-relaxed font-light">
                        Obtén un análisis profesional de tu psicología y ejecución basado en tus operaciones recientes.
                    </p>

                    <Button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="w-full mt-2 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 hover:from-neon-blue/30 hover:to-neon-purple/30 text-white border border-white/10 rounded-xl py-6 transition-all duration-300 shadow-[0_0_20px_rgba(0,224,255,0.1)] hover:shadow-[0_0_30px_rgba(0,224,255,0.2)] group"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-3 animate-spin text-neon-blue" />
                                <span className="font-mono text-neon-blue animate-pulse">ANALIZANDO...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-3 text-neon-accent group-hover:scale-110 transition-transform" />
                                <span className="font-mono tracking-widest font-bold">ANALIZAR PORTFOLIO</span>
                            </>
                        )}
                    </Button>
                </div>

                {/* Content Area */}
                <div className="flex-grow flex items-center min-h-[180px]">
                    {error && (
                        <div className="flex items-center gap-3 text-neon-red bg-neon-red/5 border border-neon-red/20 p-4 rounded-2xl w-full backdrop-blur-sm">
                            <AlertCircle className="w-6 h-6" />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    {!analysis && !loading && !error && (
                        <div className="flex flex-col items-center justify-center w-full text-white/10 py-8">
                            <Bot className="w-16 h-16 mb-4 opacity-50 stroke-[1]" />
                            <p className="text-sm font-mono tracking-widest uppercase">Esperando datos de trading...</p>
                        </div>
                    )}

                    {analysis && (
                        <div className="prose prose-invert prose-sm max-w-none w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Analysis Content with Premium Typography */}
                            <div className="space-y-3 font-light text-white/90 leading-7">
                                {analysis.split('\n').map((line, i) => (
                                    <p key={i} className={`${line.includes('**') ? 'text-neon-blue font-medium drop-shadow-[0_0_8px_rgba(0,224,255,0.3)]' : ''}`}>
                                        {line.replace(/\*\*/g, '')}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
