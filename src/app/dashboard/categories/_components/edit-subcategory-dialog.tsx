"use client";

import { useEffect, useState } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { updateSubCategory } from "@/actions/categories";
import { subCategorySchema, SubCategoryInput } from "@/lib/validations";
import { toast } from "sonner";

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
}

interface Category {
    id: number;
    categoryName: string;
}

interface EditSubCategoryDialogProps {
    subCategory: SubCategory | null;
    categories: Category[];
    onClose: () => void;
}

export function EditSubCategoryDialog({
    subCategory,
    categories,
    onClose,
}: EditSubCategoryDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<SubCategoryInput>({
        resolver: zodResolver(subCategorySchema),
    });

    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(
        () => subCategory?.categoryId
    );

    useEffect(() => {
        if (subCategory) {
            queueMicrotask(() => {
                setSelectedCategoryId(subCategory.categoryId);
                reset({
                    categoryId: subCategory.categoryId,
                    subCategoryName: subCategory.subCategoryName,
                    logoPath: subCategory.logoPath || "",
                    isExpense: subCategory.isExpense,
                    isIncome: subCategory.isIncome,
                    isActive: subCategory.isActive,
                    description: subCategory.description || "",
                    sequence: subCategory.sequence ? Number(subCategory.sequence) : undefined,
                });
            });
        }
    }, [subCategory, reset]);

    async function onSubmit(data: SubCategoryInput) {
        if (!subCategory) return;

        const result = await updateSubCategory(subCategory.id, data);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Subcategory updated successfully");
            onClose();
        }
    }

    return (
        <Dialog open={!!subCategory} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Edit Subcategory</DialogTitle>
                        <DialogDescription>
                            Update the subcategory details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-categoryId">Category *</Label>
                            <Select
                                value={selectedCategoryId?.toString()}
                                onValueChange={(value) => {
                                    if (value) {
                                        const numValue = parseInt(value);
                                        setSelectedCategoryId(numValue);
                                        setValue("categoryId", numValue);
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.categoryName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.categoryId && (
                                <p className="text-sm text-red-500">{errors.categoryId.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-subCategoryName">Subcategory Name *</Label>
                            <Input
                                id="edit-subCategoryName"
                                placeholder="Taxi"
                                {...register("subCategoryName")}
                            />
                            {errors.subCategoryName && (
                                <p className="text-sm text-red-500">{errors.subCategoryName.message}</p>
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
                                placeholder="Subcategory description..."
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
