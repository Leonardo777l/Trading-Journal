import { TradeForm } from "@/components/trade/TradeForm";

export default function EntryPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    Registrar Nueva <span className="text-neon-green">Operación</span>
                </h1>
                <p className="text-white/50 mt-2">Registra los detalles de ejecución y análisis.</p>
            </header>

            <TradeForm />
        </div>
    );
}
