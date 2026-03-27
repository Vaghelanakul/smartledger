"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    MoreHorizontal,
    Pencil,
    Trash,
    Shield,
    User,
} from "lucide-react";
import { deleteUser } from "@/actions/users";
import { toast } from "sonner";
import { EditUserDialog } from "./edit-user-dialog";

interface UserData {
    id: number;
    userName: string;
    emailAddress: string;
    role: string;
    mobileNo: string | null;
    created: Date;
    modified: Date;
    _count: {
        expenses: number;
        incomes: number;
    };
}

interface UsersTableProps {
    users: UserData[];
    currentUserId: string;
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editUser, setEditUser] = useState<UserData | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    async function handleDelete() {
        if (!deleteId) return;

        setIsProcessing(true);
        const result = await deleteUser(deleteId);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("User deleted successfully");
        }

        setIsProcessing(false);
        setDeleteId(null);
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                </CardHeader>
                <CardContent>
                    {users.length === 0 ? (
                        <div className="flex h-24 items-center justify-center text-muted-foreground">
                            No users found
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Transactions</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="w-20"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {user.role === "admin" ? (
                                                    <Shield className="h-4 w-4 text-blue-500" />
                                                ) : (
                                                    <User className="h-4 w-4 text-gray-500" />
                                                )}
                                                {user.userName}
                                                {String(user.id) === currentUserId && (
                                                    <Badge variant="outline" className="ml-2">
                                                        You
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.emailAddress}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={user.role === "admin" ? "default" : "secondary"}
                                            >
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {user._count.expenses + user._count.incomes} total
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(user.created), "dd MMM yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    render={
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={String(user.id) === currentUserId}
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    }
                                                />
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => setEditUser(user)}
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => setDeleteId(String(user.id))}
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this user? This will also delete
                            all their data including expenses and income records. This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isProcessing}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isProcessing ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Dialog */}
            <EditUserDialog user={editUser} onClose={() => setEditUser(null)} />
        </>
    );
}
