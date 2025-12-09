"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Download, Upload, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getBackupData, importData } from "@/actions/backup-actions";
import { useTradeStore } from "@/store/useTradeStore";

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const fetchInitialData = useTradeStore((state) => state.fetchInitialData);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            const res = await getBackupData();
            if (res.success && res.data) {
                const jsonString = JSON.stringify(res.data, null, 2);
                const blob = new Blob([jsonString], { type: "application/json" });
                const url = URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = url;
                a.download = `trading-journal-backup-${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error("Export failed", error);
            alert("Error al exportar datos");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm("ADVERTENCIA: Al importar un backup, se BORRARÁN todos los datos actuales y se reemplazarán con los del archivo. ¿Estás seguro?")) {
            e.target.value = ""; // Reset input
            return;
        }

        setIsLoading(true);
        setImportStatus('idle');

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                const res = await importData(json);

                if (res.success) {
                    setImportStatus('success');
                    await fetchInitialData(); // Recargar datos en el store
                    alert("¡Datos restaurados correctamente!");
                } else {
                    setImportStatus('error');
                    alert("Error al importar: " + res.error);
                }
            } catch (error) {
                console.error("Import failed", error);
                setImportStatus('error');
                alert("Error al procesar el archivo. Asegúrate de que es un JSON válido.");
            } finally {
                setIsLoading(false);
                if (e.target) e.target.value = ""; // Reset input
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                    Configuración y <span className="text-neon-blue">Backup</span>
                </h1>
                <p className="text-white/50">
                    Gestiona tus datos, exporta copias de seguridad y restaura información.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* EXPORTAR */}
                <Card className="space-y-4 border-neon-blue/20">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-neon-blue/10 rounded-lg text-neon-blue">
                            <Download className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Exportar Datos</h2>
                    </div>
                    <p className="text-white/60 text-sm">
                        Descarga una copia completa de tus Cuentas y Operaciones en formato JSON. Guarda este archivo en un lugar seguro.
                    </p>
                    <Button
                        onClick={handleExport}
                        disabled={isLoading}
                        className="w-full bg-neon-blue/10 text-neon-blue border-neon-blue/50 hover:bg-neon-blue/20"
                    >
                        {isLoading ? "Procesando..." : "Descargar Backup JSON"}
                    </Button>
                </Card>

                {/* IMPORTAR */}
                <Card className="space-y-4 border-neon-red/20">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-neon-red/10 rounded-lg text-neon-red">
                            <Upload className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Restaurar Datos</h2>
                    </div>
                    <p className="text-white/60 text-sm">
                        Sube un archivo JSON previamente exportado.
                    </p>

                    <div className="bg-neon-red/5 border border-neon-red/20 rounded-lg p-3 flex gap-3 items-start">
                        <AlertTriangle className="w-5 h-5 text-neon-red shrink-0 mt-0.5" />
                        <p className="text-xs text-neon-red/80">
                            <strong>Cuidado:</strong> Esta acción borrará todos los datos actuales y los reemplazará con los del archivo.
                        </p>
                    </div>

                    <div className="relative">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            disabled={isLoading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <Button
                            variant="secondary"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "Restaurando..." : "Seleccionar Archivo JSON"}
                        </Button>
                    </div>

                    {importStatus === 'success' && (
                        <div className="flex items-center gap-2 text-neon-green text-sm justify-center font-bold animate-pulse">
                            <CheckCircle2 className="w-4 h-4" />
                            Restauración completada
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
