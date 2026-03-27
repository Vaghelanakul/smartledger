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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { createSubCategory } from "@/actions/categories";
import { subCategorySchema, SubCategoryInput } from "@/lib/validations";
import { toast } from "sonner";

interface Category {
    id: number;
    categoryName: string;
}

interface AddSubCategoryDialogProps {
    categories: Category[];
}

export function AddSubCategoryDialog({ categories }: AddSubCategoryDialogProps) {
    const [open, setOpen] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<SubCategoryInput>({
        resolver: zodResolver(subCategorySchema),
        defaultValues: {
            isExpense: true,
            isIncome: false,
            isActive: true,
        },
    });

    async function onSubmit(data: SubCategoryInput) {
        const result = await createSubCategory(data);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Subcategory created successfully");
            reset();
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="outline" />}>
                <Plus className="mr-2 h-4 w-4" />
                Add Subcategory
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Add New Subcategory</DialogTitle>
                        <DialogDescription>
                            Create a new subcategory under an existing category.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="categoryId">Category *</Label>
                            <Select
                                onValueChange={(value) => {
                                    if (value) setValue("categoryId", parseInt(String(value)));
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
                            <Label htmlFor="subCategoryName">Subcategory Name *</Label>
                            <Input
                                id="subCategoryName"
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
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Subcategory description..."
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
