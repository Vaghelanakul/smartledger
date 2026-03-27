import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUsers } from "@/actions/users";
import { UsersTable } from "./_components/users-table";
import { AddUserDialog } from "./_components/add-user-dialog";

export default async function UsersPage() {
    // Check admin access
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: parseInt(session.user.id) },
    });

    if (!user || user.role !== "admin") {
        redirect("/dashboard");
    }

    const { users, error } = await getUsers();

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    // Calculate stats
    const totalUsers = users.length;
    const adminUsers = users.filter((u: { role: string }) => u.role === "admin").length;
    const regularUsers = totalUsers - adminUsers;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                    <p className="text-muted-foreground">
                        Manage system users and access
                    </p>
                </div>
                <AddUserDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">Registered accounts</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{regularUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            {totalUsers > 0
                                ? `${((regularUsers / totalUsers) * 100).toFixed(0)}% of total`
                                : "No users yet"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{adminUsers}</div>
                        <p className="text-xs text-muted-foreground">Admin accounts</p>
                    </CardContent>
                </Card>
            </div>

            <UsersTable users={users} currentUserId={session.user.id} />
        </div>
    );
}
