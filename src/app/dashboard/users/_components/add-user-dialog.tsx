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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { createUser } from "@/actions/users";
import { userSchema, UserInput } from "@/lib/validations";
import { toast } from "sonner";

export function AddUserDialog() {
    const [open, setOpen] = useState(false);
    const [role, setRole] = useState<"user" | "admin">("user");

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<UserInput>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            role: "user",
        },
    });

    async function onSubmit(data: UserInput) {
        const result = await createUser(data);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("User created successfully");
            reset();
            setRole("user");
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                            Create a new user account with specified role and permissions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="userName">Username *</Label>
                            <Input
                                id="userName"
                                placeholder="johndoe"
                                {...register("userName")}
                            />
                            {errors.userName && (
                                <p className="text-sm text-red-500">{errors.userName.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="emailAddress">Email *</Label>
                            <Input
                                id="emailAddress"
                                type="email"
                                placeholder="john@example.com"
                                {...register("emailAddress")}
                            />
                            {errors.emailAddress && (
                                <p className="text-sm text-red-500">{errors.emailAddress.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password *</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mobileNo">Mobile No</Label>
                            <Input
                                id="mobileNo"
                                placeholder="+1234567890"
                                {...register("mobileNo")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Role *</Label>
                            <Select
                                value={role}
                                onValueChange={(value) => {
                                    if (value) {
                                        setRole(value as "user" | "admin");
                                        setValue("role", value as "user" | "admin");
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
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
                                    Creating...
                                </>
                            ) : (
                                "Create User"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
