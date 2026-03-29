import { cn } from "@/lib/utils";

interface BackgroundBeamsProps {
    className?: string;
}

export function BackgroundBeams({ className }: BackgroundBeamsProps) {
    return (
        <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
            <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/25 blur-3xl" />
            <div className="absolute right-0 top-1/4 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
            <div className="absolute bottom-0 left-12 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.2), transparent 40%), radial-gradient(circle at 80% 10%, rgba(45,212,191,0.15), transparent 35%), radial-gradient(circle at 30% 80%, rgba(14,165,233,0.15), transparent 45%)",
                }}
            />
        </div>
    );
}
