import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { GlowCard } from "@/components/aceternity/glow-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ArrowRight,
  BarChart3,
  PiggyBank,
  Receipt,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const features = [
  {
    title: "Expense Tracking",
    description: "Record and categorize spendings in seconds with clear control.",
    icon: Receipt,
    iconColor: "text-rose-300",
  },
  {
    title: "Income Management",
    description: "Track all income sources and monitor monthly growth patterns.",
    icon: PiggyBank,
    iconColor: "text-emerald-300",
  },
  {
    title: "Insightful Reports",
    description: "Generate charts, export Excel or PDF files, and share data quickly.",
    icon: BarChart3,
    iconColor: "text-cyan-300",
  },
  {
    title: "Role Based Access",
    description: "Manage teams and permissions with secure admin level controls.",
    icon: Users,
    iconColor: "text-amber-300",
  },
];

export default async function Home() {
  const session = await auth();

  // If already logged in, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <BackgroundBeams className="opacity-50 dark:opacity-100" />
      <Spotlight className="-top-32 left-0 md:-top-20 md:left-32" fill="hsl(var(--primary))" />

      <header className="relative z-10 container mx-auto px-4 py-6">
        <nav className="rounded-2xl border border-border/60 bg-card/70 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/15 p-2">
                <PiggyBank className="h-6 w-6 text-primary" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight">SmartLedger</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="relative z-10 container mx-auto px-4 pb-16 pt-14 sm:pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            Modern ledger experience for students, teams, and startups
          </span>

          <h1 className="font-display mt-7 text-4xl font-bold leading-tight sm:text-6xl">
            Beautiful money management,
            <br />
            <span className="bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent dark:from-cyan-300 dark:via-teal-200 dark:to-emerald-300">
              built for real workflows.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            SmartLedger helps you track expenses, monitor income, and generate reports
            through a clean dashboard that stays fast and collaborative.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full gap-2 sm:w-auto">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                Create Account
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <GlowCard key={feature.title} className="text-left">
                <feature.icon className={`h-9 w-9 ${feature.iconColor}`} />
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </GlowCard>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-4xl rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-6 text-left backdrop-blur-lg sm:p-8">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-emerald-500 dark:text-emerald-300" />
            <div>
              <h2 className="font-display text-xl font-semibold text-emerald-700 dark:text-emerald-100">Secure by default</h2>
              <p className="mt-2 text-sm text-emerald-700/85 dark:text-emerald-50/85 sm:text-base">
                Role-based access with NextAuth authentication keeps your records protected
                while your team collaborates across expenses, projects, and reports.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-border/60 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 SmartLedger. Built with Next.js, Prisma & Neon.
        </div>
      </footer>
    </div>
  );
}
