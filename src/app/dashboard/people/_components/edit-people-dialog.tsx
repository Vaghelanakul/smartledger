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
import { updatePeople } from "@/actions/people";
import { peopleSchema, PeopleInput } from "@/lib/validations";
import { toast } from "sonner";

interface People {
    id: number;
    peopleCode: string | null;
    peopleName: string;
    email: string | null;
    mobileNo: string | null;
    description: string | null;
}

interface EditPeopleDialogProps {
    person: People | null;
    onClose: () => void;
}

export function EditPeopleDialog({ person, onClose }: EditPeopleDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PeopleInput>({
        resolver: zodResolver(peopleSchema),
    });

    useEffect(() => {
        if (person) {
            reset({
                peopleCode: person.peopleCode || "",
                peopleName: person.peopleName,
                email: person.email || "",
                mobileNo: person.mobileNo || "",
                description: person.description || "",
            });
        }
    }, [person, reset]);

    async function onSubmit(data: PeopleInput) {
        if (!person) return;

        const result = await updatePeople(person.id, data);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Person updated successfully");
            onClose();
        }
    }

    return (
        <Dialog open={!!person} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Edit Person</DialogTitle>
                        <DialogDescription>
                            Update the person&apos;s details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-peopleCode">Code</Label>
                            <Input
                                id="edit-peopleCode"
                                placeholder="EMP001"
                                {...register("peopleCode")}
                            />
                            {errors.peopleCode && (
                                <p className="text-sm text-red-500">{errors.peopleCode.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-peopleName">Name *</Label>
                            <Input
                                id="edit-peopleName"
                                placeholder="John Doe"
                                {...register("peopleName")}
                            />
                            {errors.peopleName && (
                                <p className="text-sm text-red-500">{errors.peopleName.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                placeholder="john@example.com"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-mobileNo">Mobile</Label>
                            <Input
                                id="edit-mobileNo"
                                placeholder="1234567890"
                                {...register("mobileNo")}
                            />
                            {errors.mobileNo && (
                                <p className="text-sm text-red-500">{errors.mobileNo.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                placeholder="Additional notes..."
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
