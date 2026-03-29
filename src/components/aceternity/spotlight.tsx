import { cn } from "@/lib/utils";

interface SpotlightProps {
    className?: string;
    fill?: string;
}

export function Spotlight({ className, fill = "white" }: SpotlightProps) {
    return (
        <svg
            className={cn(
                "pointer-events-none absolute inset-0 h-full w-full opacity-70",
                className,
            )}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <defs>
                <radialGradient id="spotlight-gradient" cx="50%" cy="40%" r="55%">
                    <stop offset="0%" stopColor={fill} stopOpacity="0.38" />
                    <stop offset="45%" stopColor={fill} stopOpacity="0.14" />
                    <stop offset="100%" stopColor={fill} stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="url(#spotlight-gradient)" />
        </svg>
    );
}
