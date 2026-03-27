import { auth } from "@/lib/auth";
import { getDashboardSummary } from "@/actions/dashboard";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardCards } from "./_components/dashboard-cards";
import { DashboardCharts } from "./_components/dashboard-charts";
import { RecentTransactions } from "./_components/recent-transactions";

export default async function DashboardPage() {
    const session = await auth();
    const summary = await getDashboardSummary();

    const isAdmin = session?.user?.role === "admin";

    return (
        <>
            <DashboardHeader
                title="Dashboard"
                description={isAdmin ? "Overview of all users' financial data" : "Your financial overview"}
            />
            <div className="relative flex-1 space-y-6 p-6">
                <DashboardCards summary={summary} />
                <DashboardCharts summary={summary} />
                <RecentTransactions summary={summary} />
            </div>
        </>
    );
}
