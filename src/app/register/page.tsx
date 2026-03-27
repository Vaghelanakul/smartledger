"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { GlowCard } from "@/components/aceternity/glow-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        const formData = new FormData(e.currentTarget);
        const data = {
            userName: formData.get("userName") as string,
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            confirmPassword: formData.get("confirmPassword") as string,
        };

        // Validate
        if (data.password !== data.confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        if (data.password.length < 6) {
            setError("Password must be at least 6 characters");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userName: data.userName,
                    email: data.email,
                    password: data.password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || "Registration failed");
            } else {
                setSuccess("Account created! Redirecting to login...");
                setTimeout(() => router.push("/login"), 2000);
            }
        } catch {
            setError("Something went wrong. Please try again.");
        }

        setIsLoading(false);
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
            <BackgroundBeams className="opacity-50 dark:opacity-100" />
            <Spotlight className="-top-24 left-0 md:left-20" fill="hsl(var(--primary))" />

            <div className="absolute right-4 top-4 z-20">
                <ThemeToggle />
            </div>

            <GlowCard className="relative z-10 w-full max-w-md px-5 py-6 sm:px-8 sm:py-8">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                        <UserPlus className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="font-display text-2xl font-bold text-foreground">Create Account</h1>
                    <p className="text-sm text-muted-foreground">
                        Register for a new SmartLedger account
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mt-6 space-y-4">
                        {error && (
                            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
                                {success}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="userName">Full Name</Label>
                            <Input
                                id="userName"
                                name="userName"
                                placeholder="John Doe"
                                required
                                disabled={isLoading}
                                className="bg-background/70"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                required
                                disabled={isLoading}
                                className="bg-background/70"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                disabled={isLoading}
                                className="bg-background/70"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                required
                                disabled={isLoading}
                                className="bg-background/70"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                "Register"
                            )}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </GlowCard>
        </div>
    );
}
