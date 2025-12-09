"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, Circle } from "lucide-react";

export default function StrategyPage() {
    // Estado local para los checklists. 
    // Al ser estado local del componente, se reiniciará automáticamente 
    // cada vez que el usuario navegue fuera y vuelva a entrar (desmontaje/montaje).
    const [principles, setPrinciples] = useState<boolean[]>(new Array(7).fill(false));
    const [protocol, setProtocol] = useState<boolean[]>(new Array(4).fill(false));

    const togglePrinciple = (index: number) => {
        const newPrinciples = [...principles];
        newPrinciples[index] = !newPrinciples[index];
        setPrinciples(newPrinciples);
    };

    const toggleProtocol = (index: number) => {
        const newProtocol = [...protocol];
        newProtocol[index] = !newProtocol[index];
        setProtocol(newProtocol);
    };

    const principlesList = [
        {
            title: "OBJETIVIDAD RADICAL",
            desc: "Identifico mis posibilidades y entradas basándome únicamente en lo que veo en el gráfico, no en lo que espero o deseo que suceda."
        },
        {
            title: "RIESGO PREDEFINIDO",
            desc: "Antes de entrar, defino exactamente cuánto estoy dispuesto a perder. El riesgo es el costo operativo de mi negocio y lo acepto de antemano."
        },
        {
            title: "DESAPEGO ABSOLUTO",
            desc: "Acepto el riesgo de cada trade. Si el mercado se vuelve en mi contra o me saca en Break Even, lo acepto sin dolor emocional. Soy un ejecutor, no un adivino."
        },
        {
            title: "ACCIÓN SIN RESERVAS",
            desc: "Cuando mi sistema se alinea, actúo sin dudar. La vacilación es el enemigo de la rentabilidad. Ejecuto mi ventaja estadística con confianza."
        },
        {
            title: "PAGO PROGRESIVO",
            desc: "Me pago a mí mismo mientras el mercado pone dinero a mi disposición. Tomo parciales (TP1) para asegurar ganancias y liberar estrés. No dejo que una ganancia se vuelva pérdida."
        },
        {
            title: "AUTO-MONITOREO",
            desc: "Vigilo constantemente mi susceptibilidad a cometer errores emocionales (miedo, avaricia, venganza). Soy el guardián de mi propia mente."
        },
        {
            title: "INTEGRIDAD INQUEBRANTABLE",
            desc: "Entiendo que estos principios son la única barrera entre el éxito consistente y el caos. Por lo tanto, nunca, bajo ninguna circunstancia, los violo."
        }
    ];

    const protocolList = [
        {
            title: "FASE 1: EL MAPA (H4)",
            steps: [
                "Identificar Estructura: ¿El mercado en 4 Horas hace altos más altos (compra) o bajos más bajos (venta)?",
                "Trazado Fibonacci: Conecta el inicio del impulso (Punto A) al final del impulso (Punto B).",
                "La Zona de Caza: Marca claramente el nivel 70.5% (OTE). Aquí es donde esperamos."
            ]
        },
        {
            title: "FASE 2: EL FILTRO (Validación)",
            steps: [
                "Hora de la Verdad (Kill Zones): ¿El precio está tocando el 70.5% durante una ventana de volumen?",
                "Londres: 02:00 AM – 05:00 AM (NY Time).",
                "New York: 07:00 AM – 10:00 AM (NY Time).",
                "Regla: Si toca en Asia, se ignora.",
                "Confirmación Elite (SMT): Opcional. Verificar si DXY o GBPUSD muestran divergencia en los mínimos/máximos."
            ]
        },
        {
            title: "FASE 3: LA EJECUCIÓN (Parámetros)",
            steps: [
                "Entrada (Entry): Limit Order en 70.5%.",
                "Protección (SL): Nivel 105% a 110%. (Evita la caza de stops 'Turtle Soup').",
                "Riesgo: 1% a 2% máximo de la cuenta por operación."
            ]
        },
        {
            title: "FASE 4: LA COSECHA (Salida)",
            steps: [
                "Objetivo 1 (El Sueldo): Nivel 0% (Inicio del impulso anterior). Acción: Cerrar 50% del lotaje y mover Stop Loss a Break Even.",
                "Objetivo 2 (La Riqueza): Nivel -27% (Extensión de Liquidez). Acción: Cerrar el resto de la posición.",
                "Resultado Esperado: Ratio Riesgo/Beneficio 1:2.7 a 1:3."
            ]
        }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <header>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                    Protocolo <span className="text-neon-green">Operativo</span>
                </h1>
                <p className="text-white/50">
                    Checklist diario de preparación mental y ejecución técnica. Se reinicia cada sesión.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* SECCIÓN 1: MENTALIDAD */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-8 bg-neon-blue rounded-full"></div>
                        <h2 className="text-xl font-bold text-white">1. Transformando la Creencia en Realidad</h2>
                    </div>

                    <div className="space-y-4">
                        {principlesList.map((item, index) => (
                            <Card
                                key={index}
                                onClick={() => togglePrinciple(index)}
                                className={`cursor-pointer transition-all duration-300 border hover:border-neon-blue/50 ${principles[index]
                                        ? "bg-neon-blue/10 border-neon-blue/30"
                                        : "bg-black/40 border-white/5"
                                    }`}
                            >
                                <div className="flex gap-4">
                                    <div className={`mt-1 transition-colors ${principles[index] ? "text-neon-blue" : "text-white/20"}`}>
                                        {principles[index] ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold mb-1 ${principles[index] ? "text-neon-blue" : "text-white"}`}>
                                            {index + 1}. {item.title}
                                        </h3>
                                        <p className={`text-sm leading-relaxed ${principles[index] ? "text-white/80" : "text-white/50"}`}>
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* SECCIÓN 2: TÉCNICA */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-8 bg-neon-green rounded-full"></div>
                        <h2 className="text-xl font-bold text-white">2. Protocolo Táctico (Paso a Paso)</h2>
                    </div>

                    <div className="space-y-6">
                        {protocolList.map((phase, index) => (
                            <Card
                                key={index}
                                onClick={() => toggleProtocol(index)}
                                className={`cursor-pointer transition-all duration-300 border hover:border-neon-green/50 ${protocol[index]
                                        ? "bg-neon-green/10 border-neon-green/30"
                                        : "bg-black/40 border-white/5"
                                    }`}
                            >
                                <div className="flex gap-4">
                                    <div className={`mt-1 transition-colors ${protocol[index] ? "text-neon-green" : "text-white/20"}`}>
                                        {protocol[index] ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-bold mb-3 ${protocol[index] ? "text-neon-green" : "text-white"}`}>
                                            {phase.title}
                                        </h3>
                                        <ul className="space-y-2">
                                            {phase.steps.map((step, i) => (
                                                <li key={i} className={`text-sm flex items-start gap-2 ${protocol[index] ? "text-white/90" : "text-white/50"}`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 mt-1.5 shrink-0"></span>
                                                    <span>{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
