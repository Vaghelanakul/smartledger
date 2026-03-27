"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { CalendarIcon, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
    id: number;
    categoryName: string;
}

interface Project {
    id: number;
    projectName: string;
}

interface ReportFiltersProps {
    categories: Category[];
    projects: Project[];
}

export function ReportFilters({ categories, projects }: ReportFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [startDate, setStartDate] = useState<Date | undefined>(
        searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined
    );
    const [categoryId, setCategoryId] = useState<string>(
        searchParams.get("categoryId") === "all" ? "" : (searchParams.get("categoryId") || "")
    );
    const [projectId, setProjectId] = useState<string>(
        searchParams.get("projectId") === "all" ? "" : (searchParams.get("projectId") || "")
    );
    const [type, setType] = useState<string>(
        searchParams.get("type") || "both"
    );

    function applyFilters() {
        const params = new URLSearchParams();

        if (startDate) params.set("startDate", format(startDate, "yyyy-MM-dd"));
        if (endDate) params.set("endDate", format(endDate, "yyyy-MM-dd"));
        if (categoryId) params.set("categoryId", categoryId);
        if (projectId) params.set("projectId", projectId);
        if (type && type !== "both") params.set("type", type);

        router.push(`/dashboard/reports?${params.toString()}`);
    }

    function clearFilters() {
        setStartDate(undefined);
        setEndDate(undefined);
        setCategoryId("");
        setProjectId("");
        setType("both");
        router.push("/dashboard/reports");
    }

    const hasFilters = startDate || endDate || categoryId || projectId || (type && type !== "both");

    const selectedCategoryName = categories.find((cat) => cat.id.toString() === categoryId)?.categoryName;
    const selectedProjectName = projects.find((proj) => proj.id.toString() === projectId)?.projectName;

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-6">
                    <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Popover>
                            <PopoverTrigger
                                render={
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !startDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, "PP") : "Pick date"}
                                    </Button>
                                }
                            />
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label>End Date</Label>
                        <Popover>
                            <PopoverTrigger
                                render={
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !endDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, "PP") : "Pick date"}
                                    </Button>
                                }
                            />
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={categoryId} onValueChange={(v) => setCategoryId(v === "all" ? "" : String(v || ""))}>
                            <SelectTrigger>
                                <SelectValue placeholder="All categories">
                                    {selectedCategoryName || "All categories"}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" label="All categories">All categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id.toString()} label={cat.categoryName}>
                                        {cat.categoryName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Project</Label>
                        <Select value={projectId} onValueChange={(v) => setProjectId(v === "all" ? "" : String(v || ""))}>
                            <SelectTrigger>
                                <SelectValue placeholder="All projects">
                                    {selectedProjectName || "All projects"}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" label="All projects">All projects</SelectItem>
                                {projects.map((proj) => (
                                    <SelectItem key={proj.id} value={proj.id.toString()} label={proj.projectName}>
                                        {proj.projectName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={type} onValueChange={(v) => setType(String(v || "both"))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Both" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="both">Both</SelectItem>
                                <SelectItem value="expense">Expenses Only</SelectItem>
                                <SelectItem value="income">Income Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-end gap-2">
                        <Button onClick={applyFilters} className="flex-1">
                            <Filter className="mr-2 h-4 w-4" />
                            Apply
                        </Button>
                        {hasFilters && (
                            <Button variant="outline" onClick={clearFilters}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
