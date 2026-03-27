"use client";

import { useState } from "react";
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, CalendarIcon, Loader2 } from "lucide-react";
import { createIncome } from "@/actions/income";
import { incomeSchema, IncomeInput } from "@/lib/validations";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

interface AddIncomeDialogProps {
    categories: Category[];
    subCategories: SubCategory[];
    projects: Project[];
    people: People[];
}

export function AddIncomeDialog({
    categories,
    subCategories,
    projects,
    people,
}: AddIncomeDialogProps) {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date>(new Date());
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<IncomeInput>({
        resolver: zodResolver(incomeSchema),
        defaultValues: {
            incomeDate: new Date(),
        },
    });

    const filteredSubCategories = selectedCategoryId
        ? subCategories.filter((s) => s.categoryId === selectedCategoryId)
        : [];

    async function onSubmit(data: IncomeInput) {
        const result = await createIncome(data);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Income added successfully");
            reset();
            setDate(new Date());
            setSelectedCategoryId(null);
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" />Add Income</Button>} />
            <DialogContent className="sm:max-w-125">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Add New Income</DialogTitle>
                        <DialogDescription>
                            Record a new income transaction.
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
                                <Label htmlFor="amount">Amount *</Label>
                                <Input
                                    id="amount"
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
                                    onValueChange={(value) => {
                                        if (value) {
                                            const id = parseInt(String(value));
                                            setSelectedCategoryId(id);
                                            setValue("categoryId", id);
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
                                    onValueChange={(value) => {
                                        if (value) setValue("subCategoryId", parseInt(String(value)));
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
                                    onValueChange={(value) => {
                                        if (value) setValue("projectId", parseInt(String(value)));
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
                                    onValueChange={(value) => {
                                        if (value) setValue("peopleId", parseInt(String(value)));
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
                            <Label htmlFor="incomeDetail">Income Detail</Label>
                            <Input
                                id="incomeDetail"
                                placeholder="Enter income details..."
                                {...register("incomeDetail")}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Add notes about this income..."
                                {...register("description")}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                "Add Income"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
