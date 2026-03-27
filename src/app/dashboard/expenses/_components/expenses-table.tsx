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
import { MoreHorizontal, Pencil, Trash, FileText } from "lucide-react";
import { deleteExpense } from "@/actions/expenses";
import { toast } from "sonner";
import { EditExpenseDialog } from "./edit-expense-dialog";

interface Expense {
    id: number;
    expenseDate: Date;
    amount: unknown;
    expenseDetail: string | null;
    description: string | null;
    attachmentPath: string | null;
    category: { id: number; categoryName: string } | null;
    subCategory: { id: number; subCategoryName: string } | null;
    project: { id: number; projectName: string } | null;
    people: { id: number; peopleName: string } | null;
}

interface Category {
    id: number;
    categoryName: string;
}

interface SubCategory {
    id: number;
    categoryId: number;
    subCategoryName: string;
}

interface Project {
    id: number;
    projectName: string;
}

interface People {
    id: number;
    peopleName: string;
}

interface ExpensesTableProps {
    expenses: Expense[];
    categories: Category[];
    subCategories: SubCategory[];
    projects: Project[];
    people: People[];
}

export function ExpensesTable({
    expenses,
    categories,
    subCategories,
    projects,
    people,
}: ExpensesTableProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editExpense, setEditExpense] = useState<Expense | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        if (!deleteId) return;

        setIsDeleting(true);
        const result = await deleteExpense(deleteId);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Expense deleted successfully");
        }

        setIsDeleting(false);
        setDeleteId(null);
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Expense Records</CardTitle>
                </CardHeader>
                <CardContent>
                    {expenses.length === 0 ? (
                        <div className="flex h-24 items-center justify-center text-muted-foreground">
                            No expenses found. Add your first expense to get started.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Subcategory</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Person</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>
                                            {format(new Date(expense.expenseDate), "dd MMM yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {expense.category?.categoryName || "-"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {expense.subCategory?.subCategoryName || "-"}
                                        </TableCell>
                                        <TableCell>
                                            {expense.project?.projectName || "-"}
                                        </TableCell>
                                        <TableCell>{expense.people?.peopleName || "-"}</TableCell>
                                        <TableCell className="text-right font-medium text-red-600">
                                            ₹{Number(expense.amount).toLocaleString("en-IN")}
                                        </TableCell>
                                        <TableCell>
                                            {expense.expenseDetail ? (
                                                <Badge variant="secondary">{expense.expenseDetail}</Badge>
                                            ) : (
                                                "-"
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    render={
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    }
                                                />
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => setEditExpense(expense)}
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    {expense.attachmentPath && (
                                                        <DropdownMenuItem>
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            View Attachment
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => setDeleteId(expense.id)}
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
                        <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this expense? This action cannot
                            be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Dialog */}
            <EditExpenseDialog
                expense={editExpense}
                categories={categories}
                subCategories={subCategories}
                projects={projects}
                people={people}
                onClose={() => setEditExpense(null)}
            />
        </>
    );
}
