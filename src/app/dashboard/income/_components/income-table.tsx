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
import { deleteIncome } from "@/actions/income";
import { toast } from "sonner";
import { EditIncomeDialog } from "./edit-income-dialog";

interface Income {
    id: number;
    incomeDate: Date;
    amount: unknown;
    incomeDetail: string | null;
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

interface IncomeTableProps {
    incomes: Income[];
    categories: Category[];
    subCategories: SubCategory[];
    projects: Project[];
    people: People[];
}

export function IncomeTable({
    incomes,
    categories,
    subCategories,
    projects,
    people,
}: IncomeTableProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editIncome, setEditIncome] = useState<Income | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        if (!deleteId) return;

        setIsDeleting(true);
        const result = await deleteIncome(deleteId);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Income deleted successfully");
        }

        setIsDeleting(false);
        setDeleteId(null);
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Income Records</CardTitle>
                </CardHeader>
                <CardContent>
                    {incomes.length === 0 ? (
                        <div className="flex h-24 items-center justify-center text-muted-foreground">
                            No income records found. Add your first income to get started.
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
                                {incomes.map((income) => (
                                    <TableRow key={income.id}>
                                        <TableCell>
                                            {format(new Date(income.incomeDate), "dd MMM yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {income.category?.categoryName || "-"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {income.subCategory?.subCategoryName || "-"}
                                        </TableCell>
                                        <TableCell>
                                            {income.project?.projectName || "-"}
                                        </TableCell>
                                        <TableCell>{income.people?.peopleName || "-"}</TableCell>
                                        <TableCell className="text-right font-medium text-green-600">
                                            ₹{Number(income.amount).toLocaleString("en-IN")}
                                        </TableCell>
                                        <TableCell>
                                            {income.incomeDetail ? (
                                                <Badge variant="secondary">{income.incomeDetail}</Badge>
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
                                                        onClick={() => setEditIncome(income)}
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    {income.attachmentPath && (
                                                        <DropdownMenuItem>
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            View Attachment
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => setDeleteId(income.id)}
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
                        <AlertDialogTitle>Delete Income</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this income record? This action cannot
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
            <EditIncomeDialog
                income={editIncome}
                categories={categories}
                subCategories={subCategories}
                projects={projects}
                people={people}
                onClose={() => setEditIncome(null)}
            />
        </>
    );
}
