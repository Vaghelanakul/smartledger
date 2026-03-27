"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface ReportSummaryProps {
    summary: {
        totalExpenses: number;
        totalIncome: number;
        netBalance: number;
        expenseCount: number;
        incomeCount: number;
    };
    yearlyComparison: {
        currentYear?: {
            year: number;
            expenses: number;
            income: number;
        };
        lastYear?: {
            year: number;
            expenses: number;
            income: number;
        };
        error?: string;
    };
}

export function ReportSummary({ summary, yearlyComparison }: ReportSummaryProps) {
    const expenseChange = yearlyComparison.lastYear?.expenses
        ? ((yearlyComparison.currentYear?.expenses || 0) - yearlyComparison.lastYear.expenses) /
        yearlyComparison.lastYear.expenses * 100
        : 0;

    const incomeChange = yearlyComparison.lastYear?.income
        ? ((yearlyComparison.currentYear?.income || 0) - yearlyComparison.lastYear.income) /
        yearlyComparison.lastYear.income * 100
        : 0;

    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        ₹{summary.totalIncome.toLocaleString("en-IN")}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                        <span>{summary.incomeCount} transactions</span>
                        {incomeChange !== 0 && (
                            <span className={`ml-2 flex items-center ${incomeChange > 0 ? "text-green-500" : "text-red-500"}`}>
                                {incomeChange > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                {Math.abs(incomeChange).toFixed(1)}% vs last year
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                        ₹{summary.totalExpenses.toLocaleString("en-IN")}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                        <span>{summary.expenseCount} transactions</span>
                        {expenseChange !== 0 && (
                            <span className={`ml-2 flex items-center ${expenseChange < 0 ? "text-green-500" : "text-red-500"}`}>
                                {expenseChange > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                {Math.abs(expenseChange).toFixed(1)}% vs last year
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                    <Wallet className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${summary.netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ₹{summary.netBalance.toLocaleString("en-IN")}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {summary.netBalance >= 0 ? "Surplus" : "Deficit"}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {summary.totalIncome > 0
                            ? ((summary.netBalance / summary.totalIncome) * 100).toFixed(1)
                            : "0"}
                        %
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Of total income saved
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
