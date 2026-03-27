"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, format } from "date-fns";

function serializeSequencedEntity<T extends Record<string, unknown> | null>(entity: T): T {
  if (!entity || !Object.prototype.hasOwnProperty.call(entity, "sequence")) {
    return entity;
  }

  const sequence = (entity as { sequence?: unknown }).sequence;
  return {
    ...entity,
    sequence: sequence == null ? null : Number(sequence),
  } as T;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: number;
  projectId?: number;
  type?: "expense" | "income" | "both";
}

export async function getReportData(filters: ReportFilters = {}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const { startDate, endDate, categoryId, projectId, type = "both" } = filters;

    // Default to current month if no dates provided
    const start = startDate ? new Date(startDate) : startOfMonth(new Date());
    const end = endDate ? new Date(endDate) : endOfMonth(new Date());

    const expenseWhere = {
      userId: parseInt(session.user.id),
      expenseDate: {
        gte: start,
        lte: end,
      },
      ...(categoryId && { categoryId }),
      ...(projectId && { projectId }),
    };

    const incomeWhere = {
      userId: parseInt(session.user.id),
      incomeDate: {
        gte: start,
        lte: end,
      },
      ...(categoryId && { categoryId }),
      ...(projectId && { projectId }),
    };

    // Get expenses
    const expenses = type !== "income" ? await prisma.expense.findMany({
      where: expenseWhere,
      include: {
        category: true,
        subCategory: true,
        project: true,
        people: true,
      },
      orderBy: { expenseDate: "desc" },
    }) : [];

    // Get incomes
    const incomes = type !== "expense" ? await prisma.income.findMany({
      where: incomeWhere,
      include: {
        category: true,
        subCategory: true,
        project: true,
        people: true,
      },
      orderBy: { incomeDate: "desc" },
    }) : [];

    const serializedExpenses = expenses.map((expense) => ({
      ...expense,
      amount: Number(expense.amount),
      category: serializeSequencedEntity(expense.category),
      subCategory: serializeSequencedEntity(expense.subCategory),
      project: serializeSequencedEntity(expense.project),
      people: serializeSequencedEntity(expense.people),
    }));

    const serializedIncomes = incomes.map((income) => ({
      ...income,
      amount: Number(income.amount),
      category: serializeSequencedEntity(income.category),
      subCategory: serializeSequencedEntity(income.subCategory),
      project: serializeSequencedEntity(income.project),
      people: serializeSequencedEntity(income.people),
    }));

    const totalExpenses = serializedExpenses.reduce((sum: number, e: { amount: unknown }) => sum + Number(e.amount), 0);
    const totalIncome = serializedIncomes.reduce((sum: number, i: { amount: unknown }) => sum + Number(i.amount), 0);
    const netBalance = totalIncome - totalExpenses;

    // Group expenses by category
    const expensesByCategory = serializedExpenses.reduce((acc: Record<string, number>, e: { category: { categoryName: string } | null; amount: unknown }) => {
      const name = e.category?.categoryName || "Uncategorized";
      if (!acc[name]) acc[name] = 0;
      acc[name] += Number(e.amount);
      return acc;
    }, {} as Record<string, number>);

    // Group income by category
    const incomeByCategory = serializedIncomes.reduce((acc: Record<string, number>, i: { category: { categoryName: string } | null; amount: unknown }) => {
      const name = i.category?.categoryName || "Uncategorized";
      if (!acc[name]) acc[name] = 0;
      acc[name] += Number(i.amount);
      return acc;
    }, {} as Record<string, number>);

    // Group by project
    const expensesByProject = serializedExpenses.reduce((acc: Record<string, number>, e: { project: { projectName: string } | null; amount: unknown }) => {
      const name = e.project?.projectName || "No Project";
      if (!acc[name]) acc[name] = 0;
      acc[name] += Number(e.amount);
      return acc;
    }, {} as Record<string, number>);

    const incomeByProject = serializedIncomes.reduce((acc: Record<string, number>, i: { project: { projectName: string } | null; amount: unknown }) => {
      const name = i.project?.projectName || "No Project";
      if (!acc[name]) acc[name] = 0;
      acc[name] += Number(i.amount);
      return acc;
    }, {} as Record<string, number>);

    // Group by expense detail
    const expensesByDetail = serializedExpenses.reduce((acc: Record<string, number>, e: { expenseDetail: string | null; amount: unknown }) => {
      const detail = e.expenseDetail || "Not Specified";
      if (!acc[detail]) acc[detail] = 0;
      acc[detail] += Number(e.amount);
      return acc;
    }, {} as Record<string, number>);

    return {
      summary: {
        totalExpenses,
        totalIncome,
        netBalance,
        expenseCount: serializedExpenses.length,
        incomeCount: serializedIncomes.length,
      },
      expensesByCategory,
      incomeByCategory,
      expensesByProject,
      incomeByProject,
      expensesByDetail,
      expenses: serializedExpenses,
      incomes: serializedIncomes,
    };
  } catch (error) {
    console.error("Failed to generate report:", error);
    return { error: "Failed to generate report" };
  }
}

