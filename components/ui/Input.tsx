import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function Input({ className, label, ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && <label className="text-xs text-foreground/60 font-mono uppercase tracking-wider">{label}</label>}
            <div className="relative group">
                <input
                    className={cn(
                        "w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-white/20 focus:outline-none focus:border-neon-blue/50 focus:shadow-[0_0_10px_rgba(0,240,255,0.1)] transition-all",
                        className
                    )}
                    {...props}
                />
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-neon-blue transition-all duration-300 group-focus-within:w-full opacity-50" />
            </div>
        </div>
    );
}
