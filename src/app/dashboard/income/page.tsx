import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getIncomes } from "@/actions/income";
import { getCategories, getSubCategories } from "@/actions/categories";
import { getProjects } from "@/actions/projects";
import { getPeople } from "@/actions/people";
import { DashboardHeader } from "@/components/dashboard-header";
import { IncomeTable } from "./_components/income-table";
import { AddIncomeDialog } from "./_components/add-income-dialog";

export default async function IncomePage() {
    const [
        { incomes },
        { categories },
        { subCategories },
        { projects },
        { people },
    ] = await Promise.all([
        getIncomes(),
        getCategories(),
        getSubCategories(),
        getProjects(),
        getPeople(),
    ]);

    const incomeCategories = categories.filter((c: { isIncome: boolean }) => c.isIncome);
    const incomeSubCategories = subCategories.filter((s: { isIncome: boolean }) => s.isIncome);

    // Calculate totals
    const totalIncome = incomes.reduce(
        (sum: number, inc: { amount: unknown }) => sum + Number(inc.amount),
        0
    );
    const thisMonthIncome = incomes
        .filter((inc: { incomeDate: Date }) => {
            const incDate = new Date(inc.incomeDate);
            const now = new Date();
            return (
                incDate.getMonth() === now.getMonth() &&
                incDate.getFullYear() === now.getFullYear()
            );
        })
        .reduce((sum: number, inc: { amount: unknown }) => sum + Number(inc.amount), 0);

    return (
        <>
            <DashboardHeader title="Income" description="Manage and track your income">
                <AddIncomeDialog
                    categories={incomeCategories}
                    subCategories={incomeSubCategories}
                    projects={projects}
                    people={people}
                />
            </DashboardHeader>
            <div className="space-y-6 p-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                ₹{totalIncome.toLocaleString("en-IN")}
                            </div>
                            <p className="text-xs text-muted-foreground">All time</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                ₹{thisMonthIncome.toLocaleString("en-IN")}
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
                            <div className="text-2xl font-bold">{incomes.length}</div>
                            <p className="text-xs text-muted-foreground">Total entries</p>
                        </CardContent>
                    </Card>
                </div>

                <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                    <IncomeTable
                        incomes={incomes}
                        categories={incomeCategories}
                        subCategories={incomeSubCategories}
                        projects={projects}
                        people={people}
                    />
                </Suspense>
            </div>
        </>
    );
}
