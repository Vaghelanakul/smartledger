import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getReportData, getMonthlyTrend, getYearlyComparison } from "@/actions/reports";
import { getCategories } from "@/actions/categories";
import { getProjects } from "@/actions/projects";
import { DashboardHeader } from "@/components/dashboard-header";
import { ReportFilters } from "./_components/report-filters";
import { ReportSummary } from "./_components/report-summary";
import { ReportCharts } from "./_components/report-charts";
import { TransactionsList } from "./_components/transactions-list";
import { ExportButtons } from "./_components/export-buttons";

interface ReportsPageProps {
    searchParams: Promise<{
        startDate?: string;
        endDate?: string;
        categoryId?: string;
        projectId?: string;
        type?: "expense" | "income" | "both";
    }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
    const params = await searchParams;

    const filters = {
        startDate: params.startDate,
        endDate: params.endDate,
        categoryId: params.categoryId ? parseInt(params.categoryId) : undefined,
        projectId: params.projectId ? parseInt(params.projectId) : undefined,
        type: params.type || "both" as const,
    };

    const [reportData, monthlyTrend, yearlyComparison, { categories }, { projects }] =
        await Promise.all([
            getReportData(filters),
            getMonthlyTrend(6),
            getYearlyComparison(),
            getCategories(),
            getProjects(),
        ]);

    if (reportData.error) {
        return <div className="text-red-500">{reportData.error}</div>;
    }

    return (
        <>
            <DashboardHeader
                title="Reports & Analytics"
                description="Analyze your financial data and generate reports"
            >
                <ExportButtons
                    expenses={reportData.expenses || []}
                    incomes={reportData.incomes || []}
                    summary={reportData.summary}
                />
            </DashboardHeader>
            <div className="space-y-6 p-6">
                <ReportFilters categories={categories} projects={projects} />

                <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                    <ReportSummary
                        summary={reportData.summary!}
                        yearlyComparison={yearlyComparison}
                    />
                </Suspense>

                <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                    <ReportCharts
                        expensesByCategory={reportData.expensesByCategory || {}}
                        incomeByCategory={reportData.incomeByCategory || {}}
                        expensesByProject={reportData.expensesByProject || {}}
                        expensesByDetail={reportData.expensesByDetail || {}}
                        monthlyTrend={monthlyTrend.data || []}
                    />
                </Suspense>

                <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                    <TransactionsList
                        expenses={reportData.expenses || []}
                        incomes={reportData.incomes || []}
                    />
                </Suspense>
            </div>
        </>
    );
}