export async function getMonthlyTrend(months: number = 6) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const now = new Date();
    const data = [];

    for (let i = months - 1; i >= 0; i--) {
      const targetDate = subMonths(now, i);
      const start = startOfMonth(targetDate);
      const end = endOfMonth(targetDate);

      const [expenses, incomes] = await Promise.all([
        prisma.expense.aggregate({
          where: {
            userId: parseInt(session.user.id),
            expenseDate: { gte: start, lte: end },
          },
          _sum: { amount: true },
        }),
        prisma.income.aggregate({
          where: {
            userId: parseInt(session.user.id),
            incomeDate: { gte: start, lte: end },
          },
          _sum: { amount: true },
        }),
      ]);

      data.push({
        month: format(targetDate, "MMM yyyy"),
        expenses: Number(expenses._sum.amount || 0),
        income: Number(incomes._sum.amount || 0),
      });
    }

    return { data };
  } catch (error) {
    console.error("Failed to get monthly trend:", error);
    return { error: "Failed to get monthly trend" };
  }
}

export async function getYearlyComparison() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    const [currentYearExpenses, currentYearIncome, lastYearExpenses, lastYearIncome] =
      await Promise.all([
        prisma.expense.aggregate({
          where: {
            userId: parseInt(session.user.id),
            expenseDate: {
              gte: startOfYear(new Date(currentYear, 0, 1)),
              lte: endOfYear(new Date(currentYear, 0, 1)),
            },
          },
          _sum: { amount: true },
        }),
        prisma.income.aggregate({
          where: {
            userId: parseInt(session.user.id),
            incomeDate: {
              gte: startOfYear(new Date(currentYear, 0, 1)),
              lte: endOfYear(new Date(currentYear, 0, 1)),
            },
          },
          _sum: { amount: true },
        }),
        prisma.expense.aggregate({
          where: {
            userId: parseInt(session.user.id),
            expenseDate: {
              gte: startOfYear(new Date(lastYear, 0, 1)),
              lte: endOfYear(new Date(lastYear, 0, 1)),
            },
          },
          _sum: { amount: true },
        }),
        prisma.income.aggregate({
          where: {
            userId: parseInt(session.user.id),
            incomeDate: {
              gte: startOfYear(new Date(lastYear, 0, 1)),
              lte: endOfYear(new Date(lastYear, 0, 1)),
            },
          },
          _sum: { amount: true },
        }),
      ]);

    return {
      currentYear: {
        year: currentYear,
        expenses: Number(currentYearExpenses._sum.amount || 0),
        income: Number(currentYearIncome._sum.amount || 0),
      },
      lastYear: {
        year: lastYear,
        expenses: Number(lastYearExpenses._sum.amount || 0),
        income: Number(lastYearIncome._sum.amount || 0),
      },
    };
  } catch (error) {
    console.error("Failed to get yearly comparison:", error);
    return { error: "Failed to get yearly comparison" };
  }
}

export async function getTopExpenseCategories(limit: number = 5) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());

    const expenses = await prisma.expense.findMany({
      where: {
        userId: parseInt(session.user.id),
        expenseDate: { gte: start, lte: end },
      },
      include: {
        category: true,
      },
    });

    const byCategory = expenses.reduce((acc: Record<string, number>, e: { category: { categoryName: string } | null; amount: unknown }) => {
      const name = e.category?.categoryName || "Uncategorized";
      if (!acc[name]) acc[name] = 0;
      acc[name] += Number(e.amount);
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(byCategory)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, limit);

    return {
      categories: sorted.map(([name, amount]) => ({ name, amount })),
    };
  } catch (error) {
    console.error("Failed to get top categories:", error);
    return { error: "Failed to get top categories" };
  }
}
