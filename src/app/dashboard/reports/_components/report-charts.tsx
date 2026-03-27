"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from "recharts";

interface ReportChartsProps {
    expensesByCategory: Record<string, number>;
    incomeByCategory: Record<string, number>;
    expensesByProject: Record<string, number>;
    expensesByDetail: Record<string, number>;
    monthlyTrend: Array<{ month: string; expenses: number; income: number }>;
}

const EXPENSE_COLORS = [
    "#ef4444", "#f97316", "#f59e0b", "#fb7185", "#f43f5e",
    "#f87171", "#dc2626", "#ea580c", "#b91c1c", "#be123c",
];

const INCOME_COLORS = [
    "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#3b82f6",
    "#16a34a", "#059669", "#0d9488", "#0284c7", "#2563eb",
];

export function ReportCharts({
    expensesByCategory,
    incomeByCategory,
    expensesByProject,
    expensesByDetail,
    monthlyTrend,
}: ReportChartsProps) {
    const expenseCategoryData = Object.entries(expensesByCategory).map(([name, value]) => ({
        name,
        value,
    }));

    const incomeCategoryData = Object.entries(incomeByCategory).map(([name, value]) => ({
        name,
        value,
    }));

    const projectData = Object.entries(expensesByProject).map(([name, value]) => ({
        name,
        value,
    }));

    const paymentModeData = Object.entries(expensesByDetail).map(([name, value]) => ({
        name,
        value,
    }));

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Monthly Trend */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Monthly Trend</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    name="Income"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="expenses"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    name="Expenses"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Expenses by Category */}
            <Card>
                <CardHeader>
                    <CardTitle>Expenses by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    {expenseCategoryData.length === 0 ? (
                        <div className="flex h-64 items-center justify-center text-muted-foreground">
                            No expense data available
                        </div>
                    ) : (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expenseCategoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name} (${(percent * 100).toFixed(0)}%)`
                                        }
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {expenseCategoryData.map((_, index) => (
                                            <Cell
                                                key={`expense-cell-${index}`}
                                                fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Income by Category */}
            <Card>
                <CardHeader>
                    <CardTitle>Income by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    {incomeCategoryData.length === 0 ? (
                        <div className="flex h-64 items-center justify-center text-muted-foreground">
                            No income data available
                        </div>
                    ) : (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={incomeCategoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name} (${(percent * 100).toFixed(0)}%)`
                                        }
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {incomeCategoryData.map((_, index) => (
                                            <Cell
                                                key={`income-cell-${index}`}
                                                fill={INCOME_COLORS[index % INCOME_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Expenses by Project */}
            <Card>
                <CardHeader>
                    <CardTitle>Expenses by Project</CardTitle>
                </CardHeader>
                <CardContent>
                    {projectData.length === 0 ? (
                        <div className="flex h-64 items-center justify-center text-muted-foreground">
                            No project data available
                        </div>
                    ) : (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={projectData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip
                                        formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`}
                                    />
                                    <Bar dataKey="value" fill="#3b82f6" name="Amount" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Expenses by Payment Mode */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                    {paymentModeData.length === 0 ? (
                        <div className="flex h-64 items-center justify-center text-muted-foreground">
                            No payment data available
                        </div>
                    ) : (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={paymentModeData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`}
                                    />
                                    <Bar dataKey="value" fill="#8b5cf6" name="Amount" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
