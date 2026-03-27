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
import { updateIncome } from "@/actions/income";
import { incomeSchema, IncomeInput } from "@/lib/validations";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

interface EditIncomeDialogProps {
    income: Income | null;
    categories: Category[];
    subCategories: SubCategory[];
    projects: Project[];
    people: People[];
    onClose: () => void;
}

const incomeDetailOptions = ["Cash", "UPI", "Card", "Bank Transfer", "Cheque", "Other"];

export function EditIncomeDialog({
    income,
    categories,
    subCategories,
    projects,
    people,
    onClose,
}: EditIncomeDialogProps) {
    const [date, setDate] = useState<Date>(income ? new Date(income.incomeDate) : new Date());
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(income?.category?.id?.toString() || "");
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>(income?.subCategory?.id?.toString() || "");
    const [selectedProjectId, setSelectedProjectId] = useState<string>(income?.project?.id?.toString() || "");
    const [selectedPeopleId, setSelectedPeopleId] = useState<string>(income?.people?.id?.toString() || "");
    const [selectedIncomeDetail, setSelectedIncomeDetail] = useState<string>(income?.incomeDetail || "");

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<IncomeInput>({
        resolver: zodResolver(incomeSchema),
    });

    useEffect(() => {
        if (income) {
            const incDate = new Date(income.incomeDate);

            queueMicrotask(() => {
                setDate(incDate);
                setSelectedCategoryId(income.category?.id?.toString() || "");
                setSelectedSubCategoryId(income.subCategory?.id?.toString() || "");
                setSelectedProjectId(income.project?.id?.toString() || "");
                setSelectedPeopleId(income.people?.id?.toString() || "");
                setSelectedIncomeDetail(income.incomeDetail || "");
            });

            reset({
                incomeDate: incDate,
                categoryId: income.category?.id,
                subCategoryId: income.subCategory?.id,
                projectId: income.project?.id,
                peopleId: income.people?.id,
                amount: Number(income.amount),
                incomeDetail: income.incomeDetail || undefined,
                description: income.description || "",
                attachmentPath: income.attachmentPath || "",
            });
        }
    }, [income, reset]);

    const filteredSubCategories = selectedCategoryId
        ? subCategories.filter((s) => s.categoryId === parseInt(selectedCategoryId))
        : [];

    async function onSubmit(data: IncomeInput) {
        if (!income) return;

        const result = await updateIncome(income.id, data);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Income updated successfully");
            onClose();
        }
    }

    return (
        <Dialog open={!!income} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-125">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Edit Income</DialogTitle>
                        <DialogDescription>
                            Update the income transaction details.
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
                                                    setValue("incomeDate", d);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.incomeDate && (
                                    <p className="text-sm text-red-500">{errors.incomeDate.message}</p>
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
                                <Label>Category *</Label>
                                <Select
                                    value={selectedCategoryId}
                                    onValueChange={(value) => {
                                        const v = String(value);
                                        setSelectedCategoryId(v);
                                        setValue("categoryId", parseInt(v));
                                        setSelectedSubCategoryId("");
                                        setValue("subCategoryId", undefined);
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
                                    value={selectedSubCategoryId}
                                    onValueChange={(value) => {
                                        const v = String(value);
                                        setSelectedSubCategoryId(v);
                                        setValue("subCategoryId", parseInt(v));
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
                                    value={selectedProjectId}
                                    onValueChange={(value) => {
                                        const v = String(value);
                                        setSelectedProjectId(v);
                                        setValue("projectId", parseInt(v));
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
                                    value={selectedPeopleId}
                                    onValueChange={(value) => {
                                        const v = String(value);
                                        setSelectedPeopleId(v);
                                        setValue("peopleId", parseInt(v));
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
                            <Label>Income Detail</Label>
                            <Select
                                value={selectedIncomeDetail}
                                onValueChange={(value) => {
                                    const v = String(value);
                                    setSelectedIncomeDetail(v);
                                    setValue("incomeDetail", v);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select detail" />
                                </SelectTrigger>
                                <SelectContent>
                                    {incomeDetailOptions.map((mode) => (
                                        <SelectItem key={mode} value={mode}>
                                            {mode}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                placeholder="Add notes about this income..."
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
