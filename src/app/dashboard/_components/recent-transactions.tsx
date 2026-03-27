"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

interface RecentTransactionsProps {
    summary: {
        recentExpenses: {
            id: number;
            date: Date;
            amount: number;
            category: string;
            project: string;
            description: string | null;
        }[];
        recentIncomes: {
            id: number;
            date: Date;
            amount: number;
            category: string;
            project: string;
            description: string | null;
        }[];
    } | null;
}

export function RecentTransactions({ summary }: RecentTransactionsProps) {
    if (!summary) return null;

    // Combine and sort recent transactions
    const allTransactions = [
        ...summary.recentExpenses.map((e) => ({ ...e, type: "expense" as const })),
        ...summary.recentIncomes.map((i) => ({ ...i, type: "income" as const })),
    ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest financial activities</CardDescription>
            </CardHeader>
            <CardContent>
                {allTransactions.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allTransactions.map((transaction) => (
                                <TableRow key={`${transaction.type}-${transaction.id}`}>
                                    <TableCell>
                                        {transaction.type === "income" ? (
                                            <Badge variant="outline" className="text-green-600 border-green-600">
                                                <ArrowUpCircle className="mr-1 h-3 w-3" />
                                                Income
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-red-600 border-red-600">
                                                <ArrowDownCircle className="mr-1 h-3 w-3" />
                                                Expense
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{formatDate(transaction.date)}</TableCell>
                                    <TableCell>{transaction.category}</TableCell>
                                    <TableCell>{transaction.project}</TableCell>
                                    <TableCell
                                        className={`text-right font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {transaction.type === "income" ? "+" : "-"}
                                        {formatCurrency(transaction.amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="flex h-32 items-center justify-center text-muted-foreground">
                        No transactions yet
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
