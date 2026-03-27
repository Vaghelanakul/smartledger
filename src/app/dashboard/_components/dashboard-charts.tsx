"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, Pie, PieChart, XAxis, YAxis, Cell, ResponsiveContainer } from "recharts";

interface DashboardChartsProps {
    summary: {
        categoryWiseExpenses: { category: string; amount: number }[];
        monthlyData: { month: string; expenses: number; incomes: number }[];
    } | null;
}

const barChartConfig = {
    expenses: {
        label: "Expenses",
        color: "hsl(var(--chart-1))",
    },
    incomes: {
        label: "Incomes",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

export function DashboardCharts({ summary }: DashboardChartsProps) {
    if (!summary) return null;

    const pieChartConfig = summary.categoryWiseExpenses.reduce(
        (acc, item, index) => {
            acc[item.category] = {
                label: item.category,
                color: COLORS[index % COLORS.length],
            };
            return acc;
        },
        {} as ChartConfig
    );

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/70 bg-card/70 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle>Monthly Overview</CardTitle>
                    <CardDescription>Income vs Expenses (Last 6 months)</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={barChartConfig} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={summary.monthlyData}>
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    stroke="var(--foreground)"
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₹${value / 1000}k`}
                                    stroke="var(--foreground)"
                                    style={{ fontSize: '12px' }}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="incomes" fill="var(--color-incomes)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/70 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle>Expense Distribution</CardTitle>
                    <CardDescription>By category</CardDescription>
                </CardHeader>
                <CardContent>
                    {summary.categoryWiseExpenses.length > 0 ? (
                        <ChartContainer config={pieChartConfig} className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={summary.categoryWiseExpenses}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="amount"
                                        nameKey="category"
                                        label={({ category, percent }) =>
                                            `${category} (${(percent * 100).toFixed(0)}%)`
                                        }
                                    >
                                        {summary.categoryWiseExpenses.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    ) : (
                        <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                            No expense data available
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
