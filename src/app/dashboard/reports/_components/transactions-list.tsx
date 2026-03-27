"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Expense {
    id: number;
    expenseDate: Date;
    amount: unknown;
    expenseDetail: string | null;
    description: string | null;
    category: { categoryName: string } | null;
    subCategory: { subCategoryName: string } | null;
    project: { projectName: string } | null;
}

interface Income {
    id: number;
    incomeDate: Date;
    amount: unknown;
    incomeDetail: string | null;
    description: string | null;
    category: { categoryName: string } | null;
    subCategory: { subCategoryName: string } | null;
    project: { projectName: string } | null;
}

interface TransactionsListProps {
    expenses: Expense[];
    incomes: Income[];
}

const ITEMS_PER_PAGE = 10;

export function TransactionsList({ expenses, incomes }: TransactionsListProps) {
    const [expensePage, setExpensePage] = useState(1);
    const [incomePage, setIncomePage] = useState(1);

    const expenseMaxPages = Math.ceil(expenses.length / ITEMS_PER_PAGE);
    const incomeMaxPages = Math.ceil(incomes.length / ITEMS_PER_PAGE);

    const paginatedExpenses = expenses.slice(
        (expensePage - 1) * ITEMS_PER_PAGE,
        expensePage * ITEMS_PER_PAGE
    );

    const paginatedIncomes = incomes.slice(
        (incomePage - 1) * ITEMS_PER_PAGE,
        incomePage * ITEMS_PER_PAGE
    );

    return (
        <Card>
            <Tabs defaultValue="expenses" className="w-full">
                <CardHeader className="border-b border-border/70 pb-4">
                    <CardTitle>Transactions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <div className="flex justify-center sm:justify-start">
                        <TabsList className="shrink-0">
                            <TabsTrigger value="expenses">
                                Expenses ({expenses.length})
                            </TabsTrigger>
                            <TabsTrigger value="income">
                                Income ({incomes.length})
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="expenses" className="mt-0">
                        {expenses.length === 0 ? (
                            <div className="flex h-24 items-center justify-center text-muted-foreground">
                                No expenses in this period
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Subcategory</TableHead>
                                            <TableHead>Project</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Payment</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedExpenses.map((expense) => (
                                            <TableRow key={expense.id}>
                                                <TableCell>
                                                    {format(new Date(expense.expenseDate), "dd MMM yyyy")}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {expense.category?.categoryName || "Uncategorized"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {expense.subCategory?.subCategoryName || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {expense.project?.projectName || "-"}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate">
                                                    {expense.description || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {expense.expenseDetail ? (
                                                        <Badge variant="secondary">{expense.expenseDetail}</Badge>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-red-600">
                                                    ₹{Number(expense.amount).toLocaleString("en-IN")}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {expenseMaxPages > 1 && (
                                    <div className="mt-4 flex items-center justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setExpensePage((p) => Math.max(1, p - 1))}
                                            disabled={expensePage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm text-muted-foreground">
                                            Page {expensePage} of {expenseMaxPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setExpensePage((p) => Math.min(expenseMaxPages, p + 1))}
                                            disabled={expensePage === expenseMaxPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="income" className="mt-0">
                        {incomes.length === 0 ? (
                            <div className="flex h-24 items-center justify-center text-muted-foreground">
                                No income in this period
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Subcategory</TableHead>
                                            <TableHead>Project</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Payment</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedIncomes.map((income) => (
                                            <TableRow key={income.id}>
                                                <TableCell>
                                                    {format(new Date(income.incomeDate), "dd MMM yyyy")}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {income.category?.categoryName || "Uncategorized"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {income.subCategory?.subCategoryName || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {income.project?.projectName || "-"}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate">
                                                    {income.description || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {income.incomeDetail ? (
                                                        <Badge variant="secondary">{income.incomeDetail}</Badge>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-green-600">
                                                    ₹{Number(income.amount).toLocaleString("en-IN")}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {incomeMaxPages > 1 && (
                                    <div className="mt-4 flex items-center justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIncomePage((p) => Math.max(1, p - 1))}
                                            disabled={incomePage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm text-muted-foreground">
                                            Page {incomePage} of {incomeMaxPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIncomePage((p) => Math.min(incomeMaxPages, p + 1))}
                                            disabled={incomePage === incomeMaxPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </TabsContent>
                </CardContent>
            </Tabs>
        </Card >
    );
}
