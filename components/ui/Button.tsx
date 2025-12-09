import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
    const variants = {
        primary: "bg-neon-green/10 text-neon-green border border-neon-green/50 hover:bg-neon-green/20 hover:shadow-[0_0_15px_rgba(0,255,65,0.3)]",
        secondary: "bg-neon-blue/10 text-neon-blue border border-neon-blue/50 hover:bg-neon-blue/20 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]",
        danger: "bg-neon-red/10 text-neon-red border border-neon-red/50 hover:bg-neon-red/20 hover:shadow-[0_0_15px_rgba(255,0,60,0.3)]",
        ghost: "hover:bg-white/5 text-foreground/70 hover:text-foreground",
    };

    return (
        <button
            className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                className
            )}
            {...props}
        />
    );
}
