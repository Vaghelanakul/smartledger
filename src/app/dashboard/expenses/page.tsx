import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getExpenses } from "@/actions/expenses";
import { getCategories, getSubCategories } from "@/actions/categories";
import { getProjects } from "@/actions/projects";
import { getPeople } from "@/actions/people";
import { DashboardHeader } from "@/components/dashboard-header";
import { ExpensesTable } from "./_components/expenses-table";
import { AddExpenseDialog } from "./_components/add-expense-dialog";

export default async function ExpensesPage() {
    const [
        { expenses },
        { categories },
        { subCategories },
        { projects },
        { people },
    ] = await Promise.all([
        getExpenses(),
        getCategories(),
        getSubCategories(),
        getProjects(),
        getPeople(),
    ]);

    const expenseCategories = categories.filter((c: { isExpense: boolean }) => c.isExpense);
    const expenseSubCategories = subCategories.filter((s: { isExpense: boolean }) => s.isExpense);

    // Calculate totals
    const totalExpenses = expenses.reduce(
        (sum: number, exp: { amount: unknown }) => sum + Number(exp.amount),
        0
    );
    const thisMonthExpenses = expenses
        .filter((exp: { expenseDate: Date }) => {
            const expDate = new Date(exp.expenseDate);
            const now = new Date();
            return (
                expDate.getMonth() === now.getMonth() &&
                expDate.getFullYear() === now.getFullYear()
            );
        })
        .reduce((sum: number, exp: { amount: unknown }) => sum + Number(exp.amount), 0);

    return (
        <>
            <DashboardHeader title="Expenses" description="Manage and track your expenses">
                <AddExpenseDialog
                    categories={expenseCategories}
                    subCategories={expenseSubCategories}
                    projects={projects}
                    people={people}
                />
            </DashboardHeader>
            <div className="space-y-6 p-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₹{totalExpenses.toLocaleString("en-IN")}
                            </div>
                            <p className="text-xs text-muted-foreground">All time</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₹{thisMonthExpenses.toLocaleString("en-IN")}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {new Date().toLocaleString("default", { month: "long" })}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{expenses.length}</div>
                            <p className="text-xs text-muted-foreground">Total entries</p>
                        </CardContent>
                    </Card>
                </div>

                <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                    <ExpensesTable
                        expenses={expenses}
                        categories={expenseCategories}
                        subCategories={expenseSubCategories}
                        projects={projects}
                        people={people}
                    />
                </Suspense>
            </div>
        </>
    );
}
