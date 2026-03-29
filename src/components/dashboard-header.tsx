"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardHeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
}

export function DashboardHeader({ title, description, children }: DashboardHeaderProps) {
    return (
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b border-border/70 bg-background/70 px-6 backdrop-blur-lg">
            <SidebarTrigger className="-ml-2" />
            <Separator orientation="vertical" className="h-6 bg-border" />
            <div className="flex flex-1 items-center justify-between">
                <div>
                    <h1 className="font-display text-lg font-semibold text-foreground">{title}</h1>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {children && <div className="flex items-center gap-2">{children}</div>}
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
