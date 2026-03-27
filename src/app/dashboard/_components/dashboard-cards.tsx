"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DashboardCardsProps {
    summary: {
        totalExpenses: number;
        totalIncomes: number;
        monthlyExpenses: number;
        monthlyIncomes: number;
    } | null;
}

export function DashboardCards({ summary }: DashboardCardsProps) {
    if (!summary) return null;

    const netBalance = summary.totalIncomes - summary.totalExpenses;
    const monthlyNet = summary.monthlyIncomes - summary.monthlyExpenses;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/70 bg-card/70 text-card-foreground backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
                    <ArrowUpCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-300" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">
                        {formatCurrency(summary.totalIncomes)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        This month: {formatCurrency(summary.monthlyIncomes)}
                    </p>
                </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/70 text-card-foreground backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                    <ArrowDownCircle className="h-4 w-4 text-rose-500 dark:text-rose-300" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-rose-600 dark:text-rose-300">
                        {formatCurrency(summary.totalExpenses)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        This month: {formatCurrency(summary.monthlyExpenses)}
                    </p>
                </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/70 text-card-foreground backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
                    <Wallet className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${netBalance >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}`}>
                        {formatCurrency(netBalance)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Total income - expenses
                    </p>
                </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/70 text-card-foreground backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Net</CardTitle>
                    <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${monthlyNet >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}`}>
                        {formatCurrency(monthlyNet)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        This month&apos;s savings
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
