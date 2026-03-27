"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { updateCategory } from "@/actions/categories";
import { categorySchema, CategoryInput } from "@/lib/validations";
import { toast } from "sonner";

interface Category {
    id: number;
    categoryName: string;
    logoPath: string | null;
    isExpense: boolean;
    isIncome: boolean;
    isActive: boolean;
    description: string | null;
    sequence: unknown;
}

interface EditCategoryDialogProps {
    category: Category | null;
    onClose: () => void;
}

export function EditCategoryDialog({ category, onClose }: EditCategoryDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CategoryInput>({
        resolver: zodResolver(categorySchema),
    });

    useEffect(() => {
        if (category) {
            reset({
                categoryName: category.categoryName,
                logoPath: category.logoPath || "",
                isExpense: category.isExpense,
                isIncome: category.isIncome,
                isActive: category.isActive,
                description: category.description || "",
                sequence: category.sequence ? Number(category.sequence) : undefined,
            });
        }
    }, [category, reset]);

    async function onSubmit(data: CategoryInput) {
        if (!category) return;

        const result = await updateCategory(category.id, data);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Category updated successfully");
            onClose();
        }
    }

    return (
        <Dialog open={!!category} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Update the category details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-categoryName">Category Name *</Label>
                            <Input
                                id="edit-categoryName"
                                placeholder="Travel"
                                {...register("categoryName")}
                            />
                            {errors.categoryName && (
                                <p className="text-sm text-red-500">{errors.categoryName.message}</p>
                            )}
                        </div>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...register("isExpense")}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <span className="text-sm">Expense</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...register("isIncome")}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <span className="text-sm">Income</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...register("isActive")}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <span className="text-sm">Active</span>
                            </label>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                placeholder="Category description..."
                                {...register("description")}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
