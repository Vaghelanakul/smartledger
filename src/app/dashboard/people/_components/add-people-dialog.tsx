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
import { createPeople } from "@/actions/people";
import { peopleSchema, PeopleInput } from "@/lib/validations";
import { toast } from "sonner";

export function AddPeopleDialog() {
    const [open, setOpen] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PeopleInput>({
        resolver: zodResolver(peopleSchema),
    });

    async function onSubmit(data: PeopleInput) {
        const result = await createPeople(data);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Person created successfully");
            reset();
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
                <Plus className="mr-2 h-4 w-4" />
                Add Person
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Add New Person</DialogTitle>
                        <DialogDescription>
                            Add a new person to your records. Fill in the details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="peopleCode">Code</Label>
                            <Input
                                id="peopleCode"
                                placeholder="EMP001"
                                {...register("peopleCode")}
                            />
                            {errors.peopleCode && (
                                <p className="text-sm text-red-500">{errors.peopleCode.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="peopleName">Name *</Label>
                            <Input
                                id="peopleName"
                                placeholder="John Doe"
                                {...register("peopleName")}
                            />
                            {errors.peopleName && (
                                <p className="text-sm text-red-500">{errors.peopleName.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mobileNo">Mobile</Label>
                            <Input
                                id="mobileNo"
                                placeholder="1234567890"
                                {...register("mobileNo")}
                            />
                            {errors.mobileNo && (
                                <p className="text-sm text-red-500">{errors.mobileNo.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Additional notes..."
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
