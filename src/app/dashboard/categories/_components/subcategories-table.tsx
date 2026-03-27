"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { deleteSubCategory } from "@/actions/categories";
import { toast } from "sonner";
import { EditSubCategoryDialog } from "./edit-subcategory-dialog";
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

interface SubCategory {
    id: number;
    categoryId: number;
    subCategoryName: string;
    logoPath: string | null;
    isExpense: boolean;
    isIncome: boolean;
    isActive: boolean;
    description: string | null;
    sequence: unknown;
    category: { categoryName: string };
}

interface Category {
    id: number;
    categoryName: string;
}

interface SubCategoriesTableProps {
    subCategories: SubCategory[];
    categories: Category[];
}

export function SubCategoriesTable({ subCategories, categories }: SubCategoriesTableProps) {
    const [editSubCategory, setEditSubCategory] = useState<SubCategory | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        if (!deleteId) return;
        setIsDeleting(true);

        const result = await deleteSubCategory(deleteId);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Subcategory deleted successfully");
        }

        setIsDeleting(false);
        setDeleteId(null);
    }

    return (
        <>
            {subCategories.length > 0 ? (
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subCategories.map((subCategory) => (
                            <TableRow key={subCategory.id}>
                                <TableCell className="font-medium">{subCategory.subCategoryName}</TableCell>
                                <TableCell>{subCategory.category.categoryName}</TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        {subCategory.isExpense && (
                                            <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300">
                                                Expense
                                            </Badge>
                                        )}
                                        {subCategory.isIncome && (
                                            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                                Income
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={subCategory.isActive
                                            ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
                                            : "border-muted-foreground/30 bg-muted/60 text-muted-foreground"
                                        }
                                    >
                                        {subCategory.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setEditSubCategory(subCategory)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setDeleteId(subCategory.id)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="flex h-40 w-full items-center justify-center text-muted-foreground">
                    No subcategories found. Add your first subcategory to get started.
                </div>
            )}

            <EditSubCategoryDialog
                subCategory={editSubCategory}
                categories={categories}
                onClose={() => setEditSubCategory(null)}
            />

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this subcategory.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
        </>
    );
}
