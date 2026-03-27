import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="relative flex min-h-screen w-full overflow-hidden bg-background text-foreground">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-16 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl dark:bg-cyan-400/15" />
                    <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
                </div>
                <AppSidebar />
                <SidebarInset className="bg-transparent">{children}</SidebarInset>
            </div>
        </SidebarProvider>
    );
}
