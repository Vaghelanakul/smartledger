"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getDashboardSummary() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const userId = parseInt(session.user.id);
  const isAdmin = session.user.role === "admin";

  const whereClause = isAdmin ? {} : { userId };

  // Get totals
  const [totalExpenses, totalIncomes, expenseCount, incomeCount] = await Promise.all([
    prisma.expense.aggregate({
      where: whereClause,
      _sum: { amount: true },
    }),
    prisma.income.aggregate({
      where: whereClause,
      _sum: { amount: true },
    }),
    prisma.expense.count({ where: whereClause }),
    prisma.income.count({ where: whereClause }),
  ]);

  // Get this month's data
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthWhereClause = {
    ...whereClause,
    expenseDate: { gte: startOfMonth, lte: endOfMonth },
  };

  const incomeMonthWhereClause = {
    ...whereClause,
    incomeDate: { gte: startOfMonth, lte: endOfMonth },
  };

  const [monthlyExpenses, monthlyIncomes] = await Promise.all([
    prisma.expense.aggregate({
      where: monthWhereClause,
      _sum: { amount: true },
    }),
    prisma.income.aggregate({
      where: incomeMonthWhereClause,
      _sum: { amount: true },
    }),
  ]);

  // Get recent transactions
  const [recentExpenses, recentIncomes] = await Promise.all([
    prisma.expense.findMany({
      where: whereClause,
      take: 5,
      orderBy: { expenseDate: "desc" },
      include: {
        category: { select: { categoryName: true } },
        project: { select: { projectName: true } },
      },
    }),
    prisma.income.findMany({
      where: whereClause,
      take: 5,
      orderBy: { incomeDate: "desc" },
      include: {
        category: { select: { categoryName: true } },
        project: { select: { projectName: true } },
      },
    }),
  ]);

  // Get category-wise expenses (for chart)
  const categoryExpenses = await prisma.expense.groupBy({
    by: ["categoryId"],
    where: whereClause,
    _sum: { amount: true },
  });

  const categoryNames = await prisma.category.findMany({
    where: { id: { in: categoryExpenses.map((c: { categoryId: number | null }) => c.categoryId).filter(Boolean) as number[] } },
    select: { id: true, categoryName: true },
  });

  const categoryWiseExpenses = categoryExpenses
    .filter((c: { categoryId: number | null }) => c.categoryId !== null)
    .map((c: { categoryId: number | null; _sum: { amount: unknown } }) => ({
      category: categoryNames.find((cat: { id: number; categoryName: string }) => cat.id === c.categoryId)?.categoryName || "Unknown",
      amount: Number(c._sum.amount) || 0,
    }));

  // Get monthly data for chart (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const [expenses, incomes] = await Promise.all([
      prisma.expense.aggregate({
        where: {
          ...whereClause,
          expenseDate: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      }),
      prisma.income.aggregate({
        where: {
          ...whereClause,
          incomeDate: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      }),
    ]);

    monthlyData.push({
      month: monthStart.toLocaleString("default", { month: "short" }),
      expenses: Number(expenses._sum.amount) || 0,
      incomes: Number(incomes._sum.amount) || 0,
    });
  }

  return {
    totalExpenses: Number(totalExpenses._sum.amount) || 0,
    totalIncomes: Number(totalIncomes._sum.amount) || 0,
    expenseCount,
    incomeCount,
    monthlyExpenses: Number(monthlyExpenses._sum.amount) || 0,
    monthlyIncomes: Number(monthlyIncomes._sum.amount) || 0,
    recentExpenses: recentExpenses.map((e: { id: number; expenseDate: Date; amount: unknown; description: string | null; category: { categoryName: string } | null; project: { projectName: string } | null }) => ({
      id: e.id,
      date: e.expenseDate,
      amount: Number(e.amount),
      category: e.category?.categoryName || "Uncategorized",
      project: e.project?.projectName || "-",
      description: e.description,
    })),
    recentIncomes: recentIncomes.map((i: { id: number; incomeDate: Date; amount: unknown; description: string | null; category: { categoryName: string } | null; project: { projectName: string } | null }) => ({
      id: i.id,
      date: i.incomeDate,
      amount: Number(i.amount),
      category: i.category?.categoryName || "Uncategorized",
      project: i.project?.projectName || "-",
      description: i.description,
    })),
    categoryWiseExpenses,
    monthlyData,
  };
}
