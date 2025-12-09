import { StatsCards } from "@/components/dashboard/StatsCards";
import { EquityChart } from "@/components/dashboard/EquityChart";
import { DailyPnLChart } from "@/components/dashboard/DailyPnLChart";
import { TradingCalendar } from "@/components/dashboard/TradingCalendar";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Bienvenido, <span className="text-neon-blue">Trader</span>
        </h1>
        <p className="text-white/50 mt-2">Aquí tienes el resumen de tu portafolio hoy.</p>
      </header>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <EquityChart />
        </div>
        <div>
          <DailyPnLChart />
        </div>
      </div>

      <div className="h-[500px]">
        <TradingCalendar />
      </div>
    </div>
  );
}
