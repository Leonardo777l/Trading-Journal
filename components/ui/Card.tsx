import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Card({ className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "bg-glass-bg border border-glass-border backdrop-blur-md rounded-xl p-6 shadow-xl",
                className
            )}
            {...props}
        />
    );
}
