"use client";

import { useState } from "react";
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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { createCategory } from "@/actions/categories";
import { categorySchema, CategoryInput } from "@/lib/validations";
import { toast } from "sonner";

export function AddCategoryDialog() {
    const [open, setOpen] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CategoryInput>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            isExpense: true,
            isIncome: false,
            isActive: true,
        },
    });

    async function onSubmit(data: CategoryInput) {
        const result = await createCategory(data);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Category created successfully");
            reset();
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>
                            Create a new category for tracking expenses or incomes.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="categoryName">Category Name *</Label>
                            <Input
                                id="categoryName"
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
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Category description..."
                                {...register("description")}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
