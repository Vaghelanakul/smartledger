"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { expenseSchema, ExpenseInput } from "@/lib/validations";

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

export async function getExpenses(filters?: {
  startDate?: Date;
  endDate?: Date;
  categoryId?: number;
  projectId?: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized", expenses: [] };
    }

    const whereClause: Record<string, unknown> = {
      userId: parseInt(session.user.id),
    };

    if (filters?.startDate && filters?.endDate) {
      whereClause.expenseDate = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    if (filters?.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    if (filters?.projectId) {
      whereClause.projectId = filters.projectId;
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        category: true,
        subCategory: true,
        project: true,
        people: true,
      },
      orderBy: {
        expenseDate: "desc",
      },
    });

    const serializedExpenses = expenses.map((expense) => ({
      ...expense,
      amount: Number(expense.amount),
      category: serializeSequencedEntity(expense.category),
      subCategory: serializeSequencedEntity(expense.subCategory),
      project: serializeSequencedEntity(expense.project),
      people: serializeSequencedEntity(expense.people),
    }));

    return { expenses: serializedExpenses };
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return { error: "Failed to fetch expenses", expenses: [] };
  }
}

export async function getExpenseById(id: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        userId: parseInt(session.user.id),
      },
      include: {
        category: true,
        subCategory: true,
        project: true,
        people: true,
      },
    });

    if (!expense) {
      return { error: "Expense not found" };
    }

    return {
      expense: {
        ...expense,
        amount: Number(expense.amount),
        category: serializeSequencedEntity(expense.category),
        subCategory: serializeSequencedEntity(expense.subCategory),
        project: serializeSequencedEntity(expense.project),
        people: serializeSequencedEntity(expense.people),
      },
    };
  } catch (error) {
    console.error("Failed to fetch expense:", error);
    return { error: "Failed to fetch expense" };
  }
}

export async function createExpense(data: ExpenseInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = expenseSchema.parse(data);

    const expense = await prisma.expense.create({
      data: {
        userId: parseInt(session.user.id),
        expenseDate: validatedData.expenseDate,
        categoryId: validatedData.categoryId,
        subCategoryId: validatedData.subCategoryId || null,
        projectId: validatedData.projectId || null,
        peopleId: validatedData.peopleId || null,
        amount: validatedData.amount,
        expenseDetail: validatedData.expenseDetail || null,
        description: validatedData.description || null,
        attachmentPath: validatedData.attachmentPath || null,
      },
    });

    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard");

    return {
      expense: {
        ...expense,
        amount: Number(expense.amount),
      },
    };
  } catch (error) {
    console.error("Failed to create expense:", error);
    return { error: "Failed to create expense" };
  }
}

export async function updateExpense(id: number, data: ExpenseInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Check if expense belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId: parseInt(session.user.id),
      },
    });

    if (!existingExpense) {
      return { error: "Expense not found" };
    }

    const validatedData = expenseSchema.parse(data);

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        expenseDate: validatedData.expenseDate,
        categoryId: validatedData.categoryId,
        subCategoryId: validatedData.subCategoryId || null,
        projectId: validatedData.projectId || null,
        peopleId: validatedData.peopleId || null,
        amount: validatedData.amount,
        expenseDetail: validatedData.expenseDetail || null,
        description: validatedData.description || null,
        attachmentPath: validatedData.attachmentPath || null,
      },
    });

    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard");

    return {
      expense: {
        ...expense,
        amount: Number(expense.amount),
      },
    };
  } catch (error) {
    console.error("Failed to update expense:", error);
    return { error: "Failed to update expense" };
  }
}

export async function deleteExpense(id: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Check if expense belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId: parseInt(session.user.id),
      },
    });

    if (!existingExpense) {
      return { error: "Expense not found" };
    }

    await prisma.expense.delete({
      where: { id },
    });

    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete expense:", error);
    return { error: "Failed to delete expense" };
  }
}

export async function getExpenseStats(period: "week" | "month" | "year" = "month") {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "month":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const expenses = await prisma.expense.findMany({
      where: {
        userId: parseInt(session.user.id),
        expenseDate: {
          gte: startDate,
          lte: now,
        },
      },
      include: {
        category: true,
      },
    });

    const totalAmount = expenses.reduce((sum: number, exp: { amount: unknown }) => sum + Number(exp.amount), 0);

    // Group by category
    const byCategory = expenses.reduce((acc: Record<string, number>, exp: { amount: unknown; category: { categoryName: string } | null }) => {
      const categoryName = exp.category?.categoryName || "Uncategorized";
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += Number(exp.amount);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAmount,
      count: expenses.length,
      byCategory,
    };
  } catch (error) {
    console.error("Failed to fetch expense stats:", error);
    return { error: "Failed to fetch expense stats" };
  }
}
