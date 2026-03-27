"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { updateUser } from "@/actions/users";
import { toast } from "sonner";

// Schema for editing user (password optional)
const editUserSchema = z.object({
    userName: z.string().min(3, "Username must be at least 3 characters"),
    emailAddress: z.string().email("Invalid email address"),
    mobileNo: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
    role: z.enum(["user", "admin"]),
});

type EditUserInput = z.infer<typeof editUserSchema>;

interface UserData {
    id: number;
    userName: string;
    emailAddress: string;
    mobileNo?: string | null;
    role: string;
}

interface EditUserDialogProps {
    user: UserData | null;
    onClose: () => void;
}

export function EditUserDialog({ user, onClose }: EditUserDialogProps) {
    // Initialize state from user prop - these will be the controlled values for Select
    const [role, setRole] = useState<"user" | "admin">(() =>
        user?.role as "user" | "admin" || "user"
    );

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<EditUserInput>({
        resolver: zodResolver(editUserSchema),
    });

    // Reset form and state when user prop changes
    useEffect(() => {
        if (user) {
            const userRole = user.role as "user" | "admin";

            // Reset form values and local state using microtask to avoid synchronous setState warning
            queueMicrotask(() => {
                setRole(userRole);
                reset({
                    userName: user.userName,
                    emailAddress: user.emailAddress,
                    mobileNo: user.mobileNo || "",
                    password: "",
                    role: userRole,
                });
            });
        }
    }, [user, reset]);

    async function onSubmit(data: EditUserInput) {
        if (!user) return;

        // Remove password if empty
        const updateData: Record<string, unknown> = {
            userName: data.userName,
            emailAddress: data.emailAddress,
            mobileNo: data.mobileNo,
            role: data.role,
        };

        if (data.password && data.password.length > 0) {
            updateData.password = data.password;
        }

        const result = await updateUser(user.id.toString(), updateData);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("User updated successfully");
            onClose();
        }
    }

    return (
        <Dialog open={!!user} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update user account details. Leave password empty to keep current
                            password.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-userName">Username *</Label>
                            <Input
                                id="edit-userName"
                                placeholder="johndoe"
                                {...register("userName")}
                            />
                            {errors.userName && (
                                <p className="text-sm text-red-500">{errors.userName.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-emailAddress">Email *</Label>
                            <Input
                                id="edit-emailAddress"
                                type="email"
                                placeholder="john@example.com"
                                {...register("emailAddress")}
                            />
                            {errors.emailAddress && (
                                <p className="text-sm text-red-500">{errors.emailAddress.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-mobileNo">Mobile No</Label>
                            <Input
                                id="edit-mobileNo"
                                placeholder="+1234567890"
                                {...register("mobileNo")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-password">
                                New Password{" "}
                                <span className="text-muted-foreground font-normal">
                                    (leave empty to keep current)
                                </span>
                            </Label>
                            <Input
                                id="edit-password"
                                type="password"
                                placeholder="••••••••"
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
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
