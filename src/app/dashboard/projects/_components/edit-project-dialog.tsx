"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, CalendarIcon } from "lucide-react";
import { updateProject } from "@/actions/projects";
import { projectSchema, ProjectInput } from "@/lib/validations";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Project {
    id: number;
    projectName: string;
    projectLogo: string | null;
    projectStartDate: Date | null;
    projectEndDate: Date | null;
    projectDetail: string | null;
    description: string | null;
    isActive: boolean;
}

interface EditProjectDialogProps {
    project: Project | null;
    onClose: () => void;
}

export function EditProjectDialog({ project, onClose }: EditProjectDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm<ProjectInput>({
        resolver: zodResolver(projectSchema),
    });

    useEffect(() => {
        if (project) {
            reset({
                projectName: project.projectName,
                projectLogo: project.projectLogo || "",
                projectStartDate: project.projectStartDate,
                projectEndDate: project.projectEndDate,
                projectDetail: project.projectDetail || "",
                description: project.description || "",
                isActive: project.isActive,
            });
        }
    }, [project, reset]);

    async function onSubmit(data: ProjectInput) {
        if (!project) return;

        const result = await updateProject(project.id, data);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Project updated successfully");
            onClose();
        }
    }

    return (
        <Dialog open={!!project} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                        <DialogDescription>
                            Update the project details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-projectName">Project Name *</Label>
                            <Input
                                id="edit-projectName"
                                placeholder="Website Redesign"
                                {...register("projectName")}
                            />
                            {errors.projectName && (
                                <p className="text-sm text-red-500">{errors.projectName.message}</p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Start Date</Label>
                                <Controller
                                    name="projectStartDate"
                                    control={control}
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger
                                                render={
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    />
                                                }
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP") : "Select date"}
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value || undefined}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>End Date</Label>
                                <Controller
                                    name="projectEndDate"
                                    control={control}
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger
                                                render={
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    />
                                                }
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP") : "Select date"}
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value || undefined}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-projectDetail">Project Details</Label>
                            <Textarea
                                id="edit-projectDetail"
                                placeholder="Brief project details..."
                                {...register("projectDetail")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                placeholder="Additional notes..."
                                {...register("description")}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                id="edit-isActive"
                                type="checkbox"
                                {...register("isActive")}
                                className="h-4 w-4 rounded border border-input bg-background cursor-pointer"
                            />
                            <Label htmlFor="edit-isActive" className="cursor-pointer font-normal">
                                Project is Active
                            </Label>
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
