"use client";

import { LayoutDashboard, PlusCircle, BookOpen, Settings, BarChart3, Wallet, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-20 md:w-64 bg-black/50 border-r border-white/5 backdrop-blur-xl flex flex-col z-50">
            <div className="p-6 flex items-center gap-3 border-b border-white/5">
                <div className="w-8 h-8 rounded-lg bg-neon-green/20 border border-neon-green/50 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-neon-green" />
                </div>
                <span className="hidden md:block font-bold text-lg tracking-wider text-white">NEON<span className="text-neon-green">TRADER</span></span>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <NavItem href="/" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active={pathname === "/"} />
                <NavItem href="/journal" icon={<BookOpen className="w-5 h-5" />} label="Diario" active={pathname === "/journal"} />
                <NavItem href="/strategy" icon={<ClipboardCheck className="w-5 h-5" />} label="Operativa" active={pathname === "/strategy"} />
                <NavItem href="/accounts" icon={<Wallet className="w-5 h-5" />} label="Cuentas" active={pathname === "/accounts"} />
                <NavItem href="/entry" icon={<PlusCircle className="w-5 h-5" />} label="Nueva Entrada" active={pathname === "/entry"} />
            </nav>

            <div className="p-4 border-t border-white/5">
                <NavItem href="/settings" icon={<Settings className="w-5 h-5" />} label="Configuración" active={pathname === "/settings"} />
            </div>
        </aside>
    );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                active
                    ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20 shadow-[0_0_15px_rgba(0,240,255,0.1)]"
                    : "text-white/50 hover:text-white hover:bg-white/5"
            )}
        >
            <div className="relative z-10 flex items-center gap-3">
                {icon}
                <span className="hidden md:block font-medium">{label}</span>
            </div>
            {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-blue shadow-[0_0_10px_rgba(0,240,255,0.5)]" />}
        </Link>
    );
}
