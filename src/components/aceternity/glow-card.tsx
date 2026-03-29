import { cn } from "@/lib/utils";

interface GlowCardProps {
    className?: string;
    children: React.ReactNode;
}

export function GlowCard({ className, children }: GlowCardProps) {
    return (
        <div
            className={cn(
                "relative rounded-2xl border border-border/70 bg-card/70 p-6 backdrop-blur-xl",
                "shadow-[0_0_0_1px_rgba(148,163,184,0.15),0_20px_60px_-30px_rgba(14,165,233,0.35)] dark:shadow-[0_0_0_1px_rgba(148,163,184,0.15),0_20px_60px_-30px_rgba(14,165,233,0.5)]",
                className,
            )}
        >
            <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
            {children}
        </div>
    );
}
