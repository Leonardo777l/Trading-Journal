import { JournalTable } from "@/components/journal/JournalTable";

export default function JournalPage() {
    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Diario de <span className="text-neon-purple">Trading</span>
                    </h1>
                    <p className="text-white/50 mt-2">Revisa tu rendimiento pasado y ejecución.</p>
                </div>
            </header>

            <JournalTable />
        </div>
    );
}
