import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function Input({ className, label, ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && <label className="text-xs text-white/50 font-bold uppercase tracking-widest pl-1">{label}</label>}
            <div className="relative group">
                <input
                    className={cn(
                        "w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm font-medium text-white placeholder:text-white/20 transition-all duration-300",
                        "hover:border-white/20 hover:bg-white/10",
                        "focus:outline-none focus:border-neon-blue/50 focus:bg-black/40 focus:shadow-[0_0_15px_rgba(0,224,255,0.15)]",
                        className
                    )}
                    {...props}
                />
            </div>
        </div>
    );
}
