import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Card({ className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "relative bg-glass-bg border border-glass-border backdrop-blur-xl rounded-2xl p-6 shadow-2xl transition-all duration-300",
                "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-glass-highlight before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100 before:pointer-events-none",
                "hover:border-white/20 hover:shadow-neon-blue/20",
                className
            )}
            {...props}
        />
    );
}
