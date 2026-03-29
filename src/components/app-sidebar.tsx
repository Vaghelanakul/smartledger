"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    Tags,
    ArrowDownCircle,
    ArrowUpCircle,
    BarChart3,
    LogOut,
    ChevronUp,
    Wallet,
    Settings,
} from "lucide-react";

const menuItems = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
    },
];

const managementItems = [
    {
        title: "People",
        icon: Users,
        href: "/dashboard/people",
    },
    {
        title: "Projects",
        icon: FolderKanban,
        href: "/dashboard/projects",
    },
    {
        title: "Categories",
        icon: Tags,
        href: "/dashboard/categories",
    },
];

const transactionItems = [
    {
        title: "Expenses",
        icon: ArrowDownCircle,
        href: "/dashboard/expenses",
    },
    {
        title: "Incomes",
        icon: ArrowUpCircle,
        href: "/dashboard/income",
    },
];

const reportItems = [
    {
        title: "Reports",
        icon: BarChart3,
        href: "/dashboard/reports",
    },
];

export function AppSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const isAdmin = session?.user?.role === "admin";

    return (
        <Sidebar className="border-r border-border/70 bg-card/70 text-card-foreground backdrop-blur-xl">
            <SidebarHeader className="border-b border-border/70 px-6 py-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/20 p-1.5">
                        <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-display text-lg font-bold">SmartLedger</span>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-muted-foreground">Overview</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        render={<Link href={item.href} />}
                                        isActive={pathname === item.href}
                                        className="text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-primary/20 data-[active=true]:text-primary"
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-muted-foreground">Management</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {managementItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        render={<Link href={item.href} />}
                                        isActive={pathname.startsWith(item.href)}
                                        className="text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-primary/20 data-[active=true]:text-primary"
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-muted-foreground">Transactions</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {transactionItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        render={<Link href={item.href} />}
                                        isActive={pathname.startsWith(item.href)}
                                        className="text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-primary/20 data-[active=true]:text-primary"
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-muted-foreground">Analytics</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {reportItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        render={<Link href={item.href} />}
                                        isActive={pathname.startsWith(item.href)}
                                        className="text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-primary/20 data-[active=true]:text-primary"
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {isAdmin && (
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-muted-foreground">Admin</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        render={<Link href="/dashboard/users" />}
                                        isActive={pathname.startsWith("/dashboard/users")}
                                        className="text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-primary/20 data-[active=true]:text-primary"
                                    >
                                        <Settings className="h-4 w-4" />
                                        <span>User Management</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>
            <SidebarFooter className="border-t border-border/70">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <SidebarMenuButton className="w-full text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={session?.user?.image || ""} />
                                            <AvatarFallback>
                                                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="flex-1 text-left truncate">{session?.user?.name}</span>
                                        <ChevronUp className="h-4 w-4" />
                                    </SidebarMenuButton>
                                }
                            />
                            <DropdownMenuContent side="top" align="start" className="w-56">
                                <div className="px-2 py-1.5">
                                    <p className="text-sm font-medium">{session?.user?.name}</p>
                                    <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                    className="cursor-pointer text-destructive"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
