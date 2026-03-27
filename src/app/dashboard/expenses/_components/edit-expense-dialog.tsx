"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { updateExpense } from "@/actions/expenses";
import { expenseSchema, ExpenseInput } from "@/lib/validations";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

interface EditExpenseDialogProps {
    expense: Expense | null;
    categories: Category[];
    subCategories: SubCategory[];
    projects: Project[];
    people: People[];
    onClose: () => void;
}

export function EditExpenseDialog({
    expense,
    categories,
    subCategories,
    projects,
    people,
    onClose,
}: EditExpenseDialogProps) {
    const [date, setDate] = useState<Date>(new Date());
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [selectedPeopleId, setSelectedPeopleId] = useState<number | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ExpenseInput>({
        resolver: zodResolver(expenseSchema),
    });

    useEffect(() => {
        if (expense) {
            const expDate = new Date(expense.expenseDate);

            queueMicrotask(() => {
                setDate(expDate);
                setSelectedCategoryId(expense.category?.id || null);
                setSelectedSubCategoryId(expense.subCategory?.id || null);
                setSelectedProjectId(expense.project?.id || null);
                setSelectedPeopleId(expense.people?.id || null);
            });

            reset({
                expenseDate: expDate,
                categoryId: expense.category?.id,
                subCategoryId: expense.subCategory?.id,
                projectId: expense.project?.id,
                peopleId: expense.people?.id,
                amount: Number(expense.amount),
                expenseDetail: expense.expenseDetail || "",
                description: expense.description || "",
                attachmentPath: expense.attachmentPath || "",
            });
        }
    }, [expense, reset]);

    const filteredSubCategories = selectedCategoryId
        ? subCategories.filter((s) => s.categoryId === selectedCategoryId)
        : [];

    async function onSubmit(data: ExpenseInput) {
        if (!expense) return;

        const result = await updateExpense(expense.id, data);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Expense updated successfully");
            onClose();
        }
    }

    return (
        <Dialog open={!!expense} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-125">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Edit Expense</DialogTitle>
                        <DialogDescription>
                            Update the expense transaction details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Date *</Label>
                                <Popover>
                                    <PopoverTrigger
                                        render={
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "justify-start text-left font-normal",
                                                    !date && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {date ? format(date, "PPP") : "Pick a date"}
                                            </Button>
                                        }
                                    />
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={(d) => {
                                                if (d) {
                                                    setDate(d);
                                                    setValue("expenseDate", d);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.expenseDate && (
                                    <p className="text-sm text-red-500">{errors.expenseDate.message}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-amount">Amount *</Label>
                                <Input
                                    id="edit-amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register("amount", { valueAsNumber: true })}
                                />
                                {errors.amount && (
                                    <p className="text-sm text-red-500">{errors.amount.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Category</Label>
                                <Select
                                    value={selectedCategoryId?.toString() || ""}
                                    onValueChange={(value) => {
                                        if (value) {
                                            const id = parseInt(String(value));
                                            setSelectedCategoryId(id);
                                            setValue("categoryId", id);
                                            setSelectedSubCategoryId(null);
                                            setValue("subCategoryId", undefined);
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
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
                                <Label>Subcategory</Label>
                                <Select
                                    value={selectedSubCategoryId?.toString() || ""}
                                    onValueChange={(value) => {
                                        if (value) {
                                            const id = parseInt(String(value));
                                            setSelectedSubCategoryId(id);
                                            setValue("subCategoryId", id);
                                        }
                                    }}
                                    disabled={!selectedCategoryId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select subcategory" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredSubCategories.map((sub) => (
                                            <SelectItem key={sub.id} value={sub.id.toString()}>
                                                {sub.subCategoryName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Project</Label>
                                <Select
                                    value={selectedProjectId?.toString() || ""}
                                    onValueChange={(value) => {
                                        if (value) {
                                            const id = parseInt(String(value));
                                            setSelectedProjectId(id);
                                            setValue("projectId", id);
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map((project) => (
                                            <SelectItem key={project.id} value={project.id.toString()}>
                                                {project.projectName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Person</Label>
                                <Select
                                    value={selectedPeopleId?.toString() || ""}
                                    onValueChange={(value) => {
                                        if (value) {
                                            const id = parseInt(String(value));
                                            setSelectedPeopleId(id);
                                            setValue("peopleId", id);
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select person" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {people.map((person) => (
                                            <SelectItem key={person.id} value={person.id.toString()}>
                                                {person.peopleName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-expenseDetail">Expense Detail</Label>
                            <Input
                                id="edit-expenseDetail"
                                placeholder="Enter expense details..."
                                {...register("expenseDetail")}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                placeholder="Add notes about this expense..."
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
